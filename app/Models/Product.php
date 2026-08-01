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
            'gallery'    => 'array',
            'colors'     => 'array',
            'sizes'      => 'array',
            'size_guide' => 'array',
            'details'    => 'array',
            'limited'    => 'boolean',
            'price'      => 'float',
            'stock'      => 'integer',
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
