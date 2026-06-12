<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePassageRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'   => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'level'   => ['required', 'in:N1,N2,N3,N4,N5'],
        ];
    }
}
