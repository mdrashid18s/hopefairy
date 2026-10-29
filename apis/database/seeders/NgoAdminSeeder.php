<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class NgoAdminSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insertOrIgnore([
            'name'       => 'NGO Super Admin',
            'email'      => 'admin@radiantfoundation.org',
            'password'   => Hash::make('Admin@2024#NGO'),
            'role'       => 'super_admin',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
