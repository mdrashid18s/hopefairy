<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 1. Drops dead obsolete NGO tables (donations, enquiries).
     * 2. Drops redundant string columns (subject, topic, subtopic) from course_metadata and resources,
     *    making subjects, topics, and subtopics relational IDs the single source of truth.
     * 3. Adds normalized country_id foreign key to testimonials linking to master countries table.
     */
    public function up(): void
    {
        // 1. Drop dead obsolete tables
        Schema::dropIfExists('donations');
        Schema::dropIfExists('enquiries');

        // 2. Remove redundant denormalized string columns from course_metadata
        Schema::table('course_metadata', function (Blueprint $table) {
            $cols = ['subject', 'topic', 'subtopic'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('course_metadata', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        // 3. Remove redundant denormalized string columns from resources
        Schema::table('resources', function (Blueprint $table) {
            $cols = ['subject', 'topic', 'subtopic'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('resources', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        // 4. Add country_id foreign key to testimonials linking to countries table
        if (!Schema::hasColumn('testimonials', 'country_id')) {
            Schema::table('testimonials', function (Blueprint $table) {
                $table->foreignId('country_id')->nullable()->after('destination_country')->constrained('countries')->onDelete('set null');
            });
        }

        // Backfill testimonials country_id from destination_country
        $countries = DB::table('countries')->get();
        $testimonials = DB::table('testimonials')->get();

        foreach ($testimonials as $t) {
            $destName = strtolower(trim($t->destination_country ?? ''));
            if (!$destName) continue;

            $matchedCountry = $countries->first(function ($c) use ($destName) {
                $cName = strtolower(trim($c->name));
                $cCode = strtolower(trim($c->country_code));
                return $destName === $cName 
                    || $destName === $cCode 
                    || ($destName === 'usa' && ($cCode === 'us' || str_contains($cName, 'united states')))
                    || ($destName === 'uk' && ($cCode === 'gb' || str_contains($cName, 'united kingdom')));
            });

            if ($matchedCountry) {
                DB::table('testimonials')->where('id', $t->id)->update([
                    'country_id' => $matchedCountry->id,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropForeign(['country_id']);
            $table->dropColumn('country_id');
        });

        Schema::table('resources', function (Blueprint $table) {
            $table->string('subject', 150)->nullable();
            $table->string('topic', 150)->nullable();
            $table->string('subtopic', 190)->nullable();
        });

        Schema::table('course_metadata', function (Blueprint $table) {
            $table->string('subject', 150)->nullable();
            $table->string('topic', 150)->nullable();
            $table->string('subtopic', 190)->nullable();
        });
    }
};
