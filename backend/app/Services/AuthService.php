<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthService
{
    /**
     * Validate credentials and return a token + user payload.
     * Returns 'pending' or 'rejected' string if account is not approved.
     * Returns null on wrong credentials.
     *
     * Auth unification (2026-09): the password itself is verified via
     * SharedCredentialService — the shared Main `users` password is authoritative
     * whenever this account is linked to an employee who already has a shared
     * account; otherwise this account's own local `mockexam_users.password` is
     * used (legacy/orphan accounts, or a linked employee with no shared account
     * yet — never auto-created here). Once verified, a JWT is issued directly for
     * this exact mockexam_users-backed identity via the guard's login() — the
     * token subject/business identity is unchanged, so every Mock Exam table
     * keyed on mockexam_users.id keeps working exactly as before.
     *
     * @param  array{email: string, password: string} $credentials
     * @return array{token: string, user: User}|string|null
     */
    public function login(array $credentials): array|string|null
    {
        $user = User::where('email', $credentials['email'])->first();

        if (! $user) {
            return null;
        }

        if ($user->approval_status === 'pending') {
            return 'pending';
        }
        if ($user->approval_status === 'rejected') {
            return 'rejected';
        }
        if (! $user->is_active) {
            return 'inactive';
        }

        if (! SharedCredentialService::verifyPassword($user, $credentials['password'])) {
            return null;
        }

        $token = Auth::guard('api')->login($user);

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
     * Database consolidation — approved decision: employee_code is required and
     * already validated by RegisterRequest (exists:employees,employee_code) — this
     * resolves it to the shared employee's id and stores it on the new account.
     *
     * Auth unification (2026-09): this registration must not mint an independent
     * Mock-only password — it resolves/creates the shared Main `users` row instead,
     * mirroring discussion-topic-system's own registration precedent exactly. If a
     * shared account already exists for this employee, the submitted password must
     * match it (a Mock registration can never silently fork a second, different
     * password for the same employee); if none exists yet, this registration
     * becomes the one that creates it, so the shared `users` table stays
     * authoritative from day one. `mockexam_users.password` is still written,
     * kept in sync transitionally with whichever hash is authoritative.
     *
     * @param  array{employee_code: string, name: string, email: string, password: string} $data
     * @return array{message: string}|array{error: true, message: string}
     */
    public function register(array $data): array
    {
        $employee = Employee::where('employee_code', $data['employee_code'])->first();

        $sharedUser = DB::table('users')->where('employee_code', $employee->employee_code)->first();

        if ($sharedUser) {
            if (! Hash::check($data['password'], $sharedUser->password)) {
                return [
                    'error'   => true,
                    'message' => 'An account for this employee already exists on the shared company system — please register using that existing password.',
                ];
            }
            $sharedPasswordHash = $sharedUser->password;
        } else {
            if (DB::table('users')->where('email', $data['email'])->exists()) {
                return [
                    'error'   => true,
                    'message' => 'This email is already used by a different account on the shared company system. Please contact your administrator.',
                ];
            }
            $sharedPasswordHash = Hash::make($data['password']);
            DB::table('users')->insert([
                'employee_code' => $employee->employee_code,
                'name'          => $data['name'],
                'email'         => $data['email'],
                'password'      => $sharedPasswordHash,
                'role'          => 3, // Member — never Admin from a self-registration
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }

        $existing = User::where('email', $data['email'])
            ->where('approval_status', 'rejected')
            ->first();

        if ($existing) {
            $existing->update([
                'name'            => $data['name'],
                'password'        => $sharedPasswordHash,
                'is_active'       => false,
                'approval_status' => 'pending',
                'employee_id'     => $employee->id,
            ]);
        } else {
            User::create([
                'name'            => $data['name'],
                'email'           => $data['email'],
                'password'        => $sharedPasswordHash,
                'role'            => 2, // Mock Exam's own local role scheme (1=admin/2=employee) — unrelated to shared users.role
                'is_active'       => false,
                'approval_status' => 'pending',
                'employee_id'     => $employee->id,
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
