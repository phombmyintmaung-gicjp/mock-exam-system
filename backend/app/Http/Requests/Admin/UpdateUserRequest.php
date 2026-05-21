<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
        $userId = $this->route('id');

        return [
            'email'                 => ['sometimes', 'email', 'max:254', "unique:users,email,{$userId}"],
            'name'                  => ['sometimes', 'string', 'max:150'],
            'role'                  => ['sometimes', 'in:admin,employee'],
            'department_id'         => ['nullable', 'integer', 'exists:departments,id'],
            'target_certification'  => ['nullable', 'string', 'max:200'],
            'password'              => ['sometimes', 'string', 'min:8', 'confirmed'],
            'is_active'             => ['sometimes', 'boolean'],
        ];
    }
}
