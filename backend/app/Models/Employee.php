<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Database consolidation: read-only reference to the company-wide shared
// `employees` table (Main-owned schema/migrations). Mock Exam only ever reads
// this table to resolve/validate an employee_code at registration — it must never
// create, update, or delete a row here. See CLAUDE.md "Database Consolidation".
class Employee extends Model
{
    protected $table = 'employees';

    protected $guarded = ['*']; // never mass-assignable from this app — read-only
}
