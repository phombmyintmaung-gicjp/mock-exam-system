<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

// One-Login migration (2026-09): this app has no local login/registration/logout/refresh
// session of any kind anymore — every action below is retired (410). Authentication
// happens once at the Main Staff Portal via the shared jwt_token cookie; SharedJwtAuth/
// RequireSharedAuth resolve identity directly from Main's shared `users` table —
// mockexam_users no longer exists at all ("ALL USERS come from [Main's] USERS TABLE").
// The frontend calls Main's own /auth/logout directly instead (see Sidebar.tsx's
// handleLogout()), which is what actually revokes the shared session. AuthService (this
// app's own login/register/logout/refresh logic, all against the now-gone local JWT) has
// been deleted entirely rather than left unused, since nothing calls any of it anymore.
class AuthController extends Controller
{
    /**
     * POST /auth/login — retired. Deliberately takes no FormRequest — this must return
     * 410 unconditionally, never a 422 from LoginRequest's own validation running first.
     */
    public function login(): JsonResponse
    {
        return response()->json(['error' => 'Local login has been retired. Please sign in at the Main Staff Portal.'], 410);
    }

    /**
     * POST /auth/register — retired. Deliberately takes no FormRequest — this must return
     * 410 unconditionally, never a 422 from RegisterRequest's own validation running first.
     */
    public function register(): JsonResponse
    {
        return response()->json(['error' => 'Local registration has been retired. Sign in at the Main Staff Portal — your account here is created automatically.'], 410);
    }

    /**
     * POST /auth/logout — retired. There is no local JWT to invalidate anymore; the shared
     * session lives entirely on Main's `users` row and is revoked by Main's own
     * /auth/logout. Kept as a route so an old cached frontend bundle gets a no-op success
     * instead of an error.
     */
    public function logout(): JsonResponse
    {
        return response()->json(['data' => ['message' => 'Successfully logged out.']]);
    }

    /**
     * POST /auth/refresh — retired. There is no local JWT left to refresh.
     */
    public function refresh(): JsonResponse
    {
        return response()->json(['error' => 'Local token refresh has been retired.'], 410);
    }
}
