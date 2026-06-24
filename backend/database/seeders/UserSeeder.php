<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'                  => 'Moe Pyae Sone Wai',
                'email'                 => 'moepyaesonewai@gicjp.com',
                'password'              => Hash::make('moepyaesonewaigicjp'),
                'role'                  => 2,
                'target_certification'  => null,
                'is_active'             => true,
            ],
            [
                'name'                  => 'Admin User',
                'email'                 => 'admin@gicjp.com',
                'password'              => Hash::make('admin1234'),
                'role'                  => 1,
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
