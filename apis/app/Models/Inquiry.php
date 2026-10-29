<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inquiry extends Model
{
    use HasFactory;

    protected $table = 'inquiries';

    protected $fillable = [
        'type',
        'name',
        'phone',
        'email',
        'city',
        'interest',
        'qualification',
        'study_level',
        'destination_id',
        'destination_name',
        'intake',
        'course',
        'message',
        'lead_status',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'destination_id');
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'destination_id');
    }
}

