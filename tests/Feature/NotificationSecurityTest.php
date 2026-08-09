<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Admin;
use App\Models\PushSubscription;
use Laravel\Sanctum\Sanctum;

class NotificationSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_subscribe_to_push()
    {
        $response = $this->postJson('/api/push/subscribe', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/fake_endpoint',
            'keys' => [
                'p256dh' => 'fakepublickey',
                'auth' => 'fakeauth',
            ]
        ]);

        $response->assertStatus(401);
    }

    public function test_user_can_subscribe_and_ownership_is_enforced()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user, ['*']);

        $response = $this->postJson('/api/push/subscribe', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/fake_endpoint_user',
            'keys' => [
                'p256dh' => 'fakepublickey',
                'auth' => 'fakeauth',
            ]
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $user->id,
            'admin_id' => null,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/fake_endpoint_user',
        ]);
    }

    public function test_admin_can_subscribe_and_ownership_is_enforced()
    {
        $admin = Admin::create([
            'name' => 'Admin User',
            'email' => 'admin_test@sectormadness.com',
            'password' => bcrypt('password'),
        ]);
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/push/subscribe', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/fake_endpoint_admin',
            'keys' => [
                'p256dh' => 'fakepublickey',
                'auth' => 'fakeauth',
            ]
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => null,
            'admin_id' => $admin->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/fake_endpoint_admin',
        ]);
    }

    public function test_database_invariant_prevents_both_user_and_admin_id()
    {
        if (\Illuminate\Support\Facades\DB::getDriverName() === 'sqlite') {
            $this->markTestSkipped('SQLite does not support ALTER TABLE CHECK constraints.');
        }

        $this->expectException(\Illuminate\Database\QueryException::class);

        // Attempting to violate the check constraint
        PushSubscription::create([
            'user_id' => 1,
            'admin_id' => 1,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/invalid',
            'public_key' => 'fake',
            'auth_token' => 'fake'
        ]);
    }
}
