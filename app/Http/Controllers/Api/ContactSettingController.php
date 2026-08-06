<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactSetting;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContactSettingController extends Controller
{
    /**
     * Public index endpoint for Storefront (active settings only)
     */
    public function index()
    {
        $warehouse = Warehouse::where('is_primary', true)->first() ?? Warehouse::first();

        $settings = ContactSetting::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($item) use ($warehouse) {
                if (in_array($item->type, ['warehouse', 'address']) && $warehouse) {
                    $item->title = 'OUR WAREHOUSE';
                    $item->subtitle = $warehouse->name ?: 'Sector Madness Central Warehouse';
                    $street = $warehouse->address ? trim(explode("\n", $warehouse->address)[0]) : 'Jl. Harapan V Lot KK-2, Karawang Barat';
                    // Strip city if already in street
                    if ($warehouse->city) {
                        $street = trim(preg_replace('/,?\s*' . preg_quote($warehouse->city, '/') . '.*$/i', '', $street));
                    }
                    $cityProv = trim("{$warehouse->city}, {$warehouse->province} {$warehouse->postal_code}, Indonesia");
                    $item->value = $street . "\n" . $cityProv;
                    $item->latitude = $warehouse->latitude ?? $item->latitude ?? -6.3533;
                    $item->longitude = $warehouse->longitude ?? $item->longitude ?? 107.2831;
                }
                return $item;
            });

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    /**
     * Admin index endpoint (returns all settings + primary warehouse detail)
     */
    public function adminIndex()
    {
        $settings = ContactSetting::orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $warehouse = Warehouse::where('is_primary', true)->first() 
            ?? Warehouse::first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'settings' => $settings,
                'warehouse' => $warehouse,
            ]
        ]);
    }

    /**
     * Store new contact setting or channel
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:channel,warehouse,email,phone,schedule,social,address',
            'code' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'value' => 'required|string',
            'link' => 'nullable|string|max:500',
            'note' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            // Optional warehouse specific fields
            'warehouse_name' => 'nullable|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|string|email|max:255',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $setting = ContactSetting::create([
                'type' => $validated['type'],
                'code' => $validated['code'] ?? null,
                'title' => $validated['title'],
                'subtitle' => $validated['subtitle'] ?? null,
                'value' => $validated['value'],
                'link' => $validated['link'] ?? null,
                'note' => $validated['note'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'sort_order' => $validated['sort_order'] ?? 0,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Sync with Warehouse if type is warehouse or address
            if (in_array($validated['type'], ['warehouse', 'address'])) {
                $warehouse = Warehouse::where('is_primary', true)->first() ?? Warehouse::first();
                $streetAddr = $request->address ?? $validated['value'];
                $warehouseData = array_filter([
                    'name' => $validated['warehouse_name'] ?? $validated['title'] ?? null,
                    'contact_name' => $validated['contact_name'] ?? null,
                    'phone' => $validated['phone'] ?? null,
                    'email' => $validated['email'] ?? null,
                    'address' => $streetAddr,
                    'city' => $validated['city'] ?? null,
                    'province' => $validated['province'] ?? null,
                    'postal_code' => $validated['postal_code'] ?? null,
                    'latitude' => $validated['latitude'] ?? null,
                    'longitude' => $validated['longitude'] ?? null,
                ], fn($val) => !is_null($val) && $val !== '');

                if ($warehouse) {
                    $warehouse->update($warehouseData);
                } else {
                    Warehouse::create(array_merge([
                        'name' => 'Sector Madness Central Warehouse',
                        'contact_name' => 'Logistics Manager',
                        'address' => $streetAddr,
                        'city' => 'Karawang',
                        'province' => 'Jawa Barat',
                        'postal_code' => '41361',
                        'is_primary' => true,
                    ], $warehouseData));
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Contact setting created successfully.',
                'data' => $setting
            ], 201);
        });
    }

    /**
     * Update existing contact setting (and sync with Warehouse if address/warehouse type)
     */
    public function update(Request $request, $id)
    {
        $setting = ContactSetting::findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|string|in:channel,warehouse,email,phone,schedule,social,address',
            'code' => 'nullable|string|max:50',
            'title' => 'sometimes|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'value' => 'sometimes|string',
            'link' => 'nullable|string|max:500',
            'note' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            // Optional warehouse specific fields for synchronization
            'warehouse_name' => 'nullable|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|string|email|max:255',
        ]);

        return DB::transaction(function () use ($setting, $validated, $request) {
            // Update note string with clean coordinate format if latitude & longitude provided
            if (isset($validated['latitude']) && isset($validated['longitude'])) {
                $validated['note'] = "LAT: {$validated['latitude']}° S, LNG: {$validated['longitude']}° E";
            }

            $setting->update(array_intersect_key($validated, array_flip([
                'type', 'code', 'title', 'subtitle', 'value', 'link', 'note',
                'latitude', 'longitude', 'sort_order', 'is_active'
            ])));

            $currentType = $validated['type'] ?? $setting->type;

            // Sync with Warehouse if updating a warehouse/address setting
            if (in_array($currentType, ['warehouse', 'address'])) {
                $warehouse = Warehouse::where('is_primary', true)->first() ?? Warehouse::first();
                $streetAddr = $request->address ?? $validated['value'] ?? $setting->value;
                
                $warehouseData = array_filter([
                    'name' => $validated['warehouse_name'] ?? null,
                    'contact_name' => $validated['contact_name'] ?? null,
                    'phone' => $validated['phone'] ?? null,
                    'email' => $validated['email'] ?? null,
                    'address' => $streetAddr,
                    'city' => $validated['city'] ?? null,
                    'province' => $validated['province'] ?? null,
                    'postal_code' => $validated['postal_code'] ?? null,
                    'latitude' => $validated['latitude'] ?? null,
                    'longitude' => $validated['longitude'] ?? null,
                ], fn($val) => !is_null($val) && $val !== '');

                if ($warehouse) {
                    $warehouse->update($warehouseData);
                } else {
                    Warehouse::create(array_merge([
                        'name' => $setting->title ?: 'Sector Madness Warehouse',
                        'contact_name' => 'Logistics Manager',
                        'address' => $setting->value,
                        'city' => $validated['city'] ?? 'Karawang',
                        'province' => $validated['province'] ?? 'Jawa Barat',
                        'postal_code' => $validated['postal_code'] ?? '41361',
                        'is_primary' => true,
                    ], $warehouseData));
                }

                // Keep full formatted address text in setting->value & auto-sync Biteship Area ID
                if ($warehouse) {
                    $warehouse->refresh();

                    $apiKey = env('BITESHIP_API_KEY');
                    if (!empty($apiKey) && (!empty($warehouse->city) || !empty($warehouse->postal_code))) {
                        try {
                            $query = trim("{$warehouse->city} {$warehouse->postal_code}");
                            $biteshipRes = \Illuminate\Support\Facades\Http::withHeaders([
                                'Authorization' => 'Bearer ' . $apiKey,
                            ])->get('https://api.biteship.com/v1/maps/areas', [
                                'countries' => 'ID',
                                'input'     => $query,
                            ]);
                            if ($biteshipRes->successful() && !empty($biteshipRes->json()['areas'])) {
                                $matchedArea = $biteshipRes->json()['areas'][0];
                                if (!empty($matchedArea['id'])) {
                                    $warehouse->area_id = $matchedArea['id'];
                                    $warehouse->saveQuietly();
                                }
                            }
                        } catch (\Exception $e) {
                            \Illuminate\Support\Facades\Log::warning('Biteship area sync failed: ' . $e->getMessage());
                        }
                    }

                    $fullAddress = "{$warehouse->name}\n{$warehouse->address}\n{$warehouse->city}, {$warehouse->province} {$warehouse->postal_code}, Indonesia";
                    $setting->update(['value' => $fullAddress]);
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Contact setting updated successfully.',
                'data' => $setting
            ]);
        });
    }

    /**
     * Delete contact setting
     */
    public function destroy($id)
    {
        $setting = ContactSetting::findOrFail($id);
        $setting->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Contact setting deleted successfully.'
        ]);
    }
}
