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
            $calcSubtotal = $order->items->sum(function($i) {
                $rawP = (float)$i->price;
                $itemP = ($rawP > 50000000) ? round($rawP / 15000) : $rawP;
                $priceIdr = $itemP < 1000 ? $itemP * 1000 : $itemP;
                return $priceIdr * $i->quantity;
            });
            $shipCost = $order->shipment ? $order->shipment->shipping_cost : 0;
            $calcTotal = max(0, $calcSubtotal + $shipCost);

            return [
                'order_number'    => $order->order_number,
                'order_date'      => \Carbon\Carbon::parse($order->created_at)->format('d M Y, H:i'),
                'status'          => $order->status,
                'total'           => (float)$calcTotal,
                'payment_status'  => $pay ? $pay->payment_status : 'unpaid',
                'payment_method'  => $pay ? strtoupper($pay->payment_type ?? 'QRIS') : 'QRIS',
                'shipping_status' => $order->status === 'cancel pending' ? 'cancel pending' : ($order->status === 'cancelled' ? 'cancelled' : ($ship ? $ship->status : 'pending')),
                'tracking_number' => $ship && $ship->tracking_number ? $ship->tracking_number : null,
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

        $subtotal = $order->items->sum(function($i) {
            $rawP = (float)$i->price;
            $itemP = ($rawP > 50000000) ? round($rawP / 15000) : $rawP;
            $priceIdr = $itemP < 1000 ? $itemP * 1000 : $itemP;
            return $priceIdr * $i->quantity;
        });
        $shippingCost = $addr['shipping_cost'] ?? ($ship ? $ship->shipping_cost : 0);
        $discountAmount = $addr['discount_amount'] ?? 0;
        $grandTotal = max(0, $subtotal - $discountAmount + $shippingCost);

        $trackingNumber = $ship && $ship->tracking_number ? $ship->tracking_number : null;

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
                'order_date'        => \Carbon\Carbon::parse($order->created_at)->format('d F Y, H:i') . ' WIB',
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
                    'courier_code'       => strtoupper($ship && $ship->courier_company ? $ship->courier_company : ($addr['courier_code'] ?? 'JNE')),
                    'courier_name'       => strtoupper($ship && $ship->courier_company ? $ship->courier_company : ($addr['courier_name'] ?? 'JNE EXPRESS')),
                    'service_code'       => strtoupper($addr['service_code'] ?? ($ship ? $ship->courier_type : 'REG')),
                    'service_name'       => $addr['service_name'] ?? 'Reguler Delivery',
                    'estimated_delivery' => $addr['estimated_delivery'] ?? '2-3 Days',
                    'tracking_number'    => $trackingNumber,
                ],
                'products'          => $order->items->map(function ($item) {
                    $rawP = (float)$item->price;
                    $itemP = ($rawP > 50000000) ? round($rawP / 15000) : $rawP;
                    $priceIdr = $itemP < 1000 ? $itemP * 1000 : $itemP;
                    $subtotalIdr = $priceIdr * $item->quantity;
                    return [
                        'id'            => $item->id,
                        'product_id'    => $item->product_id,
                        'product_name'  => $item->product_name,
                        'product_image' => $item->product ? $item->product->image : '/collection1.png',
                        'color'         => $item->color,
                        'size'          => $item->size,
                        'quantity'      => $item->quantity,
                        'price'         => (float)$priceIdr,
                        'subtotal'      => (float)$subtotalIdr,
                    ];
                }),
                'summary'           => [
                    'subtotal'    => (float)$subtotal,
                    'shipping'    => (float)$shippingCost,
                    'discount'    => (float)$discountAmount,
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

        $formatted = $orders->map(function ($order) {
            $calcSubtotal = $order->items->sum(function($i) {
                $rawP = (float)$i->price;
                $itemP = ($rawP > 50000000) ? round($rawP / 15000) : $rawP;
                $priceIdr = $itemP < 1000 ? $itemP * 1000 : $itemP;
                return $priceIdr * $i->quantity;
            });
            $shipCost = $order->shipment ? (float)$order->shipment->shipping_cost : 0;
            $grandTotal = (float)$order->grand_total > 0 ? (float)$order->grand_total : max(0, $calcSubtotal + $shipCost);

            $rawShipStatus = $order->shipment ? strtoupper($order->shipment->status) : strtoupper($order->status);
            $shipStatus = in_array($rawShipStatus, ['ALLOCATED', 'IN PROCESS', 'PENDING', 'ORDERED', '']) ? 'IN PROCESSING' : $rawShipStatus;

            return [
                'id'              => $order->id,
                'order_number'    => $order->order_number,
                'user_id'         => $order->user_id,
                'customer_name'   => $order->user ? $order->user->name : ($order->shipping_name ?: 'Guest Customer'),
                'customer_email'  => $order->user ? $order->user->email : ($order->shipping_email ?: 'guest@sectormadness.com'),
                'total'           => $grandTotal,
                'payment_status'  => $order->payment ? strtoupper($order->payment->payment_status) : strtoupper($order->status),
                'shipping_status' => $shipStatus,
                'courier'         => $order->shipment ? ($order->shipment->courier_company ?: 'JNE Express') : 'JNE Express',
                'tracking_number' => $order->shipment ? $order->shipment->tracking_number : null,
                'created_at'      => \Carbon\Carbon::parse($order->created_at)->format('Y-m-d H:i:s'),
                'items_count'     => $order->items->sum('quantity'),
                'items'           => $order->items,
            ];
        });

        return response()->json([
            'status' => true,
            'data'   => $formatted,
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

        $newStatus = $request->shipping_status ?: $request->status ?: $request->order_status;
        $courier = $request->courier ?: $request->courier_company ?: 'JNE Express';
        $trackingNumber = $request->tracking_number;

        if ($newStatus) {
            $order->update(['status' => strtolower($newStatus)]);
        }

        $shipment = \App\Models\OrderShipment::firstOrCreate(
            ['order_id' => $order->id],
            [
                'courier_company' => $courier,
                'status'          => strtolower((string)$newStatus) ?: 'in processing',
                'shipping_cost'   => 0,
            ]
        );

        $shipmentData = [];
        if ($newStatus) {
            $shipmentData['status'] = strtolower((string)$newStatus);
        }
        if ($courier) {
            $shipmentData['courier_company'] = $courier;
        }
        if ($trackingNumber !== null) {
            $shipmentData['tracking_number'] = $trackingNumber;
        }

        $shipment->update($shipmentData);

        if (in_array(strtolower((string)$newStatus), ['cancelled', 'dibatalkan']) && $order->payment) {
            $order->payment->update(['payment_status' => 'cancelled']);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Shipment tracking information updated successfully',
            'data'    => $order->load('shipment', 'payment', 'items'),
        ], 200);
    }

    /**
     * Customer: Confirm Order Received (Marks Order as Completed & Delivered)
     * Endpoint: POST /api/orders/{order_number}/confirm-received
     */
    public function confirmReceived(Request $request, $order_number)
    {
        $order = Order::where('order_number', $order_number)->first();

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        $order->update(['status' => 'completed']);

        if ($order->shipment) {
            $order->shipment->update(['status' => 'completed']);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Order confirmed as received successfully',
            'data'    => $order->load('shipment', 'payment', 'items'),
        ], 200);
    }
}
