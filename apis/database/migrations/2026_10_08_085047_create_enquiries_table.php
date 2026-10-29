<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enquiries', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['general', 'volunteer', 'partner', 'csr'])->index();
            $table->string('name', 100);
            $table->string('email', 150)->index();
            $table->string('phone', 20)->nullable();
            $table->text('message');
            $table->enum('status', ['new', 'read', 'replied', 'archived'])
                  ->default('new')->index();
            $table->string('ip_address', 45)->nullable()->comment('Stored for spam/abuse tracking only');
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('replied_at')->nullable();
            $table->foreignId('replied_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Composite indexes for common admin queries
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enquiries');
    }
};
