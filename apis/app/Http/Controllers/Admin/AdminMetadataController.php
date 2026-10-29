<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseMetadata;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\Subtopic;
use App\Services\MetadataService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMetadataController extends Controller
{
    use ApiResponseTrait;

    protected MetadataService $metadataService;

    public function __construct(MetadataService $metadataService)
    {
        $this->metadataService = $metadataService;
    }

    /**
     * List all metadata items with optional filters: course, subject, topic, search.
     */
    public function index(Request $request): JsonResponse
    {
        $items = $this->metadataService->getAll($request->all());
        return $this->successResponse($items, 'Metadata list retrieved successfully.');
    }

    /**
     * Get distinct normalized hierarchy (courses -> subjects -> topics -> subtopics) for cascading filter dropdowns.
     */
    public function hierarchy(): JsonResponse
    {
        $hierarchy = $this->metadataService->getHierarchy();
        return $this->successResponse($hierarchy, 'Metadata hierarchy retrieved successfully.');
    }


    /**
     * Store a new course metadata entry.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id'     => 'required|exists:courses,id',
            'subject_id'    => 'nullable|exists:subjects,id',
            'topic_id'      => 'nullable|exists:topics,id',
            'subtopic_id'   => 'nullable|exists:subtopics,id',
            'subject'       => 'nullable|string|max:150',
            'topic'         => 'nullable|string|max:150',
            'subtopic'      => 'nullable|string|max:190',
            'description'   => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $item = $this->metadataService->create($validated);

        return $this->successResponse($item, 'Metadata entry created successfully.', 201);
    }

    /**
     * Update an existing course metadata entry.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $metadata = CourseMetadata::findOrFail($id);

        $validated = $request->validate([
            'course_id'     => 'sometimes|required|exists:courses,id',
            'subject_id'    => 'nullable|exists:subjects,id',
            'topic_id'      => 'nullable|exists:topics,id',
            'subtopic_id'   => 'nullable|exists:subtopics,id',
            'subject'       => 'sometimes|nullable|string|max:150',
            'topic'         => 'sometimes|nullable|string|max:150',
            'subtopic'      => 'sometimes|nullable|string|max:190',
            'description'   => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $item = $this->metadataService->update($metadata, $validated);

        return $this->successResponse($item, 'Metadata entry updated successfully.');
    }


    /**
     * Toggle active/inactive state of a metadata entry.
     */
    public function toggle(int $id): JsonResponse
    {
        $metadata = CourseMetadata::findOrFail($id);
        $item = $this->metadataService->toggle($metadata);

        return $this->successResponse($item, "Metadata item is now " . ($item->is_active ? 'Active' : 'Inactive') . ".");
    }

    /**
     * Delete a metadata entry and its attached PDF.
     */
    public function destroy(int $id): JsonResponse
    {
        $metadata = CourseMetadata::findOrFail($id);
        $this->metadataService->delete($metadata);

        return $this->successResponse(null, 'Metadata entry deleted successfully.');
    }

    // -------------------------------------------------------------
    // Master Subjects Endpoints
    // -------------------------------------------------------------

    public function getSubjects(Request $request): JsonResponse
    {
        $subjects = $this->metadataService->getSubjects($request->all());
        return $this->successResponse($subjects, 'Subjects retrieved successfully.');
    }

    public function storeSubject(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id'     => 'required|exists:courses,id',
            'name'          => 'required|string|max:150',
            'slug'          => 'nullable|string|max:180',
            'code'          => 'nullable|string|max:50',
            'description'   => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $subject = $this->metadataService->createSubject($validated);
        return $this->successResponse($subject, 'Subject created successfully.', 201);
    }

    public function updateSubject(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'course_id'     => 'sometimes|required|exists:courses,id',
            'name'          => 'sometimes|required|string|max:150',
            'slug'          => 'nullable|string|max:180',
            'code'          => 'nullable|string|max:50',
            'description'   => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $subject = $this->metadataService->updateSubject($id, $validated);
        return $this->successResponse($subject, 'Subject updated successfully.');
    }

    public function destroySubject(int $id): JsonResponse
    {
        $this->metadataService->deleteSubject($id);
        return $this->successResponse(null, 'Subject deleted successfully.');
    }

    // -------------------------------------------------------------
    // Master Topics Endpoints
    // -------------------------------------------------------------

    public function getTopics(Request $request): JsonResponse
    {
        $topics = $this->metadataService->getTopics($request->all());
        return $this->successResponse($topics, 'Topics retrieved successfully.');
    }

    public function storeTopic(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject_id'    => 'required|exists:subjects,id',
            'name'          => 'required|string|max:180',
            'slug'          => 'nullable|string|max:200',
            'description'   => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $topic = $this->metadataService->createTopic($validated);
        return $this->successResponse($topic, 'Topic created successfully.', 201);
    }

    public function updateTopic(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'subject_id'    => 'sometimes|required|exists:subjects,id',
            'name'          => 'sometimes|required|string|max:180',
            'slug'          => 'nullable|string|max:200',
            'description'   => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $topic = $this->metadataService->updateTopic($id, $validated);
        return $this->successResponse($topic, 'Topic updated successfully.');
    }

    public function destroyTopic(int $id): JsonResponse
    {
        $this->metadataService->deleteTopic($id);
        return $this->successResponse(null, 'Topic deleted successfully.');
    }

    // -------------------------------------------------------------
    // Master Subtopics Endpoints
    // -------------------------------------------------------------

    public function getSubtopics(Request $request): JsonResponse
    {
        $subtopics = $this->metadataService->getSubtopics($request->all());
        return $this->successResponse($subtopics, 'Subtopics retrieved successfully.');
    }

    public function storeSubtopic(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic_id'      => 'required|exists:topics,id',
            'name'          => 'required|string|max:255',
            'slug'          => 'nullable|string|max:255',
            'description'   => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $subtopic = $this->metadataService->createSubtopic($validated);
        return $this->successResponse($subtopic, 'Subtopic created successfully.', 201);
    }

    public function updateSubtopic(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'topic_id'      => 'sometimes|required|exists:topics,id',
            'name'          => 'sometimes|required|string|max:255',
            'slug'          => 'nullable|string|max:255',
            'description'   => 'nullable|string',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $subtopic = $this->metadataService->updateSubtopic($id, $validated);
        return $this->successResponse($subtopic, 'Subtopic updated successfully.');
    }

    public function destroySubtopic(int $id): JsonResponse
    {
        $this->metadataService->deleteSubtopic($id);
        return $this->successResponse(null, 'Subtopic deleted successfully.');
    }
}
