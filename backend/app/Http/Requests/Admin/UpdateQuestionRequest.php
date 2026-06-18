<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
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
            'text'                      => ['sometimes', 'string'],
            'category_id'               => ['sometimes', 'integer', 'exists:categories,id'],
            'question_type'             => ['sometimes', 'nullable', 'string', 'max:20'],
            'explanation'               => ['sometimes', 'string'],
            'choices'                   => ['sometimes', 'array', 'min:2', 'max:6'],
            'choices.*.text'            => ['required_with:choices', 'string', 'max:500'],
            'choices.*.is_correct'      => ['required_with:choices', 'boolean'],
            'choices.*.order'           => ['required_with:choices', 'integer', 'min:0'],
        ];
    }
}
