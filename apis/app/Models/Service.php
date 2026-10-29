<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $table = 'services';

    protected $fillable = [
        'slug',
        'title',
        'headline',
        'short',
        'icon',
        'image',
        'intro',
        'features_title',
        'features',
        'highlights',
        'process_flow',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'intro' => 'array',
        'features' => 'array',
        'highlights' => 'array',
        'process_flow' => 'array',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    protected $appends = [
        'featuresTitle',
        'processFlow',
        'image_url',
        'imageUrl',
    ];

    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image)) {
            return null;
        }

        // If it's an external absolute URL
        if (preg_match('/^(https?:\/\/|\/\/)/i', $this->image)) {
            return $this->image;
        }

        // Relative path stored in public disk
        return url('storage/' . ltrim($this->image, '/'));
    }

    public function getFeaturesTitleAttribute(): string
    {
        return $this->attributes['features_title'] ?? "What’s Included";
    }

    public function getProcessFlowAttribute(): array
    {
        return $this->process_flow ?? [];
    }
}
