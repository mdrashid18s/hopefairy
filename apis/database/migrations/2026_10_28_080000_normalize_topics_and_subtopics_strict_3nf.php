<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Enforces strict 3NF normalization:
     * - `topics` table only stores `subject_id` (course_id is derived via subject -> course_id).
     * - `subtopics` table only stores `topic_id` (subject_id and course_id are derived via topic -> subject -> course_id).
     */
    public function up(): void
    {
        // 1. Normalize topics table: drop course_id
        if (Schema::hasTable('topics')) {
            Schema::table('topics', function (Blueprint $table) {
                if (Schema::hasColumn('topics', 'course_id')) {
                    // Drop foreign key and compound index first
                    try {
                        $table->dropForeign('topics_course_id_foreign');
                    } catch (\Throwable $e) {}

                    try {
                        $table->dropIndex('topics_course_id_subject_id_name_index');
                    } catch (\Throwable $e) {}

                    $table->dropColumn('course_id');
                }
            });

            // Add index on (subject_id, name)
            Schema::table('topics', function (Blueprint $table) {
                try {
                    $table->index(['subject_id', 'name'], 'topics_subject_id_name_index');
                } catch (\Throwable $e) {}
            });
        }

        // 2. Normalize subtopics table: drop course_id and subject_id
        if (Schema::hasTable('subtopics')) {
            Schema::table('subtopics', function (Blueprint $table) {
                // Drop course_id
                if (Schema::hasColumn('subtopics', 'course_id')) {
                    try {
                        $table->dropForeign('subtopics_course_id_foreign');
                    } catch (\Throwable $e) {}

                    try {
                        $table->dropIndex('subtopics_course_id_subject_id_topic_id_index');
                    } catch (\Throwable $e) {}

                    $table->dropColumn('course_id');
                }

                // Drop subject_id
                if (Schema::hasColumn('subtopics', 'subject_id')) {
                    try {
                        $table->dropForeign('subtopics_subject_id_foreign');
                    } catch (\Throwable $e) {}

                    try {
                        $table->dropIndex('subtopics_subject_id_foreign');
                    } catch (\Throwable $e) {}

                    $table->dropColumn('subject_id');
                }
            });

            // Add index on (topic_id, name)
            Schema::table('subtopics', function (Blueprint $table) {
                try {
                    $table->index(['topic_id', 'name'], 'subtopics_topic_id_name_index');
                } catch (\Throwable $e) {}
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('topics') && !Schema::hasColumn('topics', 'course_id')) {
            Schema::table('topics', function (Blueprint $table) {
                $table->unsignedBigInteger('course_id')->nullable()->after('id');
                $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
            });
        }

        if (Schema::hasTable('subtopics')) {
            Schema::table('subtopics', function (Blueprint $table) {
                if (!Schema::hasColumn('subtopics', 'course_id')) {
                    $table->unsignedBigInteger('course_id')->nullable()->after('id');
                    $table->foreign('course_id')->references('id')->on('courses')->onDelete('cascade');
                }
                if (!Schema::hasColumn('subtopics', 'subject_id')) {
                    $table->unsignedBigInteger('subject_id')->nullable()->after('course_id');
                    $table->foreign('subject_id')->references('id')->on('subjects')->onDelete('cascade');
                }
            });
        }
    }
};
