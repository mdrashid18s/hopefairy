<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Topic extends Model
{
    use HasFactory;

    protected $table = 'topics';

    protected $fillable = [
        'subject_id',
        'name',
        'slug',
        'description',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'subject_id'    => 'integer',
        'is_active'     => 'boolean',
        'display_order' => 'integer',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    protected $appends = [
        'course_id',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($topic) {
            if (empty($topic->slug)) {
                $base = Str::slug($topic->name);
                $cnt = static::where('subject_id', $topic->subject_id)->where('slug', $base)->count();
                $topic->slug = $cnt > 0 ? "{$base}-" . ($cnt + 1) : $base;
            }
        });
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * Relational course access through the parent subject (strict 3NF)
     */
    public function course()
    {
        return $this->hasOneThrough(Course::class, Subject::class, 'id', 'id', 'subject_id', 'course_id');
    }

    /**
     * Dynamic backward-compatible accessor for course_id
     */
    public function getCourseIdAttribute(): ?int
    {
        return $this->subject ? $this->subject->course_id : null;
    }

    public function subtopics(): HasMany
    {
        return $this->hasMany(Subtopic::class, 'topic_id')->orderBy('display_order')->orderBy('name');
    }

    public function metadata(): HasMany
    {
        return $this->hasMany(CourseMetadata::class, 'topic_id');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class, 'topic_id');
    }
}
