<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

// One-off safety sanity check (auth-unification, 2026-09): asserts the resolved database
// connection is the isolated `dts_testing` scratch DB and explicitly NOT the real
// `company_system_db`, before trusting any other test in this suite. Deliberately does not
// use RefreshDatabase/DatabaseTransactions — this must not touch schema/data, only read
// config.
class DbIsolationSanityTest extends TestCase
{
    public function test_resolved_database_is_the_isolated_testing_db_not_production(): void
    {
        $resolved = DB::connection()->getDatabaseName();

        $this->assertSame('dts_testing', $resolved, 'Resolved DB must be dts_testing.');
        $this->assertNotSame('company_system_db', $resolved, 'Resolved DB must NEVER be the real production database.');
    }
}
