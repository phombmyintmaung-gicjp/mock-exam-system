<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

// Retired. Accounts live in Main's shared `users` table (One-Login migration) and their access in
// Main's access groups (RBAC, Main feature 30) — this app may only READ them, never seed them.
// Create accounts in Main instead. Kept as a no-op so DatabaseSeeder's call list still resolves.
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->warn('UserSeeder is retired: accounts are created in Main, not seeded here.');
    }
}
