<?php

namespace App\Services;

use App\Models\Inquiry;
use App\Models\Country;
use App\Mail\DynamicNotificationMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class InquiryService
{
    /**
     * Store student inquiry lead and dispatch dynamic confirmation email.
     */
    public function createInquiry(array $payload): Inquiry
    {
        $destinationId = $payload['destination_id'] ?? null;
        $destinationName = $payload['destination_name'] ?? ($payload['destination'] ?? null);

        if (!empty($payload['destination']) && empty($destinationId)) {
            $dest = Country::where('name', $payload['destination'])
                ->orWhere('slug', $payload['destination'])
                ->first();
            if ($dest) {
                $destinationId = $dest->id;
                $destinationName = $dest->name;
            }
        }

        $interest = $payload['interest'] ?? null;
        if (!empty($payload['source'])) {
            $interest = !empty($interest) ? "{$interest} ({$payload['source']})" : $payload['source'];
        }

        $type = strtolower($payload['type'] ?? '');
        if (empty($type)) {
            $source = strtolower($payload['source'] ?? '');
            $type = (str_contains($source, 'query') || str_contains($source, 'home')) ? 'query' : 'inquiry';
        }
        if (!in_array($type, ['inquiry', 'query'])) {
            $type = 'inquiry';
        }

        $studyLevel = $payload['studyLevel'] ?? ($payload['study_level'] ?? null);

        $inquiry = Inquiry::create([
            'type'             => $type,
            'name'             => $payload['name'],
            'phone'            => $payload['phone'],
            'email'            => $payload['email'],
            'city'             => $payload['city'] ?? null,
            'interest'         => $interest ?? ($type === 'query' ? 'Quick consultation' : 'Study abroad'),
            'qualification'    => $payload['qualification'] ?? null,
            'study_level'      => $studyLevel,
            'destination_id'   => $destinationId,
            'destination_name' => $destinationName,
            'intake'           => $payload['intake'] ?? null,
            'course'           => $payload['course'] ?? null,
            'message'          => $payload['message'] ?? null,
            'lead_status'      => 'new',
        ]);

        // Dispatch Unified Dynamic Confirmation Email
        try {
            $summaryData = [
                'Submission Type'    => $type === 'query' ? 'Quick Query (Homepage)' : 'Detailed Inquiry (Contact Page)',
                'Student Name'       => $inquiry->name,
                'Email'              => $inquiry->email,
                'Contact Phone'      => $inquiry->phone,
            ];
            if (!empty($inquiry->city)) $summaryData['City / Location'] = $inquiry->city;
            if (!empty($inquiry->destination_name)) $summaryData['Target Destination'] = $inquiry->destination_name;
            if (!empty($inquiry->intake)) $summaryData['Preferred Timeline'] = $inquiry->intake;
            if (!empty($inquiry->course)) $summaryData['Course Interest'] = $inquiry->course;
            if (!empty($inquiry->qualification)) $summaryData['Qualification'] = $inquiry->qualification;
            if (!empty($inquiry->study_level)) $summaryData['Study Level'] = $inquiry->study_level;
            if (!empty($inquiry->interest)) $summaryData['Area of Interest'] = $inquiry->interest;
            if (!empty($inquiry->message)) $summaryData['Query / Note'] = $inquiry->message;

            $mailTitle = $type === 'query' ? 'Thanks for sending your query!' : 'Thanks for contacting us!';
            $badgeLabel = $type === 'query' ? 'QUERY RECEIVED' : 'INQUIRY RECEIVED';

            Mail::to($inquiry->email)->send(new DynamicNotificationMail(
                title: $mailTitle,
                messageBody: "Hello {$inquiry->name},\n\nThanks for reaching out!\nOur team will connect with you shortly.",
                status: 'success',
                summaryData: $summaryData,
                ctaText: null,
                ctaUrl: null,
                badgeLabel: $badgeLabel
            ));
        } catch (\Throwable $e) {
            Log::warning('Dynamic notification mail delivery failed: ' . $e->getMessage());
        }

        return $inquiry;
    }

    /**
     * Get inquiries for admin with optional status filter, type filter, and search.
     */
    public function getAll(array $filters = []): array
    {
        $query = Inquiry::with('destination')->orderBy('created_at', 'desc');

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('lead_status', $filters['status']);
        }

        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('email', 'like', $search)
                  ->orWhere('phone', 'like', $search)
                  ->orWhere('city', 'like', $search)
                  ->orWhere('destination_name', 'like', $search)
                  ->orWhere('course', 'like', $search)
                  ->orWhere('interest', 'like', $search)
                  ->orWhere('type', 'like', $search);
            });
        }

        return $query->get()->toArray();
    }

    /**
     * Update lead status.
     */
    public function updateStatus(Inquiry $inquiry, string $status): Inquiry
    {
        $inquiry->lead_status = $status;
        $inquiry->save();
        return $inquiry;
    }

    /**
     * Toggle active/inactive status of an inquiry.
     */
    public function toggle(Inquiry $inquiry): Inquiry
    {
        $inquiry->is_active = !$inquiry->is_active;
        $inquiry->save();
        return $inquiry;
    }

    /**
     * Delete an inquiry lead.
     */
    public function deleteInquiry(Inquiry $inquiry): bool
    {
        return (bool) $inquiry->delete();
    }

    /**
     * Delete alias for consistent naming.
     */
    public function delete(Inquiry $inquiry): bool
    {
        return $this->deleteInquiry($inquiry);
    }

    /**
     * Get dashboard summary statistics.
     */
    public function getStats(): array
    {
        $totalInquiries = Inquiry::count();
        $newLeads = Inquiry::where('lead_status', 'new')->count();
        $contacted = Inquiry::where('lead_status', 'contacted')->count();
        $scheduled = Inquiry::where('lead_status', 'scheduled')->count();
        $closed = Inquiry::where('lead_status', 'closed')->count();
        $activeDestinations = Country::where('is_active', true)->count();
        $totalDestinations = Country::count();

        $recentInquiries = Inquiry::orderBy('created_at', 'desc')->take(6)->get();

        return [
            'total_inquiries'     => $totalInquiries,
            'new_leads'           => $newLeads,
            'contacted_leads'     => $contacted,
            'scheduled_leads'     => $scheduled,
            'closed_leads'        => $closed,
            'active_destinations' => $activeDestinations,
            'total_destinations'  => $totalDestinations,
            'recent_inquiries'    => $recentInquiries,
        ];
    }
}
