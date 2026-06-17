<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePassageRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'string', 'max:255'],
            'content'     => ['sometimes', 'string'],
            'level'       => ['sometimes', 'in:N1,N2,N3,N4,N5'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
        ];
    }
}
