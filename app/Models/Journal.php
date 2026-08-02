<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Journal extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'category',
        'issue',
        'date',
        'summary',
        'image',
        'featured',
        'content',
        'quote',
        'sort_order',
        'is_published',
    ];

    protected $casts = [
        'featured' => 'boolean',
        'is_published' => 'boolean',
        'content' => 'array',
        'sort_order' => 'integer',
    ];
}
