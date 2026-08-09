<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Services\WebPushService;
use App\Models\PushSubscription;
use App\Models\Order;
use Illuminate\Support\Facades\Log;

class SendOrderTrackingPush implements ShouldQueue
{
    use Queueable;

    public $order;
    public $messageType; // 'status' or 'tracking'

    public function __construct(Order $order, $messageType = 'status')
    {
        $this->order = $order;
        $this->messageType = $messageType;
    }

    public function handle(WebPushService $webPushService): void
    {
        try {
            if (!$this->order->user_id) {
                return; // Guest order, no push
            }

            $subscriptions = PushSubscription::where('user_id', $this->order->user_id)->get();
            
            if ($subscriptions->isEmpty()) {
                return;
            }

            $title = '📦 Pembaruan Pesanan';
            $body = "Pesanan kamu #{$this->order->order_number} ";
            
            if ($this->messageType === 'tracking' && $this->order->shipment && $this->order->shipment->tracking_number) {
                $body .= "sedang dikirim dengan nomor resi: {$this->order->shipment->tracking_number}.";
            } else {
                $status = ucfirst($this->order->status);
                $body .= "statusnya berubah menjadi: {$status}.";
            }

            $payload = [
                'title' => $title,
                'body' => $body,
                'icon' => '/icon.png', // Square Next.js icon
                'url' => '/dashboard/orders?view_order=' . $this->order->order_number,
            ];

            $webPushService->sendToSubscriptions($subscriptions, $payload);
        } catch (\Exception $e) {
            Log::error('SendOrderTrackingPush Job Failed: ' . $e->getMessage());
        }
    }
}
