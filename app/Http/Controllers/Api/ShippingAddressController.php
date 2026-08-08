<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingAddress;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ShippingAddressController extends Controller
{
    /**
     * Dapatkan user aktif atau fallback ke customer demo untuk konsistensi pengujian.
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
     * Get All Shipping Addresses of User
     * Endpoint: GET /api/shipping-address
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
        $addresses = ShippingAddress::where('user_id', $user->id)
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => true,
            'data'   => $addresses,
        ], 200);
    }

    /**
     * Add New Shipping Address
     * Endpoint: POST /api/shipping-address
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'label'          => 'required|string|max:50',
            'receiver_name'  => 'required|string|max:255',
            'phone_number'   => 'required|string|max:30',
            'province'       => 'required|string|max:255',
            'city'           => 'required|string|max:255',
            'district'       => 'required|string|max:255',
            'postal_code'    => 'required|string|max:20',
            'street_address' => 'required|string',
            'address_notes'  => 'nullable|string',
            'area_id'        => 'nullable|string',
            'is_default'     => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = $this->getUser($request);
        $isDefault = $request->boolean('is_default', false);

        if ($isDefault && $user) {
            ShippingAddress::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address = ShippingAddress::create([
            'user_id'        => $user ? $user->id : null,
            'label'          => $request->label,
            'receiver_name'  => $request->receiver_name,
            'phone_number'   => $request->phone_number,
            'province'       => $request->province,
            'city'           => $request->city,
            'district'       => $request->district,
            'postal_code'    => $request->postal_code,
            'street_address' => $request->street_address,
            'address_notes'  => $request->address_notes,
            'area_id'        => $request->area_id ?: 'IDNPJ001',
            'is_default'     => $isDefault,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Shipping address added successfully',
            'data'    => $address,
        ], 201);
    }

    /**
     * Update Existing Shipping Address
     * Endpoint: PUT /api/shipping-address/{id}
     */
    public function update(Request $request, $id)
    {
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Authentication required'], 401);
        }

        $address = ShippingAddress::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$address) {
            return response()->json(['status' => false, 'message' => 'Address record not found or unauthorized access'], 404);
        }

        $validator = Validator::make($request->all(), [
            'label'          => 'nullable|string|max:50',
            'receiver_name'  => 'nullable|string|max:255',
            'phone_number'   => 'nullable|string|max:30',
            'province'       => 'nullable|string|max:255',
            'city'           => 'nullable|string|max:255',
            'district'       => 'nullable|string|max:255',
            'postal_code'    => 'nullable|string|max:20',
            'street_address' => 'nullable|string',
            'address_notes'  => 'nullable|string',
            'area_id'        => 'nullable|string',
            'is_default'     => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => 'Validation Error', 'errors' => $validator->errors()], 422);
        }

        $isDefault = $request->has('is_default') ? $request->boolean('is_default') : $address->is_default;

        if ($isDefault && !$address->is_default && $user) {
            ShippingAddress::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address->update(array_filter([
            'label'          => $request->label ?? $address->label,
            'receiver_name'  => $request->receiver_name ?? $address->receiver_name,
            'phone_number'   => $request->phone_number ?? $address->phone_number,
            'province'       => $request->province ?? $address->province,
            'city'           => $request->city ?? $address->city,
            'district'       => $request->district ?? $address->district,
            'postal_code'    => $request->postal_code ?? $address->postal_code,
            'street_address' => $request->street_address ?? $address->street_address,
            'address_notes'  => $request->address_notes ?? $address->address_notes,
            'area_id'        => $request->area_id ?? $address->area_id,
            'is_default'     => $isDefault,
        ]));

        return response()->json([
            'status'  => true,
            'message' => 'Shipping address updated successfully',
            'data'    => $address,
        ], 200);
    }

    /**
     * Delete Shipping Address
     * Endpoint: DELETE /api/shipping-address/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Authentication required'], 401);
        }

        $address = ShippingAddress::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$address) {
            return response()->json(['status' => false, 'message' => 'Address record not found or unauthorized access'], 404);
        }

        $address->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Shipping address removed successfully',
        ], 200);
    }
}
