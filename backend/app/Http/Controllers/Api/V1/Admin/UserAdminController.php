<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

// One-Login migration (2026-09): retired entirely. mockexam_users — and with it, Mock's
// own independent "create/approve/reject/deactivate/delete a user" admin panel — no longer
// exists ("ALL USERS come from [Main's] USERS TABLE"). There is nothing left for this app
// to independently manage: a new employee's access is provisioned by creating/linking
// their account at the Main Staff Portal's own Admin Users page, and Mock picks up that
// identity automatically the moment they open it. The former approval_status/is_active
// workflow existed only because Mock used to self-register accounts pending admin review —
// now that accounts only exist because Main already created/approved them, that whole
// workflow is redundant and has been removed, not rehomed.
class UserAdminController extends Controller
{
    private function retired(): JsonResponse
    {
        return response()->json([
            'error' => 'User management has moved to the Main Staff Portal\'s Admin Users page.',
        ], 410);
    }

    public function index(): JsonResponse { return $this->retired(); }
    public function store(): JsonResponse { return $this->retired(); }
    public function show(int $id): JsonResponse { return $this->retired(); }
    public function update(int $id): JsonResponse { return $this->retired(); }
    public function destroy(int $id): JsonResponse { return $this->retired(); }
    public function approve(int $id): JsonResponse { return $this->retired(); }
    public function reject(int $id): JsonResponse { return $this->retired(); }
}
