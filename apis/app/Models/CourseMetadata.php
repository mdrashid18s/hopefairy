<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CourseMetadata extends Model
{
    use HasFactory;

    protected $table = 'metadata';

    protected $fillable = [
        'course_id',
        'subject_id',
        'topic_id',
        'subtopic_id',
        'description',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'course_id'     => 'integer',
        'subject_id'    => 'integer',
        'topic_id'      => 'integer',
        'subtopic_id'   => 'integer',
        'is_active'     => 'boolean',
        'display_order' => 'integer',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    protected $appends = [
        'course_name',
        'subject',
        'topic',
        'subtopic',
    ];

    protected static function boot()
    {
        parent::boot();

        // Auto-resolve relational 3NF master records before saving
        static::saving(function ($meta) {
            // 1. Resolve Subject from passed text if subject_id not passed
            $passedSubject = request()->input('subject') ?? ($meta->attributes['subject'] ?? null);
            if (empty($meta->subject_id) && !empty($passedSubject) && !empty($meta->course_id)) {
                $sName = trim($passedSubject);
                $sub = Subject::firstOrCreate(
                    ['course_id' => $meta->course_id, 'name' => $sName],
                    ['slug' => Str::slug($sName), 'is_active' => true]
                );
                $meta->subject_id = $sub->id;
            }

            // 2. Resolve Topic from passed text if topic_id not passed
            $passedTopic = request()->input('topic') ?? ($meta->attributes['topic'] ?? null);
            if (empty($meta->topic_id) && !empty($passedTopic) && !empty($meta->subject_id)) {
                $tName = trim($passedTopic);
                $top = Topic::firstOrCreate(
                    ['subject_id' => $meta->subject_id, 'name' => $tName],
                    ['slug' => Str::slug($tName), 'is_active' => true]
                );
                $meta->topic_id = $top->id;
            }

            // 3. Resolve Subtopic from passed text if subtopic_id not passed
            $passedSubtopic = request()->input('subtopic') ?? ($meta->attributes['subtopic'] ?? null);
            if (empty($meta->subtopic_id) && !empty($passedSubtopic) && !empty($meta->topic_id)) {
                $stName = trim($passedSubtopic);
                $subt = Subtopic::firstOrCreate(
                    ['topic_id' => $meta->topic_id, 'name' => $stName],
                    ['slug' => Str::slug($stName), 'is_active' => true]
                );
                $meta->subtopic_id = $subt->id;
            }

            // Clean any stale non-column attributes before saving to database
            unset($meta->attributes['subject'], $meta->attributes['topic'], $meta->attributes['subtopic']);
        });
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function subjectModel(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function topicModel(): BelongsTo
    {
        return $this->belongsTo(Topic::class, 'topic_id');
    }

    public function subtopicModel(): BelongsTo
    {
        return $this->belongsTo(Subtopic::class, 'subtopic_id');
    }

    public function resources(): HasMany
    {
        return $this->hasMany(Resource::class, 'metadata_id');
    }

    public function getCourseNameAttribute(): ?string
    {
        return $this->course ? $this->course->course_name : null;
    }

    public function getSubjectAttribute(): ?string
    {
        return $this->subjectModel ? $this->subjectModel->name : null;
    }

    public function getTopicAttribute(): ?string
    {
        return $this->topicModel ? $this->topicModel->name : null;
    }

    public function getSubtopicAttribute(): ?string
    {
        return $this->subtopicModel ? $this->subtopicModel->name : null;
    }
}
