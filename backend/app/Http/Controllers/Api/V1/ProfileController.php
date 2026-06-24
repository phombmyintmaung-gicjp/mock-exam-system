<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        return response()->json(['data' => $user]);
    }

    public function update(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $validated = $request->validate([
            'name'                 => ['sometimes', 'string', 'max:150'],
            'target_certification' => ['sometimes', 'nullable', 'string', 'max:200'],
        ]);

        $user->update($validated);

        return response()->json(['data' => $user->fresh()]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if (! Hash::check($request->input('current_password'), $user->password)) {
            return response()->json(['error' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => $request->input('password')]);

        return response()->json(['data' => ['message' => 'Password updated successfully.']]);
    }
}
