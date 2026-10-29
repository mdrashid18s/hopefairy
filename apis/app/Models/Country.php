<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Country extends Model
{
    use HasFactory;

    protected $table = 'countries';

    protected $fillable = [
        'country_code',
        'name',
        'slug',
        'flag',
        'currency',
        'tagline',
        'description',
        'avg_tuition',
        'cost_of_living',
        'post_study_work',
        'intakes',
        'highlights',
        'universities_count',
        'is_active',
        'is_featured',
        'display_order',
    ];

    protected $casts = [
        'intakes'            => 'array',
        'highlights'         => 'array',
        'universities_count' => 'integer',
        'is_active'          => 'boolean',
        'is_featured'        => 'boolean',
        'display_order'      => 'integer',
    ];

    protected $appends = [
        'code',
        'courses',
    ];

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class, 'destination_id');
    }

    public function countryCourses(): HasMany
    {
        return $this->hasMany(CountryCourse::class, 'country_id')->orderBy('display_order');
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class, 'country_id')->orderBy('display_order');
    }

    public function getCodeAttribute(): ?string
    {
        return $this->country_code;
    }

    /**
     * 3NF Normalized dynamic accessor:
     * Pulls active courses straight from the relational 'country_courses' table via Foreign Key.
     */
    public function getCoursesAttribute(): array
    {
        if ($this->relationLoaded('countryCourses')) {
            return $this->countryCourses->pluck('course_name')->values()->toArray();
        }

        return $this->countryCourses()->pluck('course_name')->toArray();
    }
}
