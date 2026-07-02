<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Creates the custom_exam_results table storing score and pass/fail for each submission.
    public function up(): void
    {
        Schema::create('custom_exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->unique()->constrained('custom_exam_sessions')->cascadeOnDelete();
            $table->foreignId('set_id')->constrained('custom_question_sets')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->smallInteger('score');
            $table->smallInteger('total_questions');
            $table->smallInteger('passing_score');
            $table->enum('status', ['pass', 'fail']);
            $table->timestamp('completed_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_exam_results');
    }
};
