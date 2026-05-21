<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/users",
     *     tags={"Admin — Users"},
     *     summary="List all users",
     *     operationId="adminListUsers",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="role", in="query", required=false, @OA\Schema(type="string", enum={"admin","employee"})),
     *     @OA\Parameter(name="department_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="is_active", in="query", required=false, @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Paginated users",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="count", type="integer"),
     *             @OA\Property(property="next", type="string", nullable=true),
     *             @OA\Property(property="previous", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=403, description="Forbidden — admin only")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('department');

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $paginator = $query->orderBy('name')->paginate(perPage: 25);

        return response()->json([
            'data'     => $paginator->items(),
            'count'    => $paginator->total(),
            'next'     => $paginator->nextPageUrl(),
            'previous' => $paginator->previousPageUrl(),
        ]);
    }

    /**
     * @OA\Post(
     *     path="/admin/users",
     *     tags={"Admin — Users"},
     *     summary="Create a new user",
     *     operationId="adminStoreUser",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","role"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="role", type="string", enum={"admin","employee"}),
     *             @OA\Property(property="department_id", type="integer", nullable=true),
     *             @OA\Property(property="target_certification", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="User created",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return response()->json(['data' => $user->load('department')], 201);
    }

    /**
     * @OA\Get(
     *     path="/admin/users/{id}",
     *     tags={"Admin — Users"},
     *     summary="Get a user by ID",
     *     operationId="adminShowUser",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="User detail",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $user = User::with('department')->findOrFail($id);

        return response()->json(['data' => $user]);
    }

    /**
     * @OA\Put(
     *     path="/admin/users/{id}",
     *     tags={"Admin — Users"},
     *     summary="Update a user's profile",
     *     operationId="adminUpdateUser",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="role", type="string", enum={"admin","employee"}),
     *             @OA\Property(property="department_id", type="integer", nullable=true),
     *             @OA\Property(property="is_active", type="boolean"),
     *             @OA\Property(property="target_certification", type="string", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Updated user",
     *         @OA\JsonContent(@OA\Property(property="data", type="object"))
     *     ),
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update($request->validated());

        return response()->json(['data' => $user->load('department')]);
    }
}
