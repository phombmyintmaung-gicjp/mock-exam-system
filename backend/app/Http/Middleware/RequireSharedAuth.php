<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

// One-Login migration, Phase 3 (2026-09): replaces `auth:api` as the gate on every
// protected route — the shared Main JWT cookie (resolved earlier by SharedJwtAuth) is now
// the ONLY authentication authority. Deliberately reads the `shared_user` request attribute
// SharedJwtAuth already set, rather than calling Auth::guard('api')->check()/user() directly
// — the latter would fall back to parsing this app's own (retired) local bearer JWT the
// moment no shared identity was found, silently undoing this whole migration step.
class RequireSharedAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->attributes->get('shared_user');

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        Auth::guard('api')->setUser($user);

        return $next($request);
    }
}
