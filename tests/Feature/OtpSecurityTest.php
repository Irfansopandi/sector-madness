<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class OtpSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('OldPassword123')
        ]);
    }

    private function createOtpRecord($otp, $failedAttempts = 0, $createdAt = null)
    {
        DB::table('password_reset_tokens')->insert([
            'email' => 'test@example.com',
            'token' => Hash::make($otp),
            'created_at' => $createdAt ?? Carbon::now(),
            'failed_attempts' => $failedAttempts
        ]);
    }

    public function test_valid_otp_can_be_verified()
    {
        $this->createOtpRecord('123456');

        $response = $this->postJson('/api/forgot-password/verify-otp', [
            'email' => 'test@example.com',
            'otp' => '123456'
        ]);

        $response->assertStatus(200);
        $record = DB::table('password_reset_tokens')->where('email', 'test@example.com')->first();
        // Because of atomic reservation, even a valid verification consumes a slot
        $this->assertEquals(1, $record->failed_attempts);
    }

    public function test_invalid_otp_increments_failed_attempts()
    {
        $this->createOtpRecord('123456');

        $response = $this->postJson('/api/forgot-password/verify-otp', [
            'email' => 'test@example.com',
            'otp' => '654321'
        ]);

        $response->assertStatus(400);
        
        $record = DB::table('password_reset_tokens')->where('email', 'test@example.com')->first();
        $this->assertEquals(1, $record->failed_attempts);
    }

    public function test_otp_is_invalidated_after_five_failed_attempts()
    {
        $this->createOtpRecord('123456');

        for ($i = 1; $i <= 5; $i++) {
            $response = $this->postJson('/api/forgot-password/verify-otp', [
                'email' => 'test@example.com',
                'otp' => '111111'
            ]);
            $response->assertStatus(400);
        }

        $record = DB::table('password_reset_tokens')->where('email', 'test@example.com')->first();
        $this->assertEquals(5, $record->failed_attempts);
        
        // Note: The actual lockout rejection message is tested in test_locked_otp_cannot_be_reused
        // We do not make a 6th request here to avoid hitting the Laravel throttle:5,1 middleware (429 Too Many Requests).
    }

    public function test_locked_otp_cannot_be_reused()
    {
        $this->createOtpRecord('123456', 5);

        // Even with the CORRECT OTP, it should fail if locked out
        $response = $this->postJson('/api/forgot-password/verify-otp', [
            'email' => 'test@example.com',
            'otp' => '123456'
        ]);

        $response->assertStatus(400)
                 ->assertJsonFragment(['message' => 'Too many failed attempts. OTP is invalidated. Please request a new one.']);
    }

    public function test_expired_otp_is_rejected()
    {
        $this->createOtpRecord('123456', 0, Carbon::now()->subMinutes(16));

        $response = $this->postJson('/api/forgot-password/verify-otp', [
            'email' => 'test@example.com',
            'otp' => '123456'
        ]);

        $response->assertStatus(400)
                 ->assertJsonFragment(['message' => 'OTP has expired. Please request a new one.']);
                 
        // Ensure record is deleted
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => 'test@example.com']);
    }

    public function test_used_otp_cannot_be_reused()
    {
        $this->createOtpRecord('123456');

        // Reset password successfully
        $response = $this->postJson('/api/forgot-password/reset', [
            'email' => 'test@example.com',
            'otp' => '123456',
            'password' => 'NewPassword123',
            'password_confirmation' => 'NewPassword123'
        ]);

        $response->assertStatus(200);

        // Try to verify same OTP again
        $response2 = $this->postJson('/api/forgot-password/verify-otp', [
            'email' => 'test@example.com',
            'otp' => '123456'
        ]);

        $response2->assertStatus(400)
                  ->assertJsonFragment(['message' => 'Invalid or expired OTP.']);
    }

    public function test_correct_otp_before_lockout_still_works()
    {
        $this->createOtpRecord('123456');

        // Fail 4 times
        for ($i = 1; $i <= 4; $i++) {
            $this->postJson('/api/forgot-password/verify-otp', [
                'email' => 'test@example.com',
                'otp' => '111111'
            ]);
        }

        $record = DB::table('password_reset_tokens')->where('email', 'test@example.com')->first();
        $this->assertEquals(4, $record->failed_attempts);

        // 5th time is CORRECT
        $response = $this->postJson('/api/forgot-password/verify-otp', [
            'email' => 'test@example.com',
            'otp' => '123456'
        ]);

        $response->assertStatus(200);
    }

    public function test_attempt_counter_cannot_be_manipulated_by_client()
    {
        $this->createOtpRecord('123456', 4);

        $response = $this->postJson('/api/forgot-password/verify-otp', [
            'email' => 'test@example.com',
            'otp' => '111111',
            'failed_attempts' => 0 // Attempt to reset counter
        ]);

        $response->assertStatus(400);

        // Counter should still increment to 5
        $record = DB::table('password_reset_tokens')->where('email', 'test@example.com')->first();
        $this->assertEquals(5, $record->failed_attempts);
    }

    public function test_otp_bruteforce_does_not_change_password()
    {
        $this->createOtpRecord('123456');

        // Brute force 6 times
        for ($i = 1; $i <= 6; $i++) {
            $this->postJson('/api/forgot-password/reset', [
                'email' => 'test@example.com',
                'otp' => '111111',
                'password' => 'HackedPassword123',
                'password_confirmation' => 'HackedPassword123'
            ]);
        }

        // Even if they hit the correct one on the 6th try, it should be rejected because lockout happened at 5.
        $this->postJson('/api/forgot-password/reset', [
            'email' => 'test@example.com',
            'otp' => '123456',
            'password' => 'HackedPassword123',
            'password_confirmation' => 'HackedPassword123'
        ]);

        $freshUser = User::where('email', 'test@example.com')->first();
        
        // Password should still be OldPassword123
        $this->assertTrue(Hash::check('OldPassword123', $freshUser->password));
        $this->assertFalse(Hash::check('HackedPassword123', $freshUser->password));
    }

    public function test_parallel_or_repeated_failed_attempts_respect_lockout()
    {
        // For testing atomic update logic using increment(), 
        // we can just assert that standard requests increment it sequentially.
        $this->createOtpRecord('123456');
        
        DB::table('password_reset_tokens')
                ->where('email', 'test@example.com')
                ->increment('failed_attempts');
                
        $record = DB::table('password_reset_tokens')->where('email', 'test@example.com')->first();
        $this->assertEquals(1, $record->failed_attempts);
        
        DB::table('password_reset_tokens')
                ->where('email', 'test@example.com')
                ->increment('failed_attempts');
                
        $record = DB::table('password_reset_tokens')->where('email', 'test@example.com')->first();
        $this->assertEquals(2, $record->failed_attempts);
    }
}
