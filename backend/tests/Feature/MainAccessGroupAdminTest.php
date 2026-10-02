<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

// RBAC (Main feature 30): Mock's admin check comes only from Main's Administrator access group
// (users.role is dropped). An explicit non-Administrator group, or no explicit group at all, means
// "not admin". DatabaseTransactions only: this suite runs against the shared `dts_testing` database.
class MainAccessGroupAdminTest extends TestCase
{
    use DatabaseTransactions;

    private const TEST_SECRET = 'testing-only-shared-jwt-secret-do-not-use-in-production';
    private const ADMIN_ROUTE = '/api/v1/admin/results';

    protected function setUp(): void
    {
        parent::setUp();
        config(['shared_auth.secret' => self::TEST_SECRET]);
    }

    // Creates a linked shared account with a session token (no access group yet).
    private function makeUser(string $code): User
    {
        DB::table('employees')->insert(['employee_code' => $code, 'name' => "Employee {$code}", 'created_at' => now(), 'updated_at' => now()]);
        return User::create([
            'employee_code' => $code, 'name' => "User {$code}", 'email' => strtolower($code) . '@gicjp.com',
            'password' => Hash::make('x'), 'session_token' => "session-{$code}",
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

    public function test_administrator_group_grants_admin(): void
    {
        $user = $this->makeUser('ZRB01');
        $this->assignAccessGroup($user, administrator: true);
        $this->asUser($user, self::ADMIN_ROUTE)->assertOk();
        $profile = $this->asUser($user, '/api/v1/profile')->assertOk()->json('data');
        $this->assertTrue($profile['is_admin']);
        $this->assertArrayNotHasKey('role', $profile); // the raw legacy role is no longer exposed
    }

    public function test_non_administrator_group_denies_admin(): void
    {
        $user = $this->makeUser('ZRB02');
        $this->assignAccessGroup($user, administrator: false);
        $this->asUser($user, self::ADMIN_ROUTE)->assertForbidden();
        $this->assertFalse($this->asUser($user, '/api/v1/profile')->json('data.is_admin'));
    }

    public function test_account_without_an_explicit_group_is_not_admin(): void
    {
        $member = $this->makeUser('ZRB05');
        $this->asUser($member, self::ADMIN_ROUTE)->assertForbidden();
        $this->assertFalse($this->asUser($member, '/api/v1/profile')->json('data.is_admin'));
    }

    public function test_jwt_subject_carries_no_role_claim(): void
    {
        $this->assertSame([], $this->makeUser('ZRB06')->getJWTCustomClaims());
    }
}
