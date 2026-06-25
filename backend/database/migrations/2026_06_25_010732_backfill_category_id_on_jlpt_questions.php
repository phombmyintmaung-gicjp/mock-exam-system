<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            UPDATE questions q
            JOIN categories c ON c.name = q.category
            SET q.category_id = c.id
            WHERE q.category_id IS NULL
        ');
    }

    public function down(): void
    {
        DB::statement("
            UPDATE questions
            SET category_id = NULL
            WHERE category LIKE 'JLPT%'
        ");
    }
};
