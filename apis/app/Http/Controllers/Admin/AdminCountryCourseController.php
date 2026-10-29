<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CountryCourse;
use App\Services\CountryCourseService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCountryCourseController extends Controller
{
    use ApiResponseTrait;

    protected CountryCourseService $courseService;

    public function __construct(CountryCourseService $courseService)
    {
        $this->courseService = $courseService;
    }

    /**
     * Get all courses, optionally filtered by country.
     */
    public function index(Request $request, ?int $countryId = null): JsonResponse
    {
        $courses = $this->courseService->getAll($request->all(), $countryId);
        return $this->successResponse($courses, 'Country courses retrieved successfully.');
    }

    /**
     * Store a new country course.
     */
    public function store(Request $request, ?int $countryId = null): JsonResponse
    {
        $validated = $request->validate([
            'country_id'    => 'required|exists:countries,id',
            'course_name'   => 'required|string|max:255',
            'degree_level'  => 'nullable|string|max:100',
            'duration'      => 'nullable|string|max:100',
            'avg_fee'       => 'nullable|string|max:150',
            'intakes'       => 'nullable|string|max:255',
            'requirements'  => 'nullable|string',
            'description'   => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $course = $this->courseService->create($validated, $countryId);

        return $this->successResponse($course, 'Course created successfully for country.', 201);
    }

    /**
     * Update an existing country course.
     */
    public function update(Request $request, CountryCourse $course): JsonResponse
    {
        $validated = $request->validate([
            'country_id'    => 'sometimes|exists:countries,id',
            'course_name'   => 'sometimes|required|string|max:255',
            'degree_level'  => 'nullable|string|max:100',
            'duration'      => 'nullable|string|max:100',
            'avg_fee'       => 'nullable|string|max:150',
            'intakes'       => 'nullable|string|max:255',
            'requirements'  => 'nullable|string',
            'description'   => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $updated = $this->courseService->update($course, $validated);

        return $this->successResponse($updated, 'Course updated successfully.');
    }

    /**
     * Toggle active/inactive status of a course.
     */
    public function toggle(CountryCourse $course): JsonResponse
    {
        $updated = $this->courseService->toggle($course);
        $statusText = $updated->is_active ? 'activated' : 'deactivated';
        return $this->successResponse($updated, "Course successfully {$statusText}.");
    }

    /**
     * Remove a country course.
     */
    public function destroy(CountryCourse $course): JsonResponse
    {
        $this->courseService->delete($course);
        return $this->successResponse(null, 'Course deleted successfully.');
    }
}
