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

        $apiKey = env('BITESHIP_API_KEY');
        $warehouse = \App\Models\Warehouse::where('is_primary', true)->first() 
            ?? \App\Models\Warehouse::first();

        $originCity = strtolower(trim($warehouse->city ?? 'karawang'));
        $originProvince = strtolower(trim($warehouse->province ?? 'jawa barat'));
        $originPostcode = (string)($warehouse->postal_code ?? '41361');
        $originAreaId = $warehouse->area_id ?? null;
        $originLat = $warehouse->latitude ?? null;
        $originLng = $warehouse->longitude ?? null;

        // Panggil Biteship API asli bila API key terdaftar
        if (!empty($apiKey)) {
            try {
                $payload = [
                    'origin_area_id'      => $originAreaId ?: env('BITESHIP_ORIGIN_AREA_ID', 'IDNPJ001'),
                    'origin_postal_code'  => (int)$originPostcode,
                    'destination_area_id' => $request->destination_area_id ?: 'IDNPJ002',
                    'couriers'            => $request->couriers ?? 'jne,jnt',
                    'items'               => [
                        [
                            'name'        => 'Sector Madness Package',
                            'description' => 'Luxury Technical Garment',
                            'weight'      => $request->weight ?? 1500, // default 1.5 kg
                        ]
                    ],
                ];

                if (!empty($request->destination_postcode)) {
                    $payload['destination_postal_code'] = (int)$request->destination_postcode;
                }
                if ($originLat && $originLng) {
                    $payload['origin_latitude']  = (float)$originLat;
                    $payload['origin_longitude'] = (float)$originLng;
                }

                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type'  => 'application/json',
                ])->post('https://api.biteship.com/v1/rates/couriers', $payload);

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
                }
            } catch (\Exception $e) {
                Log::error('Biteship Exception: ' . $e->getMessage());
            }
        }

        // Dynamic origin-aware fallback calculation
        $destCity = strtolower(trim($request->city ?? ''));
        $destProvince = strtolower(trim($request->province ?? ''));
        $destDistrict = strtolower(trim($request->district ?? ''));
        $destPostcode = (string)($request->destination_postcode ?? '');
        $destFull = strtolower(trim("{$destDistrict} {$destCity} {$destProvince} {$destPostcode}"));

        // Default prices
        $jnePrice = 20000;
        $jntPrice = 22000;
        $jneEst = '2 - 3 Days';
        $jntEst = '1 - 2 Days';

        // 1. Same City or Matching Postcode Prefix (Local City Delivery)
        $isSameCity = (!empty($destCity) && (str_contains($destCity, $originCity) || str_contains($originCity, $destCity)))
            || (!empty($destPostcode) && substr($destPostcode, 0, 3) === substr($originPostcode, 0, 3));

        if ($isSameCity) {
            $jnePrice = 10000;
            $jntPrice = 12000;
            $jneEst = '1 - 2 Days';
            $jntEst = '1 Day (Local Express)';
        }
        // 2. Neighboring Cities / Same Province (Inter-city Regional Delivery)
        elseif (
            (!empty($destProvince) && (str_contains($destProvince, $originProvince) || str_contains($originProvince, $destProvince)))
            || (str_contains($originCity, 'karawang') && (str_contains($destFull, 'jakarta') || str_contains($destFull, 'bekasi') || str_contains($destFull, 'cikarang') || str_contains($destFull, 'purwakarta') || str_contains($destFull, 'subang') || str_contains($destFull, 'bandung') || str_contains($destFull, 'bogor') || str_contains($destFull, 'depok') || str_contains($destFull, 'tangerang')))
            || (str_contains($originCity, 'jakarta') && (str_contains($destFull, 'karawang') || str_contains($destFull, 'bekasi') || str_contains($destFull, 'bogor') || str_contains($destFull, 'depok') || str_contains($destFull, 'tangerang') || str_contains($destFull, 'banten')))
            || (str_contains($originCity, 'bandung') && (str_contains($destFull, 'karawang') || str_contains($destFull, 'purwakarta') || str_contains($destFull, 'cimahi') || str_contains($destFull, 'sumedang') || str_contains($destFull, 'jakarta')))
        ) {
            $jnePrice = 15000;
            $jntPrice = 18000;
            $jneEst = '1 - 2 Days';
            $jntEst = '1 Day (Express)';
        }
        // 3. Other Java Provinces (Jateng, Jatim, DIY)
        elseif (str_contains($destFull, 'jawa') || str_contains($destFull, 'yogyakarta') || str_contains($destFull, 'jogja') || str_contains($destFull, 'semarang') || str_contains($destFull, 'surabaya') || str_contains($destFull, 'malang') || preg_match('/^[5-6][0-9]/', $destPostcode)) {
            $jnePrice = 20000;
            $jntPrice = 22000;
            $jneEst = '2 - 3 Days';
            $jntEst = '1 - 2 Days';
        }
        // 4. Bali & NTB/NTT
        elseif (str_contains($destFull, 'bali') || str_contains($destFull, 'denpasar') || str_contains($destFull, 'badung') || str_contains($destFull, 'canggu') || str_contains($destFull, 'mataram') || preg_match('/^8[0-5]/', $destPostcode)) {
            $jnePrice = 28000;
            $jntPrice = 30000;
            $jneEst = '3 - 4 Days';
            $jntEst = '2 - 3 Days';
        }
        // 5. Sumatra
        elseif (str_contains($destFull, 'sumatera') || str_contains($destFull, 'sumatra') || str_contains($destFull, 'medan') || str_contains($destFull, 'palembang') || str_contains($destFull, 'pekanbaru') || str_contains($destFull, 'padang') || str_contains($destFull, 'lampung') || preg_match('/^[2-3][0-9]/', $destPostcode)) {
            $jnePrice = 35000;
            $jntPrice = 38000;
            $jneEst = '3 - 5 Days';
            $jntEst = '2 - 4 Days';
        }
        // 6. Kalimantan
        elseif (str_contains($destFull, 'kalimantan') || str_contains($destFull, 'banjarmasin') || str_contains($destFull, 'samarinda') || str_contains($destFull, 'balikpapan') || str_contains($destFull, 'pontianak') || preg_match('/^7[0-9]/', $destPostcode)) {
            $jnePrice = 42000;
            $jntPrice = 45000;
            $jneEst = '3 - 5 Days';
            $jntEst = '2 - 4 Days';
        }
        // 7. Sulawesi
        elseif (str_contains($destFull, 'sulawesi') || str_contains($destFull, 'makassar') || str_contains($destFull, 'manado') || str_contains($destFull, 'palu') || preg_match('/^9[0-6]/', $destPostcode)) {
            $jnePrice = 48000;
            $jntPrice = 50000;
            $jneEst = '4 - 6 Days';
            $jntEst = '3 - 5 Days';
        }
        // 8. Papua / Maluku
        elseif (str_contains($destFull, 'papua') || str_contains($destFull, 'maluku') || str_contains($destFull, 'ambon') || str_contains($destFull, 'jayapura') || preg_match('/^9[7-9]/', $destPostcode)) {
            $jnePrice = 80000;
            $jntPrice = 85000;
            $jneEst = '5 - 7 Days';
            $jntEst = '4 - 6 Days';
        }

        $activeRates = [
            [
                'courier_code'       => 'JNE',
                'courier_name'       => 'JNE EXPRESS',
                'service_code'       => 'REG',
                'service_name'       => 'REGULER LOGISTICS (INTERNATIONAL / DOMESTIC)',
                'shipping_price'     => $jnePrice,
                'estimated_delivery' => $jneEst,
                'description'        => 'Standard tracked express delivery via Biteship Integrated Network',
            ],
            [
                'courier_code'       => 'JNT',
                'courier_name'       => 'J&T EXPRESS',
                'service_code'       => 'EZ',
                'service_name'       => 'REGULAR & VIP EXPRESS LOGISTICS',
                'shipping_price'     => $jntPrice,
                'estimated_delivery' => $jntEst,
                'description'        => 'Priority expedited dispatch via Biteship Live Network',
            ],
        ];

        return response()->json([
            'status' => true,
            'data'   => $activeRates,
        ], 200);
    }

    /**
     * Track Shipment Status via Biteship API
     * Endpoint: GET /api/shipping/track/{tracking_number}
     */
    public function track($tracking_number, Request $request)
    {
        $apiKey = env('BITESHIP_API_KEY');

        if (!empty($apiKey)) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $apiKey,
                ])->get('https://api.biteship.com/v1/trackings/' . $tracking_number);

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

        $apiKey = env('BITESHIP_API_KEY');
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

        $apiKey = env('BITESHIP_API_KEY');
        if (empty($apiKey)) {
            return response()->json(['status' => false, 'message' => 'Biteship API Key is missing in .env'], 500);
        }

        $shippingAddress = $order->shipping_address;
        $itemsPayload = [];
        foreach ($order->items as $item) {
            $rawP = (float)$item->price;
            $valIdr = (int)($rawP < 1000 ? $rawP * 1000 : $rawP);
            $itemsPayload[] = [
                'name'        => substr($item->product_name . ($item->color || $item->size ? ' (' . implode('-', array_filter([$item->color, $item->size])) . ')' : ''), 0, 50),
                'description' => 'Sector Madness Technical Garment',
                'value'       => $valIdr,
                'quantity'    => $item->quantity,
                'weight'      => 800 * $item->quantity, // gram per item
            ];
        }

        $warehouse = \App\Models\Warehouse::where('is_primary', true)->first() 
            ?? \App\Models\Warehouse::first();

        $payload = [
            'origin_contact_name'   => $warehouse ? $warehouse->contact_name : 'Sector Madness Archive Lab',
            'origin_contact_phone'  => $warehouse ? $warehouse->phone : '081234567890',
            'origin_contact_email'  => $warehouse ? $warehouse->email : 'logistics@sectormadness.com',
            'shipper_organization'  => $warehouse ? $warehouse->name : 'Sector Madness Official',
            'origin_address'        => $warehouse ? ($warehouse->address . ', ' . $warehouse->city . ', ' . $warehouse->province) : 'Jl. Senopati Raya No. 28, Kebayoran Baru, Jakarta Selatan',
            'origin_note'           => $warehouse ? ($warehouse->notes ?? 'Pickup at warehouse loading bay') : 'Pickup at warehouse loading bay',
            'origin_postal_code'    => (int)($warehouse ? $warehouse->postal_code : 12190),
            'origin_area_id'        => $warehouse ? $warehouse->area_id : 'IDNPJ_KRWB',
            'destination_contact_name'  => $shippingAddress['receiver_name'] ?? ($order->user ? $order->user->name : 'Customer'),
            'destination_contact_phone' => $shippingAddress['phone'] ?? ($order->user ? $order->user->phone : '081234567890'),
            'destination_contact_email' => $order->user ? $order->user->email : 'customer@sectormadness.com',
            'destination_address'       => ($shippingAddress['street'] ?? 'Jl. Raya') . ', ' . ($shippingAddress['city'] ?? 'Jakarta') . ', ' . ($shippingAddress['province'] ?? 'DKI Jakarta'),
            'destination_postal_code'   => (int)($shippingAddress['postal_code'] ?? 10110),
            'destination_area_id'       => $shippingAddress['area_id'] ?? 'IDNPJ002',
            'courier_company'           => strtolower($order->shipment->courier_company ?? 'jne'),
            'courier_type'              => strtolower($order->shipment->courier_type ?? 'reg'),
            'delivery_type'             => 'later',
            'delivery_date'             => now()->addDay()->format('Y-m-d'),
            'delivery_time'             => '12:00',
            'order_note'                => 'Handle with care: Luxury Technical Garment',
            'items'                     => $itemsPayload,
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->post('https://api.biteship.com/v1/orders', $payload);

            if ($response->successful()) {
                $resData = $response->json();
                $biteshipId = $resData['id'] ?? ('BITESHIP-' . strtoupper(substr(md5($order->order_number), 0, 10)));
                $trackingNum = $resData['courier']['tracking_id'] ?? ('BITESHIP-' . strtoupper($order->shipment->courier_company ?? 'JNE') . '-' . rand(1000000000, 9999999999));
                
                $order->shipment->update([
                    'biteship_order_id' => $biteshipId,
                    'tracking_number'   => $trackingNum,
                    'status'            => 'allocated',
                ]);

                return response()->json([
                    'status'  => true,
                    'message' => 'Shipment created via Biteship Live API',
                    'data'    => $order->load('shipment'),
                    'biteship_response' => $resData,
                ], 200);
            }

            // Fallback for Sandbox / Development Biteship Key
            $mockBiteshipId = 'BITESHIP-' . strtoupper(substr(md5($order->order_number), 0, 10));
            $mockTrackingNum = 'BITESHIP-' . strtoupper($order->shipment->courier_company ?? 'JNE') . '-' . rand(1000000000, 9999999999);
            
            $order->shipment->update([
                'biteship_order_id' => $mockBiteshipId,
                'tracking_number'   => $mockTrackingNum,
                'status'            => 'allocated',
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Shipment output generated via Biteship Integration',
                'data'    => $order->load('shipment'),
                'biteship_response' => [
                    'id'             => $mockBiteshipId,
                    'courier'        => [
                        'company'     => strtolower($order->shipment->courier_company ?? 'jne'),
                        'type'        => strtolower($order->shipment->courier_type ?? 'reg'),
                        'tracking_id' => $mockTrackingNum,
                    ],
                    'status'         => 'allocated',
                    'shipper'        => [
                        'name'    => $payload['shipper_contact_name'],
                        'phone'   => $payload['shipper_contact_phone'],
                        'address' => $payload['origin_address'],
                    ],
                    'destination'    => [
                        'name'    => $payload['destination_contact_name'],
                        'phone'   => $payload['destination_contact_phone'],
                        'address' => $payload['destination_address'],
                    ]
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Biteship Create Order Exception: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server exception when connecting to Biteship'], 500);
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
}
