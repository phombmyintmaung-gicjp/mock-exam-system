<?php

namespace App\Services;

// One-Login shared authentication foundation (2026-09, Phase 5): verifies a JWT issued by
// exam-history-management's own tymon/jwt-auth (HS256) using the shared secret configured
// in config('shared_auth.secret'). Deliberately a small hand-rolled HS256 verifier rather
// than reusing this app's own tymon/jwt-auth facade — that facade is configured once, at
// boot, with THIS app's own distinct JWT_SECRET, and there is no clean way to ask it to
// verify a token signed with a different secret for just this one check. Deliberately NOT
// shared code across submodules/repositories — discussion-topic-system keeps its own
// independent copy of this exact same logic, same precedent as SharedCredentialService.
//
// This class only ever VERIFIES a token Main already issued — it never issues, signs, or
// mints a token itself, and never touches any password or credential.
class SharedJwtVerifier
{
    /**
     * Verifies a shared JWT's signature and expiry. Returns the decoded payload (including
     * the standard `sub` claim = Main's users.id) on success, or null if the token is
     * missing, malformed, unsigned with the configured secret, or expired/not-yet-valid.
     *
     * @return array<string, mixed>|null
     */
    public static function verify(?string $jwt): ?array
    {
        $secret = config('shared_auth.secret');

        if (!$secret || !$jwt) {
            return null;
        }

        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $header = json_decode(self::base64UrlDecode($encodedHeader), true);
        if (!is_array($header) || ($header['alg'] ?? null) !== 'HS256') {
            return null;
        }

        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true)
        );

        if (!hash_equals($expectedSignature, $encodedSignature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);
        if (!is_array($payload)) {
            return null;
        }

        $now = time();
        if (isset($payload['exp']) && $now >= (int) $payload['exp']) {
            return null; // expired
        }
        if (isset($payload['nbf']) && $now < (int) $payload['nbf']) {
            return null; // not yet valid
        }

        return $payload;
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
