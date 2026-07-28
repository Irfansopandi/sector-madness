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
        'details',
        'story',
        'limited',
        'stock',
    ];

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'colors'  => 'array',
            'sizes'   => 'array',
            'details' => 'array',
            'limited' => 'boolean',
            'price'   => 'float',
            'stock'   => 'integer',
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
}
