<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_answer_records', function (Blueprint $table) {
            $table->dropForeign(['question_id']);
            $table->unsignedBigInteger('question_id')->nullable()->change();
            $table->foreign('question_id')->references('id')->on('questions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('custom_answer_records', function (Blueprint $table) {
            $table->dropForeign(['question_id']);
            $table->unsignedBigInteger('question_id')->nullable(false)->change();
            $table->foreign('question_id')->references('id')->on('questions')->cascadeOnDelete();
        });
    }
};
