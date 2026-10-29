<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request and enforce enterprise HTTP security headers.
     *
     * Shields against:
     * - Clickjacking (malicious iframe embedding)
     * - MIME-type sniffing / confusion attacks
     * - Legacy browser XSS injection
     * - Sensitive URL / token referrer leakage
     * - Hardware access exploitation (camera, mic, geo)
     * - Server software fingerprinting
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Clickjacking Defense: Prevents external domains from embedding this site
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // MIME-Sniffing Defense: Enforces declared Content-Type header
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Legacy XSS Filter protection
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Referrer Privacy: Protects query parameters from being leaked to 3rd party sites
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Hardware Device Permissions Defense
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // Server Fingerprint Defense: Remove software disclosure headers
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
