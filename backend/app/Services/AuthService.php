<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthService
{
    /**
     * Validate credentials and return a token + user payload.
     * Returns 'pending' or 'rejected' string if account is not approved.
     * Returns null on wrong credentials.
     *
     * @param  array{email: string, password: string} $credentials
     * @return array{token: string, user: User}|string|null
     */
    public function login(array $credentials): array|string|null
    {
        // Check approval status before attempting JWT auth
        $user = User::where('email', $credentials['email'])->first();

        if ($user) {
            if ($user->approval_status === 'pending') {
                return 'pending';
            }
            if ($user->approval_status === 'rejected') {
                return 'rejected';
            }
            if (! $user->is_active) {
                return 'inactive';
            }
        }

        $token = Auth::guard('api')->attempt([
            'email'     => $credentials['email'],
            'password'  => $credentials['password'],
            'is_active' => true,
        ]);

        if (! $token) {
            return null;
        }

        /** @var User $user */
        $user = Auth::guard('api')->user();

        return [
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'user'       => $user,
        ];
    }

    /**
     * Create a new employee account pending admin approval.
     * Does NOT auto-login — returns a message array instead.
     *
     * @param  array{name: string, email: string, password: string} $data
     * @return array{message: string}
     */
    public function register(array $data): array
    {
        $existing = User::where('email', $data['email'])
            ->where('approval_status', 'rejected')
            ->first();

        if ($existing) {
            $existing->update([
                'name'            => $data['name'],
                'password'        => $data['password'],
                'is_active'       => false,
                'approval_status' => 'pending',
            ]);
        } else {
            User::create([
                'name'            => $data['name'],
                'email'           => $data['email'],
                'password'        => $data['password'],
                'role'            => 2,
                'is_active'       => false,
                'approval_status' => 'pending',
            ]);
        }

        return [
            'message' => 'Registration submitted. Awaiting admin approval.',
        ];
    }

    /**
     * Invalidate the current JWT token.
     */
    public function logout(): void
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
        } catch (JWTException) {
            // Token already invalid or missing — treat as logged out.
        }

        Auth::guard('api')->logout();
    }

    /**
     * Refresh the current JWT token and return the new token string.
     *
     * @throws JWTException if the refresh token has expired.
     */
    public function refresh(): string
    {
        return Auth::guard('api')->refresh();
    }
}
