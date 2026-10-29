<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 1. Drop foreign key constraint from resources referencing course_metadata.
     * 2. Drop redundant pdf columns (pdf_file, pdf_title, file_size) from course_metadata table.
     * 3. Rename table 'course_metadata' to 'metadata'.
     * 4. Rename 'course_metadata_id' to 'metadata_id' in resources and re-link foreign key to 'metadata(id)'.
     */
    public function up(): void
    {
        // 1. Drop foreign key in resources
        Schema::table('resources', function (Blueprint $table) {
            $table->dropForeign(['course_metadata_id']);
        });

        // 2. Drop pdf columns from course_metadata (PDF attachments are strictly handled in resources table)
        Schema::table('course_metadata', function (Blueprint $table) {
            $cols = ['pdf_file', 'pdf_title', 'file_size'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('course_metadata', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        // 3. Rename table 'course_metadata' to 'metadata'
        Schema::rename('course_metadata', 'metadata');

        // 4. Rename column in resources and recreate foreign key pointing to metadata(id)
        Schema::table('resources', function (Blueprint $table) {
            $table->renameColumn('course_metadata_id', 'metadata_id');
        });

        Schema::table('resources', function (Blueprint $table) {
            $table->foreign('metadata_id')->references('id')->on('metadata')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->dropForeign(['metadata_id']);
        });

        Schema::table('resources', function (Blueprint $table) {
            $table->renameColumn('metadata_id', 'course_metadata_id');
        });

        Schema::rename('metadata', 'course_metadata');

        Schema::table('course_metadata', function (Blueprint $table) {
            $table->string('pdf_file', 255)->nullable()->after('subtopic_id');
            $table->string('pdf_title', 190)->nullable()->after('pdf_file');
            $table->string('file_size', 50)->nullable()->after('pdf_title');
        });

        Schema::table('resources', function (Blueprint $table) {
            $table->foreign('course_metadata_id')->references('id')->on('course_metadata')->onDelete('set null');
        });
    }
};
