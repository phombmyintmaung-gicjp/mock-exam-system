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
            'name'     => ['required', 'string', 'max:150'],
            'email'    => [
                'required', 'email', 'regex:/@gicjp\.com$/i',
                // Allow re-registration only if the existing account was rejected.
                // Pending and approved accounts block new registrations.
                Rule::unique('users', 'email')->where(
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
