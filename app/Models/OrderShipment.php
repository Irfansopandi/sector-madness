<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderShipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'biteship_order_id',
        'tracking_number',
        'courier_company',
        'courier_type',
        'shipping_cost',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'shipping_cost' => 'float',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
