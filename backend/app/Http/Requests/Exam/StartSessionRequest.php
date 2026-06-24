<?php

namespace App\Http\Requests\Exam;

use Illuminate\Foundation\Http\FormRequest;

class StartSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'category'            => ['required', 'string', 'max:100'],
            'mode'                => ['required', 'in:exam,study'],
            'time_limit_seconds'  => ['sometimes', 'integer', 'min:0'],
            'question_count'      => ['sometimes', 'integer', 'min:1', 'max:500'],
            'question_types'      => ['sometimes', 'array'],
            'question_types.*'    => ['string', 'max:50'],
            'linked_session_id'   => ['sometimes', 'nullable', 'integer', 'exists:exam_sessions,id'],
        ];
    }
}
