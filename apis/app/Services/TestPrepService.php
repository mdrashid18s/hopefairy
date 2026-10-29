<?php

namespace App\Services;

use App\Models\TestPrep;
use Illuminate\Database\Eloquent\Collection;

class TestPrepService
{
    /**
     * Get all active test preparation courses.
     */
    public function getAll(): Collection
    {
        return TestPrep::where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->get();
    }

    /**
     * Get single test prep by code or slug.
     */
    public function getBySlugOrCode(string $identifier): ?TestPrep
    {
        return TestPrep::where('slug', $identifier)
            ->orWhere('code', strtoupper($identifier))
            ->first();
    }
}
