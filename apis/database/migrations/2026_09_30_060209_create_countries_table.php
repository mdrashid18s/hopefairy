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
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('country_code', 10)->unique();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->string('flag', 10)->nullable();
            $table->string('currency', 20)->default('USD ($)');
            $table->string('tagline', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('avg_tuition', 100)->nullable();
            $table->string('cost_of_living', 100)->nullable();
            $table->string('post_study_work', 150)->nullable();
            $table->json('intakes')->nullable();
            $table->json('courses')->nullable();
            $table->json('highlights')->nullable();
            $table->unsignedInteger('universities_count')->default(0);
            $table->boolean('is_active')->default(true)->comment('Whether services are active in this country');
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
