<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('collection')->default('The Origin Collection');
            $table->string('collection_code')->default('SECTOR 001');
            $table->string('tagline')->nullable();
            $table->text('description');
            $table->string('material')->nullable();
            $table->string('weight')->nullable();
            $table->decimal('price', 15, 2)->default(0);
            $table->string('image')->nullable();
            $table->json('gallery')->nullable();
            $table->json('colors')->nullable();
            $table->json('sizes')->nullable();
            $table->json('details')->nullable();
            $table->text('story')->nullable();
            $table->boolean('limited')->default(false);
            $table->integer('stock')->default(100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
    }
};
