<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'time_limit_seconds' => ['sometimes', 'integer', 'min:0'],
            'passing_score'      => ['sometimes', 'integer', 'min:0', 'max:100'],
            'question_count'     => ['sometimes', 'integer', 'min:1', 'max:200'],
        ];
    }
}
