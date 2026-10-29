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
        Schema::create('course_metadata', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('subject', 150)->index();
            $table->string('topic', 150)->index();
            $table->string('subtopic', 190);
            $table->string('pdf_file', 255)->nullable();
            $table->string('pdf_title', 190)->nullable();
            $table->string('file_size', 50)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            // Composite performance indexes for cascading filters
            $table->index(['course_id', 'subject']);
            $table->index(['course_id', 'subject', 'topic']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_metadata');
    }
};
