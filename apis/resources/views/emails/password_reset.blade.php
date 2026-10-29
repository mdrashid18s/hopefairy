@extends('emails.layout', ['title' => 'Password Reset Request — HopeFairy Admin'])

@section('content')
    <h2 style="color: #0b1b3a; margin-top: 0; font-size: 20px;">Password Reset Authorization</h2>
    
    <p>We received a request to reset the administrator password for your account associated with <strong>{{ $email }}</strong>.</p>

    <div class="card" style="text-align: center; padding: 24px;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold;">
            One-Time Security Verification Code (OTP)
        </p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0b1b3a; font-family: monospace; background: #ffffff; padding: 12px; border-radius: 6px; border: 1px dashed #b98a2e; display: inline-block;">
            {{ $otp }}
        </div>
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #b3261e;">
            This security code will expire in <strong>15 minutes</strong>.
        </p>
    </div>

    <p style="font-size: 14px;">
        You can also reset your password directly by clicking the secure button below:
    </p>

    <div style="text-align: center; margin: 20px 0;">
        <a href="{{ $resetUrl }}" class="btn btn-gold" style="background-color: #b98a2e; color: #ffffff;">
            Reset Administrator Password
        </a>
    </div>

    <p style="font-size: 12px; color: #6c757d; margin-top: 24px; border-top: 1px solid #e4e2dc; padding-top: 16px;">
        <strong>Security Notice:</strong> If you did not initiate this password reset, please disregard this email. Your credentials remain safe and no changes have been applied.
    </p>
@endsection
