<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Services\OfferingService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOfferingController extends Controller
{
    use ApiResponseTrait;

    protected OfferingService $offeringService;

    public function __construct(OfferingService $offeringService)
    {
        $this->offeringService = $offeringService;
    }

    /**
     * List all services for admin.
     */
    public function index(): JsonResponse
    {
        $services = $this->offeringService->getAll();
        return $this->successResponse($services, 'Services list retrieved successfully.');
    }

    /**
     * Standalone Image Upload API endpoint for services.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|image|mimes:jpeg,png,jpg,webp,svg,avif|max:5120',
        ]);

        try {
            $data = $this->offeringService->uploadImage($request->file('image'));
            return $this->successResponse($data, 'Image uploaded successfully.', 201);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Store new service.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:150',
            'slug'          => 'nullable|string|max:150|unique:services,slug',
            'headline'      => 'required|string|max:255',
            'short'         => 'required|string|max:255',
            'icon'          => 'nullable|string|max:50',
            'image'         => 'nullable',
            'features'      => 'nullable',
            'highlights'    => 'nullable',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $imageFile = $request->hasFile('image') ? $request->file('image') : null;
        $service = $this->offeringService->create($validated, $imageFile);

        return $this->successResponse($service, 'Service created successfully.', 201);
    }

    /**
     * Update existing service.
     */
    public function update(Request $request, Service $service): JsonResponse
    {
        $validated = $request->validate([
            'title'         => 'sometimes|required|string|max:150',
            'slug'          => 'sometimes|required|string|max:150|unique:services,slug,' . $service->id,
            'headline'      => 'sometimes|required|string|max:255',
            'short'         => 'sometimes|required|string|max:255',
            'icon'          => 'nullable|string|max:50',
            'image'         => 'nullable',
            'features'      => 'nullable',
            'highlights'    => 'nullable',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $imageFile = $request->hasFile('image') ? $request->file('image') : null;
        $updated = $this->offeringService->update($service, $validated, $imageFile);

        return $this->successResponse($updated, 'Service updated successfully.');
    }

    /**
     * Toggle service active status.
     */
    public function toggle(Service $service): JsonResponse
    {
        $updated = $this->offeringService->toggle($service);
        $statusStr = $updated->is_active ? 'activated' : 'deactivated';
        return $this->successResponse($updated, "Service has been {$statusStr}.");
    }

    /**
     * Delete service and cleans up its stored image.
     */
    public function destroy(Service $service): JsonResponse
    {
        $this->offeringService->delete($service);
        return $this->successResponse(null, 'Service deleted successfully.');
    }
}
