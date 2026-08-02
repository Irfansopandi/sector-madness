<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('size_guides', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->string('category_code')->default('01');
            $table->string('fit_description')->nullable();
            $table->text('description')->nullable();
            $table->json('columns'); // JSON array of header column names
            $table->json('rows');    // JSON array of measurement row objects
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('size_guides');
    }
};
