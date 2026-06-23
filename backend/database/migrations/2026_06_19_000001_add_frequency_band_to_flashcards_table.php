<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('flashcards', function (Blueprint $table) {
            // 1 = most frequent/common within this JLPT level, 5 = least frequent.
            $table->tinyInteger('frequency_band')->unsigned()->nullable()->after('example_translation');
        });
    }

    public function down(): void
    {
        Schema::table('flashcards', function (Blueprint $table) {
            $table->dropColumn('frequency_band');
        });
    }
};
