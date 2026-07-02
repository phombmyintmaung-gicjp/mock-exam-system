<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Creates the custom_answer_records table; question_id is nullable so deleted questions don't cascade.
    public function up(): void
    {
        Schema::create('custom_answer_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('result_id')->constrained('custom_exam_results')->cascadeOnDelete();
            $table->unsignedBigInteger('question_id')->nullable();
            $table->foreignId('selected_choice_id')->nullable()->constrained('choices')->nullOnDelete();
            $table->boolean('is_correct');

            $table->foreign('question_id')->references('id')->on('questions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_answer_records');
    }
};
