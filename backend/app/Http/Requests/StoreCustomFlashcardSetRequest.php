<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomFlashcardSetRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:100'],
            'type'      => ['required', 'in:kanji,vocab,grammar'],
            'levels'    => ['required', 'array', 'min:1'],
            'levels.*'  => ['in:N1,N2,N3,N4,N5'],
        ];
    }
}
