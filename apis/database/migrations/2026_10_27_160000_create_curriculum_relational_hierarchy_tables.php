<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Fully normalizes Curriculum Hierarchy into dedicated relational 3NF tables:
     * courses -> subjects -> topics -> subtopics, linked via Foreign Keys to course_metadata & resources.
     */
    public function up(): void
    {
        // 1. Master Subjects Table
        if (!Schema::hasTable('subjects')) {
            Schema::create('subjects', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
                $table->string('name', 150)->index();
                $table->string('slug', 180);
                $table->string('code', 50)->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedInteger('display_order')->default(0);
                $table->timestamps();

                $table->unique(['course_id', 'slug']);
                $table->index(['course_id', 'name']);
            });
        }

        // 2. Master Topics Table
        if (!Schema::hasTable('topics')) {
            Schema::create('topics', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
                $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
                $table->string('name', 180)->index();
                $table->string('slug', 200);
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedInteger('display_order')->default(0);
                $table->timestamps();

                $table->unique(['subject_id', 'slug']);
                $table->index(['course_id', 'subject_id', 'name']);
            });
        }

        // 3. Master Subtopics Table
        if (!Schema::hasTable('subtopics')) {
            Schema::create('subtopics', function (Blueprint $table) {
                $table->id();
                $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
                $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
                $table->foreignId('topic_id')->constrained('topics')->onDelete('cascade');
                $table->string('name', 255)->index();
                $table->string('slug', 255);
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true)->index();
                $table->unsignedInteger('display_order')->default(0);
                $table->timestamps();

                $table->unique(['topic_id', 'slug']);
                $table->index(['course_id', 'subject_id', 'topic_id']);
            });
        }

        // 4. Update course_metadata table to link directly via relational IDs
        Schema::table('course_metadata', function (Blueprint $table) {
            if (!Schema::hasColumn('course_metadata', 'subject_id')) {
                $table->foreignId('subject_id')->nullable()->after('course_id')->constrained('subjects')->onDelete('cascade');
            }
            if (!Schema::hasColumn('course_metadata', 'topic_id')) {
                $table->foreignId('topic_id')->nullable()->after('subject_id')->constrained('topics')->onDelete('cascade');
            }
            if (!Schema::hasColumn('course_metadata', 'subtopic_id')) {
                $table->foreignId('subtopic_id')->nullable()->after('topic_id')->constrained('subtopics')->onDelete('cascade');
            }
        });

        // 5. Update resources table to link directly via relational IDs
        Schema::table('resources', function (Blueprint $table) {
            if (!Schema::hasColumn('resources', 'subject_id')) {
                $table->foreignId('subject_id')->nullable()->after('course_metadata_id')->constrained('subjects')->onDelete('set null');
            }
            if (!Schema::hasColumn('resources', 'topic_id')) {
                $table->foreignId('topic_id')->nullable()->after('subject_id')->constrained('topics')->onDelete('set null');
            }
            if (!Schema::hasColumn('resources', 'subtopic_id')) {
                $table->foreignId('subtopic_id')->nullable()->after('topic_id')->constrained('subtopics')->onDelete('set null');
            }
        });

        // 6. Backfill existing data into subjects, topics, and subtopics tables
        $existing = DB::table('course_metadata')->get();
        foreach ($existing as $row) {
            $courseId = $row->course_id;
            $subjectName = trim($row->subject ?? '');
            $topicName = trim($row->topic ?? '');
            $subtopicName = trim($row->subtopic ?? '');

            if (!$subjectName) continue;

            // Subject
            $subjectSlug = Str::slug($subjectName);
            $subject = DB::table('subjects')
                ->where('course_id', $courseId)
                ->where('name', $subjectName)
                ->first();

            if (!$subject) {
                // Ensure slug unique for this course
                $cnt = DB::table('subjects')->where('course_id', $courseId)->where('slug', $subjectSlug)->count();
                $finalSlug = $cnt > 0 ? "{$subjectSlug}-" . ($cnt + 1) : $subjectSlug;
                $subjectId = DB::table('subjects')->insertGetId([
                    'course_id' => $courseId,
                    'name' => $subjectName,
                    'slug' => $finalSlug,
                    'is_active' => true,
                    'display_order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $subjectId = $subject->id;
            }

            // Topic
            $topicId = null;
            if ($topicName) {
                $topicSlug = Str::slug($topicName);
                $topic = DB::table('topics')
                    ->where('subject_id', $subjectId)
                    ->where('name', $topicName)
                    ->first();

                if (!$topic) {
                    $cnt = DB::table('topics')->where('subject_id', $subjectId)->where('slug', $topicSlug)->count();
                    $finalSlug = $cnt > 0 ? "{$topicSlug}-" . ($cnt + 1) : $topicSlug;
                    $topicId = DB::table('topics')->insertGetId([
                        'course_id' => $courseId,
                        'subject_id' => $subjectId,
                        'name' => $topicName,
                        'slug' => $finalSlug,
                        'is_active' => true,
                        'display_order' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    $topicId = $topic->id;
                }
            }

            // Subtopic
            $subtopicId = null;
            if ($topicId && $subtopicName) {
                $subtopicSlug = Str::slug($subtopicName);
                $subtopic = DB::table('subtopics')
                    ->where('topic_id', $topicId)
                    ->where('name', $subtopicName)
                    ->first();

                if (!$subtopic) {
                    $cnt = DB::table('subtopics')->where('topic_id', $topicId)->where('slug', $subtopicSlug)->count();
                    $finalSlug = $cnt > 0 ? "{$subtopicSlug}-" . ($cnt + 1) : $subtopicSlug;
                    $subtopicId = DB::table('subtopics')->insertGetId([
                        'course_id' => $courseId,
                        'subject_id' => $subjectId,
                        'topic_id' => $topicId,
                        'name' => $subtopicName,
                        'slug' => $finalSlug,
                        'is_active' => true,
                        'display_order' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    $subtopicId = $subtopic->id;
                }
            }

            // Update course_metadata row with relational IDs
            DB::table('course_metadata')->where('id', $row->id)->update([
                'subject_id' => $subjectId,
                'topic_id' => $topicId,
                'subtopic_id' => $subtopicId,
            ]);

            // Also update any matching resources
            DB::table('resources')->where('course_metadata_id', $row->id)->update([
                'subject_id' => $subjectId,
                'topic_id' => $topicId,
                'subtopic_id' => $subtopicId,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->dropForeign(['subtopic_id']);
            $table->dropForeign(['topic_id']);
            $table->dropForeign(['subject_id']);
            $table->dropColumn(['subtopic_id', 'topic_id', 'subject_id']);
        });

        Schema::table('course_metadata', function (Blueprint $table) {
            $table->dropForeign(['subtopic_id']);
            $table->dropForeign(['topic_id']);
            $table->dropForeign(['subject_id']);
            $table->dropColumn(['subtopic_id', 'topic_id', 'subject_id']);
        });

        Schema::dropIfExists('subtopics');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('subjects');
    }
};
