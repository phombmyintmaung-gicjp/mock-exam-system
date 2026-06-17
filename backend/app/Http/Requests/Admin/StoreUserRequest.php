<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
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
            'email'                 => ['required', 'email', 'max:254', 'unique:users,email'],
            'name'                  => ['required', 'string', 'max:150'],
            'role'                  => ['required', 'in:admin,employee'],
            'target_certification'  => ['nullable', 'string', 'max:200'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'is_active'             => ['sometimes', 'boolean'],
        ];
    }
}
