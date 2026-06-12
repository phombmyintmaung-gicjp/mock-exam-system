<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExamHistorySeeder extends Seeder
{
    public function run(): void
    {
        $userId = DB::table('users')->where('email', 'moepyaesonewai@gicjp.com')->value('id');
        if (!$userId) {
            return;
        }

        $histories = [
            [
                'category'            => 'AWS',
                'mode'                => 'exam',
                'time_limit_seconds'  => 3600,
                'started_at'          => now()->subDays(14),
                'correct'             => 4,
                'total'               => 6,
                'passing_score'       => 70,
            ],
            [
                'category'            => 'AWS',
                'mode'                => 'study',
                'time_limit_seconds'  => 0,
                'started_at'          => now()->subDays(12),
                'correct'             => 5,
                'total'               => 6,
                'passing_score'       => 70,
            ],
            [
                'category'            => 'Network',
                'mode'                => 'exam',
                'time_limit_seconds'  => 3600,
                'started_at'          => now()->subDays(10),
                'correct'             => 3,
                'total'               => 5,
                'passing_score'       => 70,
            ],
            [
                'category'            => 'Security',
                'mode'                => 'exam',
                'time_limit_seconds'  => 3600,
                'started_at'          => now()->subDays(7),
                'correct'             => 5,
                'total'               => 5,
                'passing_score'       => 70,
            ],
            [
                'category'            => 'Linux',
                'mode'                => 'study',
                'time_limit_seconds'  => 0,
                'started_at'          => now()->subDays(5),
                'correct'             => 3,
                'total'               => 4,
                'passing_score'       => 70,
            ],
            [
                'category'            => 'JLPT-N5-文字語彙',
                'mode'                => 'study',
                'time_limit_seconds'  => 0,
                'started_at'          => now()->subDays(3),
                'correct'             => 20,
                'total'               => 34,
                'passing_score'       => 60,
            ],
            [
                'category'            => 'JLPT-N5-文法読解',
                'mode'                => 'exam',
                'time_limit_seconds'  => 1500,
                'started_at'          => now()->subDays(2),
                'correct'             => 15,
                'total'               => 31,
                'passing_score'       => 60,
            ],
            [
                'category'            => 'JLPT-N4-文字語彙',
                'mode'                => 'study',
                'time_limit_seconds'  => 0,
                'started_at'          => now()->subDays(1),
                'correct'             => 18,
                'total'               => 34,
                'passing_score'       => 60,
            ],
        ];

        foreach ($histories as $h) {
            $completedAt = (clone $h['started_at'])->addMinutes(rand(10, 40));
            $scorePercent = ($h['total'] > 0) ? ($h['correct'] / $h['total']) * 100 : 0;
            $status = $scorePercent >= $h['passing_score'] ? 'pass' : 'fail';

            $sessionId = DB::table('exam_sessions')->insertGetId([
                'user_id'            => $userId,
                'category'           => $h['category'],
                'time_limit_seconds' => $h['time_limit_seconds'],
                'mode'               => $h['mode'],
                'completed_at'       => $completedAt,
                'is_submitted'       => true,
                'created_at'         => $h['started_at'],
                'updated_at'         => $completedAt,
            ]);

            $resultId = DB::table('exam_results')->insertGetId([
                'session_id'      => $sessionId,
                'user_id'         => $userId,
                'score'           => $h['correct'],
                'total_questions' => $h['total'],
                'passing_score'   => $h['passing_score'],
                'status'          => $status,
                'completed_at'    => $completedAt,
                'created_at'      => $completedAt,
                'updated_at'      => $completedAt,
            ]);

            // Fetch real questions from this category
            $questions = DB::table('questions')
                ->where('category', $h['category'])
                ->whereNull('deleted_at')
                ->limit($h['total'])
                ->get();

            $correctCount = 0;
            foreach ($questions as $index => $q) {
                $correct = DB::table('choices')
                    ->where('question_id', $q->id)
                    ->where('is_correct', true)
                    ->first();

                $wrong = DB::table('choices')
                    ->where('question_id', $q->id)
                    ->where('is_correct', false)
                    ->first();

                $isCorrect = $correctCount < $h['correct'];
                $selected  = $isCorrect ? $correct : $wrong;
                $correctCount += $isCorrect ? 1 : 0;

                if (!$selected) {
                    continue;
                }

                DB::table('answer_records')->insert([
                    'result_id'          => $resultId,
                    'question_id'        => $q->id,
                    'selected_choice_id' => $selected->id,
                    'is_correct'         => $isCorrect,
                    'time_taken_seconds' => rand(15, 90),
                ]);
            }
        }
    }
}
