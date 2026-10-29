<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 30)->unique()->comment('DN-YYYYMMDD-XXXXXX');
            $table->unsignedInteger('amount')->comment('INR whole rupees');
            $table->enum('designation', ['general', 'education', 'health', 'livelihoods', 'environment'])
                  ->default('general')->index();
            $table->string('name', 100);
            $table->string('email', 150)->index();
            $table->string('phone', 20);
            $table->boolean('wants_80g')->default(false)->index();
            $table->string('pan_masked', 20)->nullable()->comment('Last 4 chars only — full PAN never stored');
            $table->text('address')->nullable();
            $table->boolean('is_indian_citizen')->default(true);
            $table->boolean('consent_updates')->default(false);
            $table->enum('status', ['pledge', 'confirmed', 'receipt_sent', 'cancelled'])
                  ->default('pledge')->index();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('receipt_sent_at')->nullable();
            $table->timestamps();

            // Composite indexes for dashboard queries
            $table->index(['status', 'created_at']);
            $table->index(['designation', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
