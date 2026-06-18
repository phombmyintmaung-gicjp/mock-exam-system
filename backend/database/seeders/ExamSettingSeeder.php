<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExamSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // IT categories
            ['category' => 'AWS',      'time_limit_seconds' => 3600, 'passing_score' => 70, 'question_count' => 20],
            ['category' => 'Network',  'time_limit_seconds' => 3600, 'passing_score' => 70, 'question_count' => 20],
            ['category' => 'Security', 'time_limit_seconds' => 3600, 'passing_score' => 70, 'question_count' => 20],
            ['category' => 'Linux',    'time_limit_seconds' => 3600, 'passing_score' => 70, 'question_count' => 20],

            // ── JLPT Full Exam Simulation ────────────────────────────────────────
            // N1/N2: combined paper (語彙＋文法＋読解) — official JLPT times
            ['category' => 'JLPT-N1-Full', 'time_limit_seconds' => 6600, 'passing_score' => 60, 'question_count' => 500],
            ['category' => 'JLPT-N2-Full', 'time_limit_seconds' => 6300, 'passing_score' => 60, 'question_count' => 500],

            // ── JLPT N1 sections (section practice / N1 reference times) ────────
            ['category' => 'JLPT-N1-文字語彙', 'time_limit_seconds' => 1800, 'passing_score' => 60, 'question_count' => 34],
            ['category' => 'JLPT-N1-文法読解', 'time_limit_seconds' => 2400, 'passing_score' => 60, 'question_count' => 31],

            // ── JLPT N2 sections ─────────────────────────────────────────────────
            ['category' => 'JLPT-N2-文字語彙', 'time_limit_seconds' => 1800, 'passing_score' => 60, 'question_count' => 34],
            ['category' => 'JLPT-N2-文法読解', 'time_limit_seconds' => 2400, 'passing_score' => 60, 'question_count' => 31],

            // ── JLPT N3 sections (separate papers — real exam times) ─────────────
            // Paper 1: 言語知識（語彙）30 min
            // Paper 2: 言語知識（文法）・読解 70 min
            ['category' => 'JLPT-N3-文字語彙', 'time_limit_seconds' => 1800, 'passing_score' => 60, 'question_count' => 34],
            ['category' => 'JLPT-N3-文法読解', 'time_limit_seconds' => 4200, 'passing_score' => 60, 'question_count' => 31],

            // ── JLPT N4 sections ─────────────────────────────────────────────────
            // Paper 1: 言語知識（語彙）25 min
            // Paper 2: 言語知識（文法）・読解 55 min
            ['category' => 'JLPT-N4-文字語彙', 'time_limit_seconds' => 1500, 'passing_score' => 60, 'question_count' => 34],
            ['category' => 'JLPT-N4-文法読解', 'time_limit_seconds' => 3300, 'passing_score' => 60, 'question_count' => 31],

            // ── JLPT N5 sections ─────────────────────────────────────────────────
            // Paper 1: 言語知識（語彙）20 min
            // Paper 2: 言語知識（文法）・読解 40 min
            ['category' => 'JLPT-N5-文字語彙', 'time_limit_seconds' => 1200, 'passing_score' => 60, 'question_count' => 34],
            ['category' => 'JLPT-N5-文法読解', 'time_limit_seconds' => 2400, 'passing_score' => 60, 'question_count' => 31],
        ];

        foreach ($settings as $s) {
            DB::table('exam_settings')->updateOrInsert(
                ['category' => $s['category']],
                array_merge($s, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
