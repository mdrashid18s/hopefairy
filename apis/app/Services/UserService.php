<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserService
{
    /**
     * List all users / admin accounts with active status.
     */
    public function getAll(): Collection
    {
        return User::orderBy('created_at', 'desc')->get()->map(function ($u) {
            return [
                'id'                 => $u->id,
                'name'               => $u->name,
                'email'              => $u->email,
                'role'               => $u->role ?? 'user',
                'is_super_admin'     => $u->isSuperAdmin(),
                'is_active'          => (bool)$u->is_active,
                'has_encrypted_pass' => !empty($u->getAttribute('userpassword.en')),
                'created_at'         => $u->created_at?->format('Y-m-d H:i:s'),
            ];
        });
    }

    /**
     * Create a new user with hashed and encrypted password.
     */
    public function create(array $data): array
    {
        // Deep Email Verification: DNS MX, Typo domain check, Disposable block, Local-part validity
        EmailVerificationService::validate($data['email']);

        // Rule 6: No predictable sequences
        if (preg_match('/(1234|qwerty|password|admin|abcdef|1111|0000)/i', $data['password'])) {
            throw ValidationException::withMessages([
                'password' => ['Password must not contain predictable sequences like 1234, admin, or password.'],
            ]);
        }

        // Rule 7: Does not contain email prefix
        $emailPrefix = explode('@', $data['email'])[0];
        if (strlen($emailPrefix) >= 3 && str_contains(strtolower($data['password']), strtolower($emailPrefix))) {
            throw ValidationException::withMessages([
                'password' => ['Password must not contain your email username.'],
            ]);
        }

        $user = new User();
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->role = $data['role'] ?? 'user';
        $user->is_active = true;
        $user->setReversiblePassword($data['password']);
        $user->save();

        // Also update literal `userpassword.en` raw column
        $enc = Crypt::encryptString($data['password']);
        DB::statement(
            "UPDATE users SET `userpassword.en` = ? WHERE id = ?",
            [$enc, $user->id]
        );

        return [
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'role'           => $user->role,
            'is_super_admin' => $user->isSuperAdmin(),
            'is_active'      => (bool)$user->is_active,
        ];
    }

    /**
     * Switch or toggle user role between admin and user.
     */
    public function toggleRole(User $user, ?User $currentUser = null): User
    {
        // Normal admin cannot alter Super Admin role
        if ($user->isSuperAdmin()) {
            if ($currentUser && !$currentUser->isSuperAdmin()) {
                throw new \InvalidArgumentException('Permission denied. Normal administrators cannot alter Super Administrator roles.');
            }
            if ($user->email === 'md.asif2412@gmail.com' || $user->email === 'mrrashidsaikh0365@gmail.com') {
                throw new \InvalidArgumentException('Primary Super Administrator roles cannot be altered.');
            }
        }

        $current = $user->role ?? 'user';
        $user->role = $current === 'admin' ? 'user' : 'admin';
        $user->save();

        return $user;
    }

    /**
     * Toggle user active/inactive status.
     */
    public function toggle(User $user, ?User $currentUser = null): User
    {
        // Normal admin cannot deactivate Super Admin
        if ($user->isSuperAdmin() && (!$currentUser || !$currentUser->isSuperAdmin())) {
            throw new \InvalidArgumentException('Permission denied. Normal administrators cannot deactivate Super Administrator accounts.');
        }

        // Don't allow self-deactivation if you're the logged in admin
        if ($currentUser && $currentUser->id === $user->id) {
            throw new \InvalidArgumentException('You cannot deactivate your own account. You can only log out.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        if (!$user->is_active) {
            $user->tokens()->delete();
        }

        return $user;
    }

    /**
     * Delete user account.
     */
    public function delete(User $user, ?User $currentUser = null): bool
    {
        // Normal admin cannot delete Super Admin
        if ($user->isSuperAdmin() && (!$currentUser || !$currentUser->isSuperAdmin())) {
            throw new \InvalidArgumentException('Permission denied. Normal administrators cannot delete Super Administrator accounts.');
        }

        if ($currentUser && $currentUser->id === $user->id) {
            throw new \InvalidArgumentException('You cannot delete your own account.');
        }

        $user->tokens()->delete();
        return (bool) $user->delete();
    }

    /**
     * Decrypt reversible password for an account.
     */
    public function decryptPassword(User $user, ?User $currentUser = null): ?string
    {
        // Strict privacy rule: No user can view another user's password
        if (!$currentUser || $currentUser->id !== $user->id) {
            throw new \InvalidArgumentException('Permission denied. You cannot view another user\'s password.');
        }

        $plain = $user->getDecryptedPassword();

        if (!$plain) {
            $raw = DB::table('users')->where('id', $user->id)->value('userpassword.en');
            if ($raw) {
                try {
                    $plain = Crypt::decryptString($raw);
                } catch (\Throwable $e) {}
            }
        }

        return $plain;
    }

    /**
     * Directly update any user's password (Super Admin privilege).
     */
    public function updatePassword(User $user, string $newPassword, ?User $currentUser = null): void
    {
        // Normal admin cannot alter Super Admin password
        if ($user->isSuperAdmin() && (!$currentUser || !$currentUser->isSuperAdmin())) {
            throw new \InvalidArgumentException('Permission denied. Normal administrators cannot modify Super Administrator credentials.');
        }

        // Only Super Admin can change another account's password
        if (!$currentUser || !$currentUser->isSuperAdmin()) {
            throw new \InvalidArgumentException('Permission denied. Only Super Administrator can update user passwords.');
        }

        // Rule 6: No predictable sequences
        if (preg_match('/(1234|qwerty|password|admin|abcdef|1111|0000)/i', $newPassword)) {
            throw ValidationException::withMessages([
                'password' => ['Password must not contain predictable sequences like 1234, admin, or password.'],
            ]);
        }

        // Rule 7: Does not contain email username prefix
        $emailPrefix = explode('@', $user->email)[0];
        if (strlen($emailPrefix) >= 3 && str_contains(strtolower($newPassword), strtolower($emailPrefix))) {
            throw ValidationException::withMessages([
                'password' => ['Password must not contain user email username.'],
            ]);
        }

        $user->setReversiblePassword($newPassword);
        $user->save();

        // Also update literal `userpassword.en` raw column
        $enc = Crypt::encryptString($newPassword);
        DB::statement(
            "UPDATE users SET `userpassword.en` = ? WHERE id = ?",
            [$enc, $user->id]
        );
    }

    /**
     * Generate a unique password reset link for a user account.
     */
    public function generateResetLink(User $user, ?User $currentUser = null): array
    {
        // Normal admin cannot generate reset links for Super Admin
        if ($user->isSuperAdmin() && (!$currentUser || !$currentUser->isSuperAdmin())) {
            throw new \InvalidArgumentException('Permission denied. Normal administrators cannot generate reset links for Super Administrators.');
        }

        $token = \Illuminate\Support\Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token'      => $token,
                'created_at' => now(),
            ]
        );

        $frontendBase = rtrim(env('FRONTEND_URL', 'https://myhopefairy.com'), '/');
        $encodedEmail = urlencode($user->email);

        return [
            'email'       => $user->email,
            'name'        => $user->name,
            'token'       => $token,
            'reset_url'   => "{$frontendBase}/backend/reset-password/?token={$token}&email={$encodedEmail}",
            'local_url'   => "http://localhost:3000/backend/reset-password/?token={$token}&email={$encodedEmail}",
        ];
    }
}
