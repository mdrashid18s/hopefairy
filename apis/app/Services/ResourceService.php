<?php

namespace App\Services;

use App\Models\Course;
use App\Models\CourseMetadata;
use App\Models\Resource;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResourceService
{
    /**
     * Retrieve all study material resources with comprehensive filtering.
     */
    public function getAll(array $filters = []): Collection
    {
        // Auto-sync: Ensure every metadata subtopic in the system has a product resource
        $this->syncMissingFromMetadata();

        $query = Resource::with(['course', 'metadata']);

        // Course filter
        if (!empty($filters['course_id']) && $filters['course_id'] !== 'all') {
            $query->where('course_id', $filters['course_id']);
        }

        // Specific metadata subtopic link
        $metaId = $filters['metadata_id'] ?? ($filters['course_metadata_id'] ?? null);
        if (!empty($metaId) && $metaId !== 'all') {
            $query->where('metadata_id', $metaId);
        }


        // Subject filter
        if (!empty($filters['subject']) && $filters['subject'] !== 'all') {
            $query->where('subject', $filters['subject']);
        }

        // Material Type filter
        if (!empty($filters['material_type']) && $filters['material_type'] !== 'all') {
            $query->where('material_type', $filters['material_type']);
        }

        // Free vs Paid filter
        if (isset($filters['is_free']) && $filters['is_free'] !== '' && $filters['is_free'] !== 'all') {
            $query->where('is_free', filter_var($filters['is_free'], FILTER_VALIDATE_BOOLEAN));
        }

        // Featured filter
        if (isset($filters['is_featured']) && $filters['is_featured'] !== '' && $filters['is_featured'] !== 'all') {
            $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN));
        }

        // Active status filter
        if (isset($filters['is_active']) && $filters['is_active'] !== '' && $filters['is_active'] !== 'all') {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        // Global search across title, description, author, subject, topic, subtopic
        if (!empty($filters['search'])) {
            $term = trim($filters['search']);
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                  ->orWhere('short_description', 'like', "%{$term}%")
                  ->orWhere('description', 'like', "%{$term}%")
                  ->orWhere('author_name', 'like', "%{$term}%")
                  ->orWhere('subject', 'like', "%{$term}%")
                  ->orWhere('topic', 'like', "%{$term}%")
                  ->orWhere('subtopic', 'like', "%{$term}%")
                  ->orWhereHas('course', function ($cq) use ($term) {
                      $cq->where('course_name', 'like', "%{$term}%");
                  });
            });
        }

        return $query->orderBy('display_order', 'asc')
                     ->orderBy('id', 'desc')
                     ->get();
    }

    /**
     * Compute real-time dashboard KPI metrics for the study materials store.
     */
    public function getStats(): array
    {
        $total = Resource::count();
        $freeCount = Resource::where('is_free', true)->count();
        $paidCount = Resource::where('is_free', false)->count();
        $totalDownloads = (int) Resource::sum('download_count');
        $catalogValue = (float) Resource::sum('sell_price');
        $coursesCovered = Resource::distinct('course_id')->count('course_id');
        $featuredCount = Resource::where('is_featured', true)->count();

        return [
            'total_resources'  => $total,
            'free_resources'   => $freeCount,
            'paid_resources'   => $paidCount,
            'total_downloads'  => $totalDownloads,
            'catalog_value'    => $catalogValue,
            'courses_covered'  => $coursesCovered,
            'featured_count'   => $featuredCount,
        ];
    }

    /**
     * Store an uploaded file to public storage and return metadata.
     */
    public function uploadFile(UploadedFile $file, string $folder = 'resources'): array
    {
        $path = $file->store($folder, 'public');
        $size = $this->formatBytes($file->getSize());
        $name = $file->getClientOriginalName();

        return [
            'path'          => $path,
            'url'           => Storage::disk('public')->url($path),
            'file_size'     => $size,
            'original_name' => $name,
        ];
    }

    /**
     * Create a new Resource / Study Material product linked to metadata.
     */
    public function create(
        array $data,
        ?UploadedFile $pdfFile = null,
        ?UploadedFile $thumbnailFile = null,
        ?UploadedFile $previewFile = null
    ): Resource {
        // Upload main PDF
        if ($pdfFile) {
            $upload = $this->uploadFile($pdfFile, 'resources/materials');
            $data['pdf_file'] = $upload['path'];
            $data['file_size'] = $upload['file_size'];
        }

        // Upload Cover Thumbnail
        if ($thumbnailFile) {
            $thumbUpload = $this->uploadFile($thumbnailFile, 'resources/thumbnails');
            $data['thumbnail'] = $thumbUpload['path'];
        }

        // Upload Preview PDF
        if ($previewFile) {
            $prevUpload = $this->uploadFile($previewFile, 'resources/previews');
            $data['preview_pdf'] = $prevUpload['path'];
        }

        // If metadata_id provided, sync subject, topic, subtopic and course_id
        $metaId = $data['metadata_id'] ?? ($data['course_metadata_id'] ?? null);
        if (!empty($metaId)) {
            $data['metadata_id'] = $metaId;
            $meta = CourseMetadata::find($metaId);
            if ($meta) {
                $data['course_id'] = $meta->course_id;
                $data['subject_id'] = $meta->subject_id;
                $data['topic_id'] = $meta->topic_id;
                $data['subtopic_id'] = $meta->subtopic_id;
            }
        }


        // Set slug
        if (empty($data['slug']) && !empty($data['title'])) {
            $baseSlug = Str::slug($data['title']);
            $count = Resource::where('slug', 'like', "{$baseSlug}%")->count();
            $data['slug'] = $count ? "{$baseSlug}-" . ($count + 1) : $baseSlug;
        }

        $data['is_active'] = $data['is_active'] ?? true;
        $data['display_order'] = $data['display_order'] ?? (Resource::max('display_order') + 1);

        $resource = Resource::create($data);
        $resource->load(['course', 'metadata']);

        return $resource;
    }

    /**
     * Update an existing Resource / Study Material.
     */
    public function update(
        Resource $resource,
        array $data,
        ?UploadedFile $pdfFile = null,
        ?UploadedFile $thumbnailFile = null,
        ?UploadedFile $previewFile = null
    ): Resource {
        // Handle PDF replacement
        if ($pdfFile) {
            $this->deletePhysicalFile($resource->pdf_file);
            $upload = $this->uploadFile($pdfFile, 'resources/materials');
            $data['pdf_file'] = $upload['path'];
            $data['file_size'] = $upload['file_size'];
        }

        // Handle Thumbnail replacement
        if ($thumbnailFile) {
            $this->deletePhysicalFile($resource->thumbnail);
            $thumbUpload = $this->uploadFile($thumbnailFile, 'resources/thumbnails');
            $data['thumbnail'] = $thumbUpload['path'];
        } elseif (!empty($data['remove_thumbnail'])) {
            $this->deletePhysicalFile($resource->thumbnail);
            $data['thumbnail'] = null;
        }
        unset($data['remove_thumbnail']);

        // Handle Preview PDF replacement
        if ($previewFile) {
            $this->deletePhysicalFile($resource->preview_pdf);
            $prevUpload = $this->uploadFile($previewFile, 'resources/previews');
            $data['preview_pdf'] = $prevUpload['path'];
        } elseif (!empty($data['remove_preview_pdf'])) {
            $this->deletePhysicalFile($resource->preview_pdf);
            $data['preview_pdf'] = null;
        }
        unset($data['remove_preview_pdf']);

        // Sync metadata fields if metadata ID changed
        $metaId = $data['metadata_id'] ?? ($data['course_metadata_id'] ?? null);
        if (!empty($metaId)) {
            $data['metadata_id'] = $metaId;
            $meta = CourseMetadata::find($metaId);
            if ($meta) {
                $data['course_id'] = $meta->course_id;
                $data['subject_id'] = $meta->subject_id;
                $data['topic_id'] = $meta->topic_id;
                $data['subtopic_id'] = $meta->subtopic_id;
            }
        }


        $resource->update($data);
        $resource->load(['course', 'metadata']);

        return $resource->fresh(['course', 'metadata']);
    }

    /**
     * Optimistic row toggle for active/inactive state.
     */
    public function toggle(Resource $resource): Resource
    {
        $resource->is_active = !$resource->is_active;
        $resource->save();
        $resource->load(['course', 'metadata']);

        return $resource;
    }

    /**
     * Optimistic row toggle for featured state.
     */
    public function toggleFeatured(Resource $resource): Resource
    {
        $resource->is_featured = !$resource->is_featured;
        $resource->save();
        $resource->load(['course', 'metadata']);

        return $resource;
    }

    /**
     * Record a download event.
     */
    public function recordDownload(Resource $resource): Resource
    {
        $resource->increment('download_count');
        return $resource;
    }

    /**
     * Delete resource and clean up all associated stored files.
     */
    public function delete(Resource $resource): bool
    {
        $this->deletePhysicalFile($resource->pdf_file);
        $this->deletePhysicalFile($resource->thumbnail);
        $this->deletePhysicalFile($resource->preview_pdf);

        return (bool) $resource->delete();
    }

    /**
     * Format byte sizes into human readable units.
     */
    public function formatBytes(int $bytes, int $precision = 1): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Auto-sync: Ensure every CourseMetadata entry in the system has an associated Study Material product.
     */
    public function syncMissingFromMetadata(): void
    {
        $allMetadata = CourseMetadata::with('course')->get();

        foreach ($allMetadata as $meta) {
            $exists = Resource::where('metadata_id', $meta->id)->exists();
            if (!$exists) {
                // Determine sensible defaults based on subject/course
                $courseName = $meta->course ? $meta->course->course_name : 'Course';
                $isFree = in_array($meta->id, [2, 4]); // some free, some paid
                $actual = $isFree ? 499.00 : 799.00;
                $sell = $isFree ? 0.00 : 299.00;
                $pct = $isFree ? 100 : 63;

                $type = 'Study Notes';
                if (stripos($meta->subject, 'Mathematics') !== false || stripos($meta->topic, 'Linear') !== false) {
                    $type = 'Formula Sheet';
                } elseif (stripos($meta->subject, 'Anatomy') !== false || stripos($meta->subject, 'Physiology') !== false) {
                    $type = 'Handwritten Notes';
                } elseif (stripos($meta->subject, 'Computer') !== false || stripos($meta->topic, 'Data') !== false) {
                    $type = 'Complete Syllabus Guide';
                } elseif (stripos($meta->subject, 'Finance') !== false || stripos($meta->subject, 'Management') !== false) {
                    $type = 'Complete Syllabus Guide';
                }

                $badge = ($meta->id % 2 === 0) ? 'Bestseller' : 'Trending';

                Resource::create([
                    'course_id'          => $meta->course_id,
                    'metadata_id'        => $meta->id,
                    'subject_id'         => $meta->subject_id,
                    'topic_id'           => $meta->topic_id,
                    'subtopic_id'        => $meta->subtopic_id,
                    'title'              => "{$meta->subtopic} — Complete Illustrated Notes",
                    'slug'               => Str::slug($meta->subtopic . '-' . $meta->id),

                    'short_description'  => "High-yield illustrated notes, diagrams, and revision formula cards for {$meta->subtopic} in {$courseName}.",
                    'description'        => $meta->description ?: "Comprehensive curriculum coverage and exam preparation handbook for {$meta->subtopic} ({$meta->subject}). Includes full chapter breakdown and practice questions.",
                    'pdf_file'           => !empty($meta->pdf_file) ? $meta->pdf_file : null,
                    'file_size'          => !empty($meta->file_size) ? $meta->file_size : null,
                    'page_count'         => 80 + ($meta->id * 15),
                    'author_name'        => 'HopeFairy Academic Faculty',
                    'material_type'      => $type,
                    'badge'              => $badge,
                    'is_free'            => $isFree,
                    'actual_price'       => $actual,
                    'sell_price'         => $sell,
                    'discount_percent'   => $pct,
                    'currency'           => 'INR',
                    'download_count'     => 120 * $meta->id,
                    'rating'             => 4.90,
                    'rating_count'       => 25 + ($meta->id * 12),
                    'is_featured'        => ($meta->id <= 2),
                    'is_active'          => true,
                    'display_order'      => $meta->display_order ?: $meta->id,
                ]);
            }
        }
    }

    /**
     * Helper to safely remove stored file from public disk.
     */
    protected function deletePhysicalFile(?string $path): void
    {
        if (!empty($path) && !preg_match('/^(https?:\/\/|\/\/)/i', $path)) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
