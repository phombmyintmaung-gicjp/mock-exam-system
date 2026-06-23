<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomSetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                => ['required', 'string', 'max:200'],
            'description'         => ['nullable', 'string', 'max:1000'],
            'time_limit_seconds'  => ['sometimes', 'integer', 'min:0'],
            'passing_score'       => ['sometimes', 'integer', 'min:1', 'max:100'],
            'is_active'           => ['sometimes', 'boolean'],
        ];
    }
}
