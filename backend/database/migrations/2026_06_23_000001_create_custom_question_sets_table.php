<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_question_sets', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->string('slug', 16)->unique();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->integer('time_limit_seconds')->default(0); // 0 = no limit
            $table->smallInteger('passing_score')->default(70);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_question_sets');
    }
};
