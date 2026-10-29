<?php

namespace App\Services;

use App\Models\Country;
use App\Models\CountryCourse;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class DestinationService
{
    /**
     * Get all active countries where services are provided.
     * Eager-loads relational child country_courses.
     */
    public function getAllActive(): Collection
    {
        return Country::with('countryCourses')
            ->where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->get();
    }

    /**
     * Get all countries including inactive for admin management or with filters.
     */
    public function getAll(?array $filters = null): Collection
    {
        $query = Country::with('countryCourses');

        if (isset($filters['active'])) {
            $query->where('is_active', filter_var($filters['active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('country_code', 'like', $search)
                  ->orWhere('tagline', 'like', $search);
            });
        }

        return $query->orderBy('display_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();
    }

    /**
     * Get a single country by slug.
     */
    public function getBySlug(string $slug): ?Country
    {
        return Country::with('countryCourses')->where('slug', $slug)->first();
    }

    /**
     * Get a single country by ID or slug.
     */
    public function getById(int|string $id): ?Country
    {
        $query = Country::with('countryCourses');
        return is_numeric($id)
            ? $query->find($id)
            : $query->where('slug', $id)->first();
    }

    /**
     * Create a new country for study abroad services.
     */
    public function create(array $data): Country
    {
        if (empty($data['slug'])) {
            $data['slug'] = $this->resolveUniqueSlug($data['name']);
        }

        $code = $this->resolveCountryCode($data['name'], $data['code'] ?? ($data['country_code'] ?? null));
        if ($code) {
            $data['country_code'] = $code;
            $data['flag'] = !empty($data['flag']) ? strtoupper($data['flag']) : $code;
        }

        if (empty($data['tagline'])) {
            $data['tagline'] = "World-class education and top-ranked universities in {$data['name']}";
        }

        // Format array fields if submitted as comma-separated
        foreach (['intakes', 'highlights'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = array_values(array_filter(array_map('trim', explode(',', $data[$field]))));
            }
        }

        if (!isset($data['display_order'])) {
            $data['display_order'] = Country::max('display_order') + 1;
        }

        $coursesData = $data['courses'] ?? null;
        unset($data['courses'], $data['code']);

        $country = Country::create($data);

        // Sync courses into relational country_courses table
        if (!empty($coursesData)) {
            $courseNames = is_array($coursesData)
                ? $coursesData
                : array_filter(array_map('trim', explode(',', $coursesData)));

            foreach ($courseNames as $idx => $cName) {
                CountryCourse::firstOrCreate(
                    ['country_id' => $country->id, 'course_name' => trim($cName)],
                    ['degree_level' => 'Higher Education', 'display_order' => $idx + 1]
                );
            }
        }

        return $country->fresh(['countryCourses']);
    }

    /**
     * Update an existing country.
     */
    public function update(Country $country, array $data): Country
    {
        if (!empty($data['name'])) {
            $code = $this->resolveCountryCode($data['name'], $data['code'] ?? ($data['country_code'] ?? null));
            if ($code) {
                $data['country_code'] = $code;
                $data['flag'] = $code;
            }
        } elseif (!empty($data['code'])) {
            $data['country_code'] = strtoupper($data['code']);
        }

        foreach (['intakes', 'highlights'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = array_values(array_filter(array_map('trim', explode(',', $data[$field]))));
            }
        }

        $coursesData = $data['courses'] ?? null;
        unset($data['courses'], $data['code']);

        $country->update($data);

        // If courses array updated, sync relational country_courses table
        if (!empty($coursesData)) {
            $courseNames = is_array($coursesData)
                ? $coursesData
                : array_filter(array_map('trim', explode(',', $coursesData)));

            foreach ($courseNames as $idx => $cName) {
                CountryCourse::firstOrCreate(
                    ['country_id' => $country->id, 'course_name' => trim($cName)],
                    ['degree_level' => 'Higher Education', 'display_order' => $idx + 1]
                );
            }
        }

        return $country->fresh(['countryCourses']);
    }

    /**
     * Toggle the active service status of a country.
     */
    public function toggle(Country $country): Country
    {
        $country->is_active = !$country->is_active;
        $country->save();

        return $country->fresh(['countryCourses']);
    }

    /**
     * Alias for backward compatibility.
     */
    public function toggleStatus(Country $country): Country
    {
        return $this->toggle($country);
    }

    /**
     * Delete a country.
     */
    public function delete(Country $country): bool
    {
        return (bool)$country->delete();
    }

    /**
     * Automatically resolve unique slug.
     */
    public function resolveUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 1;

        while (Country::where('slug', $slug)
            ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
            ->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Automatically resolve ISO Alpha-2 country code.
     */
    public function resolveCountryCode(string $countryName, ?string $fallback = null): string
    {
        if (!empty($fallback) && strlen(trim($fallback)) === 2) {
            return strtoupper(trim($fallback));
        }

        $name = strtolower(trim($countryName));

        $isoMap = [
            'united kingdom' => 'GB',
            'uk'             => 'GB',
            'great britain'  => 'GB',
            'united states'  => 'US',
            'usa'            => 'US',
            'canada'         => 'CA',
            'germany'        => 'DE',
            'australia'      => 'AU',
            'ireland'        => 'IE',
            'new zealand'    => 'NZ',
            'france'         => 'FR',
            'italy'          => 'IT',
            'spain'          => 'ES',
            'netherlands'    => 'NL',
            'switzerland'    => 'CH',
            'sweden'         => 'SE',
            'norway'         => 'NO',
            'denmark'        => 'DK',
            'finland'        => 'FI',
            'singapore'      => 'SG',
            'dubai'          => 'AE',
            'uae'            => 'AE',
            'united arab emirates' => 'AE',
            'japan'          => 'JP',
            'south korea'    => 'KR',
            'china'          => 'CN',
            'malaysia'       => 'MY',
            'poland'         => 'PL',
            'hungary'        => 'HU',
            'austria'        => 'AT',
            'belgium'        => 'BE',
            'georgia'        => 'GE',
            'russia'         => 'RU',
            'india'          => 'IN',
        ];

        return $isoMap[$name] ?? (strlen($name) === 2 ? strtoupper($name) : 'UN');
    }
}
