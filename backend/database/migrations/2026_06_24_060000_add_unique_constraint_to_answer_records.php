<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('answer_records', function (Blueprint $table) {
            $table->unique(['result_id', 'question_id'], 'answer_records_result_question_unique');
        });
    }

    public function down(): void
    {
        Schema::table('answer_records', function (Blueprint $table) {
            $table->dropUnique('answer_records_result_question_unique');
        });
    }
};
