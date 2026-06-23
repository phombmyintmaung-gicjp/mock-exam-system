<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_answer_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('result_id')->constrained('custom_exam_results')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questions');
            $table->foreignId('selected_choice_id')->nullable()->constrained('choices')->nullOnDelete();
            $table->boolean('is_correct');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_answer_records');
    }
};
