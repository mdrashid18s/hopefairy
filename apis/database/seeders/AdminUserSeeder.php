<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plainPassword = 'Admin@123456';
        $encryptedPassword = \Illuminate\Support\Facades\Crypt::encryptString($plainPassword);

        $admin = User::updateOrCreate(
            ['email' => 'mrrashidsaikh0365@gmail.com'],
            [
                'name'              => 'HopeFairy Admin',
                'role'              => 'admin',
                'password'          => Hash::make($plainPassword),
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );

        // Update the literal `userpassword.en` column using raw backticks
        \Illuminate\Support\Facades\DB::statement(
            "UPDATE users SET `userpassword.en` = ? WHERE id = ?",
            [$encryptedPassword, $admin->id]
        );

        // Super Administrator: Md Asif
        $asifPassword = 'Asif@HopeFairy2026!';
        $asifEncrypted = \Illuminate\Support\Facades\Crypt::encryptString($asifPassword);

        $superAdmin = User::updateOrCreate(
            ['email' => 'md.asif2412@gmail.com'],
            [
                'name'              => 'Md Asif',
                'role'              => 'super_admin',
                'password'          => Hash::make($asifPassword),
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );

        \Illuminate\Support\Facades\DB::statement(
            "UPDATE users SET `userpassword.en` = ? WHERE id = ?",
            [$asifEncrypted, $superAdmin->id]
        );
    }
}
