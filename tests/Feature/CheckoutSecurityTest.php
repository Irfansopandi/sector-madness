<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Cart;
use App\Models\CartItem;

class CheckoutSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create user and setup cart
        $this->user = User::create([
            'name' => 'Test Customer',
            'email' => 'customer' . rand(1, 9999) . '@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->product = Product::create([
            'name' => 'Test Product',
            'slug' => 'test-product',
            'price' => 100000,
            'description' => 'A great product',
        ]);

        \App\Models\ProductVariant::create([
            'product_id' => $this->product->id,
            'color' => 'Default',
            'size' => 'M',
            'stock' => 100
        ]);

        $cart = Cart::create(['user_id' => $this->user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'price' => $this->product->price,
            'color' => 'Default',
            'size' => 'M'
        ]);
    }

    private function getBasePayload()
    {
        return [
            'receiver_name' => 'John Doe',
            'phone_number' => '081234567890',
            'street_address' => 'Jl. Test 123',
            'district' => 'Karawang Barat',
            'city' => 'Karawang',
            'province' => 'Jawa Barat',
            'postal_code' => '41361', // local delivery fallback matches Karawang origin
            'courier_code' => 'JNE',
            'service_code' => 'REG',
            'shipping_price' => 10000,
            'payment_method' => 'qris',
        ];
    }

    public function test_shipping_price_manipulation_zero()
    {
        $payload = $this->getBasePayload();
        $payload['shipping_price'] = 0; // attacker tries to get free shipping

        $token = $this->user->createToken('test_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/payment/create', $payload);

        // Karawang -> Karawang via JNE REG using fallback is 10000.
        // Product is 100000. 100000 + 10000 = 110000
        $response->assertStatus(201);
        
        $responseData = $response->json();
        // Since we mock midtrans via DB or just assert order creation
        // We will assert the order was created with total amount 110000, not 100000.
        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'total_amount' => 110000
        ]);
        
        $this->assertDatabaseHas('order_shipments', [
            'shipping_cost' => 10000
        ]);
    }

    public function test_shipping_price_manipulation_negative()
    {
        $payload = $this->getBasePayload();
        // We need to bypass the validation 'min:0' for this test to show the core logic overrides it anyway, 
        // but since validation blocks it first, it's safe at the outer layer.
        // However, if validation is removed, our logic still protects it. 
        $payload['shipping_price'] = -500000; 

        $token = $this->user->createToken('test_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/payment/create', $payload);

        // Fails at validation phase due to 'min:0'
        $response->assertStatus(422);
    }

    public function test_shipping_price_manipulation_small_value()
    {
        $payload = $this->getBasePayload();
        $payload['shipping_price'] = 1; // Passed min:0 validation but backend must recalculate

        $token = $this->user->createToken('test_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/payment/create', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'total_amount' => 110000 // recalculated correctly
        ]);
    }

    public function test_invalid_courier_service()
    {
        $payload = $this->getBasePayload();
        $payload['shipping_price'] = 10000;
        $payload['courier_code'] = 'HACKER'; // Invalid courier
        $payload['service_code'] = 'FREE'; 

        $token = $this->user->createToken('test_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/payment/create', $payload);

        $response->assertStatus(422);
        $this->assertEquals('Invalid or unavailable shipping service selected. Please refresh the shipping options.', $response->json('message'));
    }
}
