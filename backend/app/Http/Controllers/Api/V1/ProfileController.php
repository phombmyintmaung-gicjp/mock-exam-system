<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        return response()->json(['data' => $user]);
    }

    /**
     * Retired (One-Login migration, 2026-09: "ALL USERS come from [Main's] USERS TABLE" —
     * name is fully controlled by Main). target_certification (the other field this used
     * to edit) has been retired along with mockexam_users — see SharedJwtAuth's own
     * comment for why. Edit your profile at the Main Staff Portal instead.
     */
    public function update(Request $request): JsonResponse
    {
        return response()->json(['error' => 'Profile editing has moved to the Main Staff Portal.'], 410);
    }

    /**
     * Retired (One-Login migration, 2026-09: "Auth Processes like ... Change Passwords are
     * fully controlled by Main"). Change your password at the Main Staff Portal instead.
     */
    public function changePassword(Request $request): JsonResponse
    {
        return response()->json(['error' => 'Password changes have moved to the Main Staff Portal.'], 410);
    }
}
