<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('answer_records', function (Blueprint $table) {
            // Snapshot of question/choice text at the moment of submission.
            // Ensures the review page always shows the text the user saw,
            // even if an admin later edits the question or its choices.
            $table->text('question_text_snapshot')->nullable()->after('time_taken_seconds');
            $table->string('selected_choice_text_snapshot', 500)->nullable()->after('question_text_snapshot');
            $table->string('correct_choice_text_snapshot', 500)->nullable()->after('selected_choice_text_snapshot');
        });
    }

    public function down(): void
    {
        Schema::table('answer_records', function (Blueprint $table) {
            $table->dropColumn([
                'question_text_snapshot',
                'selected_choice_text_snapshot',
                'correct_choice_text_snapshot',
            ]);
        });
    }
};
