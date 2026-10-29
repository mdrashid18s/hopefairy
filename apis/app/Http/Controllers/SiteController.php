<?php

namespace App\Http\Controllers;

use App\Services\SiteContentService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class SiteController extends Controller
{
    use ApiResponseTrait;

    protected SiteContentService $siteContentService;

    public function __construct(SiteContentService $siteContentService)
    {
        $this->siteContentService = $siteContentService;
    }

    /**
     * Get site branding and contact configuration.
     */
    public function site(): JsonResponse
    {
        $data = $this->siteContentService->getSiteData();

        return $this->successResponse($data, 'Site configuration retrieved successfully.');
    }

    /**
     * Get active FAQs.
     */
    public function faqs(): JsonResponse
    {
        $faqs = $this->siteContentService->getFaqs();

        return $this->successResponse($faqs, 'FAQs retrieved successfully.');
    }
}
