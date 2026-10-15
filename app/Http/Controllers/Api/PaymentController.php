<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Services\DuitkuService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected DuitkuService $duitkuService;

    public function __construct(DuitkuService $duitkuService)
    {
        $this->duitkuService = $duitkuService;
    }

    /**
     * Generate Payment Token / URL for an Order (Duitku / Midtrans)
     * Endpoint: POST /api/payment/token/{order_number}
     */
    public function generateToken(Request $request, $order_number)
    {
        $order = Order::with(['items', 'payment', 'user', 'shipment'])
            ->where('order_number', $order_number)
            ->first();

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        // --- 1. Duitku Gateway Integration (Primary) ---
        $duitkuMerchant = config('services.duitku.merchant_code') ?? env('DUITKU_MERCHANT_CODE');
        if (!empty($duitkuMerchant)) {
            $paymentMethod = $order->payment?->payment_type ?? $request->input('payment_method', 'bca_va');
            $shippingData = [];
            if ($order->shipment) {
                $shippingData = [
                    'receiver_name'  => $order->user?->name ?? 'Customer',
                    'phone_number'   => $order->user?->phone ?? '08123456789',
                    'street_address' => $order->shipment->destination_address ?? 'Customer Address',
                    'city'           => $order->shipment->destination_city ?? 'Jakarta',
                    'postal_code'    => $order->shipment->destination_postal_code ?? '10110',
                ];
            }

            $duitkuRes = $this->duitkuService->createInvoice($order, $paymentMethod, $shippingData);

            if ($duitkuRes['success']) {
                $ref = $duitkuRes['reference'];
                $payUrl = $duitkuRes['payment_url'];
                $vaNo = $duitkuRes['va_number'];
                $qr = $duitkuRes['qr_string'];

                if ($order->payment) {
                    $order->payment->update([
                        'transaction_id'   => $ref,
                        'snap_token'       => $payUrl ?? $vaNo ?? $ref,
                        'payload_response' => $duitkuRes['raw'] ?? [],
                    ]);
                }

                return response()->json([
                    'status'       => true,
                    'gateway'      => 'duitku',
                    'token'        => $ref ?? $vaNo,
                    'reference'    => $ref,
                    'redirect_url' => $payUrl,
                    'payment_url'  => $payUrl,
                    'va_number'    => $vaNo,
                    'qr_string'    => $qr,
                ], 200);
            }

            Log::warning('Duitku createInvoice failed in generateToken, fallback to simulation/Midtrans: ' . ($duitkuRes['error'] ?? 'Unknown error'));
        }

        // --- 2. Midtrans Gateway (Fallback) ---
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $isProduction = env('MIDTRANS_IS_PRODUCTION', false);

        if (!empty($serverKey)) {
            $endpoint = $isProduction 
                ? 'https://app.midtrans.com/snap/v1/transactions' 
                : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

            $itemDetails = [];
            foreach ($order->items as $item) {
                $rawP = (float)$item->price;
                $itemP = (int)($rawP < 1000 ? $rawP * 1000 : $rawP);
                $itemDetails[] = [
                    'id'       => $item->product_id ? (string)$item->product_id : 'SM-001',
                    'price'    => $itemP,
                    'quantity' => $item->quantity,
                    'name'     => substr($item->product_name . ($item->color || $item->size ? ' (' . implode(', ', array_filter([$item->color, $item->size])) . ')' : ''), 0, 48),
                ];
            }
            if ($order->shipment && $order->shipment->shipping_cost > 0) {
                $itemDetails[] = [
                    'id'       => 'SHIPPING',
                    'price'    => (int)$order->shipment->shipping_cost,
                    'quantity' => 1,
                    'name'     => 'Shipping Cost (' . $order->shipment->courier_company . ')',
                ];
            }

            $rawTotal = (float)$order->total_amount;
            $grossAmount = (int)($rawTotal < 1000 ? $rawTotal * 1000 : $rawTotal);

            $payload = [
                'transaction_details' => [
                    'order_id'     => $order->order_number,
                    'gross_amount' => $grossAmount,
                ],
                'customer_details' => [
                    'first_name' => $order->user ? $order->user->name : 'Customer',
                    'email'      => $order->user ? $order->user->email : 'customer@sectormadness.com',
                    'phone'      => $order->user ? ($order->user->phone ?? '+628123456789') : '+628123456789',
                ],
                'item_details' => $itemDetails,
            ];

            try {
                $response = Http::withBasicAuth($serverKey, '')
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->post($endpoint, $payload);

                if ($response->successful()) {
                    $snapToken = $response->json()['token'] ?? null;
                    $redirectUrl = $response->json()['redirect_url'] ?? null;

                    if ($order->payment) {
                        $order->payment->update([
                            'snap_token' => $snapToken,
                            'payload_response' => $response->json(),
                        ]);
                    }

                    return response()->json([
                        'status' => true,
                        'token'  => $snapToken,
                        'redirect_url' => $redirectUrl,
                    ], 200);
                }
            } catch (\Exception $e) {
                Log::error('Midtrans Exception: ' . $e->getMessage());
            }
        }

        // --- 3. Simulation Mode (Fallback when no API Key is configured) ---
        $simToken = $order->payment && $order->payment->snap_token 
            ? $order->payment->snap_token 
            : 'SIM-' . strtoupper(Str::random(16));

        if ($order->payment) {
            $order->payment->update(['snap_token' => $simToken]);
        }

        return response()->json([
            'status'       => true,
            'message'      => 'Simulation mode token generated',
            'token'        => $simToken,
            'redirect_url' => 'https://sandbox.duitku.com',
        ], 200);
    }

    /**
     * Webhook Notification from Midtrans Server
     * Endpoint: POST /api/webhook/midtrans
     */
    public function webhook(Request $request)
    {
        $notif = $request->all();
        $orderNumber = $notif['order_id'] ?? null;
        $transactionStatus = $notif['transaction_status'] ?? null;
        $fraudStatus = $notif['fraud_status'] ?? null;
        $signatureKey = $notif['signature_key'] ?? null;
        $grossAmount = $notif['gross_amount'] ?? null;
        $statusCode = $notif['status_code'] ?? null;

        if (!$orderNumber) {
            return response()->json(['status' => false, 'message' => 'Missing order_id'], 400);
        }

        $order = Order::with('payment')->where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        // --- 1. SIGNATURE VALIDATION ---
        if (!$signatureKey || !$statusCode || !$grossAmount) {
            return response()->json(['status' => false, 'message' => 'Missing signature components'], 403);
        }

        $serverKey = env('MIDTRANS_SERVER_KEY');
        $expectedSignature = hash('sha512', $orderNumber . $statusCode . $grossAmount . $serverKey);
        
        if (!hash_equals($expectedSignature, $signatureKey)) {
            return response()->json(['status' => false, 'message' => 'Invalid signature'], 403);
        }

        // --- 2. GROSS AMOUNT VALIDATION ---
        // Ensure gross_amount from Midtrans matches order's actual total_amount
        $midtransAmount = (float)$grossAmount;
        $orderAmount = (float)$order->total_amount;
        
        if (abs($midtransAmount - $orderAmount) > 0.01) {
            return response()->json(['status' => false, 'message' => 'Gross amount mismatch'], 400);
        }

        // --- 3. IDEMPOTENCY CHECK ---
        if ($order->status === 'paid' && in_array($transactionStatus, ['settlement', 'capture'])) {
            return response()->json(['status' => true, 'message' => 'Notification already processed'], 200);
        }

        // --- 4. STATUS MAPPING & UPDATE ---
        $status = 'unpaid';
        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                $status = 'unpaid';
            } else {
                $status = 'paid';
            }
        } elseif ($transactionStatus == 'settlement') {
            $status = 'paid';
        } elseif ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
            $status = 'failed';
        } elseif ($transactionStatus == 'pending') {
            $status = 'unpaid';
        }

        if ($order->payment) {
            $order->payment->update([
                'payment_status'   => $status,
                'transaction_id'   => $notif['transaction_id'] ?? null,
                'payment_type'     => $notif['payment_type'] ?? $order->payment->payment_type,
                'payload_response' => $notif,
                'paid_at'          => $status === 'paid' ? now() : null,
            ]);
        }

        if ($status === 'paid') {
            $order->update(['status' => 'paid']);

            // Create a dummy Biteship Tracking Number if it doesn't exist
            if ($order->shipment && empty($order->shipment->tracking_number)) {
                $courier = strtoupper($order->shipment->courier_company ?? 'JNT');
                $order->shipment->update([
                    'tracking_number' => $courier . '-' . time()
                ]);
            }

            // Admin Notifications
            try {
                $admins = \App\Models\Admin::all();
                $title = '🛒 New Paid Order Received';
                $message = "Order baru #{$order->order_number} telah dibayar senilai Rp " . number_format($order->total_amount, 0, ',', '.');

                // 1. Internal DB Notification (Bell)
                \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminOrderNotification($title, $message, $order->order_number));

                // 2. External Web Push
                \App\Jobs\SendAdminPushNotification::dispatch($title, $message, '/admin/orders?tab=processing');
            } catch (\Exception $e) {
                Log::error('Admin Notification Failed on Webhook: ' . $e->getMessage());
            }
        } elseif ($status === 'failed') {
            $order->update(['status' => 'cancelled']);
        }

        return response()->json(['status' => true, 'message' => 'Notification processed'], 200);
    }

    /**
     * Webhook Notification from Duitku Server
     * Endpoint: POST /api/webhook/duitku
     */
    public function webhookDuitku(Request $request)
    {
        $params = $request->all();
        Log::info('Duitku Webhook Received: ', $params);

        // 1. Signature Validation
        if (!$this->duitkuService->validateCallback($params)) {
            Log::warning('Duitku Webhook: Invalid Signature', $params);
            return response()->json(['status' => false, 'message' => 'Invalid signature'], 403);
        }

        $orderNumber = $params['merchantOrderId'] ?? null;
        $amount      = (float)($params['amount'] ?? 0);
        $resultCode  = $params['resultCode'] ?? null; // "00" = Success, "01" = Failed
        $reference   = $params['reference'] ?? null;

        if (!$orderNumber) {
            return response()->json(['status' => false, 'message' => 'Missing merchantOrderId'], 400);
        }

        $order = Order::with(['items', 'payment', 'shipment', 'user'])
            ->where('order_number', $orderNumber)
            ->first();

        if (!$order) {
            Log::warning("Duitku Webhook: Order {$orderNumber} not found");
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        // 2. Amount Validation
        $orderAmount = (float)$order->total_amount;
        if (abs($amount - $orderAmount) > 1.0) {
            Log::warning("Duitku Webhook: Amount mismatch for {$orderNumber}: {$amount} vs {$orderAmount}");
            return response()->json(['status' => false, 'message' => 'Amount mismatch'], 400);
        }

        // 3. Idempotency Check
        if ($order->status === 'paid' && $resultCode === '00') {
            Log::info("Duitku Webhook: Order {$orderNumber} already processed");
            return response('SUCCESS', 200)->header('Content-Type', 'text/plain');
        }

        // 4. Update Status based on resultCode
        if ($resultCode === '00') {
            if ($order->payment) {
                $order->payment->update([
                    'payment_status'   => 'paid',
                    'transaction_id'   => $reference ?? $order->payment->transaction_id,
                    'payment_type'     => $params['paymentCode'] ?? $order->payment->payment_type,
                    'payload_response' => $params,
                    'paid_at'          => now(),
                ]);
            }

            $isFirstTime = in_array($order->status, ['pending', 'unpaid']);
            $order->update(['status' => 'paid']);

            if ($isFirstTime) {
                // Decrement stock
                foreach ($order->items as $item) {
                    $product = \App\Models\Product::find($item->product_id);
                    if ($product) {
                        $product->decrement('stock', $item->quantity);
                        $variant = \App\Models\ProductVariant::where('product_id', $product->id)
                            ->where('color', $item->color ?: 'Default')
                            ->where('size', $item->size ?: 'M')
                            ->first();
                        if ($variant) {
                            $variant->decrement('stock', $item->quantity);
                        }
                    }
                }

                // Clear user cart upon successful payment
                if ($order->user_id) {
                    $cart = \App\Models\Cart::where('user_id', $order->user_id)->first();
                    if ($cart) {
                        $cart->items()->delete();
                    }
                }
            }

            // Create tracking number if empty
            if ($order->shipment && empty($order->shipment->tracking_number)) {
                $courier = strtoupper($order->shipment->courier_company ?? 'JNT');
                $order->shipment->update([
                    'tracking_number' => $courier . '-' . time()
                ]);
            }

            // Admin Notifications
            try {
                $admins = \App\Models\Admin::all();
                $title = '🛒 New Paid Order Received (Duitku)';
                $message = "Order baru #{$order->order_number} telah dibayar via Duitku senilai Rp " . number_format($order->total_amount, 0, ',', '.');

                \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminOrderNotification($title, $message, $order->order_number));
                \App\Jobs\SendAdminPushNotification::dispatch($title, $message, '/admin/orders?tab=processing');
            } catch (\Exception $e) {
                Log::error('Admin Notification Failed on Duitku Webhook: ' . $e->getMessage());
            }

            Log::info("Duitku Webhook: Order {$orderNumber} successfully marked as PAID");
        } else {
            if ($order->payment) {
                $order->payment->update([
                    'payment_status'   => 'failed',
                    'payload_response' => $params,
                ]);
            }
            $order->update(['status' => 'cancelled']);
            Log::info("Duitku Webhook: Order {$orderNumber} marked as CANCELLED (resultCode: {$resultCode})");
        }

        return response('SUCCESS', 200)->header('Content-Type', 'text/plain');
    }


    /**
     * Generate Instant Snap Token for Frontend Direct Checkout
     * Endpoint: POST /api/payment/instant-token
     */
    public function instantToken(Request $request)
    {
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        
        $endpoint = $isProduction 
            ? 'https://app.midtrans.com/snap/v1/transactions' 
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $orderId = 'SM-ORD-' . now()->format('Ymd-His') . '-' . rand(100, 999);
        $items = $request->get('items', []);
        $shippingCost = (int)$request->get('shipping_cost', 25000);

        $itemDetails = [];
        $calculatedTotal = 0;

        foreach ($items as $item) {
            $rawP = (float)($item['price'] ?? 0);
            $priceIdr = (int)($rawP < 1000 ? $rawP * 1000 : $rawP);
            $qty = (int)($item['quantity'] ?? 1);
            $itemDetails[] = [
                'id'       => $item['id'] ?? 'SM-ITEM',
                'price'    => $priceIdr,
                'quantity' => $qty,
                'name'     => substr($item['name'] ?? 'Technical Garment', 0, 48),
            ];
            $calculatedTotal += ($priceIdr * $qty);
        }

        if ($shippingCost > 0) {
            $itemDetails[] = [
                'id'       => 'SHIPPING-FEE',
                'price'    => $shippingCost,
                'quantity' => 1,
                'name'     => 'Courier Shipping Rate',
            ];
            $calculatedTotal += $shippingCost;
        }

        if (empty($itemDetails) || $calculatedTotal <= 0) {
            $calculatedTotal = (int)($request->get('gross_amount', 150000));
            $itemDetails = [[
                'id'       => 'SM-CUSTOM-ORD',
                'price'    => $calculatedTotal,
                'quantity' => 1,
                'name'     => 'Sector Madness Order',
            ]];
        }

        $payload = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $calculatedTotal,
            ],
            'customer_details' => [
                'first_name' => $request->get('first_name', 'Customer'),
                'email'      => $request->get('email', ''),
                'phone'      => $request->get('phone', ''),
                'billing_address' => [
                    'address' => $request->get('address', ''),
                ],
                'shipping_address' => [
                    'first_name' => $request->get('first_name', 'Customer'),
                    'phone'      => $request->get('phone', ''),
                    'address'    => $request->get('address', ''),
                ]
            ],
            'item_details' => $itemDetails,
        ];

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($endpoint, $payload);

            if ($response->successful()) {
                return response()->json([
                    'status' => true,
                    'order_id' => $orderId,
                    'token'  => $response->json()['token'] ?? null,
                    'redirect_url' => $response->json()['redirect_url'] ?? null,
                    'gross_amount' => $calculatedTotal,
                ], 200);
            }

            return response()->json([
                'status' => false,
                'message' => 'Midtrans Snap API Error',
                'error' => $response->json()
            ], $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Exception when calling Midtrans Server: ' . $e->getMessage()
            ], 500);
        }
    }
}
