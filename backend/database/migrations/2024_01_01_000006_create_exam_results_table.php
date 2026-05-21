<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')
                ->unique() // One result per session (one-to-one)
                ->constrained('exam_sessions')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            // user_id is intentionally denormalized here for analytics query performance.
            $table->smallInteger('score');
            $table->smallInteger('total_questions');
            $table->smallInteger('passing_score');
            $table->enum('status', ['pass', 'fail']);
            $table->timestamp('completed_at');
            $table->timestamps();

            $table->index(['user_id', 'completed_at']); // Supports score-trend queries
            $table->index(['user_id', 'status']);        // Supports category-stats queries
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_results');
    }
};
