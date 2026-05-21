<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('category', 100)->index();
            $table->integer('time_limit_seconds')->default(3600); // 0 = no limit (study mode)
            $table->enum('mode', ['exam', 'study'])->default('exam');
            $table->timestamp('completed_at')->nullable();
            $table->boolean('is_submitted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_sessions');
    }
};
