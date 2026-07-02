<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Creates the pivot table linking questions to custom sets with display ordering.
    public function up(): void
    {
        Schema::create('custom_set_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('set_id')->constrained('custom_question_sets')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['set_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_set_questions');
    }
};
