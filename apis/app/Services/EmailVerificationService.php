<?php

namespace App\Services;

use Illuminate\Validation\ValidationException;

class EmailVerificationService
{
    /**
     * Common typo domains to block and suggest corrections.
     */
    protected static array $typoDomains = [
        'gamil.com'      => 'gmail.com',
        'gmaill.com'     => 'gmail.com',
        'gmai.com'       => 'gmail.com',
        'gmial.com'      => 'gmail.com',
        'gnail.com'      => 'gmail.com',
        'gemail.com'     => 'gmail.com',
        'yaho.com'       => 'yahoo.com',
        'yahooo.com'     => 'yahoo.com',
        'yhoo.com'       => 'yahoo.com',
        'hotmial.com'    => 'hotmail.com',
        'hotmaill.com'   => 'hotmail.com',
        'outlok.com'     => 'outlook.com',
        'outloo.com'     => 'outlook.com',
        'icld.com'       => 'icloud.com',
        'icoud.com'      => 'icloud.com',
    ];

    /**
     * Known disposable / temporary email domains to block.
     */
    protected static array $disposableDomains = [
        'mailinator.com', 'tempmail.com', '10minutemail.com', 'yopmail.com',
        'guerrillamail.com', 'sharklasers.com', 'dispostable.com', 'trashmail.com',
        'getnada.com', 'fakeinbox.com', 'throwawaymail.com', 'temp-mail.org',
        'mohmal.com', 'crazymailing.com', 'burnermail.io', 'inboxkitten.com',
    ];

    /**
     * Validate email existence, domain DNS, and plausibility.
     * Throws ValidationException on failure.
     *
     * @param string $email
     * @param string $attributeName
     * @throws ValidationException
     */
    public static function validate(string $email, string $attributeName = 'email'): void
    {
        $cleanEmail = trim(strtolower($email));

        // 1. Basic RFC format validation
        if (!filter_var($cleanEmail, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                $attributeName => ['The email address format is invalid.'],
            ]);
        }

        $parts = explode('@', $cleanEmail);
        if (count($parts) !== 2) {
            throw ValidationException::withMessages([
                $attributeName => ['Invalid email address format.'],
            ]);
        }

        [$localPart, $domain] = $parts;

        // 2. Local-part plausibility check (Catch random keyboard mashes like mkjwnd)
        if (strlen($localPart) < 2 || strlen($localPart) > 64) {
            throw ValidationException::withMessages([
                $attributeName => ['The email username must be between 2 and 64 characters.'],
            ]);
        }

        // Pure consonant keyboard mash check (e.g. mkjwnd, asdfgh, zxcvbn)
        // If the local part is only letters and >= 5 characters, it must contain at least one vowel
        if (preg_match('/^[a-z]{5,}$/', $localPart) && !preg_match('/[aeiouy]/', $localPart)) {
            throw ValidationException::withMessages([
                $attributeName => ['This email address appears to be invalid or non-existent.'],
            ]);
        }

        // Excessive character repetition (e.g. aaaaaa@gmail.com, 111111@gmail.com)
        if (preg_match('/(.)\1{4,}/', $localPart)) {
            throw ValidationException::withMessages([
                $attributeName => ['The email username contains invalid repetitive sequences.'],
            ]);
        }

        // 3. Typo domain check
        if (isset(self::$typoDomains[$domain])) {
            $suggested = self::$typoDomains[$domain];
            throw ValidationException::withMessages([
                $attributeName => ["The email domain '@{$domain}' does not exist. Did you mean '@{$suggested}'?"],
            ]);
        }

        // 4. Disposable domain check
        if (in_array($domain, self::$disposableDomains, true)) {
            throw ValidationException::withMessages([
                $attributeName => ['Temporary or disposable email addresses are not allowed for administrator accounts.'],
            ]);
        }

        // 5. DNS MX/A Record Check (Domain must exist on the Internet)
        // Only run when functions are available
        if (function_exists('checkdnsrr')) {
            $hasMx = @checkdnsrr($domain, 'MX');
            $hasA  = @checkdnsrr($domain, 'A');

            if (!$hasMx && !$hasA) {
                throw ValidationException::withMessages([
                    $attributeName => ["The email domain '{$domain}' does not exist or cannot receive mail."],
                ]);
            }
        }
    }
}
