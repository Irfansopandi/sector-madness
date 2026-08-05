<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Admin: Get all customers with search and status filter
     * Endpoint: GET /api/admin/customers
     */
    public function adminIndex(Request $request)
    {
        $query = User::with(['shippingAddresses' => function ($q) {
            $q->orderBy('is_default', 'desc')->orderBy('created_at', 'desc');
        }])->withCount('orders');

        // Search by Name, Email, Phone
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filter by Status: Active / Inactive
        if ($request->filled('status') && strtoupper($request->status) !== 'ALL') {
            $statusStr = strtoupper($request->status);
            if ($statusStr === 'ACTIVE') {
                $query->where('is_active', true);
            } elseif ($statusStr === 'INACTIVE') {
                $query->where('is_active', false);
            }
        }

        $customers = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data'   => $customers,
        ], 200);
    }

    /**
     * Admin: Get customer detail by ID
     * Endpoint: GET /api/admin/customers/{id}
     */
    public function adminShow($id)
    {
        $customer = User::with(['shippingAddresses' => function ($q) {
            $q->orderBy('is_default', 'desc')->orderBy('created_at', 'desc');
        }])->withCount('orders')->find($id);

        if (!$customer) {
            return response()->json([
                'status'  => false,
                'message' => 'Customer not found',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data'   => $customer,
        ], 200);
    }

    /**
     * Admin: Create new customer account
     * Endpoint: POST /api/admin/customers
     */
    public function adminStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users,email',
            'password'   => 'required|string|min:8',
            'phone'      => 'nullable|string|max:30',
            'birth_date' => 'nullable|string|max:50',
            'is_active'  => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $customer = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'phone'      => $request->phone ?? null,
            'birth_date' => $request->birth_date ?? null,
            'is_active'  => $request->has('is_active') ? (bool)$request->is_active : true,
            'last_login_at' => null,
        ]);

        $customer->load(['shippingAddresses']);

        return response()->json([
            'status'  => true,
            'message' => 'Customer created successfully',
            'data'    => $customer,
        ], 201);
    }

    /**
     * Admin: Update customer profile & status
     * Endpoint: PUT /api/admin/customers/{id}
     */
    public function adminUpdate(Request $request, $id)
    {
        $customer = User::find($id);

        if (!$customer) {
            return response()->json([
                'status'  => false,
                'message' => 'Customer not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'       => 'nullable|string|max:255',
            'email'      => 'nullable|string|email|max:255|unique:users,email,' . $customer->id,
            'password'   => 'nullable|string|min:8',
            'phone'      => 'nullable|string|max:30',
            'birth_date' => 'nullable|string|max:50',
            'is_active'  => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $updateData = [];
        if ($request->has('name')) $updateData['name'] = $request->name;
        if ($request->has('email')) $updateData['email'] = $request->email;
        if ($request->has('phone')) $updateData['phone'] = $request->phone;
        if ($request->has('birth_date')) $updateData['birth_date'] = $request->birth_date;
        if ($request->has('is_active')) $updateData['is_active'] = (bool)$request->is_active;
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $customer->update($updateData);
        $customer->load(['shippingAddresses']);

        return response()->json([
            'status'  => true,
            'message' => 'Customer updated successfully',
            'data'    => $customer,
        ], 200);
    }

    /**
     * Admin: Toggle customer active/inactive status
     * Endpoint: PUT /api/admin/customers/{id}/status
     */
    public function adminToggleStatus(Request $request, $id)
    {
        $customer = User::find($id);

        if (!$customer) {
            return response()->json([
                'status'  => false,
                'message' => 'Customer not found',
            ], 404);
        }

        if ($request->has('is_active')) {
            $customer->is_active = (bool)$request->is_active;
        } else {
            $customer->is_active = !$customer->is_active;
        }

        $customer->save();

        return response()->json([
            'status'  => true,
            'message' => 'Customer status updated successfully',
            'data'    => $customer,
        ], 200);
    }

    /**
     * Admin: Delete customer account
     * Endpoint: DELETE /api/admin/customers/{id}
     */
    public function adminDestroy($id)
    {
        $customer = User::find($id);

        if (!$customer) {
            return response()->json([
                'status'  => false,
                'message' => 'Customer not found',
            ], 404);
        }

        $customer->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Customer deleted successfully',
        ], 200);
    }
}
