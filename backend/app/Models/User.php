<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Tymon\JWTAuth\Contracts\JWTSubject;

// One-Login migration (2026-09): mockexam_users is retired entirely — this now reads the
// company-wide shared `users` table directly (Main-owned schema/migrations). Mock may only
// ever READ this table; it must never create, update, or delete a row here (name/email/
// password/role are all fully controlled by Main — see AuthController/ProfileController/
// UserAdminController, all retired to 410 in this app). Identity resolves via
// `employee_code` (this table's own natural key), not `employee_id` — the shared `users`
// table has no such column. The old approval_status/is_active/target_certification
// business fields have no equivalent here and are not replaced — see SharedJwtAuth's own
// comment for why that feature was retired rather than rehomed.
class User extends Authenticatable implements JWTSubject
{
    use HasFactory;

    protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'name',
        'role',
        'password',
        'employee_code',
        'session_token',
        'last_active_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'password' => 'hashed',
    ];

    // -------------------------------------------------------------------------
    // JWTSubject interface — unused now that this app's own local JWT issuance is
    // retired (see AuthController::login()), kept only because the class still
    // implements the interface; harmless to leave in place.
    // -------------------------------------------------------------------------

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /** @return array<string, mixed> */
    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->role,
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /** The shared company employee this account belongs to, if linked (joined by employee_code, not an id FK). */
    public function employee(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_code', 'employee_code');
    }

    public function examSessions(): HasMany
    {
        return $this->hasMany(ExamSession::class);
    }

    public function examResults(): HasMany
    {
        return $this->hasMany(ExamResult::class);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    // Main's own Admin convention treats a NULL role the same as 1 — see CLAUDE.md's User
    // model — mirrored here so an admin account isn't misread as a plain member.
    public function isAdmin(): bool
    {
        return $this->role === 1 || $this->role === null;
    }

    public function __toString(): string
    {
        return "{$this->name} ({$this->email})";
    }
}
