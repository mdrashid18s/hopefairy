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
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            
            // Relational linkage to master courses and course metadata hierarchy
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('course_metadata_id')->nullable()->constrained('course_metadata')->onDelete('set null');
            
            // Hierarchical tags cached for ultra-fast query performance
            $table->string('subject', 150)->nullable()->index();
            $table->string('topic', 150)->nullable()->index();
            $table->string('subtopic', 190)->nullable();
            
            // Product Identity
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->string('short_description', 500)->nullable();
            $table->text('description')->nullable();
            $table->string('thumbnail', 255)->nullable(); // Book cover / material preview image
            
            // Files
            $table->string('pdf_file', 255); // Full study material PDF
            $table->string('preview_pdf', 255)->nullable(); // Sample / preview PDF
            $table->string('file_size', 50)->nullable();
            $table->unsignedInteger('page_count')->default(0);
            
            // Author & Category Meta
            $table->string('author_name', 150)->nullable();
            $table->string('material_type', 100)->default('Study Notes');
            $table->string('badge', 50)->nullable(); // Bestseller, Trending, New, Must Read
            
            // E-Commerce & Pricing Model
            $table->boolean('is_free')->default(false)->index();
            $table->decimal('actual_price', 10, 2)->default(0.00); // MRP
            $table->decimal('sell_price', 10, 2)->default(0.00); // Offer / Sale Price
            $table->unsignedInteger('discount_percent')->default(0); // Auto-calculated % OFF
            $table->string('currency', 10)->default('INR');
            
            // Product Stats
            $table->unsignedInteger('download_count')->default(0);
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->unsignedInteger('rating_count')->default(0);
            
            // Status & Priority
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('display_order')->default(0);
            
            $table->timestamps();

            // Composite performance indexes
            $table->index(['course_id', 'is_active']);
            $table->index(['is_free', 'is_active']);
            $table->index(['is_featured', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
