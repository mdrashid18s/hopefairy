<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    use ApiResponseTrait;

    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * List all users / admin accounts with active status.
     */
    public function index(): JsonResponse
    {
        $users = $this->userService->getAll();
        return $this->successResponse($users, 'Users retrieved successfully.');
    }

    /**
     * Create a new user with hashed and encrypted password.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'role'     => 'nullable|string|in:admin,user',
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',        // Rule 2: Uppercase
                'regex:/[a-z]/',        // Rule 3: Lowercase
                'regex:/[0-9]/',        // Rule 4: Number
                'regex:/[^A-Za-z0-9]/', // Rule 5: Special character
            ],
        ], [
            'email.unique'   => 'An account with this email address already exists.',
            'password.min'   => 'Password must be at least 8 characters long.',
            'password.regex' => 'Password must include uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), and special symbols (!@#$%).',
        ]);

        $result = $this->userService->create($validated);

        return $this->successResponse($result, 'User account created successfully.', 201);
    }

    /**
     * Switch or toggle user role between admin and user.
     */
    public function toggleRole(Request $request, $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse('User account not found.', 404);
        }

        try {
            $updated = $this->userService->toggleRole($user, $request->user());
            $roleLabel = $updated->role === 'admin' ? 'Administrator' : ($updated->role === 'super_admin' ? 'Super Administrator' : 'Standard User');
            return $this->successResponse([
                'id'   => $updated->id,
                'role' => $updated->role,
            ], "Account role successfully changed to {$roleLabel}.");
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Toggle user active/inactive status (e.g. to deactivate/activate a user).
     */
    public function toggle(Request $request, $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse('User account not found or already removed.', 404);
        }

        try {
            $updated = $this->userService->toggle($user, $request->user());
            $statusText = $updated->is_active ? 'activated' : 'deactivated';
            return $this->successResponse([
                'id'        => $updated->id,
                'name'      => $updated->name,
                'email'     => $updated->email,
                'is_active' => (bool)$updated->is_active,
            ], "User account successfully {$statusText}.");
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Remove / delete a user.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->successResponse(null, 'User account has already been removed.');
        }

        try {
            $this->userService->delete($user, $request->user());
            return $this->successResponse(null, 'User account deleted successfully.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Reveal / decrypt user's encrypted password for authorized administrator.
     */
    public function decryptPassword(Request $request, $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse('User account not found or already removed.', 404);
        }

        try {
            $plain = $this->userService->decryptPassword($user, $request->user());
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 403);
        }

        if (!$plain) {
            return $this->errorResponse('No reversible encrypted password stored for this account.', 404);
        }

        return $this->successResponse([
            'id'                 => $user->id,
            'email'              => $user->email,
            'decrypted_password' => $plain,
        ], 'Password decrypted successfully.');
    }

    /**
     * Directly update any user password (Super Admin privilege).
     */
    public function updatePassword(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
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
            'password.regex' => 'Password must include uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), and special symbols (!@#$%).',
        ]);

        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse('User account not found or already removed.', 404);
        }

        try {
            $this->userService->updatePassword($user, $validated['password'], $request->user());
            return $this->successResponse([
                'id'    => $user->id,
                'email' => $user->email,
            ], 'User password updated successfully.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 403);
        } catch (ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to update password: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generate unique reset link for user account.
     */
    public function generateResetLink(Request $request, $id): JsonResponse
    {
        $user = User::find($id);
        if (!$user) {
            return $this->errorResponse('User account not found or already removed.', 404);
        }

        try {
            $result = $this->userService->generateResetLink($user, $request->user());
            return $this->successResponse($result, 'Unique password reset link generated successfully.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 403);
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to generate reset link: ' . $e->getMessage(), 500);
        }
    }
}
