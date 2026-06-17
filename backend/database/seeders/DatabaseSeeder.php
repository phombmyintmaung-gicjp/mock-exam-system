<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DepartmentSeeder::class,
            UserSeeder::class,
            ExamSettingSeeder::class,
            QuestionSeeder::class,
            PassageSeeder::class,
            JLPTQuestionSeeder::class,
            ExamHistorySeeder::class,
            FlashcardSeeder::class,
        ]);
    }
}
