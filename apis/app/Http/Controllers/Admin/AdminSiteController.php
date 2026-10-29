<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Services\SiteContentService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSiteController extends Controller
{
    use ApiResponseTrait;

    protected SiteContentService $siteContentService;

    public function __construct(SiteContentService $siteContentService)
    {
        $this->siteContentService = $siteContentService;
    }

    /**
     * Get all site settings as a key-value dictionary.
     */
    public function getSettings(): JsonResponse
    {
        $settings = $this->siteContentService->getSettings();
        return $this->successResponse($settings, 'Site settings retrieved successfully.');
    }

    /**
     * Bulk update site settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'settings' => 'required|array',
        ]);

        $settings = $this->siteContentService->updateSettings($data['settings']);
        return $this->successResponse($settings, 'Site settings updated successfully.');
    }

    /**
     * List all FAQs for admin.
     */
    public function getFaqs(): JsonResponse
    {
        $faqs = $this->siteContentService->getAllFaqs();
        return $this->successResponse($faqs, 'FAQs list retrieved successfully.');
    }

    /**
     * Store new FAQ.
     */
    public function storeFaq(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q'             => 'required|string|max:500',
            'a'             => 'required|string',
            'display_order' => 'nullable|integer',
            'is_active'     => 'nullable|boolean',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $faq = $this->siteContentService->createFaq($validated);

        return $this->successResponse($faq, 'FAQ created successfully.', 201);
    }

    /**
     * Update existing FAQ.
     */
    public function updateFaq(Request $request, Faq $faq): JsonResponse
    {
        $validated = $request->validate([
            'q'             => 'sometimes|required|string|max:500',
            'a'             => 'sometimes|required|string',
            'display_order' => 'nullable|integer',
            'is_active'     => 'nullable|boolean',
        ]);

        $updated = $this->siteContentService->updateFaq($faq, $validated);

        return $this->successResponse($updated, 'FAQ updated successfully.');
    }

    /**
     * Delete FAQ.
     */
    public function destroyFaq(Faq $faq): JsonResponse
    {
        $this->siteContentService->deleteFaq($faq);
        return $this->successResponse(null, 'FAQ deleted successfully.');
    }
}
