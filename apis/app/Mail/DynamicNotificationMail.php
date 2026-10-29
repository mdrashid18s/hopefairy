<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DynamicNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $status; // 'success' | 'failed' | 'pending' | 'info'
    public string $badgeLabel;
    public string $title;
    public string $messageBody;
    public array $summaryData;
    public ?string $ctaText;
    public ?string $ctaUrl;

    /**
     * Create a new unified dynamic email message instance.
     *
     * @param string $title
     * @param string $messageBody
     * @param string $status 'success' | 'failed' | 'pending' | 'info'
     * @param array $summaryData Key-value table data
     * @param string|null $ctaText Button text
     * @param string|null $ctaUrl Button URL
     * @param string|null $badgeLabel Optional custom badge label
     */
    public function __construct(
        string $title,
        string $messageBody,
        string $status = 'info',
        array $summaryData = [],
        ?string $ctaText = null,
        ?string $ctaUrl = null,
        ?string $badgeLabel = null
    ) {
        $this->title = $title;
        $this->messageBody = $messageBody;
        $this->status = in_array(strtolower($status), ['success', 'failed', 'pending', 'info']) ? strtolower($status) : 'info';
        $this->summaryData = $summaryData;
        $this->ctaText = $ctaText;
        $this->ctaUrl = $ctaUrl;
        $this->badgeLabel = $badgeLabel ?? match ($this->status) {
            'success' => 'COMPLETED / SUCCESS',
            'failed'  => 'ATTENTION / FAILED',
            'pending' => 'IN PROGRESS / PENDING',
            default   => 'INFORMATION',
        };
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "[HopeFairy] {$this->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.master',
        );
    }
}
