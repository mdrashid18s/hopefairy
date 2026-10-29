<?php

namespace App\Http\Controllers;

use App\Services\TestPrepService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class TestPrepController extends Controller
{
    use ApiResponseTrait;

    protected TestPrepService $testPrepService;

    public function __construct(TestPrepService $testPrepService)
    {
        $this->testPrepService = $testPrepService;
    }

    /**
     * Get test preparation courses with featured item and other tests.
     */
    public function index(): JsonResponse
    {
        $all = $this->testPrepService->getAll();
        $featured = $all->firstWhere('is_featured', true) ?? $all->first();
        $tests = $all->where('id', '!=', $featured?->id)->values();

        return $this->successResponse([
            'eyebrow'  => 'Test Preparation',
            'title'    => 'Expert Coaching for the Tests That Matter',
            'intro'    => 'Focused preparation programs that build concepts, speed and confidence — with practice tests and personal feedback at every stage.',
            'featured' => $featured,
            'tests'    => $tests,
        ], 'Test preparation courses retrieved successfully.');
    }

    /**
     * Show single course details.
     */
    public function show(string $identifier): JsonResponse
    {
        $course = $this->testPrepService->getBySlugOrCode($identifier);

        if (!$course) {
            return $this->errorResponse('Test prep course not found.', 404);
        }

        return $this->successResponse($course, 'Course details retrieved successfully.');
    }
}
