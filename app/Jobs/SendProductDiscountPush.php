<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Services\WebPushService;
use App\Models\PushSubscription;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class SendProductDiscountPush implements ShouldQueue
{
    use Queueable;

    public $product;
    public $oldDiscount;

    public function __construct(Product $product, $oldDiscount)
    {
        $this->product = $product;
        $this->oldDiscount = $oldDiscount;
    }

    public function handle(WebPushService $webPushService): void
    {
        try {
            $subscriptions = PushSubscription::whereNotNull('user_id')->get();
            if ($subscriptions->isEmpty()) {
                return;
            }

            $payload = [
                'title' => '🔥 Product Sale',
                'body' => "{$this->product->name} sekarang diskon {$this->product->discount_percentage}%.",
                'icon' => '/images/logo.png',
                'url' => '/product/' . $this->product->slug,
            ];

            $webPushService->sendToSubscriptions($subscriptions, $payload);
        } catch (\Exception $e) {
            Log::error('SendProductDiscountPush Job Failed: ' . $e->getMessage());
        }
    }
}
