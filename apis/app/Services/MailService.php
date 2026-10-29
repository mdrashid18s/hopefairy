<?php

namespace App\Services;

use App\Mail\DynamicNotificationMail;
use App\Models\Inquiry;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MailService
{
    /**
     * Send Password Reset OTP & Link to Administrator.
     */
    public static function sendPasswordResetMail(string $email, string $otp, string $resetUrl): bool
    {
        try {
            Mail::to($email)->send(new DynamicNotificationMail(
                title: "Security Verification: Password Reset Code [{$otp}]",
                messageBody: "A password reset request has been initiated for your HopeFairy Administrative Account. Enter the one-time code below or click the button to set your new password securely.",
                status: 'pending',
                summaryData: [
                    'Account Email'    => $email,
                    'Verification OTP' => $otp,
                    'Valid For'        => '15 Minutes',
                ],
                ctaText: 'Reset Password Now',
                ctaUrl: $resetUrl,
                badgeLabel: 'SECURITY VERIFICATION'
            ));

            return true;
        } catch (\Throwable $e) {
            Log::error("Failed to send password reset email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send Inquiry Notification to Administrator.
     */
    public static function sendInquiryNotification(Inquiry $inquiry): void
    {
        $adminEmail = config('mail.admin_email', env('ADMIN_EMAIL', 'mrrashidsaikh0365@gmail.com'));

        try {
            Mail::to($adminEmail)->send(new DynamicNotificationMail(
                title: "New Student Lead: {$inquiry->name} ({$inquiry->interest})",
                messageBody: "A new study abroad / admission inquiry has been submitted through the HopeFairy portal.",
                status: 'info',
                summaryData: [
                    'Student Name'  => $inquiry->name,
                    'Email'         => $inquiry->email ?? 'N/A',
                    'Phone'         => $inquiry->phone,
                    'Interest'      => $inquiry->interest,
                    'Destination'   => $inquiry->destination_name ?? 'N/A',
                    'Course'        => $inquiry->course ?? 'N/A',
                ],
                ctaText: 'Open Leads CRM',
                ctaUrl: url('/admin/inquiries'),
                badgeLabel: 'NEW LEAD'
            ));
        } catch (\Throwable $e) {
            Log::error("Failed to send inquiry notification email: " . $e->getMessage());
        }
    }
}
