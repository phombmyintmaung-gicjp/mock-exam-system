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
            // Database consolidation — approved decision: lets an admin fix a
            // wrong/missing employee link after the fact; same validation as store().
            'employee_code'         => ['sometimes', 'string', 'exists:employees,employee_code'],
            'email'                 => ['sometimes', 'email', 'max:254', "unique:mockexam_users,email,{$userId}"],
            'name'                  => ['sometimes', 'string', 'max:150'],
            'role'                  => ['sometimes', 'integer', 'in:1,2'],
            'target_certification'  => ['nullable', 'string', 'max:200'],
            'password'              => ['sometimes', 'string', 'min:8'],
            'is_active'             => ['sometimes', 'boolean'],
        ];
    }
}
