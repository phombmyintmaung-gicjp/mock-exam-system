<?php

namespace App\Http\Middleware;

use App\Models\Employee;
use App\Models\User;
use App\Services\SharedJwtVerifier;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

// One-Login migration (2026-09): primes the `api` guard with a `users` identity resolved
// directly from the shared Main JWT cookie, before ANY route-specific middleware runs
// (prepended to the whole `api` group in bootstrap/app.php) — including guest routes like
// /auth/login, where it's simply a no-op. mockexam_users no longer exists at all — "ALL
// USERS come from [Main's] USERS TABLE." Always calls $next($request) regardless of
// outcome; this middleware itself never rejects anything, since it has no idea yet whether
// the route even requires authentication. The actual gate is `RequireSharedAuth` (see that
// class), applied only to protected route groups in routes/api.php — it reads the
// request-attribute this middleware sets below rather than asking the `api` guard directly,
// specifically to avoid Tymon's JWTGuard::user() falling back to parsing this app's own
// (retired) local bearer JWT when the shared cookie doesn't resolve.
class SharedJwtAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $this->resolveViaSharedJwt($request);

        $request->attributes->set('shared_user', $user);

        if ($user) {
            Auth::guard('api')->setUser($user);
        }

        return $next($request);
    }

    // Resolves a `users` identity from the shared Main JWT cookie, or null if the cookie is
    // absent/invalid/expired, the shared session has been logged out on Main (Phase 8), or
    // the account has no employee link.
    private function resolveViaSharedJwt(Request $request): ?User
    {
        $cookieName = config('shared_auth.cookie_name', 'jwt_token');
        $jwt        = $request->cookies->get($cookieName);

        if (!$jwt) {
            return null;
        }

        $payload = SharedJwtVerifier::verify($jwt);
        if (!$payload || !isset($payload['sub'])) {
            return null;
        }

        $user = User::find($payload['sub']);
        if (!$user || !$user->employee_code) {
            return null;
        }

        // One-Login shared authentication foundation (Phase 8 — shared logout/revocation):
        // mirrors Main's own CheckActiveSession middleware exactly. Main's login() stores a
        // fresh session_token UUID on the users row and embeds the SAME value as this JWT's
        // `sid` claim; Main's own logout() nulls session_token. Comparing the two here means
        // a JWT that was perfectly valid a moment ago is rejected the instant the user logs
        // out of Main — without a new table, endpoint, or schema change.
        if (!$user->session_token || ($payload['sid'] ?? null) !== $user->session_token) {
            return null;
        }

        $employeeExists = Employee::where('employee_code', $user->employee_code)->exists();
        if (!$employeeExists) {
            return null;
        }

        return $user;
    }
}
