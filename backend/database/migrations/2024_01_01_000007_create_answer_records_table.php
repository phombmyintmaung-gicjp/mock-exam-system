<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('answer_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('result_id')
                ->constrained('exam_results')
                ->cascadeOnDelete();
            $table->foreignId('question_id')
                ->constrained('questions');
            // selected_choice_id is nullable to represent unanswered questions.
            $table->foreignId('selected_choice_id')
                ->nullable()
                ->nullOnDelete()
                ->constrained('choices');
            // is_correct is pre-computed at submission time — never recalculate on read.
            $table->boolean('is_correct');
            $table->smallInteger('time_taken_seconds')->nullable();
            // No timestamps — immutable records written once at submission.

            $table->index(['result_id', 'is_correct']); // Supports weak-areas aggregation
            $table->index('question_id');                // Supports category joins
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('answer_records');
    }
};
