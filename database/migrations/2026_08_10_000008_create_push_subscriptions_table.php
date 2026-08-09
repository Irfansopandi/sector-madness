<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('admin_id')->nullable()->constrained('admins')->onDelete('cascade');
            $table->string('endpoint', 500)->unique();
            $table->string('public_key', 255)->nullable();
            $table->string('auth_token', 255)->nullable();
            $table->timestamps();
        });

        // Enforce the invariant at database level
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE push_subscriptions ADD CONSTRAINT check_user_or_admin CHECK (
                (user_id IS NOT NULL AND admin_id IS NULL) OR 
                (admin_id IS NOT NULL AND user_id IS NULL)
            )');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
