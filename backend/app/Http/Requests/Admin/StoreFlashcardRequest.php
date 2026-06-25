<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreFlashcardRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'type'                => ['required', 'in:kanji,vocab,grammar'],
            'level'               => ['required', 'in:N1,N2,N3,N4,N5'],
            'front'               => ['required', 'string', 'max:100'],
            'reading'             => ['nullable', 'string', 'max:200'],
            'meaning'             => ['required', 'string', 'max:500'],
            'meaning_my'          => ['nullable', 'string', 'max:500'],
            'example_sentence'    => ['nullable', 'string'],
            'example_translation' => ['nullable', 'string'],
        ];
    }
}
