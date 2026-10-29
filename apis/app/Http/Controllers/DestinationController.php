<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Services\DestinationService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    use ApiResponseTrait;

    protected DestinationService $destinationService;

    public function __construct(DestinationService $destinationService)
    {
        $this->destinationService = $destinationService;
    }

    /**
     * Display listing of active destinations matching the frontend structure.
     */
    public function index(): JsonResponse
    {
        $destinations = $this->destinationService->getAllActive();

        return $this->successResponse([
            'intro' => 'Study in the UK, USA, Canada, Australia, Ireland, Germany, New Zealand or France.',
            'items' => $destinations,
        ], 'Destinations retrieved successfully.');
    }

    /**
     * Display a single destination by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $destination = $this->destinationService->getBySlug($slug);

        if (!$destination) {
            return $this->errorResponse('Destination not found.', 404);
        }

        return $this->successResponse($destination, 'Destination details retrieved successfully.');
    }

    /**
     * Store a newly created destination.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100',
            'slug'          => 'required|string|max:100|unique:destinations,slug',
            'code'          => 'required|string|max:10',
            'flag'          => 'required|string|max:10',
            'tagline'       => 'required|string|max:255',
            'intakes'       => 'nullable|array',
            'courses'       => 'nullable|array',
            'highlights'    => 'nullable|array',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $destination = $this->destinationService->create($validated);

        return $this->successResponse($destination, 'Destination created successfully.', 201);
    }

    /**
     * Update the specified destination.
     */
    public function update(Request $request, Destination $destination): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:100',
            'slug'          => 'sometimes|required|string|max:100|unique:destinations,slug,' . $destination->id,
            'code'          => 'sometimes|required|string|max:10',
            'flag'          => 'sometimes|required|string|max:10',
            'tagline'       => 'sometimes|required|string|max:255',
            'intakes'       => 'nullable|array',
            'courses'       => 'nullable|array',
            'highlights'    => 'nullable|array',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $updated = $this->destinationService->update($destination, $validated);

        return $this->successResponse($updated, 'Destination updated successfully.');
    }

    /**
     * Remove the specified destination.
     */
    public function destroy(Destination $destination): JsonResponse
    {
        $this->destinationService->delete($destination);

        return $this->successResponse(null, 'Destination deleted successfully.');
    }
}
