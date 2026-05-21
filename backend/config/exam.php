<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Exam System Configuration
    |--------------------------------------------------------------------------
    |
    | These values configure the behaviour of exam sessions. All settings can
    | be overridden via environment variables — add them to your .env file.
    |
    */

    /**
     * The minimum percentage score (0-100) required to pass an exam.
     */
    'passing_score' => (int) env('EXAM_PASSING_SCORE', 70),

    /**
     * Default number of questions served per exam session.
     */
    'default_question_count' => (int) env('EXAM_DEFAULT_QUESTION_COUNT', 20),

    /**
     * Default time limit in seconds for exam sessions.
     * 0 means no time limit (study mode equivalent).
     */
    'default_time_limit' => (int) env('EXAM_DEFAULT_TIME_LIMIT', 3600),

    /**
     * Available exam categories. Used for validation and UI display.
     * Populate this list to match the categories stored in the questions table.
     *
     * Example:
     *   EXAM_CATEGORIES="AWS Solutions Architect,AWS Developer,Google Cloud Professional"
     */
    'available_categories' => array_filter(
        explode(',', env('EXAM_CATEGORIES', '')),
        fn (string $c) => $c !== ''
    ),

];
