<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Remove legacy English-scheme rows that nothing references
        DB::table('exam_settings')
            ->whereIn('category', [
                'JLPT-N1-Kanji', 'JLPT-N1-Vocab', 'JLPT-N1-Grammar', 'JLPT-N1-Reading',
                'JLPT-N2-Kanji', 'JLPT-N2-Vocab', 'JLPT-N2-Grammar', 'JLPT-N2-Reading',
                'JLPT-N3-Kanji', 'JLPT-N3-Vocab', 'JLPT-N3-Grammar', 'JLPT-N3-Reading',
                'JLPT-N4-Kanji', 'JLPT-N4-Vocab', 'JLPT-N4-Grammar', 'JLPT-N4-Reading',
                'JLPT-N5-Kanji', 'JLPT-N5-Vocab', 'JLPT-N5-Grammar', 'JLPT-N5-Reading',
            ])
            ->delete();

        // 2. Ensure Full-exam virtual categories exist in categories table
        foreach (['JLPT-N1-Full', 'JLPT-N2-Full'] as $name) {
            DB::table('categories')->updateOrInsert(
                ['name' => $name],
                ['name' => $name, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 3. Add nullable FK column on exam_settings
        Schema::table('exam_settings', function (Blueprint $table) {
            $table->unsignedBigInteger('category_id')->nullable()->after('id');
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
        });

        // 4. Backfill category_id for all active rows
        DB::statement('
            UPDATE exam_settings es
            JOIN categories c ON c.name = es.category
            SET es.category_id = c.id
        ');
    }

    public function down(): void
    {
        Schema::table('exam_settings', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });

        // Re-insert the legacy rows so rollback restores the prior state
        $legacy = [
            ['JLPT-N1-Kanji', 1800, 60, 10], ['JLPT-N1-Vocab', 1800, 60, 10],
            ['JLPT-N1-Grammar', 1800, 60, 10], ['JLPT-N1-Reading', 2400, 60, 10],
            ['JLPT-N2-Kanji', 1800, 60, 10], ['JLPT-N2-Vocab', 1800, 60, 10],
            ['JLPT-N2-Grammar', 1800, 60, 10], ['JLPT-N2-Reading', 2400, 60, 10],
            ['JLPT-N3-Kanji', 1500, 60, 10], ['JLPT-N3-Vocab', 1500, 60, 10],
            ['JLPT-N3-Grammar', 1500, 60, 10], ['JLPT-N3-Reading', 2100, 60, 10],
            ['JLPT-N4-Kanji', 1200, 60, 10], ['JLPT-N4-Vocab', 1200, 60, 10],
            ['JLPT-N4-Grammar', 1200, 60, 10], ['JLPT-N4-Reading', 1800, 60, 10],
            ['JLPT-N5-Kanji', 900, 60, 10], ['JLPT-N5-Vocab', 900, 60, 10],
            ['JLPT-N5-Grammar', 900, 60, 10], ['JLPT-N5-Reading', 1500, 60, 10],
        ];

        foreach ($legacy as [$cat, $time, $pass, $count]) {
            DB::table('exam_settings')->insert([
                'category'           => $cat,
                'time_limit_seconds' => $time,
                'passing_score'      => $pass,
                'question_count'     => $count,
                'created_at'         => now(),
                'updated_at'         => now(),
            ]);
        }

        DB::table('categories')->whereIn('name', ['JLPT-N1-Full', 'JLPT-N2-Full'])->delete();
    }
};
