<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Admin;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_admin_api()
    {
        $response = $this->getJson('/api/admin/products');
        $response->assertStatus(401);
    }

    public function test_customer_cannot_access_admin_api()
    {
        $customer = User::create([
            'name' => 'Test Customer',
            'email' => 'customer' . rand(1, 9999) . '@example.com',
            'password' => bcrypt('password'),
        ]);
        $token = $customer->createToken('customer_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/admin/products');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_api()
    {
        $admin = Admin::create([
            'name' => 'Test Admin',
            'email' => 'admin' . rand(1, 9999) . '@example.com',
            'password' => bcrypt('password'),
        ]);
        $token = $admin->createToken('admin_token', ['admin'])->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/admin/products');

        $response->assertStatus(200);
    }
}
