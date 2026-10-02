<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\Concerns\ProvisionsMainRbacTables;
use Tests\TestCase;

// RBAC (Main feature 30): Mock's admin check now comes from Main's Administrator access group,
// not users.role. An explicit group always decides; only accounts without one fall back to Main's
// legacy rule (role NULL/1). The desynced fixtures (an explicit group disagreeing with role) can't
// arise through Main — they only prove which source decides. DatabaseTransactions only: this
// suite runs against the shared `dts_testing` database.
class MainAccessGroupAdminTest extends TestCase
{
    use DatabaseTransactions, ProvisionsMainRbacTables;

    private const TEST_SECRET = 'testing-only-shared-jwt-secret-do-not-use-in-production';
    private const ADMIN_ROUTE = '/api/v1/admin/results';

    protected function setUp(): void
    {
        parent::setUp();
        config(['shared_auth.secret' => self::TEST_SECRET]);
    }

    // Creates a linked shared account with the given legacy role and session token.
    private function makeUser(string $code, ?int $role): User
    {
        DB::table('employees')->insert(['employee_code' => $code, 'name' => "Employee {$code}", 'created_at' => now(), 'updated_at' => now()]);
        return User::create([
            'employee_code' => $code, 'name' => "User {$code}", 'email' => strtolower($code) . '@gicjp.com',
            'password' => Hash::make('x'), 'role' => $role, 'session_token' => "session-{$code}",
        ]);
    }

    // Requests a path as the user via Main's shared JWT cookie.
    private function asUser(User $user, string $path)
    {
        $b64 = fn (string $d) => rtrim(strtr(base64_encode($d), '+/', '-_'), '=');
        $header = $b64(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = $b64(json_encode(['sub' => $user->id, 'sid' => $user->session_token, 'iat' => time(), 'exp' => time() + 3600]));
        $jwt = "{$header}.{$payload}." . $b64(hash_hmac('sha256', "{$header}.{$payload}", self::TEST_SECRET, true));
        return $this->withCredentials()->withUnencryptedCookie('jwt_token', $jwt)->getJson($path);
    }

    public function test_administrator_group_grants_admin_regardless_of_role(): void
    {
        $user = $this->makeUser('ZRB01', 3);
        $this->assignAccessGroup($user, administrator: true);
        $this->asUser($user, self::ADMIN_ROUTE)->assertOk();
        $profile = $this->asUser($user, '/api/v1/profile')->assertOk()->json('data');
        $this->assertTrue($profile['is_admin']);
        $this->assertArrayNotHasKey('role', $profile); // the raw legacy role is no longer exposed
    }

    public function test_non_administrator_group_denies_admin_even_with_role_one(): void
    {
        $user = $this->makeUser('ZRB02', 1);
        $this->assignAccessGroup($user, administrator: false);
        $this->asUser($user, self::ADMIN_ROUTE)->assertForbidden();
        $this->assertFalse($this->asUser($user, '/api/v1/profile')->json('data.is_admin'));
    }

    public function test_accounts_without_an_explicit_group_use_mains_legacy_fallback(): void
    {
        $this->asUser($this->makeUser('ZRB03', 1), self::ADMIN_ROUTE)->assertOk();
        $this->asUser($this->makeUser('ZRB04', null), self::ADMIN_ROUTE)->assertOk();
        $member = $this->makeUser('ZRB05', 3);
        $this->asUser($member, self::ADMIN_ROUTE)->assertForbidden();
        $this->assertFalse($this->asUser($member, '/api/v1/profile')->json('data.is_admin'));
    }

    public function test_jwt_subject_carries_no_role_claim(): void
    {
        $this->assertSame([], $this->makeUser('ZRB06', 1)->getJWTCustomClaims());
    }
}
