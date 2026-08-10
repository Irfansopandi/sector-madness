<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PushSubscription;
use App\Models\Admin;
use App\Models\User;

class PushSubscriptionController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url|max:500',
            'keys.p256dh' => 'required|string|max:255',
            'keys.auth' => 'required|string|max:255',
        ]);

        $token = $request->bearerToken();
        $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        
        if (!$accessToken) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $isAdmin = $accessToken->tokenable_type === 'App\Models\Admin';
        $isUser = $accessToken->tokenable_type === 'App\Models\User';
        $userId = $accessToken->tokenable_id;

        if (!$isAdmin && !$isUser) {
            return response()->json(['status' => false, 'message' => 'Invalid user type.'], 403);
        }

        $subscription = PushSubscription::where('endpoint', $request->endpoint)->first();
        
        if ($subscription) {
            if ($isUser && !$isAdmin) {
                $subscription->user_id = $userId;
            } elseif ($isAdmin) {
                $subscription->admin_id = $userId;
            }
            $subscription->public_key = $request->input('keys.p256dh');
            $subscription->auth_token = $request->input('keys.auth');
            $subscription->save();
        } else {
            PushSubscription::create([
                'endpoint' => $request->endpoint,
                'user_id' => $isUser && !$isAdmin ? $userId : null,
                'admin_id' => $isAdmin ? $userId : null,
                'public_key' => $request->input('keys.p256dh'),
                'auth_token' => $request->input('keys.auth'),
            ]);
        }

        return response()->json(['status' => true, 'message' => 'Subscribed successfully.']);
    }

    public function unsubscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $isAdmin = $user instanceof Admin;
        $isUser = $user instanceof User;

        $query = PushSubscription::where('endpoint', $request->endpoint);

        if ($isAdmin) {
            $query->where('admin_id', $user->id);
        } elseif ($isUser) {
            $query->where('user_id', $user->id);
        } else {
            return response()->json(['status' => false, 'message' => 'Invalid user type.'], 403);
        }

        $query->delete();

        return response()->json(['status' => true, 'message' => 'Unsubscribed successfully.']);
    }
}
