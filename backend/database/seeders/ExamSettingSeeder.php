<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExamSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // General categories
            ['category' => 'AWS',      'time_limit_seconds' => 3600, 'passing_score' => 70, 'question_count' => 20],
            ['category' => 'Network',  'time_limit_seconds' => 3600, 'passing_score' => 70, 'question_count' => 20],
            ['category' => 'Security', 'time_limit_seconds' => 3600, 'passing_score' => 70, 'question_count' => 20],
            ['category' => 'Linux',    'time_limit_seconds' => 3600, 'passing_score' => 70, 'question_count' => 20],

            // JLPT N1 — 2 sections per level
            ['category' => 'JLPT-N1-文字語彙', 'time_limit_seconds' => 1800, 'passing_score' => 60, 'question_count' => 34],
            ['category' => 'JLPT-N1-文法読解', 'time_limit_seconds' => 2400, 'passing_score' => 60, 'question_count' => 31],

            // JLPT N2
            ['category' => 'JLPT-N2-文字語彙', 'time_limit_seconds' => 1800, 'passing_score' => 60, 'question_count' => 34],
            ['category' => 'JLPT-N2-文法読解', 'time_limit_seconds' => 2400, 'passing_score' => 60, 'question_count' => 31],

            // JLPT N3
            ['category' => 'JLPT-N3-文字語彙', 'time_limit_seconds' => 1500, 'passing_score' => 60, 'question_count' => 34],
            ['category' => 'JLPT-N3-文法読解', 'time_limit_seconds' => 2100, 'passing_score' => 60, 'question_count' => 31],

            // JLPT N4
            ['category' => 'JLPT-N4-文字語彙', 'time_limit_seconds' => 1200, 'passing_score' => 60, 'question_count' => 34],
            ['category' => 'JLPT-N4-文法読解', 'time_limit_seconds' => 1800, 'passing_score' => 60, 'question_count' => 31],

            // JLPT N5
            ['category' => 'JLPT-N5-文字語彙', 'time_limit_seconds' => 900,  'passing_score' => 60, 'question_count' => 34],
            ['category' => 'JLPT-N5-文法読解', 'time_limit_seconds' => 1500, 'passing_score' => 60, 'question_count' => 31],
        ];

        foreach ($settings as $s) {
            DB::table('exam_settings')->updateOrInsert(
                ['category' => $s['category']],
                array_merge($s, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
