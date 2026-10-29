<?php

namespace App\Services;

use App\Models\Course;
use App\Models\IndiaAdmission;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class CourseService
{
    /**
     * List all courses with optional level, stream_id and search filtering.
     */
    public function getAll(array $filters = []): Collection
    {
        $query = Course::with('stream:id,name,slug,icon')->orderBy('display_order', 'asc');

        if (!empty($filters['level']) && $filters['level'] !== 'all') {
            $query->where('level', $filters['level']);
        }

        if (!empty($filters['stream_id']) && $filters['stream_id'] !== 'all') {
            $query->where('stream_id', $filters['stream_id']);
        }

        if (!empty($filters['search'])) {
            $s = trim($filters['search']);
            $query->where(function ($q) use ($s) {
                $q->where('course_name', 'like', "%{$s}%")
                  ->orWhere('entrance_exams', 'like', "%{$s}%")
                  ->orWhere('eligibility', 'like', "%{$s}%");
            });
        }

        return $query->get();
    }

    /**
     * Get a single course by ID.
     */
    public function getById(int $id): ?Course
    {
        return Course::with('stream')->find($id);
    }

    /**
     * Create a new course.
     */
    public function create(array $data): Course
    {
        if (empty($data['slug'])) {
            $base = Str::slug($data['course_name']);
            $slug = $base;
            $c = 1;
            while (Course::where('slug', $slug)->exists()) {
                $slug = "{$base}-{$c}";
                $c++;
            }
            $data['slug'] = $slug;
        }

        $data['is_active'] = $data['is_active'] ?? true;
        $data['display_order'] = $data['display_order'] ?? (Course::max('display_order') + 1);

        return Course::create($data);
    }

    /**
     * Update an existing course.
     */
    public function update(Course $course, array $data): Course
    {
        if (!empty($data['course_name']) && $data['course_name'] !== $course->course_name) {
            $base = Str::slug($data['course_name']);
            $slug = $base;
            $c = 1;
            while (Course::where('slug', $slug)->where('id', '!=', $course->id)->exists()) {
                $slug = "{$base}-{$c}";
                $c++;
            }
            $data['slug'] = $slug;
        }

        $course->update($data);

        return $course->fresh();
    }

    /**
     * Toggle course active status.
     */
    public function toggle(Course $course): Course
    {
        $course->is_active = !$course->is_active;
        $course->save();

        return $course;
    }

    /**
     * Delete a course.
     */
    public function delete(Course $course): bool
    {
        return (bool) $course->delete();
    }

    /**
     * Get all streams / categories with course counts.
     */
    public function getStreams(?bool $activeOnly = null): Collection
    {
        $query = IndiaAdmission::withCount([
            'courses as ug_courses_count' => function ($q) {
                $q->where('level', 'undergraduate');
            },
            'courses as pg_courses_count' => function ($q) {
                $q->where('level', 'postgraduate');
            },
            'courses as total_courses_count',
        ])->orderBy('display_order', 'asc');

        if ($activeOnly === true) {
            $query->where('is_active', true);
        }

        return $query->get();
    }

    /**
     * Create a new stream / category.
     */
    public function createStream(array $data): IndiaAdmission
    {
        $name = $data['name'] ?? ($data['title'] ?? '');
        $slug = Str::slug($name);
        $baseSlug = $slug;
        $count = 1;
        while (IndiaAdmission::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$count}";
            $count++;
        }

        return IndiaAdmission::create([
            'slug'          => $slug,
            'name'          => $name,
            'icon'          => $data['icon'] ?? 'compass',
            'text'          => $data['text'] ?? ($data['description'] ?? "Admission counselling and guidance for {$name} programs."),
            'is_active'     => $data['is_active'] ?? true,
            'display_order' => $data['display_order'] ?? (IndiaAdmission::max('display_order') + 1),
        ]);
    }

    /**
     * Update an existing stream.
     */
    public function updateStream(IndiaAdmission $stream, array $data): IndiaAdmission
    {
        $name = $data['name'] ?? ($data['title'] ?? $stream->name);

        $updateData = [];
        if ($name !== $stream->name) {
            $updateData['name'] = $name;
            $updateData['slug'] = Str::slug($name);
        }
        if (isset($data['icon'])) {
            $updateData['icon'] = $data['icon'];
        }
        if (isset($data['text']) || isset($data['description'])) {
            $updateData['text'] = $data['text'] ?? $data['description'];
        }
        if (isset($data['is_active'])) {
            $updateData['is_active'] = $data['is_active'];
        }
        if (isset($data['display_order'])) {
            $updateData['display_order'] = (int) $data['display_order'];
        }

        $stream->update($updateData);

        return $stream->fresh();
    }

    /**
     * Toggle stream active status.
     */
    public function toggleStream(IndiaAdmission $stream): IndiaAdmission
    {
        $stream->is_active = !$stream->is_active;
        $stream->save();

        return $stream;
    }

    /**
     * Delete stream.
     */
    public function deleteStream(IndiaAdmission $stream): bool
    {
        return (bool) $stream->delete();
    }
}
