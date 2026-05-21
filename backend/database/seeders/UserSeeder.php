<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $its1Id = DB::table('departments')->where('name', 'ITS第1事業部')->value('id');

        $users = [
            [
                'name'                  => 'Moe Pyae Sone Wai',
                'email'                 => 'moepyaesonewai@gicjp.com',
                'password'              => Hash::make('moepyaesonewaigicjp'),
                'role'                  => 'employee',
                'department_id'         => $its1Id,
                'target_certification'  => null,
                'is_active'             => true,
            ],
            [
                'name'                  => 'Admin User',
                'email'                 => 'admin@gicjp.com',
                'password'              => Hash::make('admin1234'),
                'role'                  => 'admin',
                'department_id'         => null,
                'target_certification'  => null,
                'is_active'             => true,
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->insertOrIgnore(array_merge($user, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
