<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Services\DestinationService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDestinationController extends Controller
{
    use ApiResponseTrait;

    protected DestinationService $destinationService;

    public function __construct(DestinationService $destinationService)
    {
        $this->destinationService = $destinationService;
    }

    /**
     * List all countries (both active and inactive) from countries table.
     */
    public function index(Request $request): JsonResponse
    {
        $countries = $this->destinationService->getAll($request->all());
        return $this->successResponse($countries, 'Countries list retrieved successfully.');
    }

    /**
     * Store a newly created country with auto-derived code, slug, and defaults.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'required|string|max:100',
            'slug'          => 'nullable|string|max:120',
            'code'          => 'nullable|string|max:10',
            'flag'          => 'nullable|string|max:10',
            'tagline'       => 'nullable|string|max:255',
            'currency'      => 'nullable|string|max:20',
            'intakes'       => 'nullable',
            'courses'       => 'nullable',
            'highlights'    => 'nullable',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $code = $this->destinationService->resolveCountryCode($validated['name'], $validated['code'] ?? null);
        if (!$code) {
            return $this->errorResponse(
                "The country '{$validated['name']}' does not exist. Please enter a valid country name (e.g. United Kingdom, Germany, Canada, Australia).",
                422,
                ['name' => ["The country '{$validated['name']}' is not a recognized country."]]
            );
        }

        $validated['country_code'] = $code;
        $validated['code'] = $code;
        $country = $this->destinationService->create($validated);

        return $this->successResponse($country, "Country {$country->name} added successfully.", 201);
    }

    /**
     * Update an existing country in countries table.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $country = is_numeric($id) ? Country::findOrFail($id) : Country::where('slug', $id)->firstOrFail();

        $validated = $request->validate([
            'name'          => 'sometimes|required|string|max:100',
            'slug'          => 'nullable|string|max:120',
            'code'          => 'nullable|string|max:10',
            'flag'          => 'nullable|string|max:10',
            'tagline'       => 'nullable|string|max:255',
            'currency'      => 'nullable|string|max:20',
            'intakes'       => 'nullable',
            'courses'       => 'nullable',
            'highlights'    => 'nullable',
            'is_active'     => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        if (!empty($validated['name'])) {
            $code = $this->destinationService->resolveCountryCode($validated['name'], $validated['code'] ?? null);
            if (!$code) {
                return $this->errorResponse(
                    "The country '{$validated['name']}' does not exist. Please enter a valid country name (e.g. United Kingdom, Germany, Canada, Australia).",
                    422,
                    ['name' => ["The country '{$validated['name']}' is not a recognized country."]]
                );
            }
            $validated['code'] = $code;
            $validated['country_code'] = $code;
        }

        $updated = $this->destinationService->update($country, $validated);

        return $this->successResponse($updated, "Country {$updated->name} updated successfully.");
    }

    /**
     * Toggle the is_active status of a country.
     */
    public function toggle($id): JsonResponse
    {
        $country = is_numeric($id) ? Country::findOrFail($id) : Country::where('slug', $id)->firstOrFail();
        $updated = $this->destinationService->toggle($country);

        $statusText = $updated->is_active ? 'activated' : 'deactivated';
        return $this->successResponse($updated, "Country {$updated->name} {$statusText} successfully.");
    }

    /**
     * Delete a country.
     */
    public function destroy($id): JsonResponse
    {
        $country = is_numeric($id) ? Country::findOrFail($id) : Country::where('slug', $id)->firstOrFail();
        $name = $country->name;
        $this->destinationService->delete($country);

        return $this->successResponse(null, "Country {$name} deleted successfully.");
    }
}
