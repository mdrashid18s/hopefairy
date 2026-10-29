<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\IndiaAdmission;
use App\Services\CourseService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCourseController extends Controller
{
    use ApiResponseTrait;

    protected CourseService $courseService;

    public function __construct(CourseService $courseService)
    {
        $this->courseService = $courseService;
    }

    /**
     * List all courses with optional stream & level filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $courses = $this->courseService->getAll($request->all());
        return $this->successResponse($courses, 'Courses retrieved successfully.');
    }

    /**
     * Create a new course.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'stream_id'       => 'required|exists:india_admissions,id',
            'course_name'     => 'required|string|max:150',
            'level'           => 'required|in:undergraduate,postgraduate',
            'entrance_exams'  => 'nullable|string|max:255',
            'duration'        => 'nullable|string|max:100',
            'eligibility'     => 'nullable|string|max:255',
            'description'     => 'nullable|string',
            'is_active'       => 'nullable|boolean',
            'display_order'   => 'nullable|integer',
        ]);

        $course = $this->courseService->create($validated);

        return $this->successResponse($course->load('stream:id,name,slug,icon'), 'Course created successfully.', 201);
    }

    /**
     * Update an existing course.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'stream_id'       => 'sometimes|required|exists:india_admissions,id',
            'course_name'     => 'sometimes|required|string|max:150',
            'level'           => 'sometimes|required|in:undergraduate,postgraduate',
            'entrance_exams'  => 'nullable|string|max:255',
            'duration'        => 'nullable|string|max:100',
            'eligibility'     => 'nullable|string|max:255',
            'description'     => 'nullable|string',
            'is_active'       => 'nullable|boolean',
            'display_order'   => 'nullable|integer',
        ]);

        $updated = $this->courseService->update($course, $validated);

        return $this->successResponse($updated->load('stream:id,name,slug,icon'), 'Course updated successfully.');
    }

    /**
     * Toggle course active/inactive.
     */
    public function toggle(int $id): JsonResponse
    {
        $course = Course::findOrFail($id);
        $updated = $this->courseService->toggle($course);

        return $this->successResponse([
            'id'        => $updated->id,
            'is_active' => $updated->is_active,
        ], 'Course status toggled successfully.');
    }

    /**
     * Delete a course.
     */
    public function destroy(int $id): JsonResponse
    {
        $course = Course::findOrFail($id);
        $this->courseService->delete($course);

        return $this->successResponse(null, 'Course deleted successfully.');
    }

    /**
     * Get all streams / categories with course counts.
     */
    public function getStreams(): JsonResponse
    {
        $streams = $this->courseService->getStreams();
        return $this->successResponse($streams, 'Streams retrieved successfully.');
    }

    /**
     * Create a new stream / category.
     */
    public function storeStream(Request $request): JsonResponse
    {
        $name = $request->input('name') ?? $request->input('title');
        if (empty($name)) {
            return $this->errorResponse('The stream name or title is required.', 422, ['name' => ['The stream name or title is required.']]);
        }

        $stream = $this->courseService->createStream($request->all());

        return $this->successResponse($stream, 'Category stream created successfully.', 201);
    }

    /**
     * Update an existing stream.
     */
    public function updateStream(Request $request, int $id): JsonResponse
    {
        $stream = IndiaAdmission::findOrFail($id);
        $updated = $this->courseService->updateStream($stream, $request->all());

        return $this->successResponse($updated, 'Category stream updated successfully.');
    }

    /**
     * Toggle stream active/inactive.
     */
    public function toggleStream(int $id): JsonResponse
    {
        $stream = IndiaAdmission::findOrFail($id);
        $updated = $this->courseService->toggleStream($stream);

        return $this->successResponse([
            'id'        => $updated->id,
            'is_active' => $updated->is_active,
        ], 'Category stream status toggled successfully.');
    }

    /**
     * Delete stream.
     */
    public function destroyStream(int $id): JsonResponse
    {
        $stream = IndiaAdmission::findOrFail($id);
        $this->courseService->deleteStream($stream);

        return $this->successResponse(null, 'Category stream deleted successfully.');
    }
}
