<?php

namespace Tests\Concerns;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// TEST-ONLY. Main owns the RBAC tables (Main CLAUDE.md feature 30); this app only READS
// `access_groups` / `user_access_groups` to decide admin-ness. The shared `dts_testing` database
// predates them, so this creates a column-for-column mirror of Main's two tables there when
// missing. Deliberately NOT a migration: this app's migrations can run against the shared
// production database, and Main must stay the only owner of these tables. Runs in
// setUpTraits(), i.e. before DatabaseTransactions opens the per-test transaction, so the DDL's
// implicit commit can never leak test rows.
trait ProvisionsMainRbacTables
{
    // Creates the mirror tables (if missing) before the per-test transaction starts.
    protected function setUpTraits()
    {
        $this->ensureMainRbacTables();
        return parent::setUpTraits();
    }

    // Creates Main's access_groups / user_access_groups shape in the test database when absent.
    private function ensureMainRbacTables(): void
    {
        if (!Schema::hasTable('access_groups')) {
            Schema::create('access_groups', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100)->unique();
                $table->string('description', 255)->nullable();
                $table->boolean('is_active')->default(true);
                $table->boolean('is_system')->default(false);
                $table->timestamps();
            });
        }
        if (!Schema::hasTable('user_access_groups')) {
            Schema::create('user_access_groups', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
                $table->foreignId('access_group_id')->constrained('access_groups')->restrictOnDelete();
                $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }
        // The model caches "do the RBAC tables exist" per process — reset it now that they do.
        \Closure::bind(fn () => User::$rbacTablesPresent = null, null, User::class)();
    }

    // Gives the user an explicit access group: Main's built-in Administrator group, or a plain one.
    protected function assignAccessGroup(User $user, bool $administrator): void
    {
        $name = $administrator ? 'Administrator' : 'Member';
        $groupId = DB::table('access_groups')->where('name', $name)->value('id')
            ?? DB::table('access_groups')->insertGetId([
                'name' => $name, 'is_active' => true, 'is_system' => $administrator,
                'created_at' => now(), 'updated_at' => now(),
            ]);
        DB::table('user_access_groups')->insert([
            'user_id' => $user->id, 'access_group_id' => $groupId, 'created_at' => now(), 'updated_at' => now(),
        ]);
    }
}
