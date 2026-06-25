<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_question_sets', function (Blueprint $table) {
            $table->string('slug', 100)->change();
        });
    }

    public function down(): void
    {
        Schema::table('custom_question_sets', function (Blueprint $table) {
            $table->string('slug', 16)->change();
        });
    }
};
