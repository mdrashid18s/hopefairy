<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 1. Re-link inquiries.destination_id foreign key from redundant 'destinations' table to master 'countries' table.
     * 2. Drop redundant duplicate 'destinations' table (consolidating all study abroad destinations into 'countries').
     * 3. Drop unnormalized static JSON 'courses' column from 'countries' table (courses are 100% normalized in 'country_courses' child table via foreign key country_id).
     */
    public function up(): void
    {
        // 1. Drop old foreign key on inquiries pointing to destinations
        if (Schema::hasTable('inquiries')) {
            Schema::table('inquiries', function (Blueprint $table) {
                // Drop foreign key if exists
                try {
                    $table->dropForeign('fk_inquiries_destination');
                } catch (\Throwable $e) {
                    // Ignore if not present
                }
            });

            // Re-point destination_id in inquiries to countries table
            Schema::table('inquiries', function (Blueprint $table) {
                $table->foreign('destination_id', 'fk_inquiries_country')
                    ->references('id')
                    ->on('countries')
                    ->onDelete('set null')
                    ->onUpdate('cascade');
            });
        }

        // 2. Drop redundant duplicate 'destinations' table
        Schema::dropIfExists('destinations');

        // 3. Drop redundant static JSON 'courses' column from countries table
        if (Schema::hasColumn('countries', 'courses')) {
            Schema::table('countries', function (Blueprint $table) {
                $table->dropColumn('courses');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('countries', 'courses')) {
            Schema::table('countries', function (Blueprint $table) {
                $table->json('courses')->nullable()->after('intakes');
            });
        }

        if (!Schema::hasTable('destinations')) {
            Schema::create('destinations', function (Blueprint $table) {
                $table->id();
                $table->string('slug', 100)->unique();
                $table->string('name', 100);
                $table->string('code', 10);
                $table->string('flag', 10)->nullable();
                $table->string('tagline', 255)->nullable();
                $table->json('intakes')->nullable();
                $table->json('courses')->nullable();
                $table->json('highlights')->nullable();
                $table->boolean('is_active')->default(true);
                $table->unsignedInteger('display_order')->default(0);
                $table->timestamps();
            });
        }

        Schema::table('inquiries', function (Blueprint $table) {
            try {
                $table->dropForeign('fk_inquiries_country');
            } catch (\Throwable $e) {}
            $table->foreign('destination_id', 'fk_inquiries_destination')
                ->references('id')
                ->on('destinations')
                ->onDelete('set null')
                ->onUpdate('cascade');
        });
    }
};
