<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ShippingController extends Controller
{
    /**
     * Check Shipping Tariff / Rates via Biteship API
     * Endpoint: POST /api/shipping/rates
     */
    public function rates(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'destination_area_id'   => 'nullable|string',
            'destination_postcode'  => 'nullable|string',
            'weight'                => 'nullable|numeric|min:100', // gram
            'couriers'              => 'nullable|string', // e.g. "jne,jnt"
            'city'                  => 'nullable|string',
            'province'              => 'nullable|string',
            'district'              => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $apiKey = config('services.biteship.api_key') ?: env('BITESHIP_API_KEY');
        $baseUrl = rtrim(config('services.biteship.base_url', env('BITESHIP_BASE_URL', 'https://api.biteship.com')), '/');
        $warehouse = \App\Models\Warehouse::where('is_primary', true)->first() 
            ?? \App\Models\Warehouse::first();

        $originCity = strtolower(trim($warehouse->city ?? 'karawang'));
        $originProvince = strtolower(trim($warehouse->province ?? 'jawa barat'));
        $originPostcode = (string)($warehouse->postal_code ?? '41361');
        $originAreaId = $warehouse->area_id ?? null;
        $originLat = $warehouse->latitude ?? null;
        $originLng = $warehouse->longitude ?? null;

        $destCity = strtolower(trim($request->city ?? ''));
        $destProvince = strtolower(trim($request->province ?? ''));
        $destDistrict = strtolower(trim($request->district ?? ''));
        $destPostcode = (string)($request->destination_postcode ?? '');

        // Smart flexible Karawang detection (Karawang, Karawang Barat, postal code 413xx)
        $isKarawang = str_contains($destCity, 'karawang') 
            || str_contains($destDistrict, 'karawang')
            || (!empty($destPostcode) && str_starts_with($destPostcode, '413'));

        $requestedCouriers = $request->couriers ?? 'jne,jnt';
        $couriersArray = explode(',', $requestedCouriers);

        if (!$isKarawang) {
            $couriersArray = array_filter($couriersArray, function($c) {
                return strtolower(trim($c)) !== 'gosend';
            });
        }

        $couriersToRequest = implode(',', $couriersArray);
        if (empty($couriersToRequest)) {
            $couriersToRequest = 'jne,jnt';
        }

        // Panggil Biteship API asli bila API key terdaftar dan tidak dipaksa mock
        $forceDummy = filter_var(config('services.biteship.force_dummy', env('BITESHIP_FORCE_DUMMY', false)), FILTER_VALIDATE_BOOLEAN);
        if (!empty($apiKey) && !$forceDummy) {
            try {
                // Evaluasi validitas Biteship Area ID (Biteship ID asli panjang seperti IDNP6IDNC148IDND843IDZ12250, bukan placeholder IDNPJ001)
                $effectiveOriginAreaId = $originAreaId ?: (config('services.biteship.origin_area_id') ?: env('BITESHIP_ORIGIN_AREA_ID'));
                $isValidOriginArea = !empty($effectiveOriginAreaId) && strlen($effectiveOriginAreaId) > 10 && !str_starts_with($effectiveOriginAreaId, 'IDNPJ');

                $destAreaId = $request->destination_area_id;
                $isValidDestArea = !empty($destAreaId) && strlen($destAreaId) > 10 && !str_starts_with($destAreaId, 'IDNPJ');

                $payload = [
                    'couriers' => $couriersToRequest,
                    'items'    => [
                        [
                            'name'        => 'Sector Madness Package',
                            'description' => 'Luxury Technical Garment',
                            'value'       => (int)($request->item_value ?? 100000),
                            'quantity'    => 1,
                            'weight'      => $request->weight ? (int)$request->weight : 1000,
                        ]
                    ],
                ];

                if ($isValidOriginArea) {
                    $payload['origin_area_id'] = $effectiveOriginAreaId;
                }
                if (!empty($originPostcode)) {
                    $payload['origin_postal_code'] = (int)$originPostcode;
                }

                if ($isValidDestArea) {
                    $payload['destination_area_id'] = $destAreaId;
                }
                if (!empty($destPostcode)) {
                    $payload['destination_postal_code'] = (int)$destPostcode;
                }

                if ($originLat && $originLng) {
                    $payload['origin_latitude']  = (float)$originLat;
                    $payload['origin_longitude'] = (float)$originLng;
                }

                $response = Http::withOptions([
                    'curl' => [
                        CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                    ]
                ])->timeout(8)->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type'  => 'application/json',
                ])->post($baseUrl . '/v1/rates/couriers', $payload);

                if ($response->successful() && !empty($response->json()['pricing'])) {
                    $pricing = $response->json()['pricing'];
                    $formattedRates = array_map(function ($rate) {
                        return [
                            'courier_code'       => strtoupper($rate['company'] ?? 'JNE'),
                            'courier_name'       => strtoupper($rate['company'] ?? 'JNE') . ' LOGISTICS',
                            'service_code'       => strtoupper($rate['type'] ?? 'REG'),
                            'service_name'       => $rate['name'] ?? 'Reguler Service',
                            'shipping_price'     => (int)($rate['price'] ?? 25000),
                            'estimated_delivery' => ($rate['duration'] ?? '1-3') . ' Days',
                            'description'        => 'Integrated Biteship Live Courier Logistics Network',
                        ];
                    }, $pricing);

                    return response()->json([
                        'status' => true,
                        'data'   => array_values($formattedRates),
                    ], 200);
                } else {
                    Log::warning('Biteship Rates API returned non-200 or empty pricing: ' . $response->status() . ' - ' . $response->body());
                }

                // Fallback otomatis ke dummy jika API Biteship gagal / saldo habis (misal sandbox test key)
                return response()->json([
                    'status' => true,
                    'data'   => $this->getDummyRates($request, $isKarawang, $originCity, $originPostcode, $originProvince),
                ], 200);

            } catch (\Exception $e) {
                Log::warning('Biteship Rates API failed/timeout, falling back to local rates: ' . $e->getMessage());
                
                return response()->json([
                    'status' => true,
                    'data'   => $this->getDummyRates($request, $isKarawang, $originCity, $originPostcode, $originProvince),
                ], 200);
            }
        }

        // Fallback ke dummy jika API key belum diisi di .env atau BITESHIP_FORCE_DUMMY=true
        return response()->json([
            'status' => true,
            'data'   => $this->getDummyRates($request, $isKarawang, $originCity, $originPostcode, $originProvince),
        ], 200);
    }

    /**
     * Track Shipment Status via Biteship API
     * Endpoint: GET /api/shipping/track/{tracking_number}
     */
    public function track($tracking_number, Request $request)
    {
        $apiKey = config('services.biteship.api_key');
        $baseUrl = rtrim(config('services.biteship.base_url', 'https://api.biteship.com'), '/');

        if (!empty($apiKey)) {
            try {
                $response = Http::withOptions([
                    'curl' => [
                        CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
                    ]
                ])->withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                ])->get($baseUrl . '/v1/trackings/' . $tracking_number);

                if ($response->successful()) {
                    return response()->json([
                        'status' => true,
                        'data'   => $response->json(),
                    ], 200);
                }

                return response()->json([
                    'status'  => false,
                    'message' => 'Failed to retrieve tracking data from Biteship API',
                    'error'   => $response->json(),
                ], $response->status());
            } catch (\Exception $e) {
                Log::error('Biteship Track Exception: ' . $e->getMessage());
                return response()->json(['status' => false, 'message' => 'Exception connecting to Biteship API: ' . $e->getMessage()], 500);
            }
        }

        return response()->json([
            'status'  => false,
            'message' => 'BITESHIP_API_KEY is not configured in .env',
        ], 500);
    }

    /**
     * Search Destination Area ID for Autocomplete via Biteship API
     * Endpoint: GET /api/shipping/areas?input={keyword}
     */
    public function searchAreas(Request $request)
    {
        $keyword = $request->get('input');
        if (empty($keyword) || strlen($keyword) < 3) {
            return response()->json([
                'status' => false,
                'message' => 'Please provide at least 3 characters in input parameter',
                'data' => []
            ], 400);
        }

        $apiKey = config('services.biteship.api_key') ?: env('BITESHIP_API_KEY');
        if (!empty($apiKey)) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                ])->get('https://api.biteship.com/v1/maps/areas', [
                    'countries' => 'ID',
                    'input'     => $keyword,
                ]);

                if ($response->successful()) {
                    return response()->json([
                        'status' => true,
                        'data'   => $response->json()['areas'] ?? [],
                    ], 200);
                }
            } catch (\Exception $e) {
                Log::error('Biteship Search Area Exception: ' . $e->getMessage());
            }
        }

        return response()->json([
            'status' => false,
            'message' => 'Biteship API Key error or unreachable service',
            'data'   => [],
        ], 500);
    }

    /**
     * Create Real Order Shipment via Biteship API
     * Endpoint: POST /api/shipping/create/{order_number}
     */
    public function createShipment($order_number, ?Request $request = null)
    {
        $order = Order::with(['items', 'user', 'shipment'])->where('order_number', $order_number)->first();
        if (!$order || !$order->shipment) {
            return response()->json(['status' => false, 'message' => 'Order or shipment details not found'], 404);
        }

        if (strtolower($order->shipment->courier_company ?? '') === 'gosend') {
            $shippingAddress = $order->shipping_address ?? [];
            $destCity = strtolower(trim($shippingAddress['city'] ?? ''));
            $destProvince = strtolower(trim($shippingAddress['province'] ?? ''));
            $destDistrict = strtolower(trim($shippingAddress['district'] ?? ''));
            $destPostcode = (string)($shippingAddress['postal_code'] ?? '');
            $isKarawang = str_contains($destCity, 'karawang') 
                || str_contains($destDistrict, 'karawang') 
                || (!empty($destPostcode) && str_starts_with($destPostcode, '413'));
            
            if (!$isKarawang) {
                return response()->json(['status' => false, 'message' => 'GoSend is only available for destinations in Kabupaten Karawang, Jawa Barat.'], 403);
            }
        }

        $apiKey = config('services.biteship.api_key');
        $baseUrl = rtrim(config('services.biteship.base_url', 'https://api.biteship.com'), '/');
        
        if (empty($apiKey)) {
            return response()->json(['status' => false, 'message' => 'Biteship API Key is missing in configuration'], 500);
        }

        $shippingAddress = $order->shipping_address ?? [];
        if (is_string($shippingAddress)) {
            $shippingAddress = json_decode($shippingAddress, true) ?? [];
        }

        $itemsPayload = [];
        foreach ($order->items as $item) {
            $rawP = (float)$item->price;
            $valIdr = (int)($rawP < 1000 ? $rawP * 1000 : $rawP);
            $itemsPayload[] = [
                'name'        => substr($item->product_name . ($item->color || $item->size ? ' (' . implode('-', array_filter([$item->color, $item->size])) . ')' : ''), 0, 50),
                'description' => 'Sector Madness Technical Garment',
                'value'       => $valIdr > 0 ? $valIdr : 100000,
                'quantity'    => $item->quantity ?: 1,
                'weight'      => 800 * ($item->quantity ?: 1), // gram per item
            ];
        }
        if (empty($itemsPayload)) {
            $itemsPayload[] = [
                'name'        => 'Sector Madness Order #' . $order->order_number,
                'description' => 'Sector Madness Technical Garment',
                'value'       => 100000,
                'quantity'    => 1,
                'weight'      => 1000,
            ];
        }

        $warehouse = \App\Models\Warehouse::where('is_primary', true)->first() 
            ?? \App\Models\Warehouse::first();

        $effectiveOriginAreaId = $warehouse->area_id ?? (config('services.biteship.origin_area_id') ?: env('BITESHIP_ORIGIN_AREA_ID'));
        $isValidOriginArea = !empty($effectiveOriginAreaId) && strlen($effectiveOriginAreaId) > 10 && !str_starts_with($effectiveOriginAreaId, 'IDNPJ');

        $destAreaId = $shippingAddress['area_id'] ?? null;
        $isValidDestArea = !empty($destAreaId) && strlen($destAreaId) > 10 && !str_starts_with($destAreaId, 'IDNPJ');

        $destPostcode = (int)($shippingAddress['postal_code'] ?? $shippingAddress['postcode'] ?? 10110);
        $destStreet = $shippingAddress['street_address'] ?? $shippingAddress['street'] ?? $shippingAddress['address'] ?? 'Jl. Raya';
        $destCity = $shippingAddress['city'] ?? 'Jakarta';
        $destProvince = $shippingAddress['province'] ?? 'DKI Jakarta';

        $payload = [
            'origin_contact_name'       => $warehouse ? $warehouse->contact_name : 'Sector Madness Archive Lab',
            'origin_contact_phone'      => $warehouse ? $warehouse->phone : '081234567890',
            'origin_contact_email'      => $warehouse ? $warehouse->email : 'logistics@sectormadness.com',
            'shipper_organization'      => $warehouse ? $warehouse->name : 'Sector Madness Official',
            'origin_address'            => $warehouse ? ($warehouse->address . ', ' . $warehouse->city . ', ' . $warehouse->province) : 'Jl. Senopati Raya No. 28, Kebayoran Baru, Jakarta Selatan',
            'origin_note'               => $warehouse ? ($warehouse->notes ?? 'Pickup at warehouse loading bay') : 'Pickup at warehouse loading bay',
            'origin_postal_code'        => (int)($warehouse ? $warehouse->postal_code : 12190),
            'destination_contact_name'  => $shippingAddress['receiver_name'] ?? $shippingAddress['name'] ?? ($order->user ? $order->user->name : 'Customer'),
            'destination_contact_phone' => $shippingAddress['phone_number'] ?? $shippingAddress['phone'] ?? ($order->user ? $order->user->phone : '081234567890'),
            'destination_contact_email' => $order->user ? $order->user->email : 'customer@sectormadness.com',
            'destination_address'       => $destStreet . ', ' . $destCity . ', ' . $destProvince,
            'destination_postal_code'   => $destPostcode,
            'courier_company'           => strtolower($order->shipment->courier_company ?? 'jne'),
            'courier_type'              => strtolower($order->shipment->courier_type ?? 'reg'),
            'delivery_type'             => 'later',
            'delivery_date'             => now()->addDay()->format('Y-m-d'),
            'delivery_time'             => '12:00',
            'order_note'                => 'Handle with care: Luxury Technical Garment',
            'items'                     => $itemsPayload,
        ];

        if ($isValidOriginArea) {
            $payload['origin_area_id'] = $effectiveOriginAreaId;
        }
        if ($isValidDestArea) {
            $payload['destination_area_id'] = $destAreaId;
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->post($baseUrl . '/v1/orders', $payload);

            if ($response->successful()) {
                $resData = $response->json();
                $biteshipId = $resData['id'] ?? null;
                $courierComp = strtoupper($order->shipment->courier_company ?? 'JNE');
                $trackingNum = $resData['courier']['waybill_id'] 
                    ?? $resData['courier']['tracking_id'] 
                    ?? null;
                
                if (empty($trackingNum)) {
                    $trackingNum = $resData['id'] ?? $order->shipment->tracking_number;
                }

                // Tetap simpan status sebagai 'shipped' agar tidak turun kembali ke in processing
                $order->shipment->update([
                    'biteship_order_id' => $biteshipId ?: $order->shipment->biteship_order_id,
                    'tracking_number'   => $trackingNum ?: $order->shipment->tracking_number,
                    'status'            => 'shipped',
                ]);

                $order->update(['status' => 'shipped']);

                return response()->json([
                    'status'  => true,
                    'message' => 'Request pickup berhasil dikirim ke Biteship!',
                    'data'    => $order->load('shipment'),
                    'biteship_response' => $resData,
                ], 200);
            }

            // Response error dari Biteship API
            $statusCode = $response->status();
            $resJson = $response->json();
            $errorMsg = is_array($resJson) 
                ? ($resJson['error'] ?? $resJson['message'] ?? $response->body()) 
                : $response->body();
            $errorCode = is_array($resJson) ? ($resJson['code'] ?? null) : null;

            Log::error("Biteship Create Order Error [{$statusCode}]: " . json_encode($resJson ?? $response->body()));

            // Deteksi saldo Biteship tidak cukup (HTTP 402, kode Biteship 40009001-40009004, atau kata kunci saldo/balance/deposit/payment failed)
            $isInsufficientBalance = ($statusCode === 402)
                || in_array($errorCode, [40009001, 40009002, 40009003, 40009004])
                || preg_match('/(balance|saldo|deposit|insufficient|payment\s+failed|wallet|dana\s+tidak\s+cukup)/i', (string)$errorMsg);

            if ($isInsufficientBalance) {
                // JANGAN digantikan dengan dummy! Biarkan data sebelumnya utuh dan beri informasi yang jelas.
                return response()->json([
                    'status'     => false,
                    'error_type' => 'insufficient_balance',
                    'message'    => 'Saldo Biteship tidak mencukupi untuk melakukan request pickup kurir ini. Silakan top up saldo akun di dashboard Biteship terlebih dahulu.',
                    'detail'     => $errorMsg,
                    'biteship_response' => $resJson,
                ], 402);
            }

            // Fallback mock HANYA jika secara eksplisit diset BITESHIP_FORCE_DUMMY=true di .env
            $forceDummy = filter_var(config('services.biteship.force_dummy', env('BITESHIP_FORCE_DUMMY', false)), FILTER_VALIDATE_BOOLEAN);
            if ($forceDummy) {
                $mockBiteshipId = strtoupper(substr(md5($order->order_number), 0, 10));
                $courierCompSandbox = strtoupper($order->shipment->courier_company ?? 'JNE');
                $mockTrackingNum = $courierCompSandbox === 'GOSEND' || $courierCompSandbox === 'GO-SEND' ? 'GK-' . rand(100000000, 999999999) : $courierCompSandbox . '-' . rand(1000000000, 9999999999);
                
                $order->shipment->update([
                    'biteship_order_id' => $mockBiteshipId,
                    'tracking_number'   => $mockTrackingNum,
                    'status'            => 'shipped',
                ]);
                $order->update(['status' => 'shipped']);

                return response()->json([
                    'status'  => true,
                    'message' => '[FORCE DUMMY] Shipment output generated via Biteship Integration',
                    'data'    => $order->load('shipment'),
                    'biteship_response' => [
                        'id'             => $mockBiteshipId,
                        'courier'        => [
                            'company'     => strtolower($order->shipment->courier_company ?? 'jne'),
                            'type'        => strtolower($order->shipment->courier_type ?? 'reg'),
                            'tracking_id' => $mockTrackingNum,
                        ],
                        'status'         => 'shipped',
                    ],
                ], 200);
            }

            // Jika error API umum lainnya: JANGAN ganti dengan data dummy!
            return response()->json([
                'status'     => false,
                'error_type' => 'biteship_error',
                'message'    => 'Gagal melakukan request pickup ke Biteship: ' . ($errorMsg ?: 'Terjadi kesalahan respon dari Biteship API'),
                'detail'     => $errorMsg,
                'biteship_response' => $resJson,
            ], $statusCode >= 400 && $statusCode < 600 ? $statusCode : 400);

        } catch (\Exception $e) {
            Log::error('Biteship Create Order Exception: ' . $e->getMessage());
            return response()->json([
                'status'  => false,
                'message' => 'Terjadi kesalahan server saat menghubungi Biteship: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get Store / Office / Warehouse Info from Database
     * Endpoint: GET /api/warehouse
     */
    public function getWarehouseInfo()
    {
        $warehouse = \App\Models\Warehouse::where('is_primary', true)->first()
            ?? \App\Models\Warehouse::first();

        return response()->json([
            'status' => true,
            'data'   => $warehouse,
        ], 200);
    }

    public function getDummyRates(Request $request, $isKarawang, $originCity, $originPostcode, $originProvince)
    {
        $destCity = strtolower(trim($request->city ?? ''));
        $destProvince = strtolower(trim($request->province ?? ''));
        $destDistrict = strtolower(trim($request->district ?? ''));
        $destPostcode = (string)($request->destination_postcode ?? '');
        $destFull = strtolower(trim("{$destDistrict} {$destCity} {$destProvince} {$destPostcode}"));

        $multiplier = ceil(max(100, $request->weight ?? 1000) / 1000);

        // Default prices
        $jnePrice = 20000;
        $jntPrice = 22000;
        $jneEst = '2 - 3 Days';
        $jntEst = '1 - 2 Days';

        $isSameCity = (!empty($destCity) && (str_contains($destCity, $originCity) || str_contains($originCity, $destCity)))
            || (!empty($destPostcode) && substr($destPostcode, 0, 3) === substr($originPostcode, 0, 3));

        if ($isSameCity) {
            $jnePrice = 10000;
            $jntPrice = 12000;
            $jneEst = '1 - 2 Days';
            $jntEst = '1 Day (Local Express)';
        } elseif (
            (!empty($destProvince) && (str_contains($destProvince, $originProvince) || str_contains($originProvince, $destProvince)))
            || (str_contains($originCity, 'karawang') && (str_contains($destFull, 'jakarta') || str_contains($destFull, 'bekasi') || str_contains($destFull, 'cikarang') || str_contains($destFull, 'purwakarta') || str_contains($destFull, 'subang') || str_contains($destFull, 'bandung') || str_contains($destFull, 'bogor') || str_contains($destFull, 'depok') || str_contains($destFull, 'tangerang')))
            || (str_contains($originCity, 'jakarta') && (str_contains($destFull, 'karawang') || str_contains($destFull, 'bekasi') || str_contains($destFull, 'bogor') || str_contains($destFull, 'depok') || str_contains($destFull, 'tangerang') || str_contains($destFull, 'banten')))
            || (str_contains($originCity, 'bandung') && (str_contains($destFull, 'karawang') || str_contains($destFull, 'purwakarta') || str_contains($destFull, 'cimahi') || str_contains($destFull, 'sumedang') || str_contains($destFull, 'jakarta')))
        ) {
            $jnePrice = 15000;
            $jntPrice = 18000;
            $jneEst = '1 - 2 Days';
            $jntEst = '1 Day (Express)';
        } elseif (str_contains($destFull, 'jawa') || str_contains($destFull, 'yogyakarta') || str_contains($destFull, 'jogja') || str_contains($destFull, 'semarang') || str_contains($destFull, 'surabaya') || str_contains($destFull, 'malang') || preg_match('/^[5-6][0-9]/', $destPostcode)) {
            $jnePrice = 20000;
            $jntPrice = 22000;
        } elseif (str_contains($destFull, 'bali') || str_contains($destFull, 'denpasar') || str_contains($destFull, 'badung') || str_contains($destFull, 'canggu') || str_contains($destFull, 'mataram') || preg_match('/^8[0-5]/', $destPostcode)) {
            $jnePrice = 28000;
            $jntPrice = 30000;
            $jneEst = '3 - 4 Days';
            $jntEst = '2 - 3 Days';
        } elseif (str_contains($destFull, 'sumatera') || str_contains($destFull, 'sumatra') || str_contains($destFull, 'medan') || str_contains($destFull, 'palembang') || str_contains($destFull, 'pekanbaru') || str_contains($destFull, 'padang') || str_contains($destFull, 'lampung') || preg_match('/^[2-3][0-9]/', $destPostcode)) {
            $jnePrice = 35000;
            $jntPrice = 38000;
            $jneEst = '3 - 5 Days';
            $jntEst = '2 - 4 Days';
        } elseif (str_contains($destFull, 'kalimantan') || str_contains($destFull, 'banjarmasin') || str_contains($destFull, 'samarinda') || str_contains($destFull, 'balikpapan') || str_contains($destFull, 'pontianak') || preg_match('/^7[0-9]/', $destPostcode)) {
            $jnePrice = 42000;
            $jntPrice = 45000;
            $jneEst = '3 - 5 Days';
            $jntEst = '2 - 4 Days';
        } elseif (str_contains($destFull, 'sulawesi') || str_contains($destFull, 'makassar') || str_contains($destFull, 'manado') || str_contains($destFull, 'palu') || preg_match('/^9[0-6]/', $destPostcode)) {
            $jnePrice = 48000;
            $jntPrice = 50000;
            $jneEst = '4 - 6 Days';
            $jntEst = '3 - 5 Days';
        } elseif (str_contains($destFull, 'papua') || str_contains($destFull, 'maluku') || str_contains($destFull, 'ambon') || str_contains($destFull, 'jayapura') || preg_match('/^9[7-9]/', $destPostcode)) {
            $jnePrice = 80000;
            $jntPrice = 85000;
            $jneEst = '5 - 7 Days';
            $jntEst = '4 - 6 Days';
        }

        $dummyRates = [
            [
                'courier_code'       => 'JNE',
                'courier_name'       => 'JNE LOGISTICS',
                'service_code'       => 'REG',
                'service_name'       => 'Reguler Service',
                'shipping_price'     => $jnePrice * $multiplier,
                'estimated_delivery' => $jneEst,
                'description'        => 'Layanan Pengiriman Reguler JNE Express',
            ],
            [
                'courier_code'       => 'JNT',
                'courier_name'       => 'J&T LOGISTICS',
                'service_code'       => 'EZ',
                'service_name'       => 'EZ Service',
                'shipping_price'     => $jntPrice * $multiplier,
                'estimated_delivery' => $jntEst,
                'description'        => 'Layanan Pengiriman Reguler J&T Express',
            ]
        ];
        
        if ($isKarawang) {
            $gosendPrice = 12000; // Default Karawang GoSend
            if (str_contains($destFull, 'cikampek') || str_contains($destFull, 'jatisari') || str_contains($destFull, 'banyusari') || str_contains($destFull, 'cilamaya')) {
                $gosendPrice = 25000;
            } elseif (str_contains($destFull, 'klari') || str_contains($destFull, 'purwasari') || str_contains($destFull, 'kosambi') || str_contains($destFull, 'majalaya')) {
                $gosendPrice = 15000;
            } elseif (str_contains($destFull, 'telukjambe') || str_contains($destFull, 'karawang barat') || str_contains($destFull, 'galuh')) {
                $gosendPrice = 10000;
            } elseif (str_contains($destFull, 'rengasdengklok') || str_contains($destFull, 'pangkalan') || str_contains($destFull, 'loji')) {
                $gosendPrice = 30000;
            }

            $dummyRates[] = [
                'courier_code'       => 'GOSEND',
                'courier_name'       => 'GOSEND INSTANT',
                'service_code'       => 'INSTANT',
                'service_name'       => 'Instant Delivery',
                'shipping_price'     => $gosendPrice * $multiplier,
                'estimated_delivery' => '1-3 Hours',
                'description'        => 'Pengiriman Instant Kilat Kurir Karawang',
            ];
        }

        return $dummyRates;
    }
}
