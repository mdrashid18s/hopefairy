<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestPrep extends Model
{
    use HasFactory;

    protected $table = 'test_preps';

    protected $fillable = [
        'code',
        'name',
        'slug',
        'icon',
        'flag',
        'tagline',
        'text',
        'subjects',
        'features',
        'cta',
        'is_featured',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'subjects' => 'array',
        'features' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];
}
