<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'slug',
        'name',
        'collection',
        'collection_code',
        'tagline',
        'description',
        'material',
        'weight',
        'price',
        'original_price',
        'discount_percentage',
        'discount_expires_at',
        'is_flash_sale',
        'image',
        'gallery',
        'colors',
        'sizes',
        'size_guide',
        'details',
        'story',
        'limited',
        'stock',
    ];

    protected function casts(): array
    {
        return [
            'gallery'             => 'array',
            'colors'              => 'array',
            'sizes'               => 'array',
            'size_guide'          => 'array',
            'details'             => 'array',
            'limited'             => 'boolean',
            'is_flash_sale'       => 'boolean',
            'price'               => 'float',
            'original_price'      => 'float',
            'discount_percentage' => 'integer',
            'discount_expires_at' => 'datetime',
            'stock'               => 'integer',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
