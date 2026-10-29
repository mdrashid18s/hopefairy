<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OfferingService
{
    /**
     * Get all services, optionally filtered by active status.
     */
    public function getAll(?bool $activeOnly = null): Collection
    {
        $query = Service::orderBy('display_order', 'asc');

        if ($activeOnly === true) {
            $query->where('is_active', true);
        }

        return $query->get();
    }

    /**
     * Get single service by slug.
     */
    public function getBySlug(string $slug): ?Service
    {
        return Service::where('slug', $slug)->first();
    }

    /**
     * Get single service by ID or slug.
     */
    public function getById(int|string $id): ?Service
    {
        return is_numeric($id)
            ? Service::find($id)
            : Service::where('slug', $id)->first();
    }

    /**
     * Handle image upload for a service.
     */
    public function uploadImage(UploadedFile $file): array
    {
        $ext = strtolower($file->getClientOriginalExtension());

        // Stored XSS Protection: Inspect SVG contents for executable scripts
        if ($ext === 'svg' || str_contains($file->getMimeType(), 'svg')) {
            $content = file_get_contents($file->getRealPath());
            if (preg_match('/<script|javascript:|onload|onerror|onclick/i', $content)) {
                throw new \InvalidArgumentException('SVG file contains disallowed script elements and was blocked for security.');
            }
        }

        $path = $file->store('services', 'public');
        $url  = url('storage/' . $path);

        return [
            'path'     => $path,
            'url'      => $url,
            'filename' => $file->getClientOriginalName(),
            'size'     => $file->getSize(),
            'mime'     => $file->getClientMimeType(),
        ];
    }

    /**
     * Create a new service.
     */
    public function create(array $data, ?UploadedFile $imageFile = null): Service
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        if ($imageFile) {
            $data['image'] = $imageFile->store('services', 'public');
        } elseif (isset($data['image']) && is_string($data['image'])) {
            $data['image'] = trim($data['image']);
        }

        foreach (['features', 'highlights', 'intro', 'process_flow'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $trimmed = trim($data[$field]);
                if (str_contains($trimmed, '[object Object]')) {
                    unset($data[$field]);
                    continue;
                }
                if (str_starts_with($trimmed, '[') || str_starts_with($trimmed, '{')) {
                    $decoded = json_decode($trimmed, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $data[$field] = $decoded;
                        continue;
                    }
                }
                $data[$field] = array_values(array_filter(array_map('trim', explode("\n", $data[$field]))));
            }
        }

        $data['icon'] = $data['icon'] ?? 'compass';
        $data['intro'] = $data['intro'] ?? [$data['short'] ?? ''];
        $data['features_title'] = $data['features_title'] ?? "What's Included";
        $data['features'] = $data['features'] ?? ['Comprehensive Advisory', 'Application Strategy'];
        $data['highlights'] = $data['highlights'] ?? [];
        $data['process_flow'] = $data['process_flow'] ?? ['Consultation', 'Documentation', 'Application', 'Offer'];
        $data['is_active'] = $data['is_active'] ?? true;
        $data['display_order'] = $data['display_order'] ?? (Service::max('display_order') + 1);

        return Service::create($data);
    }

    /**
     * Update an existing service.
     */
    public function update(Service $service, array $data, ?UploadedFile $imageFile = null): Service
    {
        if ($imageFile) {
            if (!empty($service->image) && !preg_match('/^(https?:\/\/|\/\/)/i', $service->image)) {
                Storage::disk('public')->delete($service->image);
            }
            $data['image'] = $imageFile->store('services', 'public');
        } elseif (array_key_exists('image', $data)) {
            if (empty($data['image'])) {
                if (!empty($service->image) && !preg_match('/^(https?:\/\/|\/\/)/i', $service->image)) {
                    Storage::disk('public')->delete($service->image);
                }
                $data['image'] = null;
            } else {
                $data['image'] = trim($data['image']);
            }
        }

        foreach (['features', 'highlights', 'intro', 'process_flow'] as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $trimmed = trim($data[$field]);
                if (str_contains($trimmed, '[object Object]')) {
                    unset($data[$field]);
                    continue;
                }
                if (str_starts_with($trimmed, '[') || str_starts_with($trimmed, '{')) {
                    $decoded = json_decode($trimmed, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $data[$field] = $decoded;
                        continue;
                    }
                }
                $data[$field] = array_values(array_filter(array_map('trim', explode("\n", $data[$field]))));
            }
        }

        $service->update($data);

        return $service->fresh();
    }

    /**
     * Toggle service active status.
     */
    public function toggle(Service $service): Service
    {
        $service->is_active = !$service->is_active;
        $service->save();

        return $service;
    }

    /**
     * Delete service and clean up stored media.
     */
    public function delete(Service $service): bool
    {
        if (!empty($service->image) && !preg_match('/^(https?:\/\/|\/\/)/i', $service->image)) {
            Storage::disk('public')->delete($service->image);
        }

        return (bool)$service->delete();
    }
}
