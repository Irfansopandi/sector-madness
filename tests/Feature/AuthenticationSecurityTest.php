<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Clear cached routes if any, to make sure new middleware applies
        $this->artisan('route:clear');
    }

    /**
     * TEST 1 — Guest Profile Access
     */
    public function test_guest_profile_access_is_blocked()
    {
        $response = $this->putJson('/api/user/profile', [
            'name' => 'Hacked Name'
        ]);

        $response->assertStatus(401);
    }

    /**
     * TEST 2 — Fake X-Member-Email
     */
    public function test_fake_x_member_email_is_ignored_for_guests()
    {
        $userB = User::factory()->create([
            'email' => 'user-b@example.com',
            'name' => 'User B'
        ]);

        $response = $this->getJson('/api/user/profile-info', [
            'X-Member-Email' => 'user-b@example.com'
        ]);

        $response->assertStatus(401);
    }

    /**
     * TEST 3 — Valid User A Token + X-Member-Email User B
     */
    public function test_x_member_email_cannot_override_authenticated_user()
    {
        $userA = User::factory()->create([
            'email' => 'user-a@example.com',
            'name' => 'User A'
        ]);
        $userB = User::factory()->create([
            'email' => 'user-b@example.com',
            'name' => 'User B'
        ]);

        // Login as User A
        $token = $userA->createToken('test')->plainTextToken;

        // Try to access profile with X-Member-Email of User B
        $response = $this->getJson('/api/user/profile-info', [
            'Authorization' => 'Bearer ' . $token,
            'X-Member-Email' => 'user-b@example.com'
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.email', 'user-a@example.com');
        $response->assertJsonPath('data.name', 'User A');
    }

    /**
     * TEST 4 — Password Takeover Attempt
     */
    public function test_password_takeover_attempt_via_x_member_email_fails()
    {
        $userB = User::factory()->create([
            'email' => 'user-b@email.com',
            'password' => bcrypt('password123')
        ]);

        $response = $this->putJson('/api/user/profile', [
            'password' => 'hacked123'
        ], [
            'X-Member-Email' => 'user-b@email.com'
        ]);

        $response->assertStatus(401);

        // Verify password did not change
        $userB->refresh();
        $this->assertTrue(\Hash::check('password123', $userB->password));
        $this->assertFalse(\Hash::check('hacked123', $userB->password));
    }

    /**
     * TEST 5 — Valid User Token
     */
    public function test_valid_user_can_access_own_profile()
    {
        $user = User::factory()->create([
            'email' => 'valid-user@example.com',
            'name' => 'Valid User'
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->getJson('/api/user/profile-info', [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.email', 'valid-user@example.com');
    }

    /**
     * TEST 6 — Cross User Resource (Wishlist as example)
     */
    public function test_cross_user_resource_access_fails()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        // User A should not be able to get User B's wishlist or change User B's profile
        $tokenA = $userA->createToken('test')->plainTextToken;

        // Try to update User B's profile by passing their email in body
        $response = $this->putJson('/api/user/profile', [
            'email' => $userB->email,
            'name' => 'Hacked Name'
        ], [
            'Authorization' => 'Bearer ' . $tokenA,
        ]);

        // It might be 422 if unique email validation fails, or 200 but updates User A instead.
        // The key is that User B's profile is NOT updated.
        $userB->refresh();
        $this->assertNotEquals('Hacked Name', $userB->name);
        
        // Let's also verify that trying to act as User B by ID or email via header fails
        $response2 = $this->getJson('/api/user/profile-info', [
            'Authorization' => 'Bearer ' . $tokenA,
            'X-Member-Email' => $userB->email
        ]);
        
        // Should return User A's data, not User B
        $response2->assertStatus(200);
        $response2->assertJsonPath('data.id', $userA->id);
    }
}
