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

        $user = $request->user();
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $isAdmin = $user instanceof Admin;
        $isUser = $user instanceof User;

        if (!$isAdmin && !$isUser) {
            return response()->json(['status' => false, 'message' => 'Invalid user type.'], 403);
        }

        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $request->endpoint],
            [
                'user_id' => $isUser && !$isAdmin ? $user->id : null,
                'admin_id' => $isAdmin ? $user->id : null,
                'public_key' => $request->input('keys.p256dh'),
                'auth_token' => $request->input('keys.auth'),
            ]
        );

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
