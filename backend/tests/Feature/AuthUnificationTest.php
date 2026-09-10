<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

// Auth unification (2026-09), Phase 3: covers Mock Exam login/authorization after
// switching password verification to SharedCredentialService. Deliberately uses
// DatabaseTransactions, NOT RefreshDatabase — this suite runs against `dts_testing`, a
// database SHARED across all three apps' test suites; RefreshDatabase would attempt to
// re-run every migration (this app's own `mockexam_migrations` tracking table is empty
// even though the schema itself is already fully present there — see
// tests/bootstrap-testing-env.php), which would either fail outright or, far worse under
// migrate:fresh, drop every table belonging to all three apps. DatabaseTransactions only
// wraps each test in a transaction that rolls back at the end — it never touches schema.
class AuthUnificationTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        // The login/register routes are rate-limited per-IP (5/minute) using the
        // default (array, in testing) cache store. Multiple tests in this class hit
        // /auth/login from the same test-client IP within the same PHPUnit process,
        // so the counter must be cleared before each test or later tests would start
        // failing with 429 instead of the status they actually intend to exercise.
        Cache::flush();
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

    private function makeSharedUser(string $employeeCode, string $email, string $plainPassword): int
    {
        return DB::table('users')->insertGetId([
            'employee_code' => $employeeCode,
            'name'          => 'Shared Account',
            'email'         => $email,
            'password'      => Hash::make($plainPassword),
            'role'          => 3, // Member — the only non-admin value in the final shared scheme
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    private function makeMockUser(array $overrides = []): \App\Models\User
    {
        return \App\Models\User::create(array_merge([
            'email'                 => 'mockuser@gicjp.com',
            'name'                  => 'Mock Test User',
            'role'                  => 2,
            'password'              => Hash::make('local-fallback-password'),
            'is_active'             => true,
            'approval_status'       => 'approved',
            'employee_id'           => null,
            'target_certification'  => null,
        ], $overrides));
    }

    /** Test 1 — linked employee + matching shared Main password → LOGIN SUCCESS. */
    public function test_login_succeeds_with_shared_password_when_employee_linked_and_shared_account_exists(): void
    {
        $employeeId = $this->makeEmployee('ZTEST01');
        $this->makeSharedUser('ZTEST01', 'shared01@gicjp.com', 'SharedPassword123');
        $this->makeMockUser([
            'email'       => 'ztest01@gicjp.com',
            'employee_id' => $employeeId,
            // Deliberately different from the shared password, to prove the SHARED
            // password is what's actually checked, not this local one.
            'password'    => Hash::make('StaleLocalPassword999'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'ztest01@gicjp.com',
            'password' => 'SharedPassword123',
        ]);

        $response->assertStatus(200);
        $this->assertArrayHasKey('token', $response->json('data'));
    }

    /** Test 2 — linked employee + shared account + wrong password → LOGIN FAILURE. */
    public function test_login_fails_with_wrong_password_when_shared_account_exists(): void
    {
        $employeeId = $this->makeEmployee('ZTEST02');
        $this->makeSharedUser('ZTEST02', 'shared02@gicjp.com', 'SharedPassword123');
        $this->makeMockUser([
            'email'       => 'ztest02@gicjp.com',
            'employee_id' => $employeeId,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'ztest02@gicjp.com',
            'password' => 'DefinitelyWrongPassword',
        ]);

        $response->assertStatus(401);
    }

    /** Test 3 — orphan legacy account (employee_id NULL) → legacy local login preserved. */
    public function test_orphan_account_still_logs_in_with_its_own_local_password(): void
    {
        $this->makeMockUser([
            'email'       => 'ztest03@gicjp.com',
            'employee_id' => null,
            'password'    => Hash::make('LegacyLocalPassword123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'ztest03@gicjp.com',
            'password' => 'LegacyLocalPassword123',
        ]);

        $response->assertStatus(200);
    }

    /** Test 4 — employee linked but no shared Main account yet → local fallback preserved. */
    public function test_linked_employee_without_shared_account_falls_back_to_local_password(): void
    {
        $employeeId = $this->makeEmployee('ZTEST04');
        // Deliberately no row inserted into `users` for this employee_code.

        $this->makeMockUser([
            'email'       => 'ztest04@gicjp.com',
            'employee_id' => $employeeId,
            'password'    => Hash::make('LocalOnlyPassword123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'ztest04@gicjp.com',
            'password' => 'LocalOnlyPassword123',
        ]);

        $response->assertStatus(200);
    }

    /** Test 5 — shared password changes externally → Mock login uses the NEW shared password; mockexam_users.password is never written by login. */
    public function test_login_reflects_shared_password_change_without_touching_local_column(): void
    {
        $employeeId = $this->makeEmployee('ZTEST05');
        $this->makeSharedUser('ZTEST05', 'shared05@gicjp.com', 'OldSharedPassword123');
        $localHash = Hash::make('NeverTouchedLocalPassword123');
        $mockUser  = $this->makeMockUser([
            'email'       => 'ztest05@gicjp.com',
            'employee_id' => $employeeId,
            'password'    => $localHash,
        ]);

        // Simulate the shared password being changed elsewhere (e.g. via Main's own UI).
        DB::table('users')->where('employee_code', 'ZTEST05')->update([
            'password'   => Hash::make('NewSharedPassword456'),
            'updated_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'ztest05@gicjp.com',
            'password' => 'NewSharedPassword456',
        ]);

        $response->assertStatus(200);

        $this->assertSame(
            $localHash,
            DB::table('mockexam_users')->where('id', $mockUser->id)->value('password'),
            'Login must never write to mockexam_users.password.'
        );
    }

    /** Test 6 — Mock Exam business records still key off mockexam_users.id and remain reachable after login. */
    public function test_business_records_remain_accessible_via_mockexam_users_id_after_login(): void
    {
        $employeeId = $this->makeEmployee('ZTEST06');
        $this->makeSharedUser('ZTEST06', 'shared06@gicjp.com', 'SharedPassword123');
        $mockUser = $this->makeMockUser([
            'email'       => 'ztest06@gicjp.com',
            'employee_id' => $employeeId,
        ]);

        $sessionId = DB::table('exam_sessions')->insertGetId([
            'user_id'     => $mockUser->id,
            'category'    => 'AWS SAA',
            'is_submitted'=> true,
            'completed_at'=> now(),
            'created_at'  => now(),
            'updated_at'  => now(),
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

        $login = $this->postJson('/api/v1/auth/login', [
            'email'    => 'ztest06@gicjp.com',
            'password' => 'SharedPassword123',
        ]);
        $login->assertStatus(200);
        $token = $login->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/results');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    /** Test 7 — admin authorization still works for a role=1 mockexam_users account. */
    public function test_admin_authorization_still_works_after_shared_login(): void
    {
        $employeeId = $this->makeEmployee('ZTEST07');
        $this->makeSharedUser('ZTEST07', 'shared07@gicjp.com', 'SharedPassword123');
        $this->makeMockUser([
            'email'       => 'ztest07@gicjp.com',
            'employee_id' => $employeeId,
            'role'        => 1, // Mock Exam's own admin flag
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email'    => 'ztest07@gicjp.com',
            'password' => 'SharedPassword123',
        ]);
        $token = $login->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(200);
    }

    /** Test 8 — member (role=2) authorization is still correctly denied on admin-only routes. */
    public function test_member_is_still_denied_admin_routes_after_shared_login(): void
    {
        $employeeId = $this->makeEmployee('ZTEST08');
        $this->makeSharedUser('ZTEST08', 'shared08@gicjp.com', 'SharedPassword123');
        $this->makeMockUser([
            'email'       => 'ztest08@gicjp.com',
            'employee_id' => $employeeId,
            'role'        => 2, // Mock Exam's own employee/member flag
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email'    => 'ztest08@gicjp.com',
            'password' => 'SharedPassword123',
        ]);
        $token = $login->json('data.token');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(403);
    }

    /** Test 9 — no dependency on a shared users.role=2 value: a shared Member (role=3) account still logs in and Mock-side authorization is governed only by mockexam_users.role. */
    public function test_no_role_2_dependency_shared_member_role_governs_nothing_locally(): void
    {
        $employeeId = $this->makeEmployee('ZTEST09');
        // Shared role=3 (Member) — the final architecture's only non-admin value; there is no
        // role=2 anywhere in the shared `users` scheme to depend on.
        $this->makeSharedUser('ZTEST09', 'shared09@gicjp.com', 'SharedPassword123');
        $this->assertSame(3, DB::table('users')->where('employee_code', 'ZTEST09')->value('role'));

        $this->makeMockUser([
            'email'       => 'ztest09@gicjp.com',
            'employee_id' => $employeeId,
            'role'        => 1, // Mock's own admin flag — independent number space from shared users.role
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email'    => 'ztest09@gicjp.com',
            'password' => 'SharedPassword123',
        ]);
        $login->assertStatus(200);
        $token = $login->json('data.token');

        // Mock-side admin authorization is still driven purely by mockexam_users.role,
        // completely independent of the shared account's role value.
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(200);
    }
}
