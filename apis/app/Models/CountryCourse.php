<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CountryCourse extends Model
{
    use HasFactory;

    protected $table = 'country_courses';

    protected $fillable = [
        'country_id',
        'course_name',
        'degree_level',
        'duration',
        'avg_fee',
        'intakes',
        'requirements',
        'description',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'is_active'     => 'boolean',
        'display_order' => 'integer',
        'country_id'    => 'integer',
    ];

    /**
     * Relationship: The country offering this course.
     */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }
}
