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
            'difficulty'                => ['sometimes', 'in:easy,medium,hard'],
            'category'                  => ['sometimes', 'string', 'max:100'],
            'explanation'               => ['sometimes', 'string'],
            'choices'                   => ['sometimes', 'array', 'min:2', 'max:6'],
            'choices.*.text'            => ['required_with:choices', 'string', 'max:500'],
            'choices.*.is_correct'      => ['required_with:choices', 'boolean'],
            'choices.*.order'           => ['required_with:choices', 'integer', 'min:0'],
        ];
    }
}
