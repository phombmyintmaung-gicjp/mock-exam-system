<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table) {
            // Stores the sub-section question_type values used to filter questions
            // (e.g. ["問題4","問題5"] for Vocab). Null means full-section practice.
            $table->json('question_type_filter')->nullable()->after('mode');
        });
    }

    public function down(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table) {
            $table->dropColumn('question_type_filter');
        });
    }
};
