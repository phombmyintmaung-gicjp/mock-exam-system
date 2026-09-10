<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

// Auth unification (2026-09), Phase 3.6: covers UserAdminController::store()/update()
// after switching password writes to go through SharedCredentialService (Option A from
// the Phase 3.5 investigation) instead of raw mass-assignment onto mockexam_users.password.
// Same DatabaseTransactions-only precedent as AuthUnificationTest — this suite runs
// against `dts_testing`, a database shared across all three apps' test suites; never
// RefreshDatabase here (see AuthUnificationTest's own comment for the full reasoning).
class AdminPasswordUnificationTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush(); // login is rate-limited per-IP; avoid cross-test 429s
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

    private function makeSharedUser(string $employeeCode, string $email, string $plainPassword): void
    {
        DB::table('users')->insert([
            'employee_code' => $employeeCode,
            'name'          => 'Shared Account',
            'email'         => $email,
            'password'      => Hash::make($plainPassword),
            'role'          => 3,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    private function loginAsMockAdmin(string $employeeCode, string $email, string $sharedPassword): string
    {
        $employeeId = $this->makeEmployee($employeeCode);
        $this->makeSharedUser($employeeCode, "shared-{$employeeCode}@gicjp.com", $sharedPassword);

        \App\Models\User::create([
            'email'       => $email,
            'name'        => 'Acting Admin',
            'role'        => 1,
            'password'    => Hash::make($sharedPassword),
            'is_active'   => true,
            'approval_status' => 'approved',
            'employee_id' => $employeeId,
        ]);

        $login = $this->postJson('/api/v1/auth/login', ['email' => $email, 'password' => $sharedPassword]);
        $login->assertStatus(200);

        return $login->json('data.token');
    }

    /** Admin creates a user linked to an employee who already has a shared Main account → the shared password is set, not just the local one. */
    public function test_admin_create_sets_shared_password_when_employee_has_shared_account(): void
    {
        $token = $this->loginAsMockAdmin('ZADM01', 'admin01@gicjp.com', 'AdminSharedPass123');

        $targetEmployeeId = $this->makeEmployee('ZTGT01');
        $this->makeSharedUser('ZTGT01', 'shared-target01@gicjp.com', 'OldTargetSharedPass123');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/admin/users', [
                'employee_code' => 'ZTGT01',
                'email'         => 'newmock01@gicjp.com',
                'name'          => 'New Mock User',
                'role'          => 2,
                'password'      => 'AdminSetPassword456',
            ]);

        $response->assertStatus(201);

        $sharedHash = DB::table('users')->where('employee_code', 'ZTGT01')->value('password');
        $this->assertTrue(Hash::check('AdminSetPassword456', $sharedHash), 'Shared users.password must reflect the admin-supplied password.');

        $localHash = DB::table('mockexam_users')->where('email', 'newmock01@gicjp.com')->value('password');
        $this->assertTrue(Hash::check('AdminSetPassword456', $localHash), 'Local mockexam_users.password should stay in sync transitionally.');
    }

    /** Admin creates a user linked to an employee with NO shared account yet → only the local password is set, no shared row is created. */
    public function test_admin_create_falls_back_to_local_password_when_no_shared_account_exists(): void
    {
        $token = $this->loginAsMockAdmin('ZADM02', 'admin02@gicjp.com', 'AdminSharedPass123');

        $this->makeEmployee('ZTGT02');
        // Deliberately no `users` row inserted for ZTGT02.

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/admin/users', [
                'employee_code' => 'ZTGT02',
                'email'         => 'newmock02@gicjp.com',
                'name'          => 'New Mock User Two',
                'role'          => 2,
                'password'      => 'AdminSetPassword789',
            ]);

        $response->assertStatus(201);

        $this->assertFalse(
            DB::table('users')->where('employee_code', 'ZTGT02')->exists(),
            'No shared users row should be auto-created by admin creation.'
        );

        $localHash = DB::table('mockexam_users')->where('email', 'newmock02@gicjp.com')->value('password');
        $this->assertTrue(Hash::check('AdminSetPassword789', $localHash));
    }

    /** Admin updates an existing linked user's password (shared account exists) → the shared row is updated. */
    public function test_admin_update_sets_shared_password_when_employee_has_shared_account(): void
    {
        $token = $this->loginAsMockAdmin('ZADM03', 'admin03@gicjp.com', 'AdminSharedPass123');

        $targetEmployeeId = $this->makeEmployee('ZTGT03');
        $this->makeSharedUser('ZTGT03', 'shared-target03@gicjp.com', 'OldSharedPass123');
        $targetMockUser = \App\Models\User::create([
            'email'       => 'existingmock03@gicjp.com',
            'name'        => 'Existing Mock User',
            'role'        => 2,
            'password'    => Hash::make('StaleLocalPass123'),
            'is_active'   => true,
            'approval_status' => 'approved',
            'employee_id' => $targetEmployeeId,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/v1/admin/users/{$targetMockUser->id}", [
                'password' => 'NewAdminSetPass999',
            ]);

        $response->assertStatus(200);

        $sharedHash = DB::table('users')->where('employee_code', 'ZTGT03')->value('password');
        $this->assertTrue(Hash::check('NewAdminSetPass999', $sharedHash));
    }

    /** Admin updates a legacy orphan user's password (employee_id NULL) → only the local password changes, no error. */
    public function test_admin_update_orphan_account_password_stays_local_only(): void
    {
        $token = $this->loginAsMockAdmin('ZADM04', 'admin04@gicjp.com', 'AdminSharedPass123');

        $orphan = \App\Models\User::create([
            'email'       => 'orphanmock04@gicjp.com',
            'name'        => 'Orphan Mock User',
            'role'        => 2,
            'password'    => Hash::make('OldOrphanPass123'),
            'is_active'   => true,
            'approval_status' => 'approved',
            'employee_id' => null,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/v1/admin/users/{$orphan->id}", [
                'password' => 'NewOrphanPass456',
            ]);

        $response->assertStatus(200);

        $localHash = DB::table('mockexam_users')->where('id', $orphan->id)->value('password');
        $this->assertTrue(Hash::check('NewOrphanPass456', $localHash));
    }

    /** After an admin sets a linked user's password, that user can log in with it via Mock's own login endpoint. */
    public function test_target_user_can_log_in_with_admin_set_password(): void
    {
        $token = $this->loginAsMockAdmin('ZADM05', 'admin05@gicjp.com', 'AdminSharedPass123');

        $targetEmployeeId = $this->makeEmployee('ZTGT05');
        $this->makeSharedUser('ZTGT05', 'shared-target05@gicjp.com', 'OldSharedPass123');

        $created = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/admin/users', [
                'employee_code' => 'ZTGT05',
                'email'         => 'newmock05@gicjp.com',
                'name'          => 'New Mock User Five',
                'role'          => 2,
                'password'      => 'AdminSetPassword555',
            ]);
        $created->assertStatus(201);

        Cache::flush(); // clear the throttle counter again before the target's own login attempt

        $login = $this->postJson('/api/v1/auth/login', [
            'email'    => 'newmock05@gicjp.com',
            'password' => 'AdminSetPassword555',
        ]);

        $login->assertStatus(200);
    }

    /** The shared users.password row is updated identically to how Main/DTS themselves check it (Hash::check), proving cross-system propagation without needing to boot those separate applications here. */
    public function test_shared_password_update_is_verifiable_the_same_way_main_and_dts_verify_it(): void
    {
        $token = $this->loginAsMockAdmin('ZADM06', 'admin06@gicjp.com', 'AdminSharedPass123');

        $this->makeEmployee('ZTGT06');
        $this->makeSharedUser('ZTGT06', 'shared-target06@gicjp.com', 'OldSharedPass123');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/admin/users', [
                'employee_code' => 'ZTGT06',
                'email'         => 'newmock06@gicjp.com',
                'name'          => 'New Mock User Six',
                'role'          => 2,
                'password'      => 'CrossSystemPass777',
            ])->assertStatus(201);

        $sharedRow = DB::table('users')->where('employee_code', 'ZTGT06')->first();
        // This is exactly the check Main's AuthService::login() and DTS's
        // SharedCredentialService::verifyPassword() both perform against this same column.
        $this->assertTrue(Hash::check('CrossSystemPass777', $sharedRow->password));
    }
}
