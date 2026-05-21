<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
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
            'text'                      => ['required', 'string'],
            'difficulty'                => ['required', 'in:easy,medium,hard'],
            'category'                  => ['required', 'string', 'max:100'],
            'explanation'               => ['required', 'string'],
            'choices'                   => ['required', 'array', 'min:2', 'max:6'],
            'choices.*.text'            => ['required', 'string', 'max:500'],
            'choices.*.is_correct'      => ['required', 'boolean'],
            'choices.*.order'           => ['required', 'integer', 'min:0'],
        ];
    }
}
