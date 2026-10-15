<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DuitkuService
{
    protected string $merchantCode;
    protected string $apiKey;
    protected string $env;
    protected string $baseUrl;
    protected string $callbackUrl;
    protected string $returnUrl;
    protected int $expiryPeriod;

    public function __construct()
    {
        $this->merchantCode = (string)(config('services.duitku.merchant_code') ?: (env('DUITKU_MERCHANT_CODE') ?: 'DS36606'));
        $this->apiKey       = (string)(config('services.duitku.api_key') ?: (env('DUITKU_API_KEY') ?: '839fb4e6295437db048392368f3959f2'));
        $this->env          = strtolower((string)(config('services.duitku.env') ?: (env('DUITKU_ENV') ?: 'sandbox')));
        $this->callbackUrl  = (string)(config('services.duitku.callback_url') ?: (env('DUITKU_CALLBACK_URL') ?: 'https://sectormadness.com/api/webhook/duitku'));
        $this->returnUrl    = (string)(config('services.duitku.return_url') ?: (env('DUITKU_RETURN_URL') ?: 'https://sectormadness.com/orders'));
        $this->expiryPeriod = (int)(config('services.duitku.expiry_period') ?: 1440);

        $this->baseUrl = $this->env === 'production'
            ? 'https://passport.duitku.com/webapi/api/merchant'
            : 'https://sandbox.duitku.com/webapi/api/merchant';
    }

    /**
     * Map internal payment method code to Duitku payment method code.
     */
    public function mapPaymentMethod(string $method): string
    {
        $m = strtolower(trim($method));
        return match ($m) {
            'bca_va'      => 'BC', // BCA Virtual Account
            'mandiri_va',
            'echannel'    => 'M2', // Mandiri Virtual Account
            'bri_va'      => 'BR', // BRI Virtual Account
            'bni_va'      => 'I1', // BNI Virtual Account
            'permata_va'  => 'BT', // Permata Virtual Account
            'cimb_va'     => 'B1', // CIMB Niaga Virtual Account
            'qris'        => 'SP', // QRIS (ShopeePay)
            'shopeepay'   => 'SP',
            'gopay'       => 'SP',
            'ovo'         => 'OV',
            'dana'        => 'DA',
            default       => 'BC',
        };
    }

    /**
     * Request Transaction (Inquiry) from Duitku.
     * Generates VA Number, QRIS, or Payment URL.
     */
    public function createInvoice(Order $order, string $paymentMethod, array $shippingAddress = []): array
    {
        $duitkuMethod = $this->mapPaymentMethod($paymentMethod);
        $amount = (int)round((float)$order->total_amount);
        $orderNumber = $order->order_number;

        // Signature: MD5(merchantCode + merchantOrderId + paymentAmount + apiKey)
        $signature = md5($this->merchantCode . $orderNumber . $amount . $this->apiKey);

        // Format items for Duitku
        $itemDetails = [];
        foreach ($order->items as $item) {
            $itemPrice = (int)round((float)$item->price);
            $itemDetails[] = [
                'name'     => substr($item->product_name ?? 'Product Item', 0, 48),
                'price'    => $itemPrice,
                'quantity' => (int)($item->quantity ?? 1),
            ];
        }

        if ($order->shipment && (float)$order->shipment->shipping_cost > 0) {
            $itemDetails[] = [
                'name'     => 'Shipping (' . ($order->shipment->courier_company ?? 'Courier') . ')',
                'price'    => (int)round((float)$order->shipment->shipping_cost),
                'quantity' => 1,
            ];
        }

        $customerName  = $shippingAddress['receiver_name'] ?? ($order->user->name ?? 'Customer');
        $customerEmail = $order->user->email ?? 'customer@sectormadness.com';
        $customerPhone = $shippingAddress['phone_number'] ?? ($order->user->phone ?? '08123456789');

        $nameParts = explode(' ', trim($customerName), 2);
        $firstName = $nameParts[0] ?: 'Customer';
        $lastName  = $nameParts[1] ?? 'Madness';

        $addressInfo = [
            'firstName'   => $firstName,
            'lastName'    => $lastName,
            'address'     => $shippingAddress['street_address'] ?? 'Customer Address',
            'city'        => $shippingAddress['city'] ?? 'Jakarta',
            'postalCode'  => $shippingAddress['postal_code'] ?? '10110',
            'phone'       => $customerPhone,
            'countryCode' => 'ID',
        ];

        $payload = [
            'merchantCode'     => $this->merchantCode,
            'paymentAmount'    => $amount,
            'paymentMethod'    => $duitkuMethod,
            'merchantOrderId'  => $orderNumber,
            'productDetails'   => 'Payment for Order #' . $orderNumber,
            'additionalParam'  => '',
            'merchantUserInfo' => $customerEmail,
            'customerVaName'   => substr($customerName, 0, 30),
            'email'            => $customerEmail,
            'phoneNumber'      => $customerPhone,
            'itemDetails'      => $itemDetails,
            'customerDetail'   => [
                'firstName'       => $firstName,
                'lastName'        => $lastName,
                'email'           => $customerEmail,
                'phoneNumber'     => $customerPhone,
                'billingAddress'  => $addressInfo,
                'shippingAddress' => $addressInfo,
            ],
            'callbackUrl'      => $this->callbackUrl,
            'returnUrl'        => $this->returnUrl,
            'signature'        => $signature,
            'expiryPeriod'     => $this->expiryPeriod,
        ];

        $endpoint = $this->baseUrl . '/v2/inquiry';

        Log::info("Duitku Inquiry Request for Order {$orderNumber}", [
            'endpoint' => $endpoint,
            'method'   => $duitkuMethod,
            'amount'   => $amount,
        ]);

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Accept'       => 'application/json',
            ])->timeout(20)->post($endpoint, $payload);

            $data = $response->json();
            Log::info("Duitku Inquiry Response for Order {$orderNumber}: ", $data ?? ['raw' => $response->body()]);

            if ($response->successful() && isset($data['statusCode']) && $data['statusCode'] === '00') {
                return [
                    'success'        => true,
                    'reference'      => $data['reference'] ?? null,
                    'payment_url'    => $data['paymentUrl'] ?? null,
                    'va_number'      => $data['vaNumber'] ?? null,
                    'qr_string'      => $data['qrString'] ?? null,
                    'status_code'    => $data['statusCode'],
                    'status_message' => $data['statusMessage'] ?? 'SUCCESS',
                    'raw'            => $data,
                ];
            }

            return [
                'success'        => false,
                'error'          => $data['statusMessage'] ?? ('Duitku API returned status: ' . ($data['statusCode'] ?? 'Unknown')),
                'raw'            => $data ?? $response->body(),
            ];
        } catch (\Exception $e) {
            Log::error("Duitku Inquiry Exception for Order {$orderNumber}: " . $e->getMessage());
            return [
                'success' => false,
                'error'   => $e->getMessage(),
            ];
        }
    }

    /**
     * Validate Incoming Callback from Duitku.
     * Signature formula: MD5(merchantCode + amount + merchantOrderId + apiKey)
     */
    public function validateCallback(array $params): bool
    {
        $merchantCode    = $params['merchantCode'] ?? '';
        $amount          = $params['amount'] ?? '';
        $merchantOrderId = $params['merchantOrderId'] ?? '';
        $receivedSig     = $params['signature'] ?? '';

        if (empty($merchantCode) || empty($amount) || empty($merchantOrderId) || empty($receivedSig)) {
            Log::warning('Duitku Callback missing parameters', $params);
            return false;
        }

        // Must match our merchant code
        if ($merchantCode !== $this->merchantCode) {
            Log::warning("Duitku Callback merchant code mismatch: {$merchantCode} vs {$this->merchantCode}");
            return false;
        }

        $expectedSig = md5($merchantCode . $amount . $merchantOrderId . $this->apiKey);

        if (!hash_equals($expectedSig, $receivedSig)) {
            Log::warning("Duitku Callback signature mismatch. Expected: {$expectedSig}, Received: {$receivedSig}");
            return false;
        }

        return true;
    }

    /**
     * Check Real-Time Transaction Status directly with Duitku Server.
     * Endpoint: POST /webapi/api/merchant/transactionStatus
     */
    public function checkTransactionStatus(string $merchantOrderId): array
    {
        $signature = md5($this->merchantCode . $merchantOrderId . $this->apiKey);
        $endpoint  = $this->baseUrl . '/transactionStatus';

        $payload = [
            'merchantCode'    => $this->merchantCode,
            'merchantOrderId' => $merchantOrderId,
            'signature'       => $signature,
        ];

        try {
            $response = Http::asJson()->timeout(15)->post($endpoint, $payload);
            $data = $response->json();

            Log::info("Duitku Transaction Status for Order {$merchantOrderId}: ", $data ?? ['raw' => $response->body()]);

            if ($response->successful() && isset($data['statusCode'])) {
                $code = (string)$data['statusCode'];
                // statusCode: "00" = Success/Paid, "01" = Pending, "02" = Canceled/Failed/Expired
                $isPaid = ($code === '00');
                $statusName = match ($code) {
                    '00'    => 'settlement',
                    '01'    => 'pending',
                    '02'    => 'expire',
                    default => 'unknown',
                };

                return [
                    'status'             => true,
                    'is_paid'            => $isPaid,
                    'status_code'        => $code,
                    'transaction_status' => $statusName,
                    'message'            => $data['statusMessage'] ?? '',
                    'reference'          => $data['reference'] ?? null,
                    'raw'                => $data,
                ];
            }

            return [
                'status'             => false,
                'is_paid'            => false,
                'transaction_status' => 'pending',
                'message'            => $data['statusMessage'] ?? 'Failed to get status from Duitku',
                'raw'                => $data,
            ];
        } catch (\Exception $e) {
            Log::error("Duitku Status Check Exception for {$merchantOrderId}: " . $e->getMessage());
            return [
                'status'             => false,
                'is_paid'            => false,
                'transaction_status' => 'pending',
                'message'            => $e->getMessage(),
            ];
        }
    }
}
