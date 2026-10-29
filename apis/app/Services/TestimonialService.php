<?php

namespace App\Services;

use App\Models\Country;
use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class TestimonialService
{
    /**
     * Get all testimonials with optional filtering.
     */
    public function getAll(array $filters = [], bool $activeOnly = false): Collection
    {
        $query = Testimonial::with('country');

        if ($activeOnly || (isset($filters['active']) && filter_var($filters['active'], FILTER_VALIDATE_BOOLEAN))) {
            $query->where('is_active', true);
        }

        if (!empty($filters['rating'])) {
            $query->where('rating', (int) $filters['rating']);
        }

        if (!empty($filters['country_id'])) {
            $query->where('country_id', (int) $filters['country_id']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('client_name', 'like', $search)
                  ->orWhere('client_role', 'like', $search)
                  ->orWhere('review', 'like', $search)
                  ->orWhere('course_program', 'like', $search)
                  ->orWhereHas('country', function ($cq) use ($search) {
                      $cq->where('name', 'like', $search)
                         ->orWhere('country_code', 'like', $search);
                  });
            });
        }

        return $query->orderBy('display_order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get active testimonials for public site.
     */
    public function getPublic(): Collection
    {
        return $this->getAll([], true);
    }

    /**
     * Get single testimonial by ID.
     */
    public function getById(int $id): ?Testimonial
    {
        return Testimonial::with('country')->find($id);
    }

    /**
     * Create new testimonial with auto-resolution of country relation.
     */
    public function create(array $data): Testimonial
    {
        $maxOrder = Testimonial::max('display_order') ?? 0;

        $data['rating'] = $data['rating'] ?? 5;
        $data['is_featured'] = $data['is_featured'] ?? false;
        $data['is_active'] = $data['is_active'] ?? true;
        $data['display_order'] = $data['display_order'] ?? ($maxOrder + 1);

        if (empty($data['country_id']) && !empty($data['destination_country'])) {
            $destName = trim($data['destination_country']);
            $matched = Country::where('name', 'like', '%' . $destName . '%')
                ->orWhere('country_code', strtoupper($destName))
                ->first();
            if ($matched) {
                $data['country_id'] = $matched->id;
            }
        }

        return Testimonial::create($data);
    }

    /**
     * Update an existing testimonial.
     */
    public function update(Testimonial $testimonial, array $data): Testimonial
    {
        if (empty($data['country_id']) && !empty($data['destination_country'])) {
            $destName = trim($data['destination_country']);
            $matched = Country::where('name', 'like', '%' . $destName . '%')
                ->orWhere('country_code', strtoupper($destName))
                ->first();
            if ($matched) {
                $data['country_id'] = $matched->id;
            }
        }

        $testimonial->update($data);
        return $testimonial->fresh(['country']);
    }

    /**
     * Toggle testimonial active status.
     */
    public function toggle(Testimonial $testimonial): Testimonial
    {
        $testimonial->is_active = !$testimonial->is_active;
        $testimonial->save();
        return $testimonial;
    }

    /**
     * Upload avatar image for testimonial.
     */
    public function uploadAvatar(UploadedFile $file): array
    {
        $path = $file->store('testimonials', 'public');
        $url = asset('storage/' . $path);

        return [
            'path' => $path,
            'url'  => $url,
        ];
    }

    /**
     * Delete testimonial and clean up uploaded media.
     */
    public function delete(Testimonial $testimonial): bool
    {
        if (!empty($testimonial->avatar) && !preg_match('/^(https?:\/\/|\/\/)/i', $testimonial->avatar)) {
            $cleaned = str_replace(asset('storage/'), '', $testimonial->avatar);
            $cleaned = ltrim(str_replace('/storage/', '', $cleaned), '/');
            Storage::disk('public')->delete($cleaned);
        }

        return (bool) $testimonial->delete();
    }
}
