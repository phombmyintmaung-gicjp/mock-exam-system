<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
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
        // Never expose the legacy users.role column (dropped by Main; hidden so a database that
        // still has it can't leak it) — admin-ness is the server-computed `is_admin` below.
        'role',
    ];

    /**
     * Computed attributes added to serialization.
     *
     * @var list<string>
     */
    protected $appends = ['is_admin'];

    // Per-instance cache of isAdmin() — resolved at most once per request per user object.
    private ?bool $resolvedIsAdmin = null;

    // Per-process cache of whether Main's RBAC tables exist in this database.
    private static ?bool $rbacTablesPresent = null;

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
        // No role claim: this app issues no JWTs (it verifies Main's identity-only shared JWT),
        // and authorization is always resolved server-side from the database.
        return [];
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

    // True when the user is an Administrator in Main's RBAC (feature 30): their explicit access
    // group is Main's built-in Administrator group (`access_groups.is_system`). An explicit
    // non-Administrator group, or no explicit group at all, means "not admin" (Main dropped users.role).
    public function isAdmin(): bool
    {
        if ($this->resolvedIsAdmin !== null) {
            return $this->resolvedIsAdmin;
        }

        $explicitIsSystem = self::rbacTablesPresent()
            ? DB::table('user_access_groups')
                ->join('access_groups', 'access_groups.id', '=', 'user_access_groups.access_group_id')
                ->where('user_access_groups.user_id', $this->getKey())
                ->value('access_groups.is_system')
            : null;

        // No explicit assignment (or no RBAC tables) → not an Administrator; users.role is gone.
        return $this->resolvedIsAdmin = (bool) $explicitIsSystem;
    }

    // Serializes isAdmin() as `is_admin` (used by the frontend for routing / menus only).
    public function getIsAdminAttribute(): bool
    {
        return $this->isAdmin();
    }

    // True when Main's RBAC tables exist here (guards a deploy that lands before Main's RBAC
    // migrations, or a test database that lacks them — then nobody is an Administrator).
    private static function rbacTablesPresent(): bool
    {
        return self::$rbacTablesPresent ??= Schema::hasTable('user_access_groups') && Schema::hasTable('access_groups');
    }

    public function __toString(): string
    {
        return "{$this->name} ({$this->email})";
    }
}
