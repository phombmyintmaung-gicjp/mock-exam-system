<?php

namespace App\Http\Controllers;

/**
 * Base controller for all API controllers in this application.
 *
 * Keep this class thin — shared behavior (rate limiting, response helpers)
 * should be implemented as dedicated middleware or traits, not here.
 *
 * @OA\Info(
 *     title="Mock Exam System API",
 *     version="1.0.0",
 *     description="REST API for the Mock Exam System. All endpoints except POST /auth/login require a JWT Bearer token."
 * )
 *
 * @OA\Server(url="http://localhost:8000/api/v1", description="Local development")
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Obtain a token from POST /auth/login, then click Authorize and paste it here."
 * )
 */
abstract class Controller
{
    //
}
