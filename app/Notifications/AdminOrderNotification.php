<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AdminOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $title;
    public $message;
    public $orderNumber;

    public function __construct($title, $message, $orderNumber)
    {
        $this->title = $title;
        $this->message = $message;
        $this->orderNumber = $orderNumber;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'order_number' => $this->orderNumber,
            'url' => '/admin/orders/' . $this->orderNumber,
        ];
    }
}
