<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Services\WebPushService;
use App\Models\PushSubscription;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class SendNewProductPush implements ShouldQueue
{
    use Queueable;

    public $product;

    public function __construct(Product $product)
    {
        $this->product = $product;
    }

    public function handle(WebPushService $webPushService): void
    {
        try {
            $subscriptions = PushSubscription::whereNotNull('user_id')->get();
            if ($subscriptions->isEmpty()) {
                return;
            }

            $payload = [
                'title' => '✨ Produk Baru Rilis!',
                'body' => "Kami baru saja merilis {$this->product->name}. Cek koleksi terbaru kami sekarang!",
                'icon' => '/images/logo.png',
                'url' => '/product/' . $this->product->slug,
            ];

            $webPushService->sendToSubscriptions($subscriptions, $payload);
        } catch (\Exception $e) {
            Log::error('SendNewProductPush Job Failed: ' . $e->getMessage());
        }
    }
}
