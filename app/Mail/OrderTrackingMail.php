<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Order;

class OrderTrackingMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $order;
    public $messageType; // 'status' or 'tracking'

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, $messageType = 'status')
    {
        $this->order = $order;
        $this->messageType = $messageType;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        if ($this->messageType === 'tracking') {
            $subject = '📦 Resi Pengiriman Pesanan #' . $this->order->order_number;
        } elseif ($this->messageType === 'cancel_approved') {
            $subject = '✅ Pembatalan Pesanan Disetujui #' . $this->order->order_number;
        } elseif ($this->messageType === 'cancel_rejected') {
            $subject = '❌ Pembatalan Pesanan Ditolak #' . $this->order->order_number;
        } else {
            $subject = '📝 Status Pesanan Diperbarui #' . $this->order->order_number;
        }

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.tracking',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
