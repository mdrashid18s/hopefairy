<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('services') && !Schema::hasColumn('services', 'image')) {
            Schema::table('services', function (Blueprint $table) {
                $table->string('image', 500)->nullable()->after('icon');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('services') && Schema::hasColumn('services', 'image')) {
            Schema::table('services', function (Blueprint $table) {
                $table->dropColumn('image');
            });
        }
    }
};
