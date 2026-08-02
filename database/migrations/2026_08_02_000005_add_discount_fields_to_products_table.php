<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('original_price', 15, 2)->nullable()->after('price');
            $table->integer('discount_percentage')->nullable()->after('original_price');
            $table->timestamp('discount_expires_at')->nullable()->after('discount_percentage');
            $table->boolean('is_flash_sale')->default(false)->after('discount_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['original_price', 'discount_percentage', 'discount_expires_at', 'is_flash_sale']);
        });
    }
};
