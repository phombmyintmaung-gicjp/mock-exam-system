<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

// One-Login shared authentication foundation (2026-09, Phase 5): covers
// App\Http\Middleware\SharedJwtAuth, which primes the `api` guard from the shared Main JWT
// cookie BEFORE the existing `auth:api` middleware runs — added ahead of (never in place
// of) this app's own tymon/jwt-auth bearer-token check. Same DatabaseTransactions-only
// precedent as the rest of this session's tests — this suite runs against `dts_testing`,
// a database shared across all three apps' test suites; never RefreshDatabase here.
//
// IMPORTANT test-harness note: Laravel's json()/getJson() test helpers only forward
// registered cookies when the request chain also calls withCredentials() first —
// prepareCookiesForJsonRequest() otherwise returns an empty cookie set (mirrors a real
// browser's fetch()/XHR needing credentials: 'include' for a cross-origin-looking
// request). Every request below that relies on the shared cookie chains
// withCredentials()->withUnencryptedCookie() — withUnencryptedCookie (not withCookie) is
// required too, since the middleware reads the RAW cookie value directly, matching how
// Main's own jwt_token cookie is actually delivered (see Phase 4's audit: this app's `api`
// middleware group carries no EncryptCookies).
class SharedJwtAuthTest extends TestCase
{
    use DatabaseTransactions;

