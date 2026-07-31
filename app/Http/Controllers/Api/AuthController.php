<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Customer Register API
     * Endpoint: POST /api/register
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users,email',
            'password'   => 'required|string|min:8',
            'phone'      => 'nullable|numeric|digits_between:8,20',
            'birth_date' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // Simpan data langsung ke tabel users (tanpa email verification)
        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'phone'      => $request->phone ?? null,
            'birth_date' => $request->birth_date ?? null,
            'last_login_at' => null,
        ]);

        $token = $user->createToken('customer_token', ['customer'])->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'User registered successfully',
            'token'  => $token,
            'user'   => $user,
        ], 201);
    }

    /**
     * Customer Login API
     * Endpoint: POST /api/login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'status'  => false,
                'error_type' => 'email_not_found',
                'message' => 'Email address is not registered in our system.',
            ], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => false,
                'error_type' => 'wrong_password',
                'message' => 'Incorrect password. Please check and try again.',
            ], 401);
        }

        // Update last_login_at dengan waktu login terbaru
        $user->update([
            'last_login_at' => now(),
        ]);

        $token = $user->createToken('customer_token', ['customer'])->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login successful',
            'token'  => $token,
            'user'   => $user,
        ], 200);
    }

    /**
     * Customer Logout API
     * Endpoint: POST /api/logout
     */
    public function logout(Request $request)
    {
        // Menghapus token user aktif
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Logged out successfully',
        ], 200);
    }

    /**
     * Admin Login API
     * Endpoint: POST /api/admin/login
     */
    public function adminLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'status'  => false,
                'message' => 'Invalid admin credentials',
            ], 401);
        }

        $admin->update([
            'last_login_at' => now(),
        ]);

        $token = $admin->createToken('admin_token', ['admin'])->plainTextToken;

        return response()->json([
            'status'  => true,
            'message' => 'Admin login successful',
            'token'   => $token,
            'admin'   => $admin,
        ], 200);
    }

    /**
     * Admin Logout API
     * Endpoint: POST /api/admin/logout
     */
    public function adminLogout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Admin logged out successfully',
        ], 200);
    }

    /**
     * Get Customer Profile Data
     * Endpoint: GET /api/user
     */
    public function profile(Request $request)
    {
        $user = $request->user('sanctum') ?: $request->user();
        if (!$user) {
            $memberEmail = $request->header('X-Member-Email');
            if ($memberEmail) {
                $user = User::where('email', $memberEmail)->first();
            }
        }

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
        }

        // Jika nomor telepon pengguna masih kosong (misal pada akun lama), cari dari daftar alamat atau pesanan
        if ($user && empty($user->phone)) {
            $address = \App\Models\ShippingAddress::where('user_id', $user->id)->latest()->first();
            if ($address && !empty($address->phone_number)) {
                $user->phone = $address->phone_number;
                $user->save();
            }
        }

        return response()->json([
            'status' => true,
            'data'   => $user,
        ], 200);
    }

    /**
     * Update Customer Profile Data
     * Endpoint: PUT /api/user/profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user('sanctum') ?: $request->user();
        if (!$user) {
            $memberEmail = $request->header('X-Member-Email');
            if ($memberEmail) {
                $user = User::where('email', $memberEmail)->first();
            }
        }

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthorized or User not found'], 401);
        }

        $validator = Validator::make($request->all(), [
            'name'  => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
            'birth_date' => 'nullable|string|max:50',
            'password' => 'nullable|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => 'Validation Error', 'errors' => $validator->errors()], 422);
        }

        $updateData = array_filter([
            'name'       => $request->name ?? $user->name,
            'email'      => $request->email ?? $user->email,
            'phone'      => $request->phone ?? $user->phone,
            'birth_date' => $request->birth_date ?? $user->birth_date,
        ]);
        if (!empty($request->password)) {
            $updateData['password'] = Hash::make($request->password);
        }
        $user->update($updateData);

        return response()->json([
            'status'  => true,
            'message' => 'Profile updated successfully',
            'data'    => $user,
        ], 200);
    }
}
