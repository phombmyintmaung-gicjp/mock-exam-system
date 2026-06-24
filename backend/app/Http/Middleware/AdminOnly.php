<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    /**
     * Handle an incoming request.
     *
     * Grants access only to authenticated users whose role is 'admin'.
     * Returns a 403 JSON error for all other users.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if ($user === null || ! $user->isAdmin()) {
            return response()->json(
                ['error' => 'Forbidden. Admin access required.'],
                403
            );
        }

        return $next($request);
    }
}
