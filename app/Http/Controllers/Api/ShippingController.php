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
            'couriers'              => 'nullable|string', // e.g. "jne,sicepat,anteraja"
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $apiKey = env('BITESHIP_API_KEY');
        
        // Panggil Biteship API asli bila API key terdaftar
        if (!empty($apiKey)) {
            try {
                $payload = [
                    'origin_area_id' => env('BITESHIP_ORIGIN_AREA_ID', 'IDNPJ001'), // Lokasi Gudang Sector Madness
                    'destination_area_id' => $request->destination_area_id ?? 'IDNPJ002',
                    'couriers' => $request->couriers ?? 'jne,sicepat,anteraja',
                    'items' => [
                        [
                            'name'   => 'Sector Madness Package',
                            'description' => 'Luxury Technical Garment',
                            'weight' => $request->weight ?? 1500, // default 1.5 kg
                        ]
                    ],
                ];

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

        // Server Backend dynamic logistics configurations (mencegah hardcode pada frontend)
        $activeRates = [
            [
                'courier_code'       => 'JNE',
                'courier_name'       => 'JNE EXPRESS',
                'service_code'       => 'REG',
                'service_name'       => 'Reguler Logistics',
                'shipping_price'     => 25000,
                'estimated_delivery' => '2-3 Days',
                'description'        => 'Standard courier delivery via Biteship Integrated Network',
            ],
            [
                'courier_code'       => 'SICEPAT',
                'courier_name'       => 'SICEPAT LOGISTICS',
                'service_code'       => 'BEST',
                'service_name'       => 'Besok Sampai Tujuan',
                'shipping_price'     => 38000,
                'estimated_delivery' => '1-2 Days',
                'description'        => 'Priority expedited shipping via Biteship Network',
            ],
            [
                'courier_code'       => 'ANTERAJA',
                'courier_name'       => 'ANTERAJA CARGO',
                'service_code'       => 'NEXT',
                'service_name'       => 'Next Day Delivery',
                'shipping_price'     => 45000,
                'estimated_delivery' => '1 Day',
                'description'        => 'Ultra-fast premium dispatch via Biteship Logistics',
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
    public function createShipment(Request $request, $order_number)
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
            $itemsPayload[] = [
                'name'        => substr($item->product_name . ' (' . $item->color . '-' . $item->size . ')', 0, 50),
                'description' => 'Sector Madness Technical Garment',
                'value'       => (int)($item->price * 15000),
                'quantity'    => $item->quantity,
                'weight'      => 800 * $item->quantity, // gram per item
            ];
        }

        $payload = [
            'shipper_contact_name'  => 'Sector Madness Archive Lab',
            'shipper_contact_phone' => '081234567890',
            'shipper_organization'  => 'Sector Madness Official',
            'origin_address'        => 'Jl. Senopati Raya No. 28, Kebayoran Baru, Jakarta Selatan',
            'origin_note'           => 'Pickup at warehouse loading bay',
            'origin_postal_code'    => 12190,
            'destination_contact_name'  => $shippingAddress['receiver_name'] ?? ($order->user ? $order->user->name : 'Customer'),
            'destination_contact_phone' => $shippingAddress['phone'] ?? ($order->user ? $order->user->phone : '081234567890'),
            'destination_address'       => ($shippingAddress['street'] ?? 'Jl. Raya') . ', ' . ($shippingAddress['city'] ?? 'Jakarta') . ', ' . ($shippingAddress['province'] ?? 'DKI Jakarta'),
            'destination_postal_code'   => (int)($shippingAddress['postal_code'] ?? 10110),
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
                $order->shipment->update([
                    'biteship_order_id' => $resData['id'] ?? null,
                    'tracking_number'   => $resData['courier']['tracking_id'] ?? $resData['id'] ?? null,
                    'status'            => 'allocated',
                ]);

                return response()->json([
                    'status'  => true,
                    'message' => 'Shipment created via Biteship Live API',
                    'data'    => $order->load('shipment'),
                    'biteship_response' => $resData,
                ], 200);
            }

            return response()->json([
                'status'  => false,
                'message' => 'Biteship API Error',
                'errors'  => $response->json(),
            ], $response->status());
        } catch (\Exception $e) {
            Log::error('Biteship Create Order Exception: ' . $e->getMessage());
            return response()->json(['status' => false, 'message' => 'Server exception when connecting to Biteship'], 500);
        }
    }
}
