<?php

namespace App\Services;

use App\Models\IndiaAdmission;
use Illuminate\Database\Eloquent\Collection;

class IndiaAdmissionsService extends CourseService
{
    /**
     * Get all active Indian admissions streams with active courses.
     */
    public function getAllStreams(): Collection
    {
        return IndiaAdmission::where('is_active', true)
            ->with(['courses' => function ($q) {
                $q->where('is_active', true)->orderBy('display_order', 'asc');
            }])
            ->orderBy('display_order', 'asc')
            ->get();
    }
}
