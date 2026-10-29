<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Resource extends Model
{
    use HasFactory;

    protected $table = 'resources';

    protected $fillable = [
        'course_id',
        'metadata_id',
        'course_metadata_id',
        'subject_id',
        'topic_id',
        'subtopic_id',
        'title',
        'slug',
        'short_description',
        'description',
        'thumbnail',
        'pdf_file',
        'preview_pdf',
        'file_size',
        'page_count',
        'author_name',
        'material_type',
        'badge',
        'is_free',
        'actual_price',
        'sell_price',
        'discount_percent',
        'currency',
        'download_count',
        'rating',
        'rating_count',
        'is_featured',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'course_id'          => 'integer',
        'metadata_id'        => 'integer',
        'course_metadata_id' => 'integer',
        'subject_id'         => 'integer',
        'topic_id'           => 'integer',
        'subtopic_id'        => 'integer',
        'is_free'            => 'boolean',
        'actual_price'       => 'float',
        'sell_price'         => 'float',
        'discount_percent'   => 'integer',
        'page_count'         => 'integer',
        'download_count'     => 'integer',
        'rating'             => 'float',
        'rating_count'       => 'integer',
        'is_featured'        => 'boolean',
        'is_active'          => 'boolean',
        'display_order'      => 'integer',
        'created_at'         => 'datetime',
        'updated_at'         => 'datetime',
    ];

    protected $appends = [
        'course_metadata_id',
        'pdf_url',
        'preview_pdf_url',
        'thumbnail_url',
        'course_name',
        'savings_amount',
        'subject',
        'topic',
        'subtopic',
    ];

    /**
     * Auto-calculate discount percentage, slug, and relational hierarchy before saving.
     */
    protected static function booted(): void
    {
        static::saving(function (self $resource) {
            // Slug generation
            if (empty($resource->slug) && !empty($resource->title)) {
                $baseSlug = Str::slug($resource->title);
                $resource->slug = $baseSlug ?: 'resource-' . uniqid();
            }

            // Sync metadata_id from course_metadata_id if provided
            if (empty($resource->metadata_id) && !empty($resource->course_metadata_id)) {
                $resource->metadata_id = $resource->course_metadata_id;
            }

            // Sync from metadata if metadata_id present
            if (!empty($resource->metadata_id) && (empty($resource->subject_id) || empty($resource->topic_id) || empty($resource->subtopic_id))) {
                $meta = CourseMetadata::find($resource->metadata_id);
                if ($meta) {
                    $resource->course_id = $resource->course_id ?: $meta->course_id;
                    $resource->subject_id = $resource->subject_id ?: $meta->subject_id;
                    $resource->topic_id = $resource->topic_id ?: $meta->topic_id;
                    $resource->subtopic_id = $resource->subtopic_id ?: $meta->subtopic_id;
                }
            }

            // Free vs Paid calculation
            if ($resource->is_free) {
                $resource->sell_price = 0.00;
                $resource->discount_percent = 100;
            } elseif ($resource->actual_price > 0 && $resource->sell_price < $resource->actual_price) {
                $savings = $resource->actual_price - $resource->sell_price;
                $pct = ($savings / $resource->actual_price) * 100;
                $resource->discount_percent = (int) round($pct);
            } else {
                $resource->discount_percent = 0;
            }

            // Clean any non-column attributes
            unset($resource->attributes['course_metadata_id'], $resource->attributes['subject'], $resource->attributes['topic'], $resource->attributes['subtopic']);
        });
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function metadata(): BelongsTo
    {
        return $this->belongsTo(CourseMetadata::class, 'metadata_id');
    }

    public function courseMetadata(): BelongsTo
    {
        return $this->belongsTo(CourseMetadata::class, 'metadata_id');
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

    public function getCourseMetadataIdAttribute(): ?int
    {
        return $this->metadata_id;
    }

    public function setCourseMetadataIdAttribute($value): void
    {
        $this->metadata_id = $value ? (int)$value : null;
    }

    public function getCourseNameAttribute(): ?string
    {
        return $this->course ? $this->course->course_name : null;
    }

    public function getSubjectAttribute(): ?string
    {
        if ($this->subjectModel) return $this->subjectModel->name;
        if ($this->metadata && $this->metadata->subjectModel) return $this->metadata->subjectModel->name;
        return null;
    }

    public function getTopicAttribute(): ?string
    {
        if ($this->topicModel) return $this->topicModel->name;
        if ($this->metadata && $this->metadata->topicModel) return $this->metadata->topicModel->name;
        return null;
    }

    public function getSubtopicAttribute(): ?string
    {
        if ($this->subtopicModel) return $this->subtopicModel->name;
        if ($this->metadata && $this->metadata->subtopicModel) return $this->metadata->subtopicModel->name;
        return null;
    }

    public function getSavingsAmountAttribute(): float
    {
        if ($this->is_free) {
            return (float)$this->actual_price;
        }
        return max(0, round((float)$this->actual_price - (float)$this->sell_price, 2));
    }

    public function getPdfUrlAttribute(): ?string
    {
        return $this->resolveFileUrl($this->pdf_file);
    }

    public function getPreviewPdfUrlAttribute(): ?string
    {
        return $this->resolveFileUrl($this->preview_pdf);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->resolveFileUrl($this->thumbnail);
    }

    protected function resolveFileUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (preg_match('/^(https?:\/\/|\/\/)/i', $path)) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }
}
