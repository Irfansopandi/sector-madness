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
            } elseif ($this->messageType === 'cancel_approved') {
                $title = '✅ Pembatalan Disetujui';
                $body = "Ajuan pembatalan pesanan kamu #{$this->order->order_number} telah disetujui oleh admin.";
            } elseif ($this->messageType === 'cancel_rejected') {
                $title = '❌ Pembatalan Ditolak';
                $body = "Ajuan pembatalan pesanan kamu #{$this->order->order_number} ditolak. Pesanan akan tetap diproses.";
            } else {
                $status = ucfirst($this->order->status);
                $body .= "statusnya berubah menjadi: {$status}.";
            }
            
            // Jika pesanan sedang dikirim atau sudah sampai (shipped/delivery/delivered)
            if (in_array(strtolower($this->order->status), ['shipped', 'delivery', 'delivering', 'delivered'])) {
                $body .= " Saat paket sudah sampai, pastikan kondisinya aman dan sesuai sebelum melakukan konfirmasi 'Pesanan Diterima' di detail pesanan ya.";
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
