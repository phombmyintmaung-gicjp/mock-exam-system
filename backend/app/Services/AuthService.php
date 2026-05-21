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
     *
     * @param  array{email: string, password: string} $credentials
     * @return array{token: string, user: User}|null  Returns null on failure.
     */
    public function login(array $credentials): ?array
    {
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
     * Create a new employee account and return a token + user payload.
     *
     * @param  array{name: string, email: string, password: string} $data
     * @return array{token: string, token_type: string, expires_in: int, user: User}
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => $data['password'],
            'role'      => 'employee',
            'is_active' => true,
        ]);

        /** @var string $token */
        $token = Auth::guard('api')->login($user);

        return [
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'user'       => $user,
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
