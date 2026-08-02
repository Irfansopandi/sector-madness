<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_settings', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('channel'); // channel | warehouse
            $table->string('code')->nullable();        // 01, 02, 03, 04
            $table->string('title');                   // EMAIL INQUIRIES, DIRECT MESSAGING, etc.
            $table->string('subtitle')->nullable();    // GENERAL & ORDER SUPPORT, etc.
            $table->text('value');                     // info@sectormadness.com, +62..., address text
            $table->string('link')->nullable();        // mailto:..., https://wa.me/..., etc.
            $table->string('note')->nullable();        // Response protocol..., etc.
            $table->decimal('latitude', 10, 7)->nullable();  // -6.3533
            $table->decimal('longitude', 10, 7)->nullable(); // 107.2831
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_settings');
    }
};
