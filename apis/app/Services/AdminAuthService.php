<?php

namespace App\Services;

use App\Models\User;
use App\Mail\DynamicNotificationMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class AdminAuthService
{
    /**
     * Absolute URL of an Admin Portal page (served from /backend on the website domain).
     */
    private function adminUrl(string $path = ''): string
    {
        return rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/') . '/backend/' . ltrim($path, '/');
    }

    /**
     * Authenticate admin user and generate Sanctum token.
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        // 1. Explicit check: if user does not exist in database
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['You are not registered yet. Please register your account. Verification will be sent to the Super Admin.'],
            ]);
        }

        // 2. Explicit check: if user is pending approval
        if (!$user->is_active) {
            if (!empty($user->approval_token)) {
                throw ValidationException::withMessages([
                    'email' => ['Your registration is pending approval by Super Admin (mrrashidsaikh0365@gmail.com). You can log in once approved.'],
                ]);
            }
            throw ValidationException::withMessages([
                'email' => ['You are inactive. Your account is disabled, please contact administrator.'],
            ]);
        }

        // 3. Password check
        if (!Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['Incorrect password. Please verify and try again.'],
            ]);
        }

        // Revoke old tokens if any
        $user->tokens()->delete();

        // Generate Sanctum plainTextToken
        $token = $user->createToken('admin-access-token')->plainTextToken;

        return [
            'user' => [
                'id'             => $user->id,
                'name'           => $user->name,
                'email'          => $user->email,
                'role'           => $user->role ?? 'user',
                'is_super_admin' => $user->isSuperAdmin(),
            ],
            'token' => $token,
        ];
    }

    /**
     * Register a new admin account -> pending Super Admin approval.
     */
    public function register(string $email, string $password): array
    {
        $existing = User::where('email', $email)->first();
        if ($existing) {
            if ($existing->is_active) {
                throw ValidationException::withMessages([
                    'email' => ['This email is already registered and active. Please log in.'],
                ]);
            }
            if (!empty($existing->approval_token)) {
                throw ValidationException::withMessages([
                    'email' => ['This email is already registered and pending approval by Super Admin (mrrashidsaikh0365@gmail.com).'],
                ]);
            }
            throw ValidationException::withMessages([
                'email' => ['This account is currently disabled. Please contact the administrator.'],
            ]);
        }

        $approvalToken = Str::random(64);
        $derivedName = $this->deriveNameFromEmail($email);

        $user = new User();
        $user->name = $derivedName;
        $user->email = $email;
        $user->setReversiblePassword($password);
        $user->is_active = false;
        $user->approval_token = $approvalToken;
        $user->save();

        // Dispatch approval verification email to Super Admin (Rashid)
        $superAdminEmail = 'mrrashidsaikh0365@gmail.com';
        $approvalUrl = $this->adminUrl("approve/?token={$approvalToken}");

        try {
            Mail::to($superAdminEmail)->send(new DynamicNotificationMail(
                title: 'New Admin Access Request',
                messageBody: "Hello Rashid,\n\nA new user has registered for HopeFairy Admin Portal access. To grant them access, please review the request below and click 'Approve Admin Access'.\n\nOnce approved, their account will be activated immediately and they will be able to log in.",
                status: 'pending',
                summaryData: [
                    'Applicant Email' => $email,
                    'Derived Name'   => $derivedName,
                    'Requested At'   => now()->format('d M Y, h:i A') . ' IST',
                    'Access Level'   => 'Admin Portal',
                    'Current Status' => 'Pending Your Approval',
                ],
                ctaText: 'Approve Admin Access',
                ctaUrl: $approvalUrl,
                badgeLabel: 'APPROVAL REQUIRED'
            ));
        } catch (\Throwable $e) {
            Log::error('Admin registration approval mail failed to send: ' . $e->getMessage());
        }

        return [
            'email'   => $email,
            'name'    => $derivedName,
            'message' => 'Registration request submitted successfully. A verification request has been sent to Super Admin (mrrashidsaikh0365@gmail.com) for approval.',
        ];
    }

    /**
     * Approve pending admin registration via token.
     */
    public function approveRegistration(string $token): array
    {
        if (empty($token)) {
            throw ValidationException::withMessages([
                'token' => ['Approval token is required.'],
            ]);
        }

        $user = User::where('approval_token', $token)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'token' => ['Invalid or expired approval token. This account may already be approved.'],
            ]);
        }

        $user->is_active = true;
        $user->approval_token = null;
        $user->email_verified_at = now();
        $user->save();

        // Send confirmation email to newly approved user
        $loginUrl = $this->adminUrl('login/');

        try {
            Mail::to($user->email)->send(new DynamicNotificationMail(
                title: 'HopeFairy Admin Access Approved!',
                messageBody: "Hello {$user->name},\n\nGreat news! Your HopeFairy Admin account request has been officially approved by Super Admin Rashid Shaikh.\n\nYou can now log in to the management portal with your registered email and password.",
                status: 'success',
                summaryData: [
                    'Account Email' => $user->email,
                    'Approved By'   => 'Rashid Shaikh (Super Admin)',
                    'Approved At'   => now()->format('d M Y, h:i A') . ' IST',
                    'Status'        => 'Active & Verified',
                ],
                ctaText: 'Log In to Admin Portal',
                ctaUrl: $loginUrl,
                badgeLabel: 'ACCESS GRANTED'
            ));
        } catch (\Throwable $e) {
            Log::error('Approved confirmation mail to new admin failed: ' . $e->getMessage());
        }

        return [
            'id'      => $user->id,
            'name'    => $user->name,
            'email'   => $user->email,
            'message' => "Admin access for {$user->email} has been approved successfully.",
        ];
    }

    /**
     * Smart name derivation from email address.
     */
    public function deriveNameFromEmail(string $email): string
    {
        $handle = strtolower(explode('@', $email)[0] ?? '');
        $handle = preg_replace('/[0-9+._-]+$/', '', $handle);

        if (preg_match('/^(?:mr|ms|mrs|dr)(.+)$/i', $handle, $matches) && strlen($matches[1]) >= 3) {
            $handle = $matches[1];
        }

        $parts = preg_split('/[._-]+/', $handle, -1, PREG_SPLIT_NO_EMPTY);

        if (!empty($parts)) {
            $firstName = $parts[0];
            if (str_starts_with($firstName, 'rashid')) {
                return 'Rashid';
            }
            return ucwords(implode(' ', array_map('ucfirst', $parts)));
        }

        return 'Admin';
    }

    /**
     * Send 6-digit OTP to user's email for password reset.
     */
    public function sendResetOtp(string $email): bool
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['No admin account found with this email address.'],
            ]);
        }

        // Generate 6-digit cryptographic OTP
        $otp = sprintf("%06d", mt_rand(100000, 999999));

        // Store OTP in password_reset_tokens table
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token'      => $otp,
                'created_at' => now(),
            ]
        );

        // Send OTP via Dynamic Master Mail Template
        try {
            Mail::to($email)->send(new DynamicNotificationMail(
                title: 'Admin Password Reset OTP',
                messageBody: "Hello {$user->name},\n\nYou have requested a one-time verification code (OTP) to reset your HopeFairy Admin account password.\n\nPlease enter the 6-digit code below into the reset form. This code is valid for 10 minutes.\n\nIf you did not request this password reset, please ignore this email.",
                status: 'pending',
                summaryData: [
                    'Verification OTP' => $otp,
                    'Account Email'    => $email,
                    'Validity'         => '10 Minutes',
                    'Requested At'     => now()->format('d M Y, h:i A') . ' IST',
                ],
                ctaText: 'Open Reset Screen',
                ctaUrl: $this->adminUrl('forgot-password/?email=' . urlencode($email)),
                badgeLabel: 'VERIFICATION OTP'
            ));
        } catch (\Throwable $e) {
            Log::error('Admin OTP mail failed to send: ' . $e->getMessage());
            throw new \RuntimeException('Failed to send verification code email. Please verify SMTP settings.');
        }

        return true;
    }

    /**
     * Verify the 6-digit OTP for the given email.
     */
    public function verifyResetOtp(string $email, string $otp): bool
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$record || $record->token !== trim($otp)) {
            throw ValidationException::withMessages([
                'otp' => ['The verification OTP is invalid.'],
            ]);
        }

        // Check if OTP has expired (10 minutes)
        if (Carbon::parse($record->created_at)->addMinutes(10)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            throw ValidationException::withMessages([
                'otp' => ['The verification OTP has expired. Please request a new code.'],
            ]);
        }

        return true;
    }

    /**
     * Reset the admin user's password after verifying OTP.
     */
    public function resetPassword(string $email, string $otp, string $newPassword): bool
    {
        // Verify OTP validity first
        $this->verifyResetOtp($email, $otp);

        $user = User::where('email', $email)->first();
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Admin account not found.'],
            ]);
        }

        // Update password with hash and reversible encryption
        $user->setReversiblePassword($newPassword);
        $user->save();

        // Invalidate OTP and all existing tokens
        DB::table('password_reset_tokens')->where('email', $email)->delete();
        $user->tokens()->delete();

        // Send confirmation email
        try {
            Mail::to($email)->send(new DynamicNotificationMail(
                title: 'Password Successfully Changed',
                messageBody: "Hello {$user->name},\n\nYour HopeFairy Admin portal password has been changed successfully. You can now log in using your new password.\n\nIf you did not perform this change, please contact support immediately.",
                status: 'success',
                summaryData: [
                    'Account Email' => $email,
                    'Security Event' => 'Admin Password Reset via OTP',
                    'Timestamp'     => now()->format('d M Y, h:i A') . ' IST',
                ],
                ctaText: 'Log In to Admin Portal',
                ctaUrl: $this->adminUrl('login/'),
                badgeLabel: 'PASSWORD UPDATED'
            ));
        } catch (\Throwable $e) {
            Log::warning('Password change confirmation email failed: ' . $e->getMessage());
        }

        return true;
    }

    /**
     * Verify unique password reset token for the given email.
     */
    public function verifyResetToken(string $email, string $token): bool
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$record || $record->token !== trim($token)) {
            throw ValidationException::withMessages([
                'token' => ['The password reset link is invalid or has already been used.'],
            ]);
        }

        // Validity window: 30 days for designated setup links
        if (Carbon::parse($record->created_at)->addDays(30)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            throw ValidationException::withMessages([
                'token' => ['The password reset link has expired. Please request a new link.'],
            ]);
        }

        return true;
    }

    /**
     * Reset password using unique token (e.g., initial Super Admin setup or one-click reset).
     */
    public function resetPasswordWithToken(string $email, string $token, string $newPassword): bool
    {
        $this->verifyResetToken($email, $token);

        $user = User::where('email', $email)->first();
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Administrator account not found.'],
            ]);
        }

        // Set password with both hash and reversible encryption
        $user->setReversiblePassword($newPassword);
        $user->is_active = true;
        $user->approval_token = null;
        $user->email_verified_at = now();
        $user->save();

        // Invalidate reset token and purge prior sessions
        DB::table('password_reset_tokens')->where('email', $email)->delete();
        $user->tokens()->delete();

        // Send confirmation notification
        try {
            Mail::to($email)->send(new DynamicNotificationMail(
                title: 'Password Successfully Configured',
                messageBody: "Hello {$user->name},\n\nYour HopeFairy Admin account credentials have been successfully updated. You can now log into the management portal.\n\nIf you did not perform this action, please alert support immediately.",
                status: 'success',
                summaryData: [
                    'Account Email'  => $email,
                    'Security Level' => $user->isSuperAdmin() ? 'Super Administrator' : 'Administrator',
                    'Timestamp'      => now()->format('d M Y, h:i A') . ' IST',
                ],
                ctaText: 'Sign In to Admin Portal',
                ctaUrl: $this->adminUrl('login/'),
                badgeLabel: 'CREDENTIALS CONFIGURED'
            ));
        } catch (\Throwable $e) {
            Log::warning('Password reset confirmation email failed: ' . $e->getMessage());
        }

        return true;
    }
}
