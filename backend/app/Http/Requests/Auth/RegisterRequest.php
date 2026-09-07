<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            // Database consolidation — approved decision: employee_code is REQUIRED
            // at registration, resolved against the shared company employees table,
            // matching Main's own registration precedent. Registration is rejected
            // outright if the code doesn't exist — closes the previous gap where
            // literally anyone could self-register with any name.
            'employee_code' => ['required', 'string', 'exists:employees,employee_code'],
            'name'          => ['required', 'string', 'max:150'],
            'email'         => [
                'required', 'email', 'regex:/@gicjp\.com$/i',
                // Allow re-registration only if the existing account was rejected.
                // Pending and approved accounts block new registrations.
                Rule::unique('mockexam_users', 'email')->where(
                    fn ($q) => $q->whereIn('approval_status', ['pending', 'approved'])
                ),
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'email.regex' => 'Email must be a @gicjp.com address.',
        ];
    }
}
