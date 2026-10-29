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
        if (Schema::hasTable('inquiries') && !Schema::hasColumn('inquiries', 'type')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->string('type', 50)->default('inquiry')->after('id')->index();
            });

            // Backfill existing queries based on interest or message or null fields
            DB::statement("UPDATE inquiries SET type = 'query' WHERE interest LIKE '%Homepage%' OR interest LIKE '%query%' OR (city IS NULL AND course IS NULL AND qualification IS NULL AND message IS NOT NULL)");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('inquiries') && Schema::hasColumn('inquiries', 'type')) {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->dropIndex(['type']);
                $table->dropColumn('type');
            });
        }
    }
};
