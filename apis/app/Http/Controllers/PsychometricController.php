<?php

namespace App\Http\Controllers;

use App\Services\PsychometricService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class PsychometricController extends Controller
{
    use ApiResponseTrait;

    protected PsychometricService $psychometricService;

    public function __construct(PsychometricService $psychometricService)
    {
        $this->psychometricService = $psychometricService;
    }

    /**
     * Get psychometric and Hope Fairy Compass data.
     */
    public function index(): JsonResponse
    {
        $data = $this->psychometricService->getSectionData();

        return $this->successResponse($data, 'Psychometric and Hope Fairy Compass data retrieved successfully.');
    }
}
