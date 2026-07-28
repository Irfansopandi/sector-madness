<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'discount_type',
        'discount_value',
        'minimum_purchase',
        'is_active',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'discount_value'   => 'float',
            'minimum_purchase' => 'float',
            'is_active'        => 'boolean',
            'expires_at'       => 'datetime',
        ];
    }
}
