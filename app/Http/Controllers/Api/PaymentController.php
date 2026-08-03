<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Generate Midtrans Snap Payment Token for an Order
     * Endpoint: POST /api/payment/token/{order_number}
     */
    public function generateToken(Request $request, $order_number)
    {
        $order = Order::with(['items', 'payment', 'user'])
            ->where('order_number', $order_number)
            ->first();

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        $serverKey = env('MIDTRANS_SERVER_KEY');
        $isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        
        // Jika server key dikonfigurasi, panggil Midtrans Snap API asli
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

        // Mode Stub/Sandbox Tanpa API Key: Kembalikan Snap Token Simulasi agar frontend mulus
        $simToken = $order->payment && $order->payment->snap_token 
            ? $order->payment->snap_token 
            : 'SNAP-SIM-' . strtoupper(Str::random(16));

        if ($order->payment) {
            $order->payment->update(['snap_token' => $simToken]);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Midtrans simulation mode token generated',
            'token'   => $simToken,
            'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/' . $simToken,
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

        if (!$orderNumber) {
            return response()->json(['status' => false, 'message' => 'Missing order_id'], 400);
        }

        $order = Order::with('payment')->where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

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
        } elseif ($status === 'failed') {
            $order->update(['status' => 'cancelled']);
        }

        return response()->json(['status' => true, 'message' => 'Notification processed'], 200);
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
