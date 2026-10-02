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
            // Database consolidation — approved decision: admin-created accounts
            // follow the same employee validation as self-registration.
            'employee_code'         => ['required', 'string', 'exists:employees,employee_code'],
            'email'                 => ['required', 'email', 'max:254', 'unique:mockexam_users,email'],
            'name'                  => ['required', 'string', 'max:150'],
            'target_certification'  => ['nullable', 'string', 'max:200'],
            'password'              => ['required', 'string', 'min:8'],
            'is_active'             => ['sometimes', 'boolean'],
        ];
    }
}
