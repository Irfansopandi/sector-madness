<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SizeGuide extends Model
{
    protected $fillable = [
        'category',
        'category_code',
        'fit_description',
        'description',
        'columns',
        'rows',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'columns' => 'array',
        'rows' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
