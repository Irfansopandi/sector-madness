<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CartAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cart_access_is_blocked()
    {
        $response = $this->getJson('/api/cart');
        $response->assertStatus(401);
    }

    public function test_guest_checkout_summary_is_blocked()
    {
        $response = $this->getJson('/api/checkout/summary');
        $response->assertStatus(401);
    }

    public function test_user_can_access_own_cart()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user, 'sanctum')->getJson('/api/cart');
        $response->assertStatus(200);
    }

    public function test_user_cannot_access_other_users_cart()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $cartB = Cart::create(['user_id' => $userB->id]);

        $response = $this->actingAs($userA, 'sanctum')->getJson('/api/cart');
        $response->assertStatus(200);
        $this->assertNotEquals($cartB->id, $response->json('data.cart_id'));
    }

    public function test_user_cannot_modify_other_users_cart()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $cartB = Cart::create(['user_id' => $userB->id]);
        $product = Product::create(['name' => 'Test', 'slug' => 'test-1', 'description' => 'desc', 'price' => 100, 'stock' => 10]);

        $cartItemB = CartItem::create([
            'cart_id' => $cartB->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => $product->price
        ]);

        $response = $this->actingAs($userA, 'sanctum')->putJson("/api/cart/{$cartItemB->id}", [
            'quantity' => 5
        ]);

        $response->assertStatus(404);
        $this->assertEquals(1, $cartItemB->fresh()->quantity);
    }

    public function test_user_cannot_delete_other_users_cart()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $cartB = Cart::create(['user_id' => $userB->id]);
        $product = Product::create(['name' => 'Test', 'slug' => 'test-2', 'description' => 'desc', 'price' => 100, 'stock' => 10]);

        $cartItemB = CartItem::create([
            'cart_id' => $cartB->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => $product->price
        ]);

        $response = $this->actingAs($userA, 'sanctum')->deleteJson("/api/cart/{$cartItemB->id}");
        $response->assertStatus(200); // Because it deletes matching cart_id and item_id. Since cart_id doesn't match UserA's cart, nothing is deleted.

        $this->assertDatabaseHas('cart_items', ['id' => $cartItemB->id]);
    }

    public function test_checkout_only_uses_authenticated_users_cart()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $cartB = Cart::create(['user_id' => $userB->id]);
        $productB = Product::create(['name' => 'Test', 'slug' => 'test-3', 'description' => 'desc', 'stock' => 10, 'price' => 100]);
        CartItem::create([
            'cart_id' => $cartB->id,
            'product_id' => $productB->id,
            'quantity' => 1,
            'price' => $productB->price
        ]);

        $response = $this->actingAs($userA, 'sanctum')->getJson('/api/checkout/summary');
        
        $response->assertStatus(200);
        $this->assertEquals(0, $response->json('data.items_count'));
    }

    public function test_voucher_only_applies_to_authenticated_users_cart()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $cartB = Cart::create(['user_id' => $userB->id]);
        $productB = Product::create(['name' => 'Test', 'slug' => 'test-4', 'description' => 'desc', 'stock' => 10, 'price' => 500000]);
        CartItem::create([
            'cart_id' => $cartB->id,
            'product_id' => $productB->id,
            'quantity' => 1,
            'price' => $productB->price
        ]);

        $voucher = Voucher::create([
            'code' => 'DISC50',
            'name' => 'Discount 50k',
            'discount_type' => 'fixed',
            'discount_value' => 50000,
            'minimum_purchase' => 100000,
            'is_active' => true,
        ]);

        $response = $this->actingAs($userA, 'sanctum')->postJson('/api/voucher/check', [
            'code' => 'DISC50'
        ]);

        $response->assertStatus(422);
    }
}
