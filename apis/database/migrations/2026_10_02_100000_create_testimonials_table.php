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
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('client_name', 120);
            $table->string('client_role', 150)->nullable()->comment('e.g. Student at Univ of Leeds / Parent');
            $table->string('avatar', 255)->nullable()->comment('Image path or remote URL');
            $table->unsignedTinyInteger('rating')->default(5)->comment('Star rating 1 to 5');
            $table->text('review');
            $table->string('destination_country', 100)->nullable()->comment('e.g. United Kingdom, USA, Germany, India');
            $table->string('course_program', 150)->nullable()->comment('e.g. M.Sc Data Science, MBBS, B.Tech');
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('display_order')->default(0)->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
