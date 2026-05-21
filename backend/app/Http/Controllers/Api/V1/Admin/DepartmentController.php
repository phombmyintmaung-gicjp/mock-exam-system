<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/departments",
     *     tags={"Admin — Departments"},
     *     summary="List all departments",
     *     operationId="adminListDepartments",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of departments",
     *         @OA\JsonContent(@OA\Property(property="data", type="array", @OA\Items(type="object")))
     *     ),
     *     @OA\Response(response=403, description="Forbidden — admin only")
     * )
     */
    public function index(): JsonResponse
    {
        $departments = Department::orderBy('name')->get(['id', 'name']);

        return response()->json(['data' => $departments]);
    }
}
