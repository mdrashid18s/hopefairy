<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Temporary holding for encrypted password during save cycle
     */
    protected ?string $pendingEncryptedPassword = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'approval_token',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'approval_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Check if user is Super Administrator.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin'
            || strtolower($this->email ?? '') === 'md.asif2412@gmail.com'
            || strtolower($this->email ?? '') === 'mrrashidsaikh0365@gmail.com';
    }

    /**
     * Model boot hooks to safely manage the `userpassword.en` dot column without SQL split errors.
     */
    protected static function booted(): void
    {
        static::saving(function (User $user) {
            // If userpassword.en is in attributes, extract it to prevent Eloquent query builder from splitting on dot
            if (array_key_exists('userpassword.en', $user->attributes)) {
                $user->pendingEncryptedPassword = $user->attributes['userpassword.en'];
                unset($user->attributes['userpassword.en']);
            }
        });

        static::saved(function (User $user) {
            if ($user->pendingEncryptedPassword !== null) {
                DB::statement(
                    "UPDATE users SET `userpassword.en` = ? WHERE id = ?",
                    [$user->pendingEncryptedPassword, $user->id]
                );
                $user->attributes['userpassword.en'] = $user->pendingEncryptedPassword;
                $user->pendingEncryptedPassword = null;
            }
        });
    }

    /**
     * Set password both hashed and symmetrically encrypted for reversible recovery.
     */
    public function setReversiblePassword(string $plainPassword): void
    {
        $this->password = Hash::make($plainPassword);
        $encrypted = Crypt::encryptString($plainPassword);
        $this->pendingEncryptedPassword = $encrypted;
        $this->attributes['userpassword.en'] = $encrypted;
    }

    /**
     * Decrypt and return the plain text password from `userpassword.en`.
     */
    public function getDecryptedPassword(): ?string
    {
        $encrypted = $this->attributes['userpassword.en'] ?? null;

        if (!$encrypted && $this->id) {
            $row = DB::selectOne("SELECT `userpassword.en` as enc FROM users WHERE id = ?", [$this->id]);
            $encrypted = $row?->enc;
            if ($encrypted) {
                $this->attributes['userpassword.en'] = $encrypted;
            }
        }

        if (!$encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($encrypted);
        } catch (\Throwable $e) {
            return null;
        }
    }
}
