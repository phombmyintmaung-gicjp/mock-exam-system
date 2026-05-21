<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->text('text');
            $table->enum('difficulty', ['easy', 'medium', 'hard']);
            $table->string('category', 100)->index();
            $table->text('explanation');
            $table->softDeletes(); // Protects answer_records — never hard-delete
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
