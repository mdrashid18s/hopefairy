<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Subject extends Model
{
    use HasFactory;

    protected $table = 'subjects';

    protected $fillable = [
        'course_id',
        'name',
        'slug',
        'code',
        'description',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'course_id' => 'integer',
        'is_active' => 'boolean',
        'display_order' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subject) {
            if (empty($subject->slug)) {
                $base = Str::slug($subject->name);
                $cnt = static::where('course_id', $subject->course_id)->where('slug', $base)->count();
                $subject->slug = $cnt > 0 ? "{$base}-" . ($cnt + 1) : $base;
            }
        });
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function topics(): HasMany
    {
        return $this->hasMany(Topic::class, 'subject_id')->orderBy('display_order')->orderBy('name');
    }

    public function subtopics(): HasMany
    {
        return $this->hasMany(Subtopic::class, 'subject_id');
    }

    public function metadata(): HasMany
    {
        return $this->hasMany(CourseMetadata::class, 'subject_id');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class, 'subject_id');
    }
}