    private const TEST_SECRET = 'testing-only-shared-jwt-secret-do-not-use-in-production';

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush(); // login is rate-limited per-IP; avoid cross-test 429s on the legacy-login test below
    }

    private function makeEmployee(string $code): int
    {
        return DB::table('employees')->insertGetId([
            'employee_code' => $code,
            'name'          => "Test Employee {$code}",
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    private function makeSharedUser(string $employeeCode, string $email): int
    {
        return DB::table('users')->insertGetId([
            'employee_code' => $employeeCode,
            'name'          => 'Shared Account',
            'email'         => $email,
            'password'      => bcrypt('irrelevant-for-this-suite'),
            'role'          => 3,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    private function makeMockUser(int $employeeId, string $email, int $role = 2): \App\Models\User
    {
        return \App\Models\User::create([
            'email'                => $email,
            'name'                 => 'Mock Account',
            'role'                 => $role,
            'password'             => bcrypt('irrelevant-for-this-suite'),
            'is_active'            => true,
            'approval_status'      => 'approved',
            'employee_id'          => $employeeId,
            'target_certification' => null,
        ]);
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /** Mints a JWT exactly matching what Main's tymon/jwt-auth issues (HS256, `sub` claim), signed with the shared test secret. */
    private function mintSharedJwt(int $sharedUserId, ?int $expiresInSeconds = 3600, ?string $secret = null): string
    {
        $secret  = $secret ?? self::TEST_SECRET;
        $header  = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = $this->base64UrlEncode(json_encode([
            'sub' => $sharedUserId,
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

    /** Test 1 — a valid shared JWT resolves the correct mockexam_users identity. */
    public function test_valid_shared_jwt_resolves_mock_user(): void
    {
        $employeeId = $this->makeEmployee('ZSJ01');
        $sharedId   = $this->makeSharedUser('ZSJ01', 'shared-zsj01@gicjp.com');
        $mockUser   = $this->makeMockUser($employeeId, 'mock-zsj01@gicjp.com');

        $jwt = $this->mintSharedJwt($sharedId);

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/profile');

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $mockUser->id);
    }

    /** Test 2 — an expired shared JWT is rejected (falls through to the existing bearer-token guard, which also fails with no token → 401). */
    public function test_expired_shared_jwt_is_rejected(): void
    {
        $employeeId = $this->makeEmployee('ZSJ02');
        $sharedId   = $this->makeSharedUser('ZSJ02', 'shared-zsj02@gicjp.com');
        $this->makeMockUser($employeeId, 'mock-zsj02@gicjp.com');

        $jwt = $this->mintSharedJwt($sharedId, expiresInSeconds: -60);

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/profile');

        $response->assertStatus(401);
    }

    /** Test 3 — a shared JWT signed with the wrong secret (invalid signature) is rejected. */
    public function test_invalid_signature_shared_jwt_is_rejected(): void
    {
        $employeeId = $this->makeEmployee('ZSJ03');
        $sharedId   = $this->makeSharedUser('ZSJ03', 'shared-zsj03@gicjp.com');
        $this->makeMockUser($employeeId, 'mock-zsj03@gicjp.com');

        $jwt = $this->mintSharedJwt($sharedId, secret: 'a-completely-different-wrong-secret');

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/profile');

        $response->assertStatus(401);
    }

    /** Test 4 — no shared cookie and no bearer token → unauthenticated. */
    public function test_missing_cookie_is_unauthenticated(): void
    {
        $response = $this->getJson('/api/v1/profile');

        $response->assertStatus(401);
    }

    /** Test 5 — a valid shared JWT resolves the exact correct mockexam_users.id, not some other one. */
    public function test_shared_jwt_resolves_the_correct_mockexam_users_id_specifically(): void
    {
        $employeeId = $this->makeEmployee('ZSJ05');
        $sharedId   = $this->makeSharedUser('ZSJ05', 'shared-zsj05@gicjp.com');
        $mockUser   = $this->makeMockUser($employeeId, 'mock-zsj05@gicjp.com');

        $otherEmployeeId = $this->makeEmployee('ZSJ05B');
        $this->makeMockUser($otherEmployeeId, 'mock-zsj05b@gicjp.com');

        $jwt = $this->mintSharedJwt($sharedId);

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/profile');

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $mockUser->id);
    }

    /** Test 6 — Mock business records still resolve using mockexam_users.id after shared-JWT authentication. */
    public function test_business_records_still_resolve_via_mockexam_users_id(): void
    {
        $employeeId = $this->makeEmployee('ZSJ06');
        $sharedId   = $this->makeSharedUser('ZSJ06', 'shared-zsj06@gicjp.com');
        $mockUser   = $this->makeMockUser($employeeId, 'mock-zsj06@gicjp.com');

        $sessionId = DB::table('exam_sessions')->insertGetId([
            'user_id'      => $mockUser->id,
            'category'     => 'AWS SAA',
            'is_submitted' => true,
            'completed_at' => now(),
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
        DB::table('exam_results')->insert([
            'session_id'      => $sessionId,
            'user_id'         => $mockUser->id,
            'score'           => 80,
            'total_questions' => 100,
            'passing_score'   => 70,
            'status'          => 'pass',
            'completed_at'    => now(),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        $jwt = $this->mintSharedJwt($sharedId);

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/results');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /** Existing Mock admin-only authorization is unaffected by shared-JWT resolution. */
    public function test_existing_admin_authorization_still_works_via_shared_jwt(): void
    {
        $employeeId = $this->makeEmployee('ZSJ07');
        $sharedId   = $this->makeSharedUser('ZSJ07', 'shared-zsj07@gicjp.com');
        $this->makeMockUser($employeeId, 'mock-zsj07@gicjp.com', role: 1);

        $jwt = $this->mintSharedJwt($sharedId);

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/admin/users');

        $response->assertStatus(200);
    }

    /** Existing Mock member (non-admin) authorization is still correctly denied via shared-JWT resolution. */
    public function test_existing_member_authorization_still_denied_via_shared_jwt(): void
    {
        $employeeId = $this->makeEmployee('ZSJ07B');
        $sharedId   = $this->makeSharedUser('ZSJ07B', 'shared-zsj07b@gicjp.com');
        $this->makeMockUser($employeeId, 'mock-zsj07b@gicjp.com', role: 2);

        $jwt = $this->mintSharedJwt($sharedId);

        $response = $this->withSharedCookie($jwt)->getJson('/api/v1/admin/users');

        $response->assertStatus(403);
    }

    /** The existing legacy/orphan local-login flow (Phase 3's own shared-credential fallback for employee_id=NULL accounts) is completely unaffected by this middleware's addition. */
    public function test_legacy_local_login_flow_still_works_unaffected(): void
    {
        \App\Models\User::create([
            'email'       => 'mock-zsj08@gicjp.com',
            'name'        => 'Legacy Login Path',
            'role'        => 2,
            'password'    => bcrypt('LegacyPlainPassword123'),
            'is_active'   => true,
            'approval_status' => 'approved',
            'employee_id' => null,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'mock-zsj08@gicjp.com',
            'password' => 'LegacyPlainPassword123',
        ]);

        $response->assertStatus(200);
    }
}
