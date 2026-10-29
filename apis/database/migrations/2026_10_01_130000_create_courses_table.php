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
        // 1. Create the courses table with foreign key to india_admissions
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stream_id')->constrained('india_admissions')->onDelete('cascade');
            $table->string('course_name', 150);
            $table->enum('level', ['undergraduate', 'postgraduate'])->default('undergraduate');
            $table->string('entrance_exams', 255)->nullable();
            $table->string('duration', 100)->nullable();
            $table->string('eligibility', 255)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->index('stream_id');
            $table->index('level');
            $table->index('is_active');
            $table->index('display_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
