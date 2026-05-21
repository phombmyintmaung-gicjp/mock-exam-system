<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'ITS第1事業部'],
            ['name' => 'ITS第2事業部'],
            ['name' => '管理部'],
        ];

        foreach ($departments as $dept) {
            DB::table('departments')->insertOrIgnore([
                'name'       => $dept['name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
