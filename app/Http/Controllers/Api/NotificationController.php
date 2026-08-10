<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get unread notifications for the authenticated admin
     */
    public function getAdminNotifications(Request $request)
    {
        $admin = $request->user();
        if (!$admin) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
        }

        $notifications = $admin->unreadNotifications()->take(10)->get();

        return response()->json([
            'status' => true,
            'data' => $notifications
        ], 200);
    }

    /**
     * Get all notifications (read and unread) for the admin page
     */
    public function getAllAdminNotifications(Request $request)
    {
        $admin = $request->user();
        if (!$admin) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
        }

        $notifications = $admin->notifications()->paginate(20);

        return response()->json([
            'status' => true,
            'data' => $notifications
        ], 200);
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $admin = $request->user();
        if (!$admin) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
        }

        $notification = $admin->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'status' => true,
            'message' => 'Notification marked as read'
        ], 200);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $admin = $request->user();
        if (!$admin) {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], 401);
        }

        $admin->unreadNotifications->markAsRead();

        return response()->json([
            'status' => true,
            'message' => 'All notifications marked as read'
        ], 200);
    }
}
