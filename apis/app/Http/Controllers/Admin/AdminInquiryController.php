<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Services\InquiryService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminInquiryController extends Controller
{
    use ApiResponseTrait;

    protected InquiryService $inquiryService;

    public function __construct(InquiryService $inquiryService)
    {
        $this->inquiryService = $inquiryService;
    }

    /**
     * Get all student leads/inquiries with filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->query('status', 'all'),
            'type'   => $request->query('type', 'all'),
            'search' => $request->query('search', ''),
        ];

        $inquiries = $this->inquiryService->getAll($filters);

        return $this->successResponse($inquiries, 'Inquiries retrieved successfully.');
    }

    /**
     * Update lead status (e.g., 'new', 'contacted', 'scheduled', 'closed').
     */
    public function updateStatus(Request $request, Inquiry $inquiry): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:new,contacted,scheduled,closed',
        ]);

        $updated = $this->inquiryService->updateStatus($inquiry, $validated['status']);

        return $this->successResponse($updated, "Inquiry status updated to {$validated['status']}.");
    }

    /**
     * Delete an inquiry.
     */
    public function destroy(Inquiry $inquiry): JsonResponse
    {
        $this->inquiryService->deleteInquiry($inquiry);

        return $this->successResponse(null, 'Inquiry deleted successfully.');
    }

    /**
     * Toggle active/inactive status of an inquiry.
     */
    public function toggle(Inquiry $inquiry): JsonResponse
    {
        $updated = $this->inquiryService->toggle($inquiry);

        $statusText = $updated->is_active ? 'activated' : 'archived/inactivated';
        return $this->successResponse($updated, "Inquiry {$statusText} successfully.");
    }

    /**
     * Get dashboard summary statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = $this->inquiryService->getStats();

        return $this->successResponse($stats, 'Dashboard stats retrieved successfully.');
    }
}
