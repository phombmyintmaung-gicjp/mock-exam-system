<?php

// Used as phpunit.xml's `bootstrap` entry point instead of vendor/autoload.php directly.
//
// This app (mock-exam-system) had NO test infrastructure at all before this task (no
// phpunit.xml, no tests/ directory) — this file is built fresh, mirroring the identical
// fix already proven for exam-history-management and discussion-topic-system this same
// auth-unification effort. The container's real DB_DATABASE (company_system_db, the
// shared production database) is set by docker-compose.yml and lands in $_SERVER at PHP
// startup — PHPUnit's own <env force="true"> only updates getenv()/$_ENV, NOT $_SERVER,
// and Laravel's env() helper reads $_SERVER first, so force="true" alone does NOT
// redirect tests away from the real database. Overwrite all three layers here,
// unconditionally, before anything else loads.
//
// Points at `dts_testing` — the same pre-existing, already-verified-safe consolidated
// scratch database discussion-topic-system's tests already use: a full copy of all
// three apps' schemas (including this app's own `mockexam_users`/`categories`/
// `exam_sessions`/etc. tables, confirmed schema-identical to production and empty of
// real data), on the same MySQL server. Deliberately reused rather than building a new
// database from scratch, because this app's own migration history is NOT fully
// replayable against a truly empty database — 2026_09_07_120000_rename_users_to_
// mockexam_users_and_link_employee.php's up() requires the shared `employees` table to
// already exist (->constrained('employees')), which a fresh empty DB would not have.
// `dts_testing` already has the fully-consolidated post-migration schema, sidestepping
// that gap entirely — see tests/TestCase.php for why RefreshDatabase is deliberately
// NOT used against this shared database (its mockexam_migrations tracking table is
// empty even though the schema itself is fully present, which would make
// RefreshDatabase attempt to re-run all migrations against already-existing tables).
$overrides = [
    'APP_ENV'          => 'testing',
    'BCRYPT_ROUNDS'    => '4',
    'CACHE_DRIVER'     => 'array',
    'DB_CONNECTION'    => 'mysql',
    'DB_DATABASE'      => 'dts_testing',
    'MAIL_MAILER'      => 'array',
    'QUEUE_CONNECTION' => 'sync',
    'SESSION_DRIVER'   => 'array',
    // One-Login shared authentication foundation (Phase 5): a testing-only dummy secret
    // (same literal value as discussion-topic-system's own test bootstrap, so both suites
    // model the same shared-secret contract) so SharedJwtVerifier has something to
    // actually verify against in this suite. NOT a real secret, NOT used anywhere outside
    // this isolated test run, and NEVER set in any real .env by this change.
    'SHARED_JWT_SECRET' => 'testing-only-shared-jwt-secret-do-not-use-in-production',
];

foreach ($overrides as $name => $value) {
    putenv("{$name}={$value}");
    $_ENV[$name] = $value;
    $_SERVER[$name] = $value;
}

if (getenv('DB_DATABASE') !== 'dts_testing' || ($_SERVER['DB_DATABASE'] ?? null) !== 'dts_testing') {
    fwrite(STDERR, "FATAL: test environment override failed to take effect — refusing to boot to avoid running tests against the real database.\n");
    exit(1);
}

require __DIR__ . '/../vendor/autoload.php';
