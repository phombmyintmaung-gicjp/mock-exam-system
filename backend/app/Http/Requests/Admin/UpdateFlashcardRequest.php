<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFlashcardRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'type'                => ['sometimes', 'in:kanji,vocab,grammar'],
            'level'               => ['sometimes', 'in:N1,N2,N3,N4,N5'],
            'front'               => ['sometimes', 'string', 'max:100'],
            'reading'             => ['nullable', 'string', 'max:200'],
            'meaning'             => ['sometimes', 'string', 'max:500'],
            'example_sentence'    => ['nullable', 'string'],
            'example_translation' => ['nullable', 'string'],
        ];
    }
}
