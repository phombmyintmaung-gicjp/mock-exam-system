<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Creates the answer_records table; snapshots preserve question/choice text after soft-delete.
    public function up(): void
    {
        Schema::create('answer_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('result_id')->constrained('exam_results')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->restrictOnDelete();
            $table->foreignId('selected_choice_id')->nullable()->constrained('choices')->nullOnDelete();
            $table->boolean('is_correct');
            $table->smallInteger('time_taken_seconds')->nullable();
            $table->text('question_text_snapshot')->nullable();
            $table->string('selected_choice_text_snapshot', 500)->nullable();
            $table->string('correct_choice_text_snapshot', 500)->nullable();

            $table->unique(['result_id', 'question_id']);
            $table->index(['result_id', 'is_correct']);
            $table->index('question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('answer_records');
    }
};
