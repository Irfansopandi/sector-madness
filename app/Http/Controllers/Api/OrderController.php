<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // checkAdmin handled by middleware

    /**
     * Dapatkan user aktif atau fallback ke customer demo.
     */
    private function getUser(Request $request)
    {
        $user = $request->user('sanctum') ?: $request->user();
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
        // Auto-complete delivered orders older than 5 days
        Order::where('user_id', $user->id)
            ->where('updated_at', '<=', now()->subDays(5))
            ->where(function ($q) {
                $q->whereIn('status', ['delivered', 'delivering', 'shipped'])
                  ->orWhereHas('shipment', function ($sq) {
                      $sq->whereIn('status', ['delivered', 'delivering', 'shipped']);
                  });
            })
            ->get()
            ->each(function ($ord) {
                $ord->update(['status' => 'completed']);
                if ($ord->shipment) {
                    $ord->shipment->update(['status' => 'completed']);
                }
            });

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
        
        $query = Order::with(['items.product', 'payment', 'shipment'])
            ->where('order_number', $order_number);

        // Strict ownership check: non-admin users can only access their own orders
        if (!$user || !($user instanceof \App\Models\Admin)) {
            if (!$user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Authentication required',
                ], 401);
            }
            $query->where('user_id', $user->id);
        }

        $order = $query->first();

        if (!$order) {
            return response()->json([
                'status'  => false,
                'message' => 'Order record not found or unauthorized access',
            ], 404);
        }

        // Auto-complete if order in delivery status and older than 5 days
        $isDeliveredStatus = in_array(strtolower($order->status), ['delivered', 'delivering', 'shipped']) ||
            ($order->shipment && in_array(strtolower($order->shipment->status), ['delivered', 'delivering', 'shipped']));
        if ($isDeliveredStatus && $order->updated_at <= now()->subDays(5)) {
            $order->update(['status' => 'completed']);
            if ($order->shipment) {
                $order->shipment->update(['status' => 'completed']);
            }
            $order->refresh();
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

        $customerUser = $order->user;
        $customerName = $customerUser ? $customerUser->name : ($order->shipping_name ?: ($addr['receiver_name'] ?? 'Customer'));
        $customerEmail = $customerUser ? $customerUser->email : ($order->shipping_email ?: 'guest@sectormadness.com');
        $customerPhone = $customerUser ? ($customerUser->phone ?: ($addr['phone_number'] ?? '')) : ($addr['phone_number'] ?? '');

        $shippingReceiver = $addr['receiver_name'] ?? ($customerUser ? $customerUser->name : 'Recipient');
        $shippingPhone = $addr['phone_number'] ?? ($customerUser ? $customerUser->phone : '');

        return response()->json([
            'status' => true,
            'data'   => [
                'order_number'      => $order->order_number,
                'order_date'        => \Carbon\Carbon::parse($order->created_at)->format('d F Y, H:i') . ' WIB',
                'customer_info'     => [
                    'name'  => $customerName,
                    'email' => $customerEmail,
                    'phone' => $customerPhone,
                ],
                'shipping_address'  => [
                    'receiver_name'  => $shippingReceiver,
                    'phone_number'   => $shippingPhone,
                    'street_address' => $addr['street_address'] ?? ($addr['street'] ?? ''),
                    'district'       => $addr['district'] ?? ($addr['district_name'] ?? ''),
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
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Authentication required'], 401);
        }

        $order = Order::where('order_number', $order_number)->first();

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        if ($order->user_id !== $user->id) {
            return response()->json(['status' => false, 'message' => 'Unauthorized access to this order'], 403);
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

            $addr = $order->shipping_address ?? [];
            $customerUser = $order->user;
            $customerName = $customerUser ? $customerUser->name : ($order->shipping_name ?: ($addr['receiver_name'] ?? 'Guest Customer'));
            $customerEmail = $customerUser ? $customerUser->email : ($order->shipping_email ?: 'guest@sectormadness.com');
            $customerPhone = $customerUser ? ($customerUser->phone ?: ($addr['phone_number'] ?? '')) : ($addr['phone_number'] ?? '');

            return [
                'id'              => $order->id,
                'order_number'    => $order->order_number,
                'user_id'         => $order->user_id,
                'customer_name'   => $customerName,
                'customer_email'  => $customerEmail,
                'customer_phone'  => $customerPhone,
                'shipping_address'=> $addr,
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
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Authentication required'], 401);
        }

        $order = Order::where('order_number', $order_number)->first();

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        if ($order->user_id !== $user->id) {
            return response()->json(['status' => false, 'message' => 'Unauthorized access to this order'], 403);
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

    /**
     * Admin: Get Sales Trend and Top Products Chart Analytics
     * Endpoint: GET /api/admin/dashboard-charts?period=week|month|3months|year
     */
    public function adminDashboardCharts(Request $request)
    {
        $period = strtolower((string)$request->query('period', 'month'));
        if (!in_array($period, ['week', 'month', '3months', 'year'])) {
            $period = 'month';
        }

        $now = \Carbon\Carbon::now();
        switch ($period) {
            case 'week':
                $startDate = $now->copy()->subDays(6)->startOfDay();
                break;
            case '3months':
                $startDate = $now->copy()->subDays(89)->startOfDay();
                break;
            case 'year':
                $startDate = $now->copy()->subMonths(11)->startOfMonth();
                break;
            case 'month':
            default:
                $startDate = $now->copy()->subDays(29)->startOfDay();
                break;
        }

        // Fetch valid non-cancelled orders within period
        $orders = Order::with(['items', 'payment', 'shipment'])
            ->where('created_at', '>=', $startDate)
            ->get()
            ->reject(function ($ord) {
                $st = strtoupper((string)($ord->status ?? ''));
                $shipSt = strtoupper((string)($ord->shipment ? $ord->shipment->status : ''));
                $paySt = strtoupper((string)($ord->payment ? $ord->payment->payment_status : ''));
                return in_array($st, ['CANCELLED', 'CANCELED', 'DIBATALKAN']) ||
                       in_array($shipSt, ['CANCELLED', 'CANCELED', 'DIBATALKAN']) ||
                       in_array($paySt, ['CANCELLED', 'CANCELED', 'DIBATALKAN']);
            });

        // 1. Group Sales Trend Data based on period
        $salesTrend = [];
        if ($period === 'week') {
            for ($i = 6; $i >= 0; $i--) {
                $day = $now->copy()->subDays($i);
                $dayStr = $day->format('Y-m-d');
                $label = $day->locale('id')->isoFormat('dddd, D MMM');
                
                $dayOrders = $orders->filter(fn($o) => \Carbon\Carbon::parse($o->created_at)->format('Y-m-d') === $dayStr);
                $revenue = $dayOrders->sum(function($order) {
                    $calcSubtotal = $order->items->sum(function($item) {
                        $rawP = (float)$item->price;
                        $itemP = ($rawP > 50000000) ? round($rawP / 15000) : $rawP;
                        $priceIdr = $itemP < 1000 ? $itemP * 1000 : $itemP;
                        return $priceIdr * $item->quantity;
                    });
                    $shipCost = $order->shipment ? (float)$order->shipment->shipping_cost : 0;
                    return (float)$order->grand_total > 0 ? (float)$order->grand_total : max(0, $calcSubtotal + $shipCost);
                });
                
                $salesTrend[] = [
                    'label' => $label,
                    'revenue' => (float)$revenue,
                    'orders_count' => $dayOrders->count(),
                ];
            }
        } else if ($period === 'month') {
            for ($i = 29; $i >= 0; $i--) {
                $day = $now->copy()->subDays($i);
                $dayStr = $day->format('Y-m-d');
                $label = $day->locale('id')->isoFormat('D MMM');
                
                $dayOrders = $orders->filter(fn($o) => \Carbon\Carbon::parse($o->created_at)->format('Y-m-d') === $dayStr);
                $revenue = $dayOrders->sum(function($order) {
                    $calcSubtotal = $order->items->sum(function($item) {
                        $rawP = (float)$item->price;
                        $itemP = ($rawP > 50000000) ? round($rawP / 15000) : $rawP;
                        $priceIdr = $itemP < 1000 ? $itemP * 1000 : $itemP;
                        return $priceIdr * $item->quantity;
                    });
                    $shipCost = $order->shipment ? (float)$order->shipment->shipping_cost : 0;
                    return (float)$order->grand_total > 0 ? (float)$order->grand_total : max(0, $calcSubtotal + $shipCost);
                });

                $salesTrend[] = [
                    'label' => $label,
                    'revenue' => (float)$revenue,
                    'orders_count' => $dayOrders->count(),
                ];
            }
        } else if ($period === '3months') {
            for ($i = 11; $i >= 0; $i--) {
                $weekStart = $now->copy()->subWeeks($i)->startOfWeek();
                $weekEnd = $now->copy()->subWeeks($i)->endOfWeek();
                $label = 'Minggu ' . (12 - $i) . ' (' . $weekStart->format('d/m') . ')';

                $wOrders = $orders->filter(function($o) use ($weekStart, $weekEnd) {
                    $cAt = \Carbon\Carbon::parse($o->created_at);
                    return $cAt->between($weekStart, $weekEnd);
                });

                $revenue = $wOrders->sum(function($order) {
                    $calcSubtotal = $order->items->sum(function($item) {
                        $rawP = (float)$item->price;
                        $itemP = ($rawP > 50000000) ? round($rawP / 15000) : $rawP;
                        $priceIdr = $itemP < 1000 ? $itemP * 1000 : $itemP;
                        return $priceIdr * $item->quantity;
                    });
                    $shipCost = $order->shipment ? (float)$order->shipment->shipping_cost : 0;
                    return (float)$order->grand_total > 0 ? (float)$order->grand_total : max(0, $calcSubtotal + $shipCost);
                });

                $salesTrend[] = [
                    'label' => $label,
                    'revenue' => (float)$revenue,
                    'orders_count' => $wOrders->count(),
                ];
            }
        } else if ($period === 'year') {
            for ($i = 11; $i >= 0; $i--) {
                $m = $now->copy()->subMonths($i);
                $mStr = $m->format('Y-m');
                $label = $m->locale('id')->isoFormat('MMM YYYY');

                $mOrders = $orders->filter(fn($o) => \Carbon\Carbon::parse($o->created_at)->format('Y-m') === $mStr);
                $revenue = $mOrders->sum(function($order) {
                    $calcSubtotal = $order->items->sum(function($item) {
                        $rawP = (float)$item->price;
                        $itemP = ($rawP > 50000000) ? round($rawP / 15000) : $rawP;
                        $priceIdr = $itemP < 1000 ? $itemP * 1000 : $itemP;
                        return $priceIdr * $item->quantity;
                    });
                    $shipCost = $order->shipment ? (float)$order->shipment->shipping_cost : 0;
                    return (float)$order->grand_total > 0 ? (float)$order->grand_total : max(0, $calcSubtotal + $shipCost);
                });

                $salesTrend[] = [
                    'label' => $label,
                    'revenue' => (float)$revenue,
                    'orders_count' => $mOrders->count(),
                ];
            }
        }

        // 2. Aggregate Top 6 Products from valid orders
        $productsMap = [];
        $catalogProducts = \App\Models\Product::all();

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $pId = $item->product_id ?: $item->id;
                $rawName = $item->product_name ?: 'Product #' . $pId;
                $qty = (int)$item->quantity;

                // Match catalog product
                $matched = $catalogProducts->first(function($p) use ($pId, $rawName) {
                    if ((string)$p->id === (string)$pId) return true;
                    $pName = strtolower(trim($p->name ?? ''));
                    $iName = strtolower(trim($rawName));
                    return $pName && $iName && ($pName === $iName || str_contains($pName, $iName) || str_contains($iName, $pName));
                });

                $displayName = $matched ? $matched->name : $rawName;
                $rawP = (float)($matched ? $matched->price : $item->price);
                $unitPrice = $rawP < 1000 ? $rawP * 1000 : $rawP;

                if (!isset($productsMap[$displayName])) {
                    $productsMap[$displayName] = [
                        'product_id' => $pId,
                        'product_name' => $displayName,
                        'quantity_sold' => 0,
                        'revenue' => 0,
                    ];
                }
                $productsMap[$displayName]['quantity_sold'] += $qty;
                $productsMap[$displayName]['revenue'] += ($unitPrice * $qty);
            }
        }

        $topProducts = array_values($productsMap);
        usort($topProducts, function($a, $b) {
            if ($b['quantity_sold'] === $a['quantity_sold']) {
                return $b['revenue'] <=> $a['revenue'];
            }
            return $b['quantity_sold'] <=> $a['quantity_sold'];
        });

        $top6Products = array_slice($topProducts, 0, 6);

        return response()->json([
            'status' => true,
            'period' => $period,
            'sales' => $salesTrend,
            'top_products' => $top6Products,
        ], 200);
    }
}
