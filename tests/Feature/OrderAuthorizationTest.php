<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Order;

class OrderAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->userA = User::create([
            'name' => 'User A',
            'email' => 'usera@example.com',
            'password' => bcrypt('password')
        ]);

        $this->userB = User::create([
            'name' => 'User B',
            'email' => 'userb@example.com',
            'password' => bcrypt('password')
        ]);

        // Order A belongs to User A
        $this->orderA = Order::create([
            'user_id' => $this->userA->id,
            'order_number' => 'ORD-A-123',
            'total_amount' => 150000,
            'status' => 'pending'
        ]);

        // Order B belongs to User B
        $this->orderB = Order::create([
            'user_id' => $this->userB->id,
            'order_number' => 'ORD-B-456',
            'total_amount' => 250000,
            'status' => 'pending'
        ]);
    }

    public function test_guest_cannot_cancel_order()
    {
        $response = $this->postJson("/api/orders/{$this->orderA->order_number}/cancel");

        $response->assertStatus(401);
        
        // Assert database not changed
        $this->assertDatabaseHas('orders', [
            'id' => $this->orderA->id,
            'status' => 'pending'
        ]);
    }

    public function test_guest_cannot_confirm_received_order()
    {
        $response = $this->postJson("/api/orders/{$this->orderB->order_number}/confirm-received");

        $response->assertStatus(401);
        
        // Assert database not changed
        $this->assertDatabaseHas('orders', [
            'id' => $this->orderB->id,
            'status' => 'pending'
        ]);
    }

    public function test_user_a_cannot_cancel_user_b_order()
    {
        // Login as User A
        $this->actingAs($this->userA);

        $response = $this->postJson("/api/orders/{$this->orderB->order_number}/cancel");

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Unauthorized access to this order']);
        
        // Assert Order B is NOT changed
        $this->assertDatabaseHas('orders', [
            'id' => $this->orderB->id,
            'status' => 'pending'
        ]);
    }

    public function test_user_a_cannot_confirm_user_b_order()
    {
        // Login as User A
        $this->actingAs($this->userA);

        $response = $this->postJson("/api/orders/{$this->orderB->order_number}/confirm-received");

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Unauthorized access to this order']);
        
        // Assert Order B is NOT changed
        $this->assertDatabaseHas('orders', [
            'id' => $this->orderB->id,
            'status' => 'pending'
        ]);
    }

    public function test_user_a_can_cancel_own_order()
    {
        $this->actingAs($this->userA);

        $response = $this->postJson("/api/orders/{$this->orderA->order_number}/cancel");

        $response->assertStatus(200);
        
        // Assert database changed
        $this->assertDatabaseHas('orders', [
            'id' => $this->orderA->id,
            'status' => 'cancelled' // Or whatever the valid status transition is
        ]);
    }

    public function test_user_b_can_confirm_own_order()
    {
        $this->actingAs($this->userB);

        $response = $this->postJson("/api/orders/{$this->orderB->order_number}/confirm-received");

        $response->assertStatus(200);
        
        // Assert database changed
        $this->assertDatabaseHas('orders', [
            'id' => $this->orderB->id,
            'status' => 'completed'
        ]);
    }

    public function test_invalid_order_number_returns_404()
    {
        $this->actingAs($this->userA);

        $response = $this->postJson("/api/orders/INVALID-ORDER/cancel");

        $response->assertStatus(404);
    }

    public function test_client_cannot_manipulate_ownership_with_body_parameter()
    {
        // Attacker logs in as User A
        $this->actingAs($this->userA);

        // Attacker tries to pass user_id = User B ID via body
        $payload = [
            'user_id' => $this->userB->id
        ];

        $response = $this->postJson("/api/orders/{$this->orderB->order_number}/cancel", $payload);

        $response->assertStatus(403);
        
        // Assert Order B is NOT changed
        $this->assertDatabaseHas('orders', [
            'id' => $this->orderB->id,
            'status' => 'pending'
        ]);
    }
}
