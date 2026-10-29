<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use App\Services\ResourceService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminResourceController extends Controller
{
    use ApiResponseTrait;

    protected ResourceService $resourceService;

    public function __construct(ResourceService $resourceService)
    {
        $this->resourceService = $resourceService;
    }

    /**
     * List study materials with filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $items = $this->resourceService->getAll($request->all());
        return $this->successResponse($items, 'Study materials retrieved successfully.');
    }

    /**
     * Get overview KPI stats for resources store.
     */
    public function stats(): JsonResponse
    {
        $stats = $this->resourceService->getStats();
        return $this->successResponse($stats, 'Resource store stats retrieved successfully.');
    }

    /**
     * Standalone PDF upload endpoint.
     */
    public function uploadPdf(Request $request): JsonResponse
    {
        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:51200', // Up to 50MB
        ]);

        $data = $this->resourceService->uploadFile($request->file('pdf'), 'resources/materials');
        return $this->successResponse($data, 'Study material PDF uploaded successfully.', 201);
    }

    /**
     * Standalone Cover Thumbnail upload endpoint.
     */
    public function uploadThumbnail(Request $request): JsonResponse
    {
        $request->validate([
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240', // Up to 10MB
        ]);

        $data = $this->resourceService->uploadFile($request->file('thumbnail'), 'resources/thumbnails');
        return $this->successResponse($data, 'Cover thumbnail uploaded successfully.', 201);
    }

    /**
     * Store a new Study Material product.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id'          => 'required|exists:courses,id',
            'metadata_id'        => 'nullable|exists:metadata,id',
            'course_metadata_id' => 'nullable|exists:metadata,id',
            'subject'            => 'nullable|string|max:150',
            'topic'              => 'nullable|string|max:150',
            'subtopic'           => 'nullable|string|max:190',
            'title'              => 'required|string|max:255',
            'slug'               => 'nullable|string|max:255|unique:resources,slug',
            'short_description'  => 'nullable|string|max:500',
            'description'        => 'nullable|string',
            'pdf'                => 'nullable|file|mimes:pdf|max:51200',
            'pdf_file'           => 'required_without:pdf|nullable|string|max:255',
            'thumbnail_file'     => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:10240',
            'thumbnail'          => 'nullable|string|max:255',
            'preview_pdf_file'   => 'nullable|file|mimes:pdf|max:20480',
            'preview_pdf'        => 'nullable|string|max:255',
            'file_size'          => 'nullable|string|max:50',
            'page_count'         => 'nullable|integer|min:0',
            'author_name'        => 'nullable|string|max:150',
            'material_type'      => 'nullable|string|max:100',
            'badge'              => 'nullable|string|max:50',
            'is_free'            => 'nullable|boolean',
            'actual_price'       => 'nullable|numeric|min:0',
            'sell_price'         => 'nullable|numeric|min:0',
            'currency'           => 'nullable|string|max:10',
            'is_featured'        => 'nullable|boolean',
            'is_active'          => 'nullable|boolean',
            'display_order'      => 'nullable|integer',
        ]);

        $item = $this->resourceService->create(
            $validated,
            $request->file('pdf'),
            $request->file('thumbnail_file'),
            $request->file('preview_pdf_file')
        );

        return $this->successResponse($item, 'Study material product added successfully.', 201);
    }

    /**
     * Update an existing Study Material.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $resource = Resource::findOrFail($id);

        $validated = $request->validate([
            'course_id'          => 'sometimes|required|exists:courses,id',
            'metadata_id'        => 'nullable|exists:metadata,id',
            'course_metadata_id' => 'nullable|exists:metadata,id',

            'subject'            => 'nullable|string|max:150',
            'topic'              => 'nullable|string|max:150',
            'subtopic'           => 'nullable|string|max:190',
            'title'              => 'sometimes|required|string|max:255',
            'slug'               => 'nullable|string|max:255|unique:resources,slug,' . $id,
            'short_description'  => 'nullable|string|max:500',
            'description'        => 'nullable|string',
            'pdf'                => 'nullable|file|mimes:pdf|max:51200',
            'pdf_file'           => 'nullable|string|max:255',
            'thumbnail_file'     => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:10240',
            'thumbnail'          => 'nullable|string|max:255',
            'preview_pdf_file'   => 'nullable|file|mimes:pdf|max:20480',
            'preview_pdf'        => 'nullable|string|max:255',
            'remove_thumbnail'   => 'nullable|boolean',
            'remove_preview_pdf' => 'nullable|boolean',
            'file_size'          => 'nullable|string|max:50',
            'page_count'         => 'nullable|integer|min:0',
            'author_name'        => 'nullable|string|max:150',
            'material_type'      => 'nullable|string|max:100',
            'badge'              => 'nullable|string|max:50',
            'is_free'            => 'nullable|boolean',
            'actual_price'       => 'nullable|numeric|min:0',
            'sell_price'         => 'nullable|numeric|min:0',
            'currency'           => 'nullable|string|max:10',
            'is_featured'        => 'nullable|boolean',
            'is_active'          => 'nullable|boolean',
            'display_order'      => 'nullable|integer',
        ]);

        $item = $this->resourceService->update(
            $resource,
            $validated,
            $request->file('pdf'),
            $request->file('thumbnail_file'),
            $request->file('preview_pdf_file')
        );

        return $this->successResponse($item, 'Study material updated successfully.');
    }

    /**
     * Row-level optimistic active/inactive toggle.
     */
    public function toggle(int $id): JsonResponse
    {
        $resource = Resource::findOrFail($id);
        $item = $this->resourceService->toggle($resource);

        return $this->successResponse($item, "Study material is now " . ($item->is_active ? 'Active' : 'Inactive') . ".");
    }

    /**
     * Row-level optimistic featured status toggle.
     */
    public function toggleFeatured(int $id): JsonResponse
    {
        $resource = Resource::findOrFail($id);
        $item = $this->resourceService->toggleFeatured($resource);

        return $this->successResponse($item, "Study material is now " . ($item->is_featured ? 'Featured' : 'Standard') . ".");
    }

    /**
     * Delete resource and its stored files.
     */
    public function destroy(int $id): JsonResponse
    {
        $resource = Resource::findOrFail($id);
        $this->resourceService->delete($resource);

        return $this->successResponse(null, 'Study material product deleted successfully.');
    }
}
