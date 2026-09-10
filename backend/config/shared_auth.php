<?php

// One-Login shared authentication foundation (2026-09, Phase 5 of the auth-unification
// effort). This is a NEW, additive config surface — it does not touch this app's own
// JWT_SECRET or mockexam_users.password. `secret` must be set to the EXACT SAME value as
// exam-history-management's own JWT_SECRET (backend/.env there) once an operator wires
// this up for real — until SHARED_JWT_SECRET is set here, the shared-JWT verification path
// in App\Services\SharedJwtVerifier always fails closed (returns null) and every request
// continues to authenticate exactly as it does today, via this app's own tymon/jwt-auth
// `api` guard (its own, different, JWT_SECRET). See SharedJwtVerifier's own docblock for
// why this is a hand-rolled HS256 check rather than reusing tymon's own facade.
return [
    'secret'      => env('SHARED_JWT_SECRET'),
    'cookie_name' => env('SHARED_JWT_COOKIE_NAME', 'jwt_token'),
];
