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
        // 1. Add is_active and encrypted password columns to users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('password');
            }
            if (!Schema::hasColumn('users', 'userpassword_en')) {
                $table->text('userpassword_en')->nullable()->after('is_active');
            }
        });

        // Add literal `userpassword.en` column if not present via raw SQL for exact dot-column compatibility
        $hasDotCol = DB::select("SHOW COLUMNS FROM users LIKE 'userpassword.en'");
        if (empty($hasDotCol)) {
            DB::statement("ALTER TABLE users ADD `userpassword.en` TEXT NULL AFTER `userpassword_en`");
        }

        // 2. Add is_active to inquiries table if missing
        if (Schema::hasTable('inquiries') && !Schema::hasColumn('inquiries', 'is_active')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->after('lead_status');
            });
        }

        // 3. Add is_active to site_settings table if missing
        if (Schema::hasTable('site_settings') && !Schema::hasColumn('site_settings', 'is_active')) {
            Schema::table('site_settings', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->after('group_name');
            });
        }

        // 4. Create country_courses table with foreign key relationship to countries table
        if (!Schema::hasTable('country_courses')) {
            Schema::create('country_courses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('country_id')
                      ->constrained('countries')
                      ->onDelete('cascade');
                $table->string('course_name', 255);
                $table->string('degree_level', 100)->nullable(); // e.g., Bachelor, Master, PhD, Diploma
                $table->string('duration', 100)->nullable();     // e.g., '1-2 Years', '3-4 Years'
                $table->string('avg_fee', 150)->nullable();      // e.g., '£15,000 - £25,000 / year'
                $table->string('intakes', 255)->nullable();      // e.g., 'Sep, Jan, May'
                $table->text('requirements')->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->unsignedInteger('display_order')->default(0);
                $table->timestamps();

                $table->index(['country_id', 'is_active']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('country_courses');

        if (Schema::hasTable('site_settings') && Schema::hasColumn('site_settings', 'is_active')) {
            Schema::table('site_settings', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }

        if (Schema::hasTable('inquiries') && Schema::hasColumn('inquiries', 'is_active')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }

        if (Schema::hasTable('users')) {
            $hasDotCol = DB::select("SHOW COLUMNS FROM users LIKE 'userpassword.en'");
            if (!empty($hasDotCol)) {
                DB::statement("ALTER TABLE users DROP COLUMN `userpassword.en`");
            }

            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'userpassword_en')) {
                    $table->dropColumn('userpassword_en');
                }
                if (Schema::hasColumn('users', 'is_active')) {
                    $table->dropColumn('is_active');
                }
            });
        }
    }
};
