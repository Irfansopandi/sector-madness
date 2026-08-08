<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Helper to verify Admin authorization
     */
    // checkAdmin handled by middleware

    /**
     * Laporan Penjualan (Sales Report)
     * GET /api/admin/reports/sales?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
     */
    public function sales(Request $request)
    {
        $startDateInput = $request->query('start_date');
        $endDateInput = $request->query('end_date');

        if (!$startDateInput || !$endDateInput) {
            return response()->json([
                'status' => false,
                'message' => 'Tanggal mulai dan tanggal akhir wajib diisi.'
            ], 422);
        }

        try {
            $startDate = Carbon::parse($startDateInput)->startOfDay();
            $endDate = Carbon::parse($endDateInput)->endOfDay();
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD.'
            ], 422);
        }

        if ($startDate->gt($endDate)) {
            return response()->json([
                'status' => false,
                'message' => 'Tanggal mulai tidak boleh lebih besar daripada tanggal akhir.'
            ], 422);
        }

        // Query orders within date range with relations
        $rawOrders = Order::with(['user', 'items', 'payment', 'shipment'])
            ->where('created_at', '>=', $startDate)
            ->where('created_at', '<=', $endDate)
            ->orderBy('created_at', 'desc')
            ->get();

        // Exclude cancelled orders
        $validOrders = $rawOrders->reject(function ($ord) {
            $st = strtoupper((string)($ord->status ?? ''));
            $shipSt = strtoupper((string)($ord->shipment ? $ord->shipment->status : ''));
            $paySt = strtoupper((string)($ord->payment ? $ord->payment->payment_status : ''));
            return in_array($st, ['CANCELLED', 'CANCELED', 'DIBATALKAN']) ||
                   in_array($shipSt, ['CANCELLED', 'CANCELED', 'DIBATALKAN']) ||
                   in_array($paySt, ['CANCELLED', 'CANCELED', 'DIBATALKAN']);
        })->values();

        // Optional status filter
        $statusInput = strtolower(trim((string)$request->query('status', 'all')));
        if (!empty($statusInput) && $statusInput !== 'all') {
            $validOrders = $validOrders->filter(function ($ord) use ($statusInput) {
                $st = strtolower((string)($ord->status ?? ''));
                if ($statusInput === 'completed') {
                    return in_array($st, ['completed', 'delivered']);
                }
                if ($statusInput === 'shipped') {
                    return in_array($st, ['shipped', 'delivering']);
                }
                if ($statusInput === 'processing') {
                    return in_array($st, ['processing', 'in_processing', 'pending', 'in processing']);
                }
                if ($statusInput === 'paid') {
                    $paySt = strtolower((string)($ord->payment ? $ord->payment->payment_status : ''));
                    return $st === 'paid' || $paySt === 'paid';
                }
                return $st === $statusInput;
            })->values();
        }

        $totalRevenue = 0;
        $totalItemsSold = 0;
        $orderList = [];

        foreach ($validOrders as $order) {
            $calcSubtotal = $order->items->sum(function($item) {
                $rawP = (float)$item->price;
                $itemP = ($rawP > 50000000) ? round($rawP / 15000) : $rawP;
                $priceIdr = $itemP < 1000 ? $itemP * 1000 : $itemP;
                return $priceIdr * $item->quantity;
            });
            $shipCost = $order->shipment ? (float)$order->shipment->shipping_cost : 0;
            $orderTotal = (float)($order->grand_total ?? 0) > 0 
                ? (float)$order->grand_total 
                : ((float)($order->total_amount ?? 0) > 0 ? (float)$order->total_amount : max(0, $calcSubtotal + $shipCost));

            $itemsCount = $order->items->sum('quantity');
            $totalRevenue += $orderTotal;
            $totalItemsSold += $itemsCount;

            $customerName = 'Guest Customer';
            $customerEmail = '-';
            if ($order->user) {
                $customerName = $order->user->name ?? trim(($order->user->first_name ?? '') . ' ' . ($order->user->last_name ?? ''));
                if (empty($customerName)) {
                    $customerName = $order->user->email ? explode('@', $order->user->email)[0] : 'Customer';
                }
                $customerEmail = $order->user->email ?? '-';
            } else if (!empty($order->shipping_address)) {
                $addr = is_array($order->shipping_address) ? $order->shipping_address : json_decode($order->shipping_address, true);
                if (is_array($addr)) {
                    $customerName = $addr['recipient_name'] ?? $addr['name'] ?? 'Guest Customer';
                    $customerEmail = $addr['email'] ?? '-';
                }
            }

            $orderList[] = [
                'id'             => $order->id,
                'order_number'   => $order->order_number,
                'created_at'     => $order->created_at->format('Y-m-d H:i:s'),
                'created_at_fmt' => $order->created_at->locale('id')->isoFormat('D MMMM YYYY, HH:mm'),
                'customer_name'  => $customerName,
                'customer_email' => $customerEmail,
                'items_count'    => (int)$itemsCount,
                'status'         => $order->status,
                'payment_status' => $order->payment ? $order->payment->payment_status : 'unpaid',
                'total_amount'   => (float)$orderTotal,
            ];
        }

        return response()->json([
            'status' => true,
            'data' => [
                'period' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date'   => $endDate->format('Y-m-d'),
                    'start_fmt'  => $startDate->locale('id')->isoFormat('D MMMM YYYY'),
                    'end_fmt'    => $endDate->locale('id')->isoFormat('D MMMM YYYY'),
                ],
                'summary' => [
                    'total_revenue'    => (float)$totalRevenue,
                    'total_orders'     => (int)$validOrders->count(),
                    'total_items_sold' => (int)$totalItemsSold,
                ],
                'orders' => $orderList,
            ]
        ], 200);
    }

    /**
     * Laporan Customer (Customer Report)
     * GET /api/admin/reports/customers?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
     */
    public function customers(Request $request)
    {
        $startDateInput = $request->query('start_date');
        $endDateInput = $request->query('end_date');

        if (!$startDateInput || !$endDateInput) {
            return response()->json([
                'status' => false,
                'message' => 'Tanggal mulai dan tanggal akhir wajib diisi.'
            ], 422);
        }

        try {
            $startDate = Carbon::parse($startDateInput)->startOfDay();
            $endDate = Carbon::parse($endDateInput)->endOfDay();
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD.'
            ], 422);
        }

        if ($startDate->gt($endDate)) {
            return response()->json([
                'status' => false,
                'message' => 'Tanggal mulai tidak boleh lebih besar daripada tanggal akhir.'
            ], 422);
        }

        // Query valid orders within period with user relation
        $rawOrders = Order::with(['user', 'items', 'payment', 'shipment'])
            ->where('created_at', '>=', $startDate)
            ->where('created_at', '<=', $endDate)
            ->orderBy('created_at', 'desc')
            ->get();

        // Exclude cancelled orders
        $validOrders = $rawOrders->reject(function ($ord) {
            $st = strtoupper((string)($ord->status ?? ''));
            $shipSt = strtoupper((string)($ord->shipment ? $ord->shipment->status : ''));
            $paySt = strtoupper((string)($ord->payment ? $ord->payment->payment_status : ''));
            return in_array($st, ['CANCELLED', 'CANCELED', 'DIBATALKAN']) ||
                   in_array($shipSt, ['CANCELLED', 'CANCELED', 'DIBATALKAN']) ||
                   in_array($paySt, ['CANCELLED', 'CANCELED', 'DIBATALKAN']);
        })->values();

        // Group valid orders by customer (user_id or guest email)
        $groupedCustomers = [];

        foreach ($validOrders as $order) {
            $calcSubtotal = $order->items->sum(function($item) {
                $rawP = (float)$item->price;
                $itemP = ($rawP > 50000000) ? round($rawP / 15000) : $rawP;
                $priceIdr = $itemP < 1000 ? $itemP * 1000 : $itemP;
                return $priceIdr * $item->quantity;
            });
            $shipCost = $order->shipment ? (float)$order->shipment->shipping_cost : 0;
            $orderTotal = (float)($order->grand_total ?? 0) > 0 
                ? (float)$order->grand_total 
                : ((float)($order->total_amount ?? 0) > 0 ? (float)$order->total_amount : max(0, $calcSubtotal + $shipCost));

            $userId = $order->user_id;
            $userEmail = $order->user ? $order->user->email : null;
            if (!$userEmail && !empty($order->shipping_address)) {
                $addr = is_array($order->shipping_address) ? $order->shipping_address : json_decode($order->shipping_address, true);
                if (is_array($addr)) {
                    $userEmail = $addr['email'] ?? null;
                }
            }

            $key = $userId ? "user_{$userId}" : "email_" . ($userEmail ?? "guest_{$order->id}");

            if (!isset($groupedCustomers[$key])) {
                $customerName = 'Guest Customer';
                if ($order->user) {
                    $customerName = $order->user->name ?? trim(($order->user->first_name ?? '') . ' ' . ($order->user->last_name ?? ''));
                    if (empty($customerName)) {
                        $customerName = $order->user->email ? explode('@', $order->user->email)[0] : 'Customer';
                    }
                } else if (!empty($order->shipping_address)) {
                    $addr = is_array($order->shipping_address) ? $order->shipping_address : json_decode($order->shipping_address, true);
                    if (is_array($addr)) {
                        $customerName = $addr['recipient_name'] ?? $addr['name'] ?? 'Guest Customer';
                    }
                }

                $groupedCustomers[$key] = [
                    'user_id'            => $userId,
                    'customer_name'      => $customerName,
                    'customer_email'     => $userEmail ?? '-',
                    'valid_orders_count' => 0,
                    'total_spent'        => 0,
                    'last_order_date'    => $order->created_at->format('Y-m-d H:i:s'),
                    'last_order_fmt'     => $order->created_at->locale('id')->isoFormat('D MMMM YYYY, HH:mm'),
                ];
            }

            $groupedCustomers[$key]['valid_orders_count'] += 1;
            $groupedCustomers[$key]['total_spent'] += $orderTotal;

            // Keep the latest order date (orders are sorted created_at desc)
            if ($order->created_at->gt(Carbon::parse($groupedCustomers[$key]['last_order_date']))) {
                $groupedCustomers[$key]['last_order_date'] = $order->created_at->format('Y-m-d H:i:s');
                $groupedCustomers[$key]['last_order_fmt']  = $order->created_at->locale('id')->isoFormat('D MMMM YYYY, HH:mm');
            }
        }

        $customerList = array_values($groupedCustomers);

        // Sort customer list by total_spent descending
        usort($customerList, function($a, $b) {
            return $b['total_spent'] <=> $a['total_spent'];
        });

        $totalCustomers = count($customerList);
        $totalOrdersSum = array_sum(array_column($customerList, 'valid_orders_count'));
        $totalSpentSum = array_sum(array_column($customerList, 'total_spent'));

        return response()->json([
            'status' => true,
            'data' => [
                'period' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date'   => $endDate->format('Y-m-d'),
                    'start_fmt'  => $startDate->locale('id')->isoFormat('D MMMM YYYY'),
                    'end_fmt'    => $endDate->locale('id')->isoFormat('D MMMM YYYY'),
                ],
                'summary' => [
                    'total_customers'  => (int)$totalCustomers,
                    'total_orders'     => (int)$totalOrdersSum,
                    'total_spent'      => (float)$totalSpentSum,
                ],
                'customers' => $customerList,
            ]
        ], 200);
    }
}
