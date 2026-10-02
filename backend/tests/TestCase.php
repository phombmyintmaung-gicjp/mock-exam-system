<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use Tests\Concerns\ProvisionsMainRbacTables;

abstract class TestCase extends BaseTestCase
{
    use ProvisionsMainRbacTables;

    // Creates the RBAC mirror tables (if missing) before the per-test transaction starts — after
    // first refusing to touch anything but the isolated test database (DDL must never reach the
    // shared real database, whatever PHPUnit's ordering).
    protected function setUpTraits()
    {
        $resolved = DB::connection()->getDatabaseName();
        $allowed = getenv('GITHUB_ACTIONS') === 'true' ? $resolved !== 'company_system_db' : $resolved === 'dts_testing';
        if (!$allowed) {
            throw new \RuntimeException("REFUSING TO RUN: resolved test database is '{$resolved}'.");
        }
        $this->ensureMainRbacTables();
        return parent::setUpTraits();
    }

    // Makes the user an Administrator the way Main does: an explicit Administrator-group row.
    protected function makeAdministrator(User $user): User
    {
        $this->assignAccessGroup($user, administrator: true);
        return $user;
    }
}
