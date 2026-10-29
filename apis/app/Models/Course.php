<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $table = 'courses';

    protected $fillable = [
        'stream_id',
        'course_name',
        'level',
        'entrance_exams',
        'duration',
        'eligibility',
        'description',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'display_order' => 'integer',
        'stream_id' => 'integer',
    ];

    /**
     * Relationship to Stream (IndiaAdmission)
     */
    public function stream(): BelongsTo
    {
        return $this->belongsTo(IndiaAdmission::class, 'stream_id');
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class, 'course_id')->orderBy('display_order')->orderBy('name');
    }

    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class, 'course_id')->orderBy('display_order')->orderBy('name');
    }

    public function subtopics(): HasMany
    {
        return $this->hasMany(Subtopic::class, 'course_id')->orderBy('display_order')->orderBy('name');
    }

    public function metadata(): HasMany
    {
        return $this->hasMany(CourseMetadata::class, 'course_id');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class, 'course_id');
    }
}
