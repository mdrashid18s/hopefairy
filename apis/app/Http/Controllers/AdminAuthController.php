<?php

namespace App\Http\Controllers;

use App\Services\AdminAuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    use ApiResponseTrait;

    protected AdminAuthService $authService;

    public function __construct(AdminAuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Admin login with email and password -> returns Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        try {
            $data = $this->authService->login($validated['email'], $validated['password']);
            return $this->successResponse($data, 'Admin logged in successfully.');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Authentication failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get authenticated admin user.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return $this->successResponse([
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'role'           => $user->role ?? 'user',
            'is_super_admin' => $user->isSuperAdmin(),
        ], 'Admin profile retrieved successfully.');
    }

    /**
     * Logout and revoke Sanctum access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return $this->successResponse(null, 'Logged out successfully.');
    }

    /**
     * Initiate Forgot Password flow -> send 6-digit OTP to admin email.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $this->authService->sendResetOtp($validated['email']);
            return $this->successResponse([
                'email' => $validated['email'],
            ], 'A 6-digit verification OTP has been sent to your email.');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Verify OTP code.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        try {
            $this->authService->verifyResetOtp($validated['email'], $validated['otp']);
            return $this->successResponse([
                'verified' => true,
                'email'    => $validated['email'],
                'otp'      => $validated['otp'],
            ], 'OTP verified successfully.');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        }
    }

    /**
     * Complete password reset using OTP and new password.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'                 => 'required|email',
            'otp'                   => 'required|string|size:6',
            'password'              => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',        // Rule 2: Uppercase letter
                'regex:/[a-z]/',        // Rule 3: Lowercase letter
                'regex:/[0-9]/',        // Rule 4: Number digit
                'regex:/[^A-Za-z0-9]/', // Rule 5: Special character
                'confirmed',
            ],
            'password_confirmation' => 'required|string',
        ], [
            'password.min'       => 'Password must be at least 8 characters long.',
            'password.regex'     => 'Password must include uppercase, lowercase, numbers, and special characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        try {
            $this->authService->resetPassword($validated['email'], $validated['otp'], $validated['password']);
            return $this->successResponse(null, 'Password has been reset successfully. Please log in with your new password.');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Password reset failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Register new admin account (Pending Super Admin verification).
     * Only requires email and password as requested by client.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|email|max:150',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/',
            ],
        ], [
            'password.min'   => 'Password must be at least 8 characters long.',
            'password.regex' => 'Password must include uppercase letters, lowercase letters, numbers, and special symbols.',
        ]);

        \App\Services\EmailVerificationService::validate($validated['email']);

        try {
            $data = $this->authService->register($validated['email'], $validated['password']);
            return $this->successResponse($data, 'Registration request submitted. An approval verification has been dispatched to Super Admin.');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Registration failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Approve pending admin registration token.
     */
    public function approveRegistration(Request $request): JsonResponse
    {
        $token = $request->input('token') ?? $request->query('token');

        if (!$token) {
            return $this->errorResponse('Approval token is required.', 422);
        }

        try {
            $data = $this->authService->approveRegistration($token);
            return $this->successResponse($data, 'Admin access approved successfully.');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Approval failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Verify unique password reset token.
     */
    public function verifyResetToken(Request $request): JsonResponse
    {
        $email = $request->input('email') ?? $request->query('email');
        $token = $request->input('token') ?? $request->query('token');

        if (!$email || !$token) {
            return $this->errorResponse('Email and reset token are required.', 422);
        }

        try {
            $this->authService->verifyResetToken($email, $token);
            $user = \App\Models\User::where('email', $email)->first();
            return $this->successResponse([
                'valid'          => true,
                'email'          => $email,
                'name'           => $user?->name ?? 'Administrator',
                'is_super_admin' => $user?->isSuperAdmin() ?? false,
            ], 'Reset token is valid.');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Reset password using unique token.
     */
    public function resetPasswordWithToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'                 => 'required|email',
            'token'                 => 'required|string',
            'password'              => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/',
                'confirmed',
            ],
            'password_confirmation' => 'required|string',
        ], [
            'password.min'       => 'Password must be at least 8 characters long.',
            'password.regex'     => 'Password must include uppercase, lowercase, numbers, and special symbols.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        try {
            $this->authService->resetPasswordWithToken($validated['email'], $validated['token'], $validated['password']);
            return $this->successResponse(null, 'Password has been set successfully! You can now log into HopeFairy Management.');
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Password reset failed: ' . $e->getMessage(), 500);
        }
    }
}
