<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Subtopic extends Model
{
    use HasFactory;

    protected $table = 'subtopics';

    protected $fillable = [
        'topic_id',
        'name',
        'slug',
        'description',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'topic_id'      => 'integer',
        'is_active'     => 'boolean',
        'display_order' => 'integer',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    protected $appends = [
        'subject_id',
        'course_id',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subtopic) {
            if (empty($subtopic->slug)) {
                $base = Str::slug($subtopic->name);
                $cnt = static::where('topic_id', $subtopic->topic_id)->where('slug', $base)->count();
                $subtopic->slug = $cnt > 0 ? "{$base}-" . ($cnt + 1) : $base;
            }
        });
    }

    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

    /**
     * Relational subject access through parent topic (strict 3NF)
     */
    public function subject()
    {
        return $this->hasOneThrough(Subject::class, Topic::class, 'id', 'id', 'topic_id', 'subject_id');
    }

    /**
     * Dynamic backward-compatible accessor for subject_id
     */
    public function getSubjectIdAttribute(): ?int
    {
        return $this->topic ? $this->topic->subject_id : null;
    }

    /**
     * Dynamic backward-compatible accessor for course_id
     */
    public function getCourseIdAttribute(): ?int
    {
        return $this->topic && $this->topic->subject ? $this->topic->subject->course_id : null;
    }

    public function metadata(): HasMany
    {
        return $this->hasMany(CourseMetadata::class, 'subtopic_id');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class, 'subtopic_id');
    }
}
