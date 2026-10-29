<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Copy any data from userpassword_en to `userpassword.en` if needed
        if (Schema::hasColumn('users', 'userpassword_en')) {
            DB::statement("UPDATE users SET `userpassword.en` = userpassword_en WHERE `userpassword.en` IS NULL AND userpassword_en IS NOT NULL");

            // Drop duplicate column userpassword_en
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('userpassword_en');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('users', 'userpassword_en')) {
            Schema::table('users', function (Blueprint $table) {
                $table->text('userpassword_en')->nullable()->after('is_active');
            });
            DB::statement("UPDATE users SET userpassword_en = `userpassword.en` WHERE `userpassword.en` IS NOT NULL");
        }
    }
};
