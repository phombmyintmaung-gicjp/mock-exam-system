<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

// One-Login migration (2026-09): covers App\Http\Middleware\SharedJwtAuth, which resolves
// identity ONLY from the shared Main JWT cookie, directly against the shared `users` table
// — mockexam_users no longer exists at all ("ALL USERS come from [Main's] USERS TABLE").
// Same DatabaseTransactions-only precedent as the rest of this session's tests — this suite
// runs against `dts_testing`, a database shared across all three apps' test suites; never
// RefreshDatabase here.
class SharedJwtAuthTest extends TestCase
{
    use DatabaseTransactions;

    private const TEST_SECRET = 'testing-only-shared-jwt-secret-do-not-use-in-production';

    // Employee is guarded (Mock only ever reads this Main-owned table) — insert via raw
    // query builder for test seeding rather than mass-assignment.
    private function makeEmployee(string $code): int
    {
        return DB::table('employees')->insertGetId([
            'employee_code' => $code,
            'name'          => "Test Employee {$code}",
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    // Creates a shared account. `$role` keeps the fixture's intent: NULL/1 → Main's Administrator
    // access group (users.role no longer exists), 3 → no group (not admin).
    private function makeUser(string $employeeCode, string $email, ?int $role = 3, ?string $sessionToken = 'e2e-fixed-test-session-token'): User
    {
        $user = User::create([
            'employee_code' => $employeeCode,
            'name'          => 'Shared Account',
            'email'         => $email,
            'password'      => Hash::make('irrelevant-for-this-suite'),
            'session_token' => $sessionToken,
        ]);
        if ($role === null || $role === 1) {
            $this->makeAdministrator($user);
        }
        return $user;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function mintSharedJwt(int $sharedUserId, ?int $expiresInSeconds = 3600, ?string $secret = null, ?string $sid = 'e2e-fixed-test-session-token'): string
    {
        $secret  = $secret ?? self::TEST_SECRET;
        $header  = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = $this->base64UrlEncode(json_encode([
            'sub' => $sharedUserId,
            'sid' => $sid,
            'iat' => time(),
            'exp' => $expiresInSeconds === null ? null : time() + $expiresInSeconds,
        ]));
        $signature = $this->base64UrlEncode(hash_hmac('sha256', "{$header}.{$payload}", $secret, true));

        return "{$header}.{$payload}.{$signature}";
    }

    private function withSharedCookie(string $jwt)
    {
        return $this->withCredentials()->withUnencryptedCookie('jwt_token', $jwt);
    }

    /** Test 1 — a valid shared JWT resolves the correct users identity. */
    public function test_valid_shared_jwt_resolves_user(): void
    {
        $this->makeEmployee('ZSJ01');
        $user = $this->makeUser('ZSJ01', 'shared-zsj01@gicjp.com');

        $jwt = $this->mintSharedJwt($user->id);

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/profile');

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $user->id);
    }

    /** Test 2 — an expired shared JWT is rejected. */
    public function test_expired_shared_jwt_is_rejected(): void
    {
        $this->makeEmployee('ZSJ02');
        $user = $this->makeUser('ZSJ02', 'shared-zsj02@gicjp.com');

        $jwt = $this->mintSharedJwt($user->id, expiresInSeconds: -60);

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/profile');

        $response->assertStatus(401);
    }

    /** Test 3 — a shared JWT signed with the wrong secret (invalid signature) is rejected. */
    public function test_invalid_signature_shared_jwt_is_rejected(): void
    {
        $this->makeEmployee('ZSJ03');
        $user = $this->makeUser('ZSJ03', 'shared-zsj03@gicjp.com');

        $jwt = $this->mintSharedJwt($user->id, secret: 'a-completely-different-wrong-secret');

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/profile');

        $response->assertStatus(401);
    }

    /** Test 4 — no shared cookie is unauthenticated. */
    public function test_missing_cookie_is_unauthenticated(): void
    {
        $response = $this->getJson('/api/v1/profile');

        $response->assertStatus(401);
    }

    /** Test 5 — a valid shared JWT for a user with no employee_code link at all is safely rejected. */
    public function test_valid_shared_jwt_with_no_employee_link_is_safely_rejected(): void
    {
        $user = User::create([
            'employee_code' => null,
            'name'          => 'Unlinked Account',
            'email'         => 'unlinked-zsj05@gicjp.com',
            'password'      => Hash::make('irrelevant'),
            'session_token' => 'session-zsj05',
        ]);

        $jwt = $this->mintSharedJwt($user->id, sid: 'session-zsj05');

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/profile');

        $response->assertStatus(401);
    }

    /** Test 6 — the resolved identity is exactly the linked users.id, not some other one. */
    public function test_shared_jwt_resolves_the_correct_user_id_specifically(): void
    {
        $this->makeEmployee('ZSJ06');
        $user = $this->makeUser('ZSJ06', 'shared-zsj06@gicjp.com');

        $this->makeEmployee('ZSJ06B');
        $this->makeUser('ZSJ06B', 'shared-zsj06b@gicjp.com', sessionToken: 'session-zsj06b');

        $jwt = $this->mintSharedJwt($user->id);

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/profile');

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $user->id);
    }

    /** Business records still resolve using the shared users.id after shared-JWT authentication. */
    public function test_business_records_still_resolve_via_shared_users_id(): void
    {
        $this->makeEmployee('ZSJ07');
        $user = $this->makeUser('ZSJ07', 'shared-zsj07@gicjp.com', sessionToken: 'session-zsj07');

        $sessionId = DB::table('exam_sessions')->insertGetId([
            'user_id'      => $user->id,
            'category'     => 'AWS SAA',
            'is_submitted' => true,
            'completed_at' => now(),
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
        DB::table('exam_results')->insert([
            'session_id'      => $sessionId,
            'user_id'         => $user->id,
            'score'           => 80,
            'total_questions' => 100,
            'passing_score'   => 70,
            'status'          => 'pass',
            'completed_at'    => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $jwt = $this->mintSharedJwt($user->id, sid: 'session-zsj07');

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/results');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /** Existing Mock admin-only authorization is unaffected: a role=1 (admin) account resolved via the shared JWT can reach an admin-only route. */
    public function test_existing_admin_authorization_still_works_via_shared_jwt(): void
    {
        $this->makeEmployee('ZSJ08');
        $user = $this->makeUser('ZSJ08', 'shared-zsj08@gicjp.com', role: 1, sessionToken: 'session-zsj08');

        $jwt = $this->mintSharedJwt($user->id, sid: 'session-zsj08');

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/results');

        $response->assertStatus(200);
    }

    /** An account in Main's Administrator access group is admin here too (fixture: role null). */
    public function test_null_role_is_treated_as_admin(): void
    {
        $this->makeEmployee('ZSJ08B');
        $user = $this->makeUser('ZSJ08B', 'shared-zsj08b@gicjp.com', role: null, sessionToken: 'session-zsj08b');

        $jwt = $this->mintSharedJwt($user->id, sid: 'session-zsj08b');

        $this->assertTrue($user->isAdmin());
        $this->withSharedCookie($jwt)->getJson('/api/v1/profile')->assertStatus(200);
    }

    /** One-Login migration — the legacy local login/bearer path is retired entirely. */
    public function test_local_login_is_retired(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'anyone@gicjp.com',
            'password' => 'whatever',
        ]);

        $response->assertStatus(410);
    }

    /** Phase 8 — a token that was valid a moment ago is rejected the instant Main's own logout nulls session_token, mirroring Main's own CheckActiveSession. */
    public function test_shared_jwt_rejected_after_main_logout_nulls_session_token(): void
    {
        $this->makeEmployee('ZSJ09');
        $user = $this->makeUser('ZSJ09', 'shared-zsj09@gicjp.com', sessionToken: 'session-before-logout');

        $jwt = $this->mintSharedJwt($user->id, sid: 'session-before-logout');

        // Simulate Main's own AuthService::logout(): nulls users.session_token.
        $user->update(['session_token' => null]);

        $this->withSharedCookie($jwt)->getJson('/api/v1/profile')->assertStatus(401);
    }

    /** Phase 8 — a stale sid (e.g. from a previous login, superseded by a newer one) is also rejected, not just a null session_token. */
    public function test_shared_jwt_rejected_when_sid_no_longer_matches_current_session_token(): void
    {
        $this->makeEmployee('ZSJ10');
        $user = $this->makeUser('ZSJ10', 'shared-zsj10@gicjp.com', sessionToken: 'old-session');

        $jwt = $this->mintSharedJwt($user->id, sid: 'old-session');
        $user->update(['session_token' => 'new-session-from-another-login']);

        $this->withSharedCookie($jwt)->getJson('/api/v1/profile')->assertStatus(401);
    }
}
