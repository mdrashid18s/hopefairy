<?php

namespace App\Http\Controllers;

use App\Services\IndiaAdmissionsService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class IndiaAdmissionsController extends Controller
{
    use ApiResponseTrait;

    protected IndiaAdmissionsService $admissionsService;

    public function __construct(IndiaAdmissionsService $admissionsService)
    {
        $this->admissionsService = $admissionsService;
    }

    /**
     * Get all India admissions streams.
     */
    public function index(): JsonResponse
    {
        $streams = $this->admissionsService->getAllStreams();

        return $this->successResponse([
            'eyebrow' => 'Admissions in India',
            'title'   => 'The Right College in India, the Right Program',
            'intro'   => 'Admission consulting for top Indian institutions across engineering, medicine, management, law and liberal arts — for undergraduate and postgraduate programs.',
            'streams' => $streams,
        ], 'India Admissions streams retrieved successfully.');
    }
}
