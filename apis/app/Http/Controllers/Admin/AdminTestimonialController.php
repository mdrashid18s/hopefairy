<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use App\Services\TestimonialService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTestimonialController extends Controller
{
    use ApiResponseTrait;

    protected TestimonialService $testimonialService;

    public function __construct(TestimonialService $testimonialService)
    {
        $this->testimonialService = $testimonialService;
    }

    /**
     * List all testimonials for Admin with filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $testimonials = $this->testimonialService->getAll($request->all());
        return $this->successResponse($testimonials, 'Testimonials retrieved successfully.');
    }

    /**
     * Public API endpoint for active testimonials on frontend.
     */
    public function publicIndex(): JsonResponse
    {
        $testimonials = $this->testimonialService->getPublic();
        return $this->successResponse($testimonials, 'Active testimonials retrieved successfully.');
    }

    /**
     * Create a new testimonial.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_name'         => 'required|string|max:120',
            'client_role'         => 'nullable|string|max:150',
            'avatar'              => 'nullable|string|max:255',
            'rating'              => 'nullable|integer|min:1|max:5',
            'review'              => 'required|string',
            'destination_country' => 'nullable|string|max:100',
            'course_program'      => 'nullable|string|max:150',
            'is_featured'         => 'nullable|boolean',
            'is_active'           => 'nullable|boolean',
            'display_order'       => 'nullable|integer',
        ]);

        $testimonial = $this->testimonialService->create($validated);

        return $this->successResponse($testimonial, 'Testimonial created successfully.', 201);
    }

    /**
     * Update an existing testimonial.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $testimonial = Testimonial::findOrFail($id);

        $validated = $request->validate([
            'client_name'         => 'sometimes|required|string|max:120',
            'client_role'         => 'nullable|string|max:150',
            'avatar'              => 'nullable|string|max:255',
            'rating'              => 'nullable|integer|min:1|max:5',
            'review'              => 'sometimes|required|string',
            'destination_country' => 'nullable|string|max:100',
            'course_program'      => 'nullable|string|max:150',
            'is_featured'         => 'nullable|boolean',
            'is_active'           => 'nullable|boolean',
            'display_order'       => 'nullable|integer',
        ]);

        $updated = $this->testimonialService->update($testimonial, $validated);

        return $this->successResponse($updated, 'Testimonial updated successfully.');
    }

    /**
     * Toggle active/inactive status (optimistic row-level mutation).
     */
    public function toggle(int $id): JsonResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $updated = $this->testimonialService->toggle($testimonial);

        return $this->successResponse([
            'id'        => $updated->id,
            'is_active' => $updated->is_active,
        ], 'Testimonial status toggled successfully.');
    }

    /**
     * Upload avatar DP image for testimonial.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|file|image|mimes:jpeg,png,jpg,webp,svg,gif,avif|max:5120',
        ]);

        $data = $this->testimonialService->uploadAvatar($request->file('avatar'));

        return $this->successResponse($data, 'Avatar uploaded successfully.');
    }

    /**
     * Delete testimonial.
     */
    public function destroy(int $id): JsonResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $this->testimonialService->delete($testimonial);

        return $this->successResponse(null, 'Testimonial deleted successfully.');
    }
}
