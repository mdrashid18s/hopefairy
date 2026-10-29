<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Testimonial extends Model
{
    use HasFactory;

    protected $table = 'testimonials';

    protected $fillable = [
        'client_name',
        'client_role',
        'avatar',
        'rating',
        'review',
        'country_id',
        'course_program',
        'is_featured',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'country_id'    => 'integer',
        'rating'        => 'integer',
        'is_featured'   => 'boolean',
        'is_active'     => 'boolean',
        'display_order' => 'integer',
    ];

    protected $appends = [
        'avatar_url',
        'destination_country',
        'country_name',
        'country_code',
        'country_flag',
    ];

    /**
     * Relationship to target study destination country (3NF normalized)
     */
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_id');
    }

    /**
     * Backward-compatible virtual accessor for destination_country string
     */
    public function getDestinationCountryAttribute(): ?string
    {
        return $this->country?->name;
    }

    public function getCountryNameAttribute(): ?string
    {
        return $this->country?->name;
    }

    public function getCountryCodeAttribute(): ?string
    {
        return $this->country?->country_code;
    }

    public function getCountryFlagAttribute(): ?string
    {
        return $this->country?->flag;
    }

    /**
     * Get avatar full URL if available
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (empty($this->avatar)) {
            return null;
        }

        if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
            return $this->avatar;
        }

        return url('/' . ltrim($this->avatar, '/'));
    }
}
