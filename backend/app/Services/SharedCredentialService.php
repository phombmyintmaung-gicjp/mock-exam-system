<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Auth unification (2026-09): Mock Exam's own equivalent of discussion-topic-system's
// SharedCredentialService. Deliberately NOT shared code across submodules/repositories —
// each app keeps an independent implementation of the same resolve/verify/update rules,
// since a cross-repo dependency between two separate git submodules would be worse than
// a small amount of duplication. Resolves a Mock Exam account's authoritative credential
// from the shared Main `users` table (keyed by employee_code) whenever the account is
// linked to a real employee who already has a shared account; falls back to this app's
// own local `mockexam_users.password` for legacy/orphan accounts (employee_id NULL) and
// for linked accounts whose employee has no shared Main account yet — never auto-created
// here (see AuthService::login()).
class SharedCredentialService
{
    // Returns the shared Main `users` row for this Mock account's linked employee, if any.
    public static function resolveSharedRow(User $user): ?object
    {
        $employeeCode = $user->employee?->employee_code;

        return $employeeCode ? DB::table('users')->where('employee_code', $employeeCode)->first() : null;
    }

    // Verifies a plaintext password against the shared Main password when available, else the local one.
    public static function verifyPassword(User $user, string $plainPassword): bool
    {
        $shared = self::resolveSharedRow($user);

        return $shared
            ? Hash::check($plainPassword, $shared->password)
            : Hash::check($plainPassword, $user->password);
    }

    // Writes a new password to the shared row authoritatively (if linked) and keeps the local column in sync transitionally.
    public static function updatePassword(User $user, string $newPlainPassword): bool
    {
        $newHash      = Hash::make($newPlainPassword);
        $employeeCode = $user->employee?->employee_code;

        $sharedUpdated = $employeeCode
            ? DB::table('users')->where('employee_code', $employeeCode)->update(['password' => $newHash, 'updated_at' => now()]) > 0
            : false;

        $user->password = $newHash;
        $user->save();

        return $sharedUpdated;
    }
}
