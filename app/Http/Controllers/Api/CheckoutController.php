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
        if (!$user) {
            $user = User::where('email', 'member@sectormadness.com')->first();
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
                'id'          => 'qris',
                'name'        => 'QRIS',
                'category'    => 'E-Wallet / QR',
                'description' => 'Scan & authorize via any Indonesian bank or e-wallet apps',
                'icon'        => 'qr',
                'is_active'   => true,
            ],
            [
                'id'          => 'gopay',
                'name'        => 'GoPay',
                'category'    => 'E-Wallet',
                'description' => 'Instant seamless checkout directly through your GoPay account',
                'icon'        => 'wallet',
                'is_active'   => true,
            ],
            [
                'id'          => 'shopeepay',
                'name'        => 'ShopeePay',
                'category'    => 'E-Wallet',
                'description' => 'Rapid mobile transaction authorization via ShopeePay application',
                'icon'        => 'wallet',
                'is_active'   => true,
            ],
            [
                'id'          => 'bca_va',
                'name'        => 'BCA Virtual Account',
                'category'    => 'Virtual Account',
                'description' => 'Automated payment validation via Bank Central Asia VA system',
                'icon'        => 'bank',
                'is_active'   => true,
            ],
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
                'id'          => 'permata_va',
                'name'        => 'Permata Virtual Account',
                'category'    => 'Virtual Account',
                'description' => 'Automated verification via Bank Permata Virtual Account',
                'icon'        => 'bank',
                'is_active'   => true,
            ],
            [
                'id'          => 'credit_card',
                'name'        => 'Credit / Debit Card',
                'category'    => 'Credit Card',
                'description' => '3D Secure encrypted authorization for Visa, Mastercard, and JCB',
                'icon'        => 'card',
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
        $cart = Cart::where('user_id', $user ? $user->id : 1)->first();

        $subtotal = 0;
        if ($cart) {
            $items = $cart->items()->with('product')->get();
            foreach ($items as $item) {
                $subtotal += ($item->price * 15000 * $item->quantity);
            }
        }

        $code = strtoupper(trim($request->code));
        $voucher = Voucher::where('code', $code)->where('is_active', true)->first();

        if (!$voucher) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid or inactive voucher promo code.',
            ], 404);
        }

        if ($voucher->expires_at && $voucher->expires_at < now()) {
            return response()->json([
                'status'  => false,
                'message' => 'This voucher code has expired.',
            ], 422);
        }

        if ($subtotal < $voucher->minimum_purchase) {
            return response()->json([
                'status'  => false,
                'message' => "Minimum order of Rp " . number_format($voucher->minimum_purchase, 0, ',', '.') . " required for this voucher.",
            ], 422);
        }

        $discount = 0;
        if ($voucher->discount_type === 'percentage') {
            $discount = ($subtotal * $voucher->discount_value) / 100;
        } else {
            $discount = $voucher->discount_value;
        }

        return response()->json([
            'status'  => true,
            'message' => "Voucher applied: {$voucher->name}",
            'data'    => [
                'code'             => $voucher->code,
                'name'             => $voucher->name,
                'discount_amount'  => (float)$discount,
                'minimum_purchase' => (float)$voucher->minimum_purchase,
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
        $cart = Cart::where('user_id', $user ? $user->id : 1)->first();

        $cartItems = $cart ? $cart->items()->with('product')->get() : collect([]);

        $subtotal = 0;
        $formattedItems = [];
        $hasOutOfStock = false;

        foreach ($cartItems as $item) {
            $product = $item->product;
            $priceIdr = (float)($item->price * 15000);
            $itemTotal = $priceIdr * $item->quantity;
            $subtotal += $itemTotal;

            $stock = $product ? (int)$product->stock : 0;
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
            $voucher = Voucher::where('code', strtoupper($voucherCode))->where('is_active', true)->first();
            if ($voucher && ($subtotal >= $voucher->minimum_purchase)) {
                if ($voucher->discount_type === 'percentage') {
                    $discount = ($subtotal * $voucher->discount_value) / 100;
                } else {
                    $discount = (float)$voucher->discount_value;
                }
            }
        }

        // Kalkulasi pajak 11% dari subtotal dikurangi diskon
        $taxableAmount = max(0, $subtotal - $discount);
        $tax = round($taxableAmount * 0.11);
        
        $grandTotal = max(0, $subtotal - $discount + $shippingPrice + $tax);

        return response()->json([
            'status' => true,
            'data'   => [
                'subtotal'       => (float)$subtotal,
                'shipping'       => (float)$shippingPrice,
                'discount'       => (float)$discount,
                'tax'            => (float)$tax,
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

        // 3. Validasi Address
        $shippingAddressData = null;
        if ($request->address_id) {
            $addr = ShippingAddress::find($request->address_id);
            if (!$addr) {
                return response()->json(['status' => false, 'message' => 'Selected shipping address not found.'], 422);
            }
            $shippingAddressData = [
                'receiver_name' => $addr->receiver_name,
                'phone_number'  => $addr->phone_number,
                'street_address'=> $addr->street_address,
                'city'          => $addr->city,
                'province'      => $addr->province,
                'postal_code'   => $addr->postal_code,
                'label'         => $addr->label,
            ];
        } else {
            if (!$request->street_address || !$request->receiver_name) {
                return response()->json(['status' => false, 'message' => 'Please provide full shipping address details.'], 422);
            }
            $shippingAddressData = [
                'receiver_name' => $request->receiver_name,
                'phone_number'  => $request->phone_number ?? $user->phone,
                'street_address'=> $request->street_address,
                'city'          => $request->city ?? 'Jakarta',
                'province'      => $request->province ?? 'DKI Jakarta',
                'postal_code'   => $request->postal_code ?? '12110',
                'label'         => 'Custom Address',
            ];
        }

        // 4. Validasi Payment Method
        $validMethods = ['qris', 'gopay', 'shopeepay', 'bca_va', 'bni_va', 'mandiri_va', 'permata_va', 'credit_card'];
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

            if ($product->stock < $item->quantity) {
                return response()->json([
                    'status'  => false,
                    'message' => "Insufficient stock for product '{$product->name}'. Only {$product->stock} available.",
                ], 422);
            }

            // Gunakan harga terbaru di DB
            $latestPriceIdr = (int)($product->price * 15000);
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
                'color'         => $item->color,
                'size'          => $item->size,
                'quantity'      => $item->quantity,
                'price'         => $latestPriceIdr, // simpan dalam IDR rasmi
                'subtotal'      => $itemSubtotal,
            ];
        }

        // 6. Validasi Voucher
        $discount = 0;
        $voucherCode = $request->voucher_code;
        if (!empty($voucherCode)) {
            $voucher = Voucher::where('code', strtoupper($voucherCode))->where('is_active', true)->first();
            if (!$voucher || ($voucher->expires_at && $voucher->expires_at < now()) || $subtotal < $voucher->minimum_purchase) {
                return response()->json(['status' => false, 'message' => 'The promotional voucher code applied is invalid or conditions not met.'], 422);
            }
            if ($voucher->discount_type === 'percentage') {
                $discount = (int)(($subtotal * $voucher->discount_value) / 100);
            } else {
                $discount = (int)$voucher->discount_value;
            }
            $itemDetailsForMidtrans[] = [
                'id'       => 'VOUCHER-DISC',
                'price'    => -$discount,
                'quantity' => 1,
                'name'     => substr("Promo Code ({$voucher->code})", 0, 48),
            ];
        }

        $shippingCost = (int)$request->shipping_price;
        if ($shippingCost > 0) {
            $itemDetailsForMidtrans[] = [
                'id'       => 'SHIPPING-FEE',
                'price'    => $shippingCost,
                'quantity' => 1,
                'name'     => substr("Shipping (" . strtoupper($request->courier_code) . " - " . ($request->service_code) . ")", 0, 48),
            ];
        }

        $taxableAmount = max(0, $subtotal - $discount);
        $tax = (int)round($taxableAmount * 0.11);
        if ($tax > 0) {
            $itemDetailsForMidtrans[] = [
                'id'       => 'TAX-PPN11',
                'price'    => $tax,
                'quantity' => 1,
                'name'     => 'Indonesian VAT (11%)',
            ];
        }

        $grandTotal = max(0, $subtotal - $discount + $shippingCost + $tax);

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
                    'tax_amount'      => $tax,
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
                    'color'        => $dbItem['color'],
                    'size'         => $dbItem['size'],
                    'quantity'     => $dbItem['quantity'],
                    'price'        => $dbItem['price'],
                    'subtotal'     => $dbItem['subtotal'],
                ]);

                // Kurangi stok produk
                $product = $dbItem['product'];
                $product->decrement('stock', $dbItem['quantity']);
            }

            OrderShipment::create([
                'order_id'        => $order->id,
                'courier_company' => strtoupper($request->courier_code),
                'courier_type'    => strtoupper($request->service_code),
                'shipping_cost'   => $shippingCost,
                'status'          => 'pending',
                'tracking_number' => null,
            ]);

            // Bersihkan item dari cart setelah order sah terbentuk
            $cart->items()->delete();

            return $order;
        });

        // 7. Call Midtrans Live/Sandbox Snap Gateway API
        $serverKey = env('MIDTRANS_SERVER_KEY');
        $isProduction = env('MIDTRANS_IS_PRODUCTION', false);
        $endpoint = $isProduction ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        // Map enabled payments for Midtrans Snap
        $midtransEnabledPayment = null;
        switch (strtolower($request->payment_method)) {
            case 'qris': $midtransEnabledPayment = ['qris', 'gopay', 'other_qris']; break;
            case 'gopay': $midtransEnabledPayment = ['gopay', 'qris']; break;
            case 'shopeepay': $midtransEnabledPayment = ['shopeepay', 'qris']; break;
            case 'bca_va': $midtransEnabledPayment = ['bca_va', 'bank_transfer']; break;
            case 'bni_va': $midtransEnabledPayment = ['bni_va', 'bank_transfer']; break;
            case 'mandiri_va': $midtransEnabledPayment = ['echannel', 'bank_transfer']; break;
            case 'permata_va': $midtransEnabledPayment = ['permata_va', 'bank_transfer']; break;
            case 'credit_card': $midtransEnabledPayment = ['credit_card']; break;
            default: $midtransEnabledPayment = ['qris', 'gopay', 'bank_transfer', 'credit_card', 'shopeepay']; break;
        }

        $payload = [
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => (int)$grandTotal,
            ],
            'customer_details' => [
                'first_name' => $shippingAddressData['receiver_name'],
                'email'      => $user->email,
                'phone'      => $shippingAddressData['phone_number'],
                'shipping_address' => [
                    'first_name' => $shippingAddressData['receiver_name'],
                    'phone'      => $shippingAddressData['phone_number'],
                    'address'    => $shippingAddressData['street_address'],
                    'city'       => $shippingAddressData['city'],
                    'postal_code'=> $shippingAddressData['postal_code'],
                ],
            ],
            'item_details' => $itemDetailsForMidtrans,
            'enabled_payments' => $midtransEnabledPayment,
        ];

        $snapToken = null;
        $redirectUrl = null;

        try {
            $res = Http::withBasicAuth($serverKey, '')
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post($endpoint, $payload);

            if ($res->successful()) {
                $snapToken = $res->json()['token'] ?? null;
                $redirectUrl = $res->json()['redirect_url'] ?? null;
            } else {
                Log::warning('Midtrans Snap Failed: ' . json_encode($res->json()));
                // Fallback token agar frontend tetap sanggup menampilkan respon testing
                $snapToken = 'SNAP-TEST-' . strtoupper(Str::random(12));
            }
        } catch (\Exception $e) {
            Log::error('Midtrans Exception in createPayment: ' . $e->getMessage());
            $snapToken = 'SNAP-EX-' . strtoupper(Str::random(12));
        }

        // Rekam OrderPayment
        OrderPayment::create([
            'order_id'       => $order->id,
            'snap_token'     => $snapToken,
            'payment_type'   => $request->payment_method,
            'payment_status' => 'unpaid',
            'gross_amount'   => $grandTotal,
        ]);

        return response()->json([
            'status'       => true,
            'message'      => 'Payment transaction generated via Midtrans',
            'order_number' => $order->order_number,
            'snap_token'   => $snapToken,
            'redirect_url' => $redirectUrl,
            'data'         => $order->load('items', 'payment', 'shipment'),
        ], 201);
    }

    /**
     * Backward compatibility process endpoint
     */
    public function process(Request $request)
    {
        return $this->createPayment($request);
    }
}
