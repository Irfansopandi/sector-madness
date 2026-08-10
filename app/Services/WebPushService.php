<?php

namespace App\Services;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use App\Models\PushSubscription;
use Illuminate\Support\Facades\Log;

class WebPushService
{
    protected $webPush;

    public function __construct()
    {
        $auth = [
            'VAPID' => [
                'subject' => env('APP_URL', 'mailto:admin@sectormadness.com'),
                'publicKey' => env('VAPID_PUBLIC_KEY'),
                'privateKey' => env('VAPID_PRIVATE_KEY'),
            ],
        ];

        if (!empty(env('VAPID_PUBLIC_KEY')) && !empty(env('VAPID_PRIVATE_KEY'))) {
            $this->webPush = new WebPush($auth);
        }
    }

    public function sendToSubscriptions($subscriptions, $payload)
    {
        if (!$this->webPush) {
            Log::error('WebPushService: WebPush not initialized. Check VAPID keys in .env');
            return;
        }

        $payloadJson = json_encode($payload);

        foreach ($subscriptions as $sub) {
            $this->webPush->queueNotification(
                Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                ]),
                $payloadJson
            );
        }

        \Illuminate\Support\Facades\Log::info('WebPushService queueing notification to ' . count($subscriptions) . ' endpoints.', $payload);

        foreach ($this->webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();

            if (!$report->isSuccess()) {
                \Illuminate\Support\Facades\Log::warning("WebPush Error {$endpoint}: {$report->getReason()}");
                if ($report->isSubscriptionExpired()) {
                    PushSubscription::where('endpoint', $endpoint)->delete();
                }
            } else {
                \Illuminate\Support\Facades\Log::info("WebPush Success {$endpoint}");
            }
        }
    }
}
