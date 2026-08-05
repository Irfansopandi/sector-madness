<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class VoucherController extends Controller
{
    /**
     * Admin: Get all vouchers with search and status filter
     * Endpoint: GET /api/admin/vouchers
     */
    public function adminIndex(Request $request)
    {
        $query = Voucher::query();

        // Search by Code or Name
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        // Filter by Status: ACTIVE, INACTIVE, EXPIRED
        if ($request->filled('status') && strtoupper($request->status) !== 'ALL') {
            $statusStr = strtoupper($request->status);
            if ($statusStr === 'ACTIVE') {
                $query->where('is_active', true)
                      ->where(function ($q) {
                          $q->whereNull('expires_at')
                            ->orWhere('expires_at', '>=', now());
                      });
            } elseif ($statusStr === 'INACTIVE') {
                $query->where('is_active', false);
            } elseif ($statusStr === 'EXPIRED') {
                $query->whereNotNull('expires_at')
                      ->where('expires_at', '<', now());
            }
        }

        $vouchers = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data'   => $vouchers,
        ], 200);
    }

    /**
     * Admin: Store a new voucher
     * Endpoint: POST /api/admin/vouchers
     */
    public function adminStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code'             => 'required|string|max:50|unique:vouchers,code',
            'name'             => 'required|string|max:255',
            'discount_type'    => 'required|in:fixed,percentage',
            'discount_value'   => 'required|numeric|min:0',
            'minimum_purchase' => 'nullable|numeric|min:0',
            'is_active'        => 'nullable|boolean',
            'expires_at'       => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Percentage validation: cannot exceed 100%
        if ($request->discount_type === 'percentage' && (float)$request->discount_value > 100) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => ['discount_value' => ['Nilai persentase diskon tidak boleh melebihi 100%']],
            ], 422);
        }

        $voucher = Voucher::create([
            'code'             => strtoupper(trim($request->code)),
            'name'             => trim($request->name),
            'discount_type'    => $request->discount_type,
            'discount_value'   => (float)$request->discount_value,
            'minimum_purchase' => (float)($request->minimum_purchase ?? 0),
            'is_active'        => $request->has('is_active') ? (bool)$request->is_active : true,
            'expires_at'       => $request->filled('expires_at') ? $request->expires_at : null,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Kode voucher berhasil dibuat',
            'data'    => $voucher,
        ], 201);
    }

    /**
     * Admin: Show voucher detail
     * Endpoint: GET /api/admin/vouchers/{id}
     */
    public function adminShow($id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json([
                'status'  => false,
                'message' => 'Voucher tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data'   => $voucher,
        ], 200);
    }

    /**
     * Admin: Update voucher
     * Endpoint: PUT /api/admin/vouchers/{id}
     */
    public function adminUpdate(Request $request, $id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json([
                'status'  => false,
                'message' => 'Voucher tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'code'             => ['nullable', 'string', 'max:50', Rule::unique('vouchers', 'code')->ignore($voucher->id)],
            'name'             => 'nullable|string|max:255',
            'discount_type'    => 'nullable|in:fixed,percentage',
            'discount_value'   => 'nullable|numeric|min:0',
            'minimum_purchase' => 'nullable|numeric|min:0',
            'is_active'        => 'nullable|boolean',
            'expires_at'       => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $discType = $request->discount_type ?? $voucher->discount_type;
        $discVal  = $request->has('discount_value') ? (float)$request->discount_value : $voucher->discount_value;

        if ($discType === 'percentage' && $discVal > 100) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => ['discount_value' => ['Nilai persentase diskon tidak boleh melebihi 100%']],
            ], 422);
        }

        $updateData = [];
        if ($request->filled('code')) {
            $updateData['code'] = strtoupper(trim($request->code));
        }
        if ($request->filled('name')) {
            $updateData['name'] = trim($request->name);
        }
        if ($request->has('discount_type')) {
            $updateData['discount_type'] = $request->discount_type;
        }
        if ($request->has('discount_value')) {
            $updateData['discount_value'] = (float)$request->discount_value;
        }
        if ($request->has('minimum_purchase')) {
            $updateData['minimum_purchase'] = (float)$request->minimum_purchase;
        }
        if ($request->has('is_active')) {
            $updateData['is_active'] = (bool)$request->is_active;
        }
        if ($request->has('expires_at')) {
            $updateData['expires_at'] = $request->filled('expires_at') ? $request->expires_at : null;
        }

        $voucher->update($updateData);

        return response()->json([
            'status'  => true,
            'message' => 'Kode voucher berhasil diperbarui',
            'data'    => $voucher->fresh(),
        ], 200);
    }

    /**
     * Admin: Toggle active status
     * Endpoint: PUT /api/admin/vouchers/{id}/status
     */
    public function adminToggleStatus(Request $request, $id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json([
                'status'  => false,
                'message' => 'Voucher tidak ditemukan',
            ], 404);
        }

        $newStatus = $request->has('is_active') ? (bool)$request->is_active : !$voucher->is_active;
        $voucher->update(['is_active' => $newStatus]);

        return response()->json([
            'status'  => true,
            'message' => 'Status voucher berhasil diperbarui',
            'data'    => $voucher,
        ], 200);
    }

    /**
     * Admin: Delete voucher
     * Endpoint: DELETE /api/admin/vouchers/{id}
     */
    public function adminDestroy($id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json([
                'status'  => false,
                'message' => 'Voucher tidak ditemukan',
            ], 404);
        }

        $voucher->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Voucher berhasil dihapus dari database',
        ], 200);
    }
}
