<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

class PasswordUpdateSecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * TEST 1: Guest mencoba mengganti password
     */
    public function test_guest_cannot_update_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123')
        ]);

        $response = $this->putJson('/api/user/profile', [
            'password' => 'NewPassword123'
        ]);

        $response->assertStatus(401);

        $this->assertTrue(Hash::check('OldPassword123', $user->fresh()->password));
    }

    /**
     * TEST 2: Authenticated user mengirim password baru TANPA current_password
     */
    public function test_authenticated_user_cannot_update_password_without_current_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123')
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/user/profile', [
            'password' => 'NewPassword123'
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['current_password']);

        $this->assertTrue(Hash::check('OldPassword123', $user->fresh()->password));
    }

    /**
     * TEST 3: Authenticated user mengirim current_password SALAH
     */
    public function test_authenticated_user_cannot_update_password_with_wrong_current_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123')
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/user/profile', [
            'current_password' => 'WrongOldPassword',
            'password' => 'NewPassword123'
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['current_password']);

        $this->assertTrue(Hash::check('OldPassword123', $user->fresh()->password));
    }

    /**
     * TEST 4: Authenticated user mengirim current_password benar tetapi password baru invalid
     */
    public function test_authenticated_user_cannot_update_password_with_invalid_new_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123')
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/user/profile', [
            'current_password' => 'OldPassword123',
            'password' => 'short' // Assuming min:8 validation
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['password']);

        $this->assertTrue(Hash::check('OldPassword123', $user->fresh()->password));
    }

    /**
     * TEST 5: Authenticated user mengirim current_password benar + password baru valid
     * TEST 7: Pastikan password baru tersimpan menggunakan Hash::make()
     */
    public function test_authenticated_user_can_update_password_with_correct_credentials()
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPassword123')
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->putJson('/api/user/profile', [
            'current_password' => 'OldPassword123',
            'password' => 'NewPassword123'
        ]);

        $response->assertStatus(200);

        $freshUser = $user->fresh();
        
        // Assert password has changed
        $this->assertFalse(Hash::check('OldPassword123', $freshUser->password));
        
        // Assert password matches the new one and is hashed properly
        $this->assertTrue(Hash::check('NewPassword123', $freshUser->password));
        
        // Ensure it's not stored in plaintext
        $this->assertNotEquals('NewPassword123', $freshUser->password);
    }

    /**
     * TEST 6: User A mencoba memanipulasi email/user_id/X-Member-Email untuk mengubah password User B
     */
    public function test_user_cannot_manipulate_other_users_password_via_email_or_headers()
    {
        $userA = User::factory()->create([
            'email' => 'usera@example.com',
            'password' => Hash::make('OldPasswordA')
        ]);

        $userB = User::factory()->create([
            'email' => 'userb@example.com',
            'password' => Hash::make('OldPasswordB')
        ]);

        Sanctum::actingAs($userA, ['*']);

        $response = $this->withHeaders([
            'X-Member-Email' => 'userb@example.com'
        ])->putJson('/api/user/profile', [
            'email' => 'userb@example.com',
            'user_id' => $userB->id,
            'current_password' => 'OldPasswordB',
            'password' => 'HackedPasswordB'
        ]);

        // Depending on email validation (unique:users,email), it might return 422 because userb@example.com exists
        // Or it might try to check current_password against User A's password.
        // Let's assert that User B's password has NOT changed.
        $this->assertTrue(Hash::check('OldPasswordB', $userB->fresh()->password));
        
        // Also assert User A's password has NOT changed to HackedPasswordB because OldPasswordB doesn't match OldPasswordA
        $this->assertTrue(Hash::check('OldPasswordA', $userA->fresh()->password));
    }
}
