<?php

namespace App\Http\Controllers;

use App\Services\OfferingService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class OfferingController extends Controller
{
    use ApiResponseTrait;

    protected OfferingService $offeringService;

    public function __construct(OfferingService $offeringService)
    {
        $this->offeringService = $offeringService;
    }

    /**
     * Get all active services with features, highlights, and process flow.
     */
    public function index(): JsonResponse
    {
        $services = $this->offeringService->getAll();

        return $this->successResponse([
            'intro' => 'From choosing the right course to boarding your flight, HopeFairy covers every stage of the study abroad journey with one dedicated team.',
            'items' => $services,
        ], 'Services retrieved successfully.');
    }

    /**
     * Get single service by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $service = $this->offeringService->getBySlug($slug);

        if (!$service) {
            return $this->errorResponse('Service not found.', 404);
        }

        return $this->successResponse($service, 'Service details retrieved successfully.');
    }
}
