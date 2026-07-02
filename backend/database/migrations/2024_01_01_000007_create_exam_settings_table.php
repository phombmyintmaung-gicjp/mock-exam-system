<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Creates the exam_settings table for per-category time limits and passing scores.
    public function up(): void
    {
        Schema::create('exam_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category', 100)->unique();
            $table->integer('time_limit_seconds')->default(3600);
            $table->smallInteger('passing_score')->default(70);
            $table->smallInteger('question_count')->default(20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_settings');
    }
};
