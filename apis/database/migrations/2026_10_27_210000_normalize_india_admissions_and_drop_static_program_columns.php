<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Drops redundant, unnormalized static JSON columns (ug_programs, ug_exams, pg_programs, pg_exams)
     * from `india_admissions` because programs, exams, levels, durations and eligibility are already
     * relationally normalized in the dedicated `courses` child table with foreign key `stream_id`.
     */
    public function up(): void
    {
        if (Schema::hasTable('india_admissions')) {
            Schema::table('india_admissions', function (Blueprint $table) {
                $columnsToDrop = [];
                foreach (['ug_programs', 'ug_exams', 'pg_programs', 'pg_exams'] as $col) {
                    if (Schema::hasColumn('india_admissions', $col)) {
                        $columnsToDrop[] = $col;
                    }
                }
                if (!empty($columnsToDrop)) {
                    $table->dropColumn($columnsToDrop);
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('india_admissions')) {
            Schema::table('india_admissions', function (Blueprint $table) {
                if (!Schema::hasColumn('india_admissions', 'ug_programs')) {
                    $table->longText('ug_programs')->nullable()->after('text');
                }
                if (!Schema::hasColumn('india_admissions', 'ug_exams')) {
                    $table->longText('ug_exams')->nullable()->after('ug_programs');
                }
                if (!Schema::hasColumn('india_admissions', 'pg_programs')) {
                    $table->longText('pg_programs')->nullable()->after('ug_exams');
                }
                if (!Schema::hasColumn('india_admissions', 'pg_exams')) {
                    $table->longText('pg_exams')->nullable()->after('pg_programs');
                }
            });
        }
    }
};
