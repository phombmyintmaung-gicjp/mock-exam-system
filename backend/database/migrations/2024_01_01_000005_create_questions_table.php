<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Creates the questions table with soft deletes to preserve answer history.
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('passage_id')->nullable()->constrained()->nullOnDelete();
            $table->text('text');
            $table->string('category', 100)->index();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('question_type', 30)->nullable();
            $table->text('explanation');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
