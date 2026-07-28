<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'transaction_id',
        'snap_token',
        'payment_type',
        'payment_status',
        'gross_amount',
        'payload_response',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'gross_amount'     => 'float',
            'payload_response' => 'array',
            'paid_at'          => 'datetime',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
