<?php

namespace Database\Seeders;

use App\Models\CustomQuestionSet;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomSetSeeder extends Seeder
{
    public function run(): void
    {
        // Use the first admin user as creator
        $admin = User::where('role', 'admin')->first();
        if (! $admin) {
            $this->command->warn('No admin user found — skipping CustomSetSeeder.');
            return;
        }

        $this->seedAwsSet($admin->id);
        $this->seedJlptN5Set($admin->id);
    }

    private function seedAwsSet(int $adminId): void
    {
        $slug = 'AWS00001';

        // Remove existing set with this slug so the seeder is idempotent
        $existing = CustomQuestionSet::where('slug', $slug)->first();
        if ($existing) {
            $existing->delete();
        }

        $set = CustomQuestionSet::create([
            'name'                => 'AWS Cloud Practitioner — Quick Check',
            'description'         => 'A 10-question warm-up covering core AWS services and concepts.',
            'slug'                => $slug,
            'created_by'          => $adminId,
            'time_limit_seconds'  => 600, // 10 minutes
            'passing_score'       => 70,
            'is_active'           => true,
        ]);

        $questions = Question::where('category', 'AWS')
            ->inRandomOrder()
            ->limit(10)
            ->get();

        foreach ($questions as $order => $question) {
            DB::table('custom_set_questions')->insert([
                'set_id'      => $set->id,
                'question_id' => $question->id,
                'sort_order'  => $order,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        $this->command->info("Created AWS custom set with {$questions->count()} questions (slug: {$slug}).");
    }

    private function seedJlptN5Set(int $adminId): void
    {
        $slug = 'JLPTN501';

        $existing = CustomQuestionSet::where('slug', $slug)->first();
        if ($existing) {
            $existing->delete();
        }

        $set = CustomQuestionSet::create([
            'name'                => 'JLPT N5 文字語彙 — Daily Drill',
            'description'         => 'A short 10-question drill on JLPT N5 vocabulary and kanji.',
            'slug'                => $slug,
            'created_by'          => $adminId,
            'time_limit_seconds'  => 600, // 10 minutes
            'passing_score'       => 60,
            'is_active'           => true,
        ]);

        $questions = Question::where('category', 'JLPT-N5-文字語彙')
            ->inRandomOrder()
            ->limit(10)
            ->get();

        foreach ($questions as $order => $question) {
            DB::table('custom_set_questions')->insert([
                'set_id'      => $set->id,
                'question_id' => $question->id,
                'sort_order'  => $order,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        $this->command->info("Created JLPT N5 custom set with {$questions->count()} questions (slug: {$slug}).");
    }
}
