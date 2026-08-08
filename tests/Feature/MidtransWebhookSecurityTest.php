<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\OrderPayment;

class MidtransWebhookSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure MIDTRANS_SERVER_KEY is set for tests
        config(['app.env' => 'testing']);
        putenv('MIDTRANS_SERVER_KEY=SB-Mid-server-TEST_KEY_123');

        $this->user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password')
        ]);

        $this->order = Order::create([
            'user_id' => $this->user->id,
            'order_number' => 'TEST-ORD-12345',
            'total_amount' => 150000,
            'status' => 'pending'
        ]);

        $this->payment = OrderPayment::create([
            'order_id' => $this->order->id,
            'payment_type' => 'qris',
            'payment_status' => 'unpaid'
        ]);
    }

    private function generateSignature($orderId, $statusCode, $grossAmount)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');
        return hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
    }

    private function getBasePayload()
    {
        return [
            'order_id' => 'TEST-ORD-12345',
            'status_code' => '200',
            'gross_amount' => '150000.00',
            'transaction_status' => 'settlement',
            'transaction_id' => 'abc-123-def',
            'payment_type' => 'qris'
        ];
    }

    public function test_valid_signature()
    {
        $payload = $this->getBasePayload();
        $payload['signature_key'] = $this->generateSignature($payload['order_id'], $payload['status_code'], $payload['gross_amount']);

        $response = $this->postJson('/api/webhook/midtrans', $payload);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'paid'
        ]);

        $this->assertDatabaseHas('order_payments', [
            'id' => $this->payment->id,
            'payment_status' => 'paid',
        ]);
        
        // Assert paid_at is not null
        $updatedPayment = OrderPayment::find($this->payment->id);
        $this->assertNotNull($updatedPayment->paid_at);
    }

    public function test_invalid_signature()
    {
        $payload = $this->getBasePayload();
        $payload['signature_key'] = 'wrong_signature_12345';

        $response = $this->postJson('/api/webhook/midtrans', $payload);

        $response->assertStatus(403);
        
        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'pending'
        ]);
    }

    public function test_missing_signature()
    {
        $payload = $this->getBasePayload();
        // signature_key is omitted

        $response = $this->postJson('/api/webhook/midtrans', $payload);

        $response->assertStatus(403);
        $response->assertJson(['message' => 'Missing signature components']);
    }

    public function test_tampered_gross_amount_with_invalid_signature()
    {
        $payload = $this->getBasePayload();
        $payload['gross_amount'] = '1000.00';
        $payload['signature_key'] = $this->generateSignature($payload['order_id'], $payload['status_code'], '150000.00'); // Valid sig for 150K, but tampered amount 1K

        $response = $this->postJson('/api/webhook/midtrans', $payload);

        // Fails at signature check because the payload's gross_amount doesn't match the signature's components
        $response->assertStatus(403);
    }

    public function test_valid_signature_but_wrong_gross_amount()
    {
        $payload = $this->getBasePayload();
        // Attacker correctly hashes a forged cheap amount
        $payload['gross_amount'] = '1000.00'; 
        $payload['signature_key'] = $this->generateSignature($payload['order_id'], $payload['status_code'], $payload['gross_amount']);

        $response = $this->postJson('/api/webhook/midtrans', $payload);

        // Fails at gross amount mismatch check
        $response->assertStatus(400);
        $response->assertJson(['message' => 'Gross amount mismatch']);
        
        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'pending'
        ]);
    }

    public function test_invalid_order_id()
    {
        $payload = $this->getBasePayload();
        $payload['order_id'] = 'NON_EXISTENT_ORDER';
        $payload['signature_key'] = $this->generateSignature($payload['order_id'], $payload['status_code'], $payload['gross_amount']);

        $response = $this->postJson('/api/webhook/midtrans', $payload);

        $response->assertStatus(404);
    }

    public function test_invalid_transaction_status()
    {
        $payload = $this->getBasePayload();
        $payload['transaction_status'] = 'unknown_status';
        $payload['signature_key'] = $this->generateSignature($payload['order_id'], $payload['status_code'], $payload['gross_amount']);

        $response = $this->postJson('/api/webhook/midtrans', $payload);

        $response->assertStatus(200); // Processed, but status becomes unpaid

        $this->assertDatabaseHas('order_payments', [
            'id' => $this->payment->id,
            'payment_status' => 'unpaid', // Unchanged or explicitly set to unpaid
        ]);
    }

    public function test_duplicate_webhook_idempotency()
    {
        $payload = $this->getBasePayload();
        $payload['signature_key'] = $this->generateSignature($payload['order_id'], $payload['status_code'], $payload['gross_amount']);

        // First request
        $this->postJson('/api/webhook/midtrans', $payload)->assertStatus(200);

        // Save paid_at
        $firstPaymentState = OrderPayment::find($this->payment->id);
        $this->assertEquals('paid', $firstPaymentState->payment_status);
        
        // Wait 1 second (so now() would theoretically change if updated)
        // Since it's a test, we can just alter paid_at manually to be 1 hour ago
        $firstPaymentState->update(['paid_at' => now()->subHour()]);
        $expectedPaidAt = $firstPaymentState->fresh()->paid_at->toDateTimeString();

        // Second request
        $response = $this->postJson('/api/webhook/midtrans', $payload);
        $response->assertStatus(200);
        $response->assertJson(['message' => 'Notification already processed']);

        $secondPaymentState = OrderPayment::find($this->payment->id);
        
        // It shouldn't have updated the paid_at
        $this->assertEquals($expectedPaidAt, $secondPaymentState->paid_at->toDateTimeString());
    }
}
