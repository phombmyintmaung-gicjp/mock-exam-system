<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Creates the exam_sessions table; linked_session_id supports study/exam session pairing.
    public function up(): void
    {
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('category', 100)->index();
            $table->integer('time_limit_seconds')->default(3600);
            $table->enum('mode', ['exam', 'study'])->default('exam');
            $table->json('question_type_filter')->nullable();
            $table->boolean('is_submitted')->default(false);
            $table->enum('submitted_by', ['manual', 'timeout', 'violation'])->default('manual');
            $table->json('violation_log')->nullable();
            $table->unsignedBigInteger('linked_session_id')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('linked_session_id')->references('id')->on('exam_sessions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_sessions');
    }
};
