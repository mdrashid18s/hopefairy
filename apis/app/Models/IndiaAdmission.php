<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IndiaAdmission extends Model
{
    use HasFactory;

    protected $table = 'india_admissions';

    protected $fillable = [
        'slug',
        'name',
        'icon',
        'text',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    protected $appends = [
        'title',
        'ug',
        'pg',
        'ug_programs',
        'ug_exams',
        'pg_programs',
        'pg_exams',
    ];

    /**
     * Alias 'name' to 'title' so both properties work everywhere seamlessly
     */
    public function getTitleAttribute(): ?string
    {
        return $this->attributes['name'] ?? null;
    }

    /**
     * Relationship to individual Courses
     */
    public function courses()
    {
        return $this->hasMany(Course::class, 'stream_id')->orderBy('display_order');
    }

    /**
     * Dynamic 3NF accessor for undergraduate programs & exams
     */
    public function getUgAttribute(): array
    {
        $courses = $this->relationLoaded('courses') ? $this->courses : $this->courses()->get();
        $ugCourses = $courses->where('level', 'undergraduate')->where('is_active', true);

        $programs = $ugCourses->pluck('course_name')->unique()->values()->all();
        $exams = $ugCourses->pluck('entrance_exams')->filter()->flatMap(function ($item) {
            return array_map('trim', preg_split('/[·,]/u', $item));
        })->filter()->unique()->values()->all();

        return [
            'programs' => $programs,
            'exams' => $exams,
        ];
    }

    /**
     * Dynamic 3NF accessor for postgraduate programs & exams
     */
    public function getPgAttribute(): array
    {
        $courses = $this->relationLoaded('courses') ? $this->courses : $this->courses()->get();
        $pgCourses = $courses->where('level', 'postgraduate')->where('is_active', true);

        $programs = $pgCourses->pluck('course_name')->unique()->values()->all();
        $exams = $pgCourses->pluck('entrance_exams')->filter()->flatMap(function ($item) {
            return array_map('trim', preg_split('/[·,]/u', $item));
        })->filter()->unique()->values()->all();

        return [
            'programs' => $programs,
            'exams' => $exams,
        ];
    }

    /**
     * Backward-compatible 3NF accessors for legacy code expecting array properties
     */
    public function getUgProgramsAttribute(): array
    {
        return $this->ug['programs'] ?? [];
    }

    public function getUgExamsAttribute(): array
    {
        return $this->ug['exams'] ?? [];
    }

    public function getPgProgramsAttribute(): array
    {
        return $this->pg['programs'] ?? [];
    }

    public function getPgExamsAttribute(): array
    {
        return $this->pg['exams'] ?? [];
    }
}
