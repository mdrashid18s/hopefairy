<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInquiryRequest;
use App\Services\InquiryService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class InquiryController extends Controller
{
    use ApiResponseTrait;

    protected InquiryService $inquiryService;

    public function __construct(InquiryService $inquiryService)
    {
        $this->inquiryService = $inquiryService;
    }

    /**
     * Submit contact form / booking session.
     */
    public function store(StoreInquiryRequest $request): JsonResponse
    {
        $validated = $request->validated();
        if (!empty($validated['website'])) {
            // Honeypot caught spam bot — return simulated success silently
            return $this->successResponse([
                'ok' => true,
            ], 'Thanks for contacting us! Our team will connect with you shortly.', 200);
        }

        $inquiry = $this->inquiryService->createInquiry($validated);

        return $this->successResponse([
            'ok'        => true,
            'id'        => $inquiry->id,
            'reference' => 'HPF-' . str_pad($inquiry->id, 5, '0', STR_PAD_LEFT),
        ], 'Thanks for contacting us! Our team will connect with you shortly.', 201);
    }
}
