<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\OrderShipment;
use App\Models\Product;
use App\Models\ShippingAddress;
use App\Models\User;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    /**
     * Helper get user (support Sanctum & guest/demo testing fallback)
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
     * Get Dynamic Active Payment Methods from Backend
     * Endpoint: GET /api/payment-methods
     */
    public function paymentMethods()
    {
        $methods = [
            [
                'id'          => 'bni_va',
                'name'        => 'BNI Virtual Account',
                'category'    => 'Virtual Account',
                'description' => 'Automated real-time confirmation via Bank Negara Indonesia VA',
                'icon'        => 'bank',
                'is_active'   => true,
            ],
            [
                'id'          => 'mandiri_va',
                'name'        => 'Mandiri Virtual Account',
                'category'    => 'Virtual Account',
                'description' => 'Automated transaction clearing via Bank Mandiri VA network',
                'icon'        => 'bank',
                'is_active'   => true,
            ],
            [
                'id'          => 'bri_va',
                'name'        => 'BRI Virtual Account',
                'category'    => 'Virtual Account',
                'description' => 'Automated payment processing through Bank Rakyat Indonesia BRIVA',
                'icon'        => 'bank',
                'is_active'   => true,
            ],
        ];

        return response()->json([
            'status' => true,
            'data'   => $methods,
        ], 200);
    }

    /**
     * Check & Validate Voucher Promo
     * Endpoint: POST /api/voucher/check
     */
    public function checkVoucher(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => 'Please enter a voucher code.'], 400);
        }

        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
        }
        $cart = Cart::where('user_id', $user->id)->first();

        $subtotal = 0;
        if ($cart) {
            $items = $cart->items()->with('product')->get();
            foreach ($items as $item) {
                $rawPrice = (float)($item->product ? $item->product->price : $item->price);
                $priceIdr = $rawPrice < 1000 ? $rawPrice * 1000 : $rawPrice;
                $subtotal += ($priceIdr * $item->quantity);
            }
        }

        $code = strtoupper(trim($request->code));
        $voucher = Voucher::where('code', $code)->first();

        if (!$voucher) {
            return response()->json([
                'status'  => false,
                'message' => 'Voucher code not found or invalid.',
            ], 404);
        }

        if (!$voucher->is_active) {
            return response()->json([
                'status'  => false,
                'message' => 'Voucher code is currently inactive.',
            ], 422);
        }

        if ($voucher->expires_at && $voucher->expires_at < now()) {
            return response()->json([
                'status'  => false,
                'message' => 'Voucher code has expired.',
            ], 422);
        }

        if ($subtotal < (float)$voucher->minimum_purchase) {
            return response()->json([
                'status'  => false,
                'message' => "Minimum purchase of Rp " . number_format($voucher->minimum_purchase, 0, ',', '.') . " is required for this voucher.",
            ], 422);
        }

        $discount = 0;
        if ($subtotal > 0) {
            if ($voucher->discount_type === 'percentage') {
                $discount = ($subtotal * (float)$voucher->discount_value) / 100;
            } else {
                $discount = (float)$voucher->discount_value;
            }
            $discount = min($subtotal, $discount);
        }

        return response()->json([
            'status'  => true,
            'message' => "Voucher applied: {$voucher->name}",
            'data'    => [
                'code'             => $voucher->code,
                'name'             => $voucher->name,
                'discount_amount'  => (float)$discount,
                'minimum_purchase' => (float)$voucher->minimum_purchase,
                'discount_type'    => $voucher->discount_type,
                'discount_value'   => (float)$voucher->discount_value,
                'expires_at'       => $voucher->expires_at ? $voucher->expires_at->format('d M Y') : null,
            ]
        ], 200);
    }

    /**
     * Get Order Summary Calculations directly from Backend
     * Endpoint: GET /api/checkout/summary (dan POST /api/checkout/summary)
     */
    public function summary(Request $request)
    {
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
        }
        $cart = Cart::where('user_id', $user->id)->first();

        $cartItems = $cart ? $cart->items()->with('product')->get() : collect([]);

        $subtotal = 0;
        $formattedItems = [];
        $hasOutOfStock = false;

        foreach ($cartItems as $item) {
            $product = $item->product;
            $rawPrice = (float)($product ? $product->price : $item->price);
            $priceIdr = $rawPrice < 1000 ? $rawPrice * 1000 : $rawPrice;
            $itemTotal = $priceIdr * $item->quantity;
            $subtotal += $itemTotal;

            $variant = $product ? \App\Models\ProductVariant::where('product_id', $product->id)
                ->where('color', $item->color ?: 'Default')
                ->where('size', $item->size ?: 'M')
                ->first() : null;
            $stock = $variant ? $variant->stock : 0;
            if ($stock < $item->quantity) {
                $hasOutOfStock = true;
            }

            $formattedItems[] = [
                'id'            => $item->id,
                'product_id'    => $item->product_id,
                'product_name'  => $product ? $product->name : 'Sector Garment',
                'product_image' => $product ? $product->image : '/collection1.png',
                'color'         => $item->color ?? 'Obsidian',
                'size'          => $item->size ?? 'L',
                'quantity'      => $item->quantity,
                'price'         => $priceIdr,
                'subtotal'      => $itemTotal,
                'in_stock'      => $stock >= $item->quantity,
            ];
        }

        $shippingPrice = (float)$request->get('shipping_price', 0);
        $voucherCode = $request->get('voucher_code');
        $discount = 0;

        if (!empty($voucherCode)) {
            $code = strtoupper(trim($voucherCode));
            $voucher = Voucher::where('code', $code)->first();
            if (
                $voucher &&
                $voucher->is_active &&
                (!$voucher->expires_at || $voucher->expires_at >= now()) &&
                ($subtotal >= (float)$voucher->minimum_purchase)
            ) {
                if ($voucher->discount_type === 'percentage') {
                    $discount = ($subtotal * (float)$voucher->discount_value) / 100;
                } else {
                    $discount = (float)$voucher->discount_value;
                }
                $discount = min($subtotal, $discount);
            }
        }

        // Harga sudah termasuk PPN (Tax Included)
        $tax = 0;
        $grandTotal = max(0, $subtotal - $discount + $shippingPrice);

        return response()->json([
            'status' => true,
            'data'   => [
                'subtotal'       => (float)$subtotal,
                'shipping'       => (float)$shippingPrice,
                'discount'       => (float)$discount,
                'grand_total'    => (float)$grandTotal,
                'items_count'    => $cartItems->sum('quantity'),
                'items'          => $formattedItems,
                'can_checkout'   => ($cartItems->count() > 0 && !$hasOutOfStock),
                'has_out_of_stock' => $hasOutOfStock,
                'currency'       => 'IDR',
            ],
        ], 200);
    }

    /**
     * Validasi Sebelum Pembayaran & Generate Midtrans Snap Token
     * Endpoint: POST /api/payment/create
     */
    public function createPayment(Request $request)
    {
        $user = $this->getUser($request);

        // 1. Validasi Login
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Authentication required. Please login first.'], 401);
        }

        // 2. Validasi Customer & Input Form
        $validator = Validator::make($request->all(), [
            'address_id'         => 'nullable|integer|exists:shipping_addresses,id',
            'receiver_name'      => 'nullable|string',
            'phone_number'       => 'nullable|string',
            'street_address'     => 'nullable|string',
            'district'           => 'nullable|string',
            'province'           => 'nullable|string',
            'city'               => 'nullable|string',
            'postal_code'        => 'nullable|string',
            'courier_code'       => 'required|string',
            'courier_name'       => 'nullable|string',
            'service_code'       => 'required|string',
            'service_name'       => 'nullable|string',
            'shipping_price'     => 'required|numeric|min:0',
            'estimated_delivery' => 'nullable|string',
            'payment_method'     => 'required|string',
            'voucher_code'       => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Pre-payment validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // 3. Validasi Address & Security Ownership Check
        $shippingAddressData = null;
        if ($request->address_id) {
            $addr = ShippingAddress::find($request->address_id);
            if (!$addr) {
                return response()->json(['status' => false, 'message' => 'Selected shipping address not found.'], 422);
            }
            if ($addr->user_id && $user && $addr->user_id != $user->id) {
                return response()->json(['status' => false, 'message' => 'Unauthorized address access. Selected address does not belong to you.'], 403);
            }
            $shippingAddressData = [
                'receiver_name' => $request->receiver_name ?: $addr->receiver_name,
                'phone_number'  => $request->phone_number ?: $addr->phone_number,
                'street_address'=> $request->street_address ?: $addr->street_address,
                'district'      => $request->district ?: ($addr->district ?? ''),
                'city'          => $request->city ?: $addr->city,
                'province'      => $request->province ?: $addr->province,
                'postal_code'   => $request->postal_code ?: $addr->postal_code,
                'label'         => $addr->label ?? 'Main Address',
            ];
        } else {
            if (!$request->street_address || !$request->receiver_name) {
                return response()->json(['status' => false, 'message' => 'Please provide full shipping address details.'], 422);
            }
            $shippingAddressData = [
                'receiver_name' => $request->receiver_name,
                'phone_number'  => $request->phone_number ?? $user->phone,
                'street_address'=> $request->street_address,
                'district'      => $request->district ?? '',
                'city'          => $request->city ?? 'Jakarta',
                'province'      => $request->province ?? 'DKI Jakarta',
                'postal_code'   => $request->postal_code ?? '12110',
                'label'         => 'Custom Address',
            ];
        }

        // 4. Validasi Payment Method
        $validMethods = ['qris', 'gopay', 'shopeepay', 'ovo', 'dana', 'bca_va', 'bni_va', 'bri_va', 'mandiri_va', 'permata_va', 'cimb_va', 'credit_card'];
        if (!in_array(strtolower($request->payment_method), $validMethods)) {
            return response()->json(['status' => false, 'message' => 'Selected payment method is currently unavailable or invalid.'], 422);
        }

        $cart = Cart::where('user_id', $user->id)->first();
        if (!$cart || $cart->items()->count() === 0) {
            return response()->json(['status' => false, 'message' => 'Your shopping bag is empty.'], 400);
        }

        $cartItems = $cart->items()->with('product')->get();

        // 5. Validasi Stock & Validasi Harga Terbaru dari Backend (tanpa mempercayai Frontend)
        $subtotal = 0;
        $itemDetailsForMidtrans = [];
        $dbOrderItems = [];

        foreach ($cartItems as $item) {
            $product = $item->product;
            if (!$product) {
                return response()->json(['status' => false, 'message' => "An item in your bag is no longer active in catalog."], 422);
            }

            $variant = \App\Models\ProductVariant::where('product_id', $product->id)
                ->where('color', $item->color ?: 'Default')
                ->where('size', $item->size ?: 'M')
                ->first();
            $variantStock = $variant ? $variant->stock : 0;

            if ($variantStock < $item->quantity) {
                return response()->json([
                    'status'  => false,
                    'message' => "Insufficient stock for product '{$product->name}' ({$item->color} / {$item->size}). Only {$variantStock} available.",
                ], 422);
            }

            // Gunakan harga terbaru di DB (normalisasi IDR)
            $rawPrice = (float)$product->price;
            $latestPriceIdr = (int)($rawPrice < 1000 ? $rawPrice * 1000 : $rawPrice);
            $itemSubtotal = $latestPriceIdr * $item->quantity;
            $subtotal += $itemSubtotal;

            $itemDetailsForMidtrans[] = [
                'id'       => $product->id,
                'price'    => $latestPriceIdr,
                'quantity' => (int)$item->quantity,
                'name'     => substr($product->name . " [{$item->size}]", 0, 48),
            ];

            $dbOrderItems[] = [
                'product'       => $product,
                'product_id'    => $product->id,
                'product_name'  => $product->name,
                'product_image' => $product->image,
                'color'         => $item->color,
                'size'          => $item->size,
                'quantity'      => $item->quantity,
                'price'         => $latestPriceIdr, // simpan dalam IDR rasmi
                'subtotal'      => $itemSubtotal,
            ];
        }

        // 6. Validasi Voucher (Strict Backend Enforcement)
        $discount = 0;
        $voucherCode = $request->voucher_code;
        if (!empty($voucherCode)) {
            $code = strtoupper(trim($voucherCode));
            $voucher = Voucher::where('code', $code)->first();

            if (!$voucher) {
                return response()->json(['status' => false, 'message' => 'Voucher code not found or invalid.'], 422);
            }
            if (!$voucher->is_active) {
                return response()->json(['status' => false, 'message' => 'Voucher code is currently inactive.'], 422);
            }
            if ($voucher->expires_at && $voucher->expires_at < now()) {
                return response()->json(['status' => false, 'message' => 'Voucher code has expired.'], 422);
            }
            if ($subtotal < (float)$voucher->minimum_purchase) {
                return response()->json([
                    'status'  => false,
                    'message' => "Minimum purchase of Rp " . number_format($voucher->minimum_purchase, 0, ',', '.') . " is required for this voucher.",
                ], 422);
            }

            if ($voucher->discount_type === 'percentage') {
                $discount = (int)(($subtotal * (float)$voucher->discount_value) / 100);
            } else {
                $discount = (int)$voucher->discount_value;
            }
            $discount = min((int)$subtotal, $discount);

            $itemDetailsForMidtrans[] = [
                'id'       => 'VOUCHER-DISC',
                'price'    => -$discount,
                'quantity' => 1,
                'name'     => substr("Voucher ({$voucher->code})", 0, 48),
            ];

            $voucherCode = $voucher->code;
        }

        // --- SERVER-SIDE SHIPPING RATE RECALCULATION & VALIDATION ---
        // DO NOT trust $request->shipping_price from frontend!
        $totalWeightGrams = 0;
        foreach ($cart->items as $item) {
            $w = $item->product ? (int)($item->product->package_weight_grams) : 0;
            if ($w <= 0) $w = 1000;
            $totalWeightGrams += ($w * $item->quantity);
        }
        if ($totalWeightGrams <= 0) $totalWeightGrams = 1000;

        $shippingRequest = new \Illuminate\Http\Request();
        $shippingRequest->replace([
            'destination_area_id'  => $request->destination_area_id ?: ($shippingAddressData['area_id'] ?? null),
            'city'                 => $shippingAddressData['city'] ?? null,
            'province'             => $shippingAddressData['province'] ?? null,
            'district'             => $shippingAddressData['district'] ?? null,
            'destination_postcode' => $shippingAddressData['postal_code'] ?? null,
            'weight'               => $totalWeightGrams,
            'couriers'             => strtolower($request->courier_code),
        ]);

        $shippingController = app(\App\Http\Controllers\Api\ShippingController::class);
        $ratesResponse = $shippingController->rates($shippingRequest);
        $ratesData = $ratesResponse->getData(true);

        $normalizeCourier = function($code) {
            $c = strtoupper(trim($code ?? ''));
            if (in_array($c, ['J&T', 'JET', 'JNT', 'J&T EXPRESS', 'J&T LOGISTICS'])) return 'JNT';
            if (in_array($c, ['GO-SEND', 'GOSEND', 'GOJEK', 'GOSEND INSTANT'])) return 'GOSEND';
            if (in_array($c, ['JNE', 'JNE EXPRESS', 'JNE LOGISTICS'])) return 'JNE';
            if (in_array($c, ['SICEPAT', 'SI CEPAT', 'SICEPAT EXPRESS'])) return 'SICEPAT';
            return $c;
        };

        $validShippingCost = null;
        $reqCourierNorm = $normalizeCourier($request->courier_code);
        $reqService = strtoupper(trim($request->service_code ?? ''));

        if (isset($ratesData['status']) && $ratesData['status'] === true && !empty($ratesData['data'])) {
            // 1. Exact courier + exact service match
            foreach ($ratesData['data'] as $rate) {
                if (
                    $normalizeCourier($rate['courier_code'] ?? '') === $reqCourierNorm &&
                    strtoupper(trim($rate['service_code'] ?? '')) === $reqService
                ) {
                    $validShippingCost = (int) $rate['shipping_price'];
                    break;
                }
            }

            // 2. Exact courier match with any available service (if service code differs slightly)
            if ($validShippingCost === null) {
                foreach ($ratesData['data'] as $rate) {
                    if ($normalizeCourier($rate['courier_code'] ?? '') === $reqCourierNorm) {
                        $validShippingCost = (int) $rate['shipping_price'];
                        break;
                    }
                }
            }
        }

        // 3. Fallback calculation if Biteship was unreachable, empty, or balance depleted
        if ($validShippingCost === null) {
            $destCity = strtolower(trim($shippingAddressData['city'] ?? ''));
            $destProvince = strtolower(trim($shippingAddressData['province'] ?? ''));
            $destDistrict = strtolower(trim($shippingAddressData['district'] ?? ''));
            $destPostcode = (string)($shippingAddressData['postal_code'] ?? '');
            $isKarawang = str_contains($destCity, 'karawang') 
                || str_contains($destDistrict, 'karawang') 
                || (!empty($destPostcode) && str_starts_with($destPostcode, '413'));

            $warehouse = \App\Models\Warehouse::where('is_primary', true)->first() ?? \App\Models\Warehouse::first();
            $originCity = strtolower(trim($warehouse->city ?? 'karawang'));
            $originProvince = strtolower(trim($warehouse->province ?? 'jawa barat'));
            $originPostcode = (string)($warehouse->postal_code ?? '41361');

            $fallbackRates = $shippingController->getDummyRates($shippingRequest, $isKarawang, $originCity, $originPostcode, $originProvince);
            foreach ($fallbackRates as $rate) {
                if ($normalizeCourier($rate['courier_code']) === $reqCourierNorm) {
                    $validShippingCost = (int) $rate['shipping_price'];
                    break;
                }
            }

            // If still null, use the first available fallback rate or provided shipping price
            if ($validShippingCost === null && !empty($fallbackRates)) {
                $validShippingCost = (int) $fallbackRates[0]['shipping_price'];
            } elseif ($validShippingCost === null && (int)$request->shipping_price > 0) {
                $validShippingCost = (int) $request->shipping_price;
            }
        }

        if ($validShippingCost === null) {
            return response()->json([
                'status' => false, 
                'message' => 'Invalid or unavailable shipping service selected. Please refresh the shipping options.'
            ], 422);
        }

        // Use the validated server-side calculated shipping cost!
        $shippingCost = $validShippingCost;

        if ($shippingCost > 0) {
            $itemDetailsForMidtrans[] = [
                'id'       => 'SHIPPING-FEE',
                'price'    => $shippingCost,
                'quantity' => 1,
                'name'     => substr("Shipping (" . strtoupper($request->courier_code) . " - " . ($request->service_code) . ")", 0, 48),
            ];
        }

        $tax = 0;
        $grandTotal = max(0, $subtotal - $discount + $shippingCost);

        // Transaksi DB Atomik: Buat pesanan & kurangi stok produk
        $order = DB::transaction(function () use ($user, $cart, $dbOrderItems, $shippingAddressData, $request, $grandTotal, $shippingCost, $discount, $tax, $subtotal, $voucherCode) {
            $orderNumber = 'SM-ORD-' . date('Ymd-His') . '-' . strtoupper(Str::random(4));

            $order = Order::create([
                'order_number'     => $orderNumber,
                'user_id'          => $user->id,
                'total_amount'     => $grandTotal,
                'status'           => 'pending',
                'shipping_address' => array_merge($shippingAddressData, [
                    'subtotal'        => $subtotal,
                    'shipping_cost'   => $shippingCost,
                    'discount_amount' => $discount,
                    'voucher_code'    => $voucherCode,
                    'courier_code'    => $request->courier_code,
                    'courier_name'    => $request->courier_name,
                    'service_code'    => $request->service_code,
                    'service_name'    => $request->service_name,
                    'estimated_delivery' => $request->estimated_delivery,
                    'payment_method'  => $request->payment_method,
                ]),
            ]);

            foreach ($dbOrderItems as $dbItem) {
                OrderItem::create([
                    'order_id'     => $order->id,
                    'product_id'   => $dbItem['product_id'],
                    'product_name' => $dbItem['product_name'],
                    'product_image'=> $dbItem['product_image'],
                    'color'        => $dbItem['color'],
                    'size'         => $dbItem['size'],
                    'quantity'     => $dbItem['quantity'],
                    'price'        => $dbItem['price'],
                    'subtotal'     => $dbItem['subtotal'],
                ]);

                // Stok TIDAK dikurangi di sini.
                // Stok baru dikurangi setelah pembayaran berhasil dikonfirmasi (via checkPaymentStatus / webhook).
            }

            OrderShipment::create([
                'order_id'        => $order->id,
                'courier_company' => strtoupper($request->courier_code),
                'courier_type'    => strtoupper($request->service_code),
                'shipping_cost'   => $shippingCost,
                'status'          => 'pending',
                'tracking_number' => null,
            ]);

            // Catatan: Item cart TIDAK DIHAPUS di sini agar jika customer me-remove/close pop-up Midtrans,
            // keranja tetap utuh dan customer bisa menekan Place Order lagi. Cart baru dihapus ketika pembayaran sukses/pending (melalui frontend clearCart & Webhook).
            // $cart->items()->delete();

            return $order;
        });

        // Admin notification moved to PaymentController (only when paid)
        // 7. Call Payment Gateway (Midtrans Core API v2/charge)
        $serverKey = config('services.midtrans.server_key') ?: env('MIDTRANS_SERVER_KEY');
        $isProduction = filter_var(config('services.midtrans.is_production', env('MIDTRANS_IS_PRODUCTION', false)), FILTER_VALIDATE_BOOLEAN);
        $endpoint = $isProduction ? 'https://api.midtrans.com/v2/charge' : 'https://api.sandbox.midtrans.com/v2/charge';

        $paymentMethod = strtolower($request->payment_method);
        $paymentType = 'bank_transfer';
        $bankTransfer = null;
        $echannel = null;
        $qrisAcquirer = null;

        switch ($paymentMethod) {
            case 'bca_va':
                $paymentType = 'bank_transfer';
                $bankTransfer = ['bank' => 'bca'];
                break;
            case 'bni_va':
                $paymentType = 'bank_transfer';
                $bankTransfer = ['bank' => 'bni'];
                break;
            case 'bri_va':
                $paymentType = 'bank_transfer';
                $bankTransfer = ['bank' => 'bri'];
                break;
            case 'permata_va':
                $paymentType = 'bank_transfer';
                $bankTransfer = ['bank' => 'permata'];
                break;
            case 'cimb_va':
                $paymentType = 'bank_transfer';
                $bankTransfer = ['bank' => 'cimb'];
                break;
            case 'mandiri_va':
                $paymentType = 'echannel';
                $echannel = [
                    'bill_info1' => 'Payment For',
                    'bill_info2' => 'Sector Madness'
                ];
                break;
            case 'qris':
            case 'gopay':
            case 'shopeepay':
            case 'ovo':
            case 'dana':
                $paymentType = 'qris';
                $qrisAcquirer = ['acquirer' => 'gopay'];
                break;
            default:
                $paymentType = 'bank_transfer';
                $bankTransfer = ['bank' => 'bca'];
                break;
        }

        // Strict validation: sum(item_details) MUST strictly match gross_amount in Midtrans
        $sumItemDetails = array_reduce($itemDetailsForMidtrans, function ($carry, $item) {
            return $carry + ((int)($item['price'] ?? 0) * (int)($item['quantity'] ?? 1));
        }, 0);

        if ($sumItemDetails !== (int)$grandTotal) {
            $itemDetailsForMidtrans = [
                [
                    'id'       => substr($order->order_number, 0, 48),
                    'price'    => (int)$grandTotal,
                    'quantity' => 1,
                    'name'     => 'Order #' . $order->order_number,
                ]
            ];
        }

        $payload = [
            'payment_type' => $paymentType,
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => (int)$grandTotal,
            ],
            'customer_details' => [
                'first_name' => $shippingAddressData['receiver_name'],
                'phone'      => $shippingAddressData['phone_number'],
                'email'      => $user->email ?? 'customer@sectormadness.com',
                'shipping_address' => [
                    'first_name' => $shippingAddressData['receiver_name'],
                    'phone'      => $shippingAddressData['phone_number'],
                    'address'    => $shippingAddressData['street_address'],
                    'city'       => $shippingAddressData['city'],
                    'postal_code'=> $shippingAddressData['postal_code'],
                ],
            ],
            'item_details' => $itemDetailsForMidtrans,
        ];

        if ($paymentType === 'bank_transfer' && isset($bankTransfer)) {
            $payload['bank_transfer'] = $bankTransfer;
        } elseif ($paymentType === 'echannel' && isset($echannel)) {
            $payload['echannel'] = $echannel;
        } elseif ($paymentType === 'qris' && isset($qrisAcquirer)) {
            $payload['qris'] = $qrisAcquirer;
        }

        $vaNumber = null;
        $qrString = null;
        $paymentUrl = null;
        $transactionId = null;
        $midtransResponse = [];

        try {
            $res = Http::withBasicAuth($serverKey, '')
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept'       => 'application/json'
                ])
                ->post($endpoint, $payload);

            $midtransResponse = $res->json() ?? [];
            Log::info("Midtrans Charge Response for Order {$order->order_number}: ", $midtransResponse);

            if ($res->successful() && isset($midtransResponse['status_code']) && in_array($midtransResponse['status_code'], ['200', '201'])) {
                $transactionId = $midtransResponse['transaction_id'] ?? null;

                // Extract Virtual Account
                if (isset($midtransResponse['va_numbers'][0]['va_number'])) {
                    $vaNumber = $midtransResponse['va_numbers'][0]['va_number'];
                } elseif (isset($midtransResponse['permata_va_number'])) {
                    $vaNumber = $midtransResponse['permata_va_number'];
                } elseif (isset($midtransResponse['biller_code']) && isset($midtransResponse['bill_key'])) {
                    $vaNumber = $midtransResponse['biller_code'] . ' ' . $midtransResponse['bill_key'];
                }

                // Extract QRIS (actions -> url or direct qr_string)
                if (isset($midtransResponse['actions'])) {
                    foreach ($midtransResponse['actions'] as $action) {
                        if (($action['name'] ?? '') === 'generate-qr-code') {
                            $qrString = $action['url'];
                        }
                    }
                }
                if (empty($qrString) && isset($midtransResponse['qr_string'])) {
                    $qrString = $midtransResponse['qr_string'];
                }
            } else {
                Log::warning("Midtrans Core Charge Failed for Order {$order->order_number}, attempting Snap fallback: ", $midtransResponse);

                // Otomatis fallback ke Midtrans Snap API (karena di Production, channel bank seperti BRI/BNI/Mandiri aktif di Snap secara default)
                $snapEndpoint = $isProduction 
                    ? 'https://app.midtrans.com/snap/v1/transactions' 
                    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

                $snapPayload = [
                    'transaction_details' => [
                        'order_id'     => $order->order_number,
                        'gross_amount' => (int)$grandTotal,
                    ],
                    'customer_details' => [
                        'first_name' => $shippingAddressData['receiver_name'],
                        'phone'      => $shippingAddressData['phone_number'],
                        'email'      => $user->email ?? 'customer@sectormadness.com',
                        'shipping_address' => [
                            'first_name'  => $shippingAddressData['receiver_name'],
                            'phone'       => $shippingAddressData['phone_number'],
                            'address'     => $shippingAddressData['street_address'],
                            'city'        => $shippingAddressData['city'],
                            'postal_code' => $shippingAddressData['postal_code'],
                        ],
                    ],
                    'item_details' => $itemDetailsForMidtrans,
                ];

                $snapRes = Http::withBasicAuth($serverKey, '')
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'Accept'       => 'application/json'
                    ])
                    ->post($snapEndpoint, $snapPayload);

                if ($snapRes->successful() && !empty($snapRes->json()['token'])) {
                    $snapData = $snapRes->json();
                    $transactionId = $order->order_number;
                    $paymentUrl = $snapData['redirect_url'] ?? null;
                    $vaNumber = $paymentUrl;
                    $midtransResponse = $snapData;
                } else {
                    Log::warning("Midtrans Snap Fallback also failed: ", $snapRes->json() ?? []);
                    return response()->json([
                        'status'  => false,
                        'message' => 'Gagal membuat transaksi Midtrans: ' . ($midtransResponse['status_message'] ?? 'Gateway returned an error'),
                        'details' => $midtransResponse,
                    ], 422);
                }
            }
        } catch (\Exception $e) {
            Log::error("Midtrans Charge Exception for Order {$order->order_number}: " . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Exception connecting to Midtrans: ' . $e->getMessage(),
            ], 500);
        }

        // Rekam OrderPayment
        OrderPayment::create([
            'order_id'         => $order->id,
            'transaction_id'   => $transactionId ?? $order->order_number,
            'snap_token'       => $vaNumber ?? $qrString ?? $order->order_number,
            'payment_type'     => $request->payment_method,
            'payment_status'   => 'unpaid',
            'gross_amount'     => $grandTotal,
            'payload_response' => $midtransResponse,
        ]);

        return response()->json([
            'status'        => true,
            'gateway'       => 'midtrans',
            'is_production' => $isProduction,
            'message'       => 'Payment transaction generated successfully',
            'order_number'  => $order->order_number,
            'va_number'     => $vaNumber,
            'qr_string'     => $qrString,
            'payment_url'   => $paymentUrl,
            'reference'     => $transactionId,
            'data'          => $order->load('items', 'payment', 'shipment'),
            'response'      => $midtransResponse,
        ], 201);
    }

    /**
     * Check Real-Time Payment Status directly with Midtrans Server
     * Endpoint: GET /api/checkout/status/{order_number}
     */
    public function checkPaymentStatus($order_number, Request $request)
    {
        $order = Order::with(['payment', 'items', 'shipment'])->where('order_number', $order_number)->first();
        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        // 1. If already marked paid in DB, return immediately
        if ($order->status === 'paid' || ($order->payment && $order->payment->payment_status === 'paid')) {
            return response()->json(['status' => true, 'is_paid' => true, 'transaction_status' => 'settlement']);
        }

        // 2. Query Midtrans API Status
        $serverKey = config('services.midtrans.server_key') ?: env('MIDTRANS_SERVER_KEY');
        $isProduction = filter_var(config('services.midtrans.is_production', env('MIDTRANS_IS_PRODUCTION', false)), FILTER_VALIDATE_BOOLEAN);
        $endpoint = $isProduction 
            ? "https://api.midtrans.com/v2/{$order_number}/status" 
            : "https://api.sandbox.midtrans.com/v2/{$order_number}/status";

        try {
            $res = Http::withBasicAuth($serverKey, '')
                ->withHeaders(['Accept' => 'application/json'])
                ->get($endpoint);

            if ($res->successful()) {
                $statusData = $res->json();
                $transactionStatus = $statusData['transaction_status'] ?? 'pending';
                $fraudStatus = $statusData['fraud_status'] ?? 'accept';

                if (in_array($transactionStatus, ['settlement']) || ($transactionStatus === 'capture' && $fraudStatus === 'accept')) {
                    $isFirstTime = in_array($order->status, ['pending', 'unpaid']);
                    $order->update(['status' => 'processing']);
                    if ($order->payment) {
                        $order->payment->update([
                            'payment_status'   => 'paid',
                            'paid_at'          => now(),
                            'transaction_id'   => $statusData['transaction_id'] ?? $order->payment->transaction_id,
                            'payload_response' => $statusData,
                        ]);
                    }

                    if ($order->shipment && empty($order->shipment->tracking_number)) {
                        $courier = strtoupper($order->shipment->courier_company ?? 'JNT');
                        $order->shipment->update(['tracking_number' => $courier . '-' . time()]);
                    }

                    if ($isFirstTime) {
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

                        if ($order->user_id) {
                            $cart = \App\Models\Cart::where('user_id', $order->user_id)->first();
                            if ($cart) {
                                $cart->items()->delete();
                            }
                        }

                        try {
                            $admins = \App\Models\Admin::all();
                            $title = '🛒 New Paid Order Received (Midtrans)';
                            $message = "Order baru #{$order->order_number} telah dibayar via Midtrans senilai Rp " . number_format($order->total_amount, 0, ',', '.');
                            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminOrderNotification($title, $message, $order->order_number));
                            \App\Jobs\SendAdminPushNotification::dispatch($title, $message, '/admin/orders?tab=processing');
                        } catch (\Exception $e) {
                            Log::error('Admin Notification Failed on Midtrans checkPaymentStatus: ' . $e->getMessage());
                        }
                    }

                    return response()->json(['status' => true, 'is_paid' => true, 'transaction_status' => 'settlement']);
                }

                if (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                    $order->update(['status' => 'cancelled']);
                    if ($order->payment) {
                        $order->payment->update(['payment_status' => 'failed']);
                    }
                    return response()->json(['status' => true, 'is_paid' => false, 'transaction_status' => $transactionStatus]);
                }

                return response()->json([
                    'status'             => true,
                    'is_paid'            => false,
                    'transaction_status' => $transactionStatus,
                    'response'           => $statusData,
                ]);
            }

            return response()->json(['status' => true, 'is_paid' => false, 'transaction_status' => 'pending_api']);
        } catch (\Exception $e) {
            Log::error('Check Payment Status Exception: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Exception connecting to Midtrans API: ' . $e->getMessage(), 'is_paid' => false], 500);
        }
    }

    /**
     * Backward compatibility process endpoint
     */
    public function process(Request $request)
    {
        return $this->createPayment($request);
    }
}
