<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Models\User;
use App\Mail\ResetPasswordOtpMail;

class ForgotPasswordController extends Controller
{
    /**
     * POST /api/forgot-password/send-otp
     */
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;
        $otp = (string) random_int(100000, 999999);

        // Delete existing token if any
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Insert new token
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($otp),
            'created_at' => Carbon::now()
        ]);

        // Send Email
        try {
            Mail::to($email)->send(new ResetPasswordOtpMail($otp));
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to send email. Please check server configuration.',
                'error' => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'status' => true,
            'message' => 'OTP sent successfully.'
        ], 200);
    }

    /**
     * POST /api/forgot-password/verify-otp
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|numeric|digits:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid or expired OTP.'
            ], 400);
        }

        // Check expiration (15 minutes)
        if (Carbon::parse($record->created_at)->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'status' => false,
                'message' => 'OTP has expired. Please request a new one.'
            ], 400);
        }

        // Check OTP matches
        if (!Hash::check($request->otp, $record->token)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid OTP code.'
            ], 400);
        }

        return response()->json([
            'status' => true,
            'message' => 'OTP verified successfully.'
        ], 200);
    }

    /**
     * POST /api/forgot-password/reset
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|numeric|digits:6',
            'password' => 'required|string|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$record || Carbon::parse($record->created_at)->addMinutes(15)->isPast() || !Hash::check($request->otp, $record->token)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid or expired OTP.'
            ], 400);
        }

        // Update password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Password reset successfully.'
        ], 200);
    }
}
