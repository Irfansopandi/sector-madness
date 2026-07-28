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
        Schema::create('shipping_addresses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('label', 50)->default('Rumah'); // Rumah, Kantor, Apartemen, Lainnya
            $table->string('receiver_name');
            $table->string('phone_number', 30);
            $table->string('province');
            $table->string('city');
            $table->string('district');
            $table->string('postal_code', 20);
            $table->text('street_address');
            $table->text('address_notes')->nullable();
            $table->string('area_id')->nullable(); // Biteship Area ID (contoh: IDNPJ001)
            $table->boolean('is_default')->default(false);
            $table->timestamps();
        });

        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->enum('discount_type', ['fixed', 'percentage'])->default('fixed');
            $table->decimal('discount_value', 12, 2)->default(0);
            $table->decimal('minimum_purchase', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_addresses');
        Schema::dropIfExists('vouchers');
    }
};
