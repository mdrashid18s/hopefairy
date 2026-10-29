<?php

namespace App\Services;

use App\Models\CountryCourse;
use Illuminate\Database\Eloquent\Collection;

class CountryCourseService
{
    /**
     * Get all country courses with optional country_id, active, and search filters.
     */
    public function getAll(array $filters = [], ?int $countryId = null): Collection
    {
        $query = CountryCourse::with('country:id,name,country_code,slug,flag');

        $cId = $countryId ?? ($filters['country_id'] ?? null);
        if ($cId) {
            $query->where('country_id', $cId);
        }

        if (isset($filters['active'])) {
            $query->where('is_active', filter_var($filters['active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('course_name', 'like', "%{$search}%")
                  ->orWhere('degree_level', 'like', "%{$search}%")
                  ->orWhere('intakes', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('country_id')
            ->orderBy('display_order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get single country course by ID.
     */
    public function getById(int $id): ?CountryCourse
    {
        return CountryCourse::with('country:id,name,country_code,slug,flag')->find($id);
    }

    /**
     * Create a new country course.
     */
    public function create(array $data, ?int $countryId = null): CountryCourse
    {
        if ($countryId && !isset($data['country_id'])) {
            $data['country_id'] = $countryId;
        }

        $data['is_active'] = $data['is_active'] ?? true;
        $data['display_order'] = $data['display_order'] ?? (CountryCourse::max('display_order') + 1);

        $course = CountryCourse::create($data);
        $course->load('country:id,name,country_code,slug,flag');

        return $course;
    }

    /**
     * Update an existing country course.
     */
    public function update(CountryCourse $course, array $data): CountryCourse
    {
        $course->update($data);
        $course->load('country:id,name,country_code,slug,flag');

        return $course->fresh();
    }

    /**
     * Toggle country course active status.
     */
    public function toggle(CountryCourse $course): CountryCourse
    {
        $course->is_active = !$course->is_active;
        $course->save();
        $course->load('country:id,name,country_code,slug,flag');

        return $course;
    }

    /**
     * Delete a country course.
     */
    public function delete(CountryCourse $course): bool
    {
        return (bool) $course->delete();
    }
}
