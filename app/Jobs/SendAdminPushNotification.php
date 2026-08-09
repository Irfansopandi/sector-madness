<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Services\WebPushService;
use App\Models\PushSubscription;
use Illuminate\Support\Facades\Log;

class SendAdminPushNotification implements ShouldQueue
{
    use Queueable;

    public $title;
    public $message;
    public $url;

    public function __construct($title, $message, $url = '/admin')
    {
        $this->title = $title;
        $this->message = $message;
        $this->url = $url;
    }

    public function handle(WebPushService $webPushService): void
    {
        try {
            $subscriptions = PushSubscription::whereNotNull('admin_id')->get();
            if ($subscriptions->isEmpty()) {
                return;
            }

            $payload = [
                'title' => $this->title,
                'body' => $this->message,
                'icon' => '/images/logo.png',
                'url' => $this->url,
            ];

            $webPushService->sendToSubscriptions($subscriptions, $payload);
        } catch (\Exception $e) {
            Log::error('SendAdminPushNotification Job Failed: ' . $e->getMessage());
        }
    }
}
