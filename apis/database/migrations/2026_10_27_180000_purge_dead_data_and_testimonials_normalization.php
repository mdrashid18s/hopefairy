<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 1. Purge automated testing/bot dummy rows from inquiries table.
     * 2. Drop redundant 'destination_country' string column from testimonials,
     *    making the foreign key 'country_id' (linked to countries) the 100% pure relational source of truth.
     */
    public function up(): void
    {
        // 1. Purge automated testing bot rows from inquiries
        DB::table('inquiries')
            ->where('name', 'like', '%Bot%')
            ->orWhere('email', 'like', '%@hopefairy-test.com')
            ->orWhere('email', 'like', '%@hopefairy-verification.com')
            ->delete();

        // 2. Remove redundant destination_country string column from testimonials
        if (Schema::hasColumn('testimonials', 'destination_country')) {
            Schema::table('testimonials', function (Blueprint $table) {
                $table->dropColumn('destination_country');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('testimonials', 'destination_country')) {
            Schema::table('testimonials', function (Blueprint $table) {
                $table->string('destination_country', 100)->nullable()->after('review');
            });
        }
    }
};
