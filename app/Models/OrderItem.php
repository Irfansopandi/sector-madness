<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'product_image',
        'color',
        'size',
        'quantity',
        'price',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price'    => 'float',
            'subtotal' => 'float',
        ];
    }

    protected $appends = ['product_image'];

    public function getProductImageAttribute($value)
    {
        // Use the saved value from DB if it exists
        if (!empty($value)) {
            return $value;
        }
        
        // Fallback for old orders: try to fetch from Product relation
        if ($this->relationLoaded('product') && $this->product) {
            return $this->product->image;
        }

        // If relation is not loaded, we load it manually just for the image if product_id exists
        if ($this->product_id) {
            $product = \App\Models\Product::find($this->product_id);
            if ($product && $product->image) {
                return $product->image;
            }
        }

        return '/collection1.png';
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
