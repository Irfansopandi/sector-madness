<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Dapatkan user aktif atau fallback ke customer demo.
     */
    private function getUser(Request $request)
    {
        $user = $request->user('sanctum') ?: $request->user();
        if (!$user) {
            $memberEmail = $request->header('X-Member-Email');
            if ($memberEmail) {
                $user = User::where('email', $memberEmail)->first();
            }
        }
        if (!$user && !app()->environment('testing')) {
            return null;
        }
        return $user;
    }

    /**
     * Get All Orders of Authenticated Customer
     * Endpoint: GET /api/orders
     */
    public function index(Request $request)
    {
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json([
                'status' => true,
                'data' => [],
            ], 200);
        }
        $orders = Order::with(['items', 'payment', 'shipment'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedOrders = $orders->map(function ($order) {
            $ship = $order->shipment;
            $pay = $order->payment;
            return [
                'order_number'    => $order->order_number,
                'order_date'      => \Carbon\Carbon::parse($order->getRawOriginal('created_at') ?? $order->created_at, 'UTC')->setTimezone('Asia/Jakarta')->format('d M Y, H:i'),
                'status'          => $order->status,
                'total'           => (float)$order->total_amount,
                'payment_status'  => $pay ? $pay->payment_status : 'unpaid',
                'payment_method'  => $pay ? strtoupper($pay->payment_type ?? 'QRIS') : 'QRIS',
                'shipping_status' => $order->status === 'cancel pending' ? 'cancel pending' : ($order->status === 'cancelled' ? 'cancelled' : ($ship ? $ship->status : 'pending')),
                'tracking_number' => $ship ? ($ship->tracking_number ?: 'BS-TRACK-' . substr(md5($order->id), 0, 8)) : null,
                'items_count'     => $order->items->sum('quantity'),
                'snap_token'      => $pay ? $pay->snap_token : null,
            ];
        });

        return response()->json([
            'status' => true,
            'data'   => $formattedOrders,
        ], 200);
    }

    /**
     * Get Single Order Detail by Order Number
     * Endpoint: GET /api/orders/{order_number}
     */
    public function show(Request $request, $order_number)
    {
        $user = $this->getUser($request);
        $order = Order::with(['items.product', 'payment', 'shipment'])
            ->where('order_number', $order_number)
            ->first();

        if (!$order) {
            return response()->json([
                'status'  => false,
                'message' => 'Order record not found or unauthorized access',
            ], 404);
        }

        $addr = $order->shipping_address ?? [];
        $ship = $order->shipment;
        $pay  = $order->payment;

        $subtotal = $addr['subtotal'] ?? $order->items->sum('subtotal');
        $shippingCost = $addr['shipping_cost'] ?? ($ship ? $ship->shipping_cost : 0);
        $discountAmount = $addr['discount_amount'] ?? 0;
        $taxAmount = $addr['tax_amount'] ?? round(($subtotal - $discountAmount) * 0.11);
        $grandTotal = $order->total_amount;

        $trackingNumber = $ship && $ship->tracking_number ? $ship->tracking_number : 'SM-LOGS-' . strtoupper(substr(md5($order->order_number), 0, 10));

        // Timeline Order
        $timeline = [
            [
                'status' => 'Order Created',
                'date'   => $order->created_at->format('d M Y - H:i'),
                'detail' => 'Order placed and pre-authorized in Sector Madness system',
                'done'   => true,
            ],
            [
                'status' => 'Payment Verification',
                'date'   => $pay && $pay->payment_status === 'paid' ? $order->updated_at->format('d M Y - H:i') : 'In Progress',
                'detail' => $pay && $pay->payment_status === 'paid' ? 'Midtrans transaction verified & funds secured' : 'Waiting for payment verification via Midtrans gateway',
                'done'   => $pay && ($pay->payment_status === 'paid' || $order->status === 'processing'),
            ],
            [
                'status' => 'Atelier Dispatch Allocation',
                'date'   => $order->status === 'shipped' ? 'Completed' : 'Pending Allocation',
                'detail' => 'Package inspected and handed to Biteship courier partner',
                'done'   => in_array($order->status, ['shipped', 'delivered']),
            ],
            [
                'status' => 'Delivered to Recipient',
                'date'   => $order->status === 'delivered' ? 'Confirmed' : 'Est. ' . now()->addDays(2)->format('d M Y'),
                'detail' => 'Package signed and received safely at destination',
                'done'   => $order->status === 'delivered',
            ]
        ];

        return response()->json([
            'status' => true,
            'data'   => [
                'order_number'      => $order->order_number,
                'order_date'        => \Carbon\Carbon::parse($order->getRawOriginal('created_at') ?? $order->created_at, 'UTC')->setTimezone('Asia/Jakarta')->format('d F Y, H:i') . ' WIB',
                'customer_info'     => [
                    'name'  => $addr['receiver_name'] ?? ($user ? $user->name : ($order->user ? $order->user->name : 'Customer')),
                    'email' => $user ? $user->email : ($order->user ? $order->user->email : ''),
                    'phone' => $addr['phone_number'] ?? ($user ? $user->phone : ($order->user ? $order->user->phone : '')),
                ],
                'shipping_address'  => [
                    'receiver_name'  => $addr['receiver_name'] ?? ($order->user ? $order->user->name : 'Recipient'),
                    'phone_number'   => $addr['phone_number'] ?? ($order->user ? $order->user->phone : ''),
                    'street_address' => $addr['street_address'] ?? ($addr['street'] ?? ''),
                    'city'           => $addr['city'] ?? '',
                    'province'       => $addr['province'] ?? '',
                    'postal_code'    => $addr['postal_code'] ?? '',
                    'label'          => $addr['label'] ?? 'Main Address',
                ],
                'courier_info'      => [
                    'courier_code'       => strtoupper($addr['courier_code'] ?? ($ship ? $ship->courier_company : 'JNE')),
                    'courier_name'       => strtoupper($addr['courier_name'] ?? ($ship ? $ship->courier_company . ' EXPRESS' : 'JNE EXPRESS')),
                    'service_code'       => strtoupper($addr['service_code'] ?? ($ship ? $ship->courier_type : 'REG')),
                    'service_name'       => $addr['service_name'] ?? 'Reguler Delivery',
                    'estimated_delivery' => $addr['estimated_delivery'] ?? '2-3 Days',
                    'tracking_number'    => $trackingNumber,
                ],
                'products'          => $order->items->map(function ($item) {
                    return [
                        'id'            => $item->id,
                        'product_id'    => $item->product_id,
                        'product_name'  => $item->product_name,
                        'product_image' => $item->product ? $item->product->image : '/collection1.png',
                        'color'         => $item->color ?? 'Black',
                        'size'          => $item->size ?? 'M',
                        'quantity'      => $item->quantity,
                        'price'         => (float)$item->price,
                        'subtotal'      => (float)($item->price * $item->quantity),
                    ];
                }),
                'summary'           => [
                    'subtotal'    => (float)$subtotal,
                    'shipping'    => (float)$shippingCost,
                    'discount'    => (float)$discountAmount,
                    'tax'         => (float)$taxAmount,
                    'grand_total' => (float)$grandTotal,
                ],
                'payment_info'      => [
                    'method'         => strtoupper($addr['payment_method'] ?? ($pay ? $pay->payment_type : 'QRIS')),
                    'payment_status' => $pay ? $pay->payment_status : 'unpaid',
                    'snap_token'     => $pay ? $pay->snap_token : null,
                    'paid_at'        => $pay && $pay->payment_status === 'paid' ? $pay->updated_at->format('d F Y, H:i') : null,
                ],
                'status'            => $order->status,
                'shipping_status'   => $order->status === 'cancel pending' ? 'cancel pending' : ($order->status === 'cancelled' ? 'cancelled' : ($ship ? $ship->status : 'pending')),
                'timeline'          => $timeline,
            ],
        ], 200);
    }

    /**
     * Cancel Pending Order
     * Endpoint: POST /api/orders/{order_number}/cancel
     */
    public function cancel(Request $request, $order_number)
    {
        $user = $this->getUser($request);
        $order = Order::where('order_number', $order_number)->first();

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        if (in_array(strtolower($order->status), ['delivered', 'completed', 'cancelled', 'dibatalkan'])) {
            return response()->json([
                'status'  => false,
                'message' => 'This order cannot be cancelled at its current stage.',
            ], 400);
        }

        // If order is already paid, requires admin verification ('cancel pending'). If unpaid, cancel instantly ('cancelled').
        $isPaid = $order->payment && in_array(strtolower($order->payment->payment_status), ['paid', 'settled', 'success']);
        $newStatus = $isPaid ? 'cancel pending' : 'cancelled';

        $order->update(['status' => $newStatus]);
        if ($order->shipment) {
            $order->shipment->update(['status' => $newStatus]);
        }
        if (!$isPaid && $order->payment) {
            $order->payment->update(['payment_status' => 'cancelled']);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Order cancellation request submitted successfully',
            'data'    => $order->load('items', 'payment', 'shipment'),
        ], 200);
    }

    /**
     * Admin: List All Orders in System
     * Endpoint: GET /api/admin/orders
     */
    public function adminOrders(Request $request)
    {
        $orders = Order::with(['user', 'items', 'payment', 'shipment'])->latest()->get();
        return response()->json([
            'status' => true,
            'data'   => $orders,
        ], 200);
    }

    /**
     * Admin: Update Shipment & Tracking Resi Info
     * Endpoint: PUT /api/admin/orders/{order_number}/shipment
     */
    public function adminUpdateShipment(Request $request, $order_number)
    {
        $order = Order::where('order_number', $order_number)->first();
        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        if ($order->shipment) {
            $order->shipment->update(array_filter([
                'tracking_number'   => $request->tracking_number,
                'biteship_order_id' => $request->biteship_order_id,
                'courier_company'   => $request->courier_company,
                'courier_type'      => $request->courier_type,
                'status'            => $request->status,
            ]));
        }

        if ($request->has('order_status')) {
            $order->update(['status' => $request->order_status]);
            if (in_array(strtolower($request->order_status), ['cancelled', 'dibatalkan']) && $order->payment) {
                $order->payment->update(['payment_status' => 'cancelled']);
            }
        }

        return response()->json([
            'status'  => true,
            'message' => 'Shipment tracking information updated successfully',
            'data'    => $order->load('shipment', 'payment', 'items'),
        ], 200);
    }
}
