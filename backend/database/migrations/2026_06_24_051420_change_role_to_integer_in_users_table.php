<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // 1 = admin, 2 = employee

    public function up(): void
    {
        // Step 1: relax to VARCHAR so MySQL accepts the intermediate string values
        DB::statement("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'employee'");
        // Step 2: convert existing string values to integers stored as strings
        DB::statement("UPDATE users SET role = CASE WHEN role = 'admin' THEN '1' WHEN role = 'employee' THEN '2' ELSE '2' END");
        // Step 3: tighten to TINYINT UNSIGNED
        DB::statement("ALTER TABLE users MODIFY COLUMN role TINYINT UNSIGNED NOT NULL DEFAULT 2");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'employee'");
        DB::statement("UPDATE users SET role = CASE WHEN role = '1' THEN 'admin' WHEN role = '2' THEN 'employee' ELSE 'employee' END");
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','employee') NOT NULL DEFAULT 'employee'");
    }
};
