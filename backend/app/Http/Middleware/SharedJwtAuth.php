<?php

namespace App\Http\Middleware;

use App\Models\Employee;
use App\Models\User;
use App\Services\SharedJwtVerifier;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

// One-Login shared authentication foundation (2026-09, Phase 5): primes the `api` guard
// with a mockexam_users identity resolved from the shared Main JWT cookie, BEFORE the
// existing `auth:api` middleware runs. Tymon's JWTGuard::user() returns whatever was
// already set via setUser()/login() without attempting its own token-based resolution
// (confirmed in vendor/tymon/jwt-auth/src/JWTGuard.php — `if ($this->user !== null) return
// $this->user;`), so this middleware never conflicts with, and never needs to touch, the
// existing bearer-token JWT check — if this middleware can't resolve a shared identity, it
// simply does nothing and lets `auth:api` proceed exactly as it always has (this app's own
// JWT_SECRET, own token, own login flow — completely unaffected). The shared-JWT branch is
// currently inert in any real deployment, since SHARED_JWT_SECRET is not yet set in any
// real .env (see config/shared_auth.php) — it activates only once that's configured later.
// Always calls $next($request) regardless of outcome — this middleware never itself
// rejects a request; only the existing `auth:api` middleware after it can do that.
class SharedJwtAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $this->resolveViaSharedJwt($request);

        if ($user) {
            Auth::guard('api')->setUser($user);
        }

        return $next($request);
    }

    // Resolves a mockexam_users identity from the shared Main JWT cookie, or null if the
    // cookie is absent/invalid/expired, the shared session has been logged out on Main
    // (Phase 8), the shared account has no employee link, that employee has no
    // mockexam_users account, or (a data-integrity anomaly) more than one mockexam_users
    // row claims the same employee — every one of those cases is left for the existing
    // bearer-token guard to handle instead, never guessed at here.
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

        $sharedRow = DB::table('users')->where('id', $payload['sub'])->first();
        if (!$sharedRow || !$sharedRow->employee_code) {
            return null;
        }

        // One-Login shared authentication foundation (Phase 8 — shared logout/revocation):
        // mirrors Main's own CheckActiveSession middleware exactly. Main's login() stores a
        // fresh session_token UUID on the users row and embeds the SAME value as this JWT's
        // `sid` claim; Main's own logout() nulls session_token. Comparing the two here means
        // a JWT that was perfectly valid a moment ago is rejected the instant the user logs
        // out of Main — without a new table, endpoint, or schema change, since both sides
        // already existed for Main's own single-session enforcement (found during the
        // Phase 7 E2E test, which showed Main itself already rejects a logged-out token this
        // way while DTS/Mock previously did not).
        if (!$sharedRow->session_token || ($payload['sid'] ?? null) !== $sharedRow->session_token) {
            return null;
        }

        $employeeId = Employee::where('employee_code', $sharedRow->employee_code)->value('id');
        if (!$employeeId) {
            return null;
        }

        $matches = User::where('employee_id', $employeeId)->get();

        return $matches->count() === 1 ? $matches->first() : null;
    }
}
