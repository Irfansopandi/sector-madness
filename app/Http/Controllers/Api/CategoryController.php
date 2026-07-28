<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('products')->get();
        return response()->json([
            'status' => true,
            'data'   => $categories,
        ], 200);
    }

    public function show($slug)
    {
        $category = Category::where('slug', $slug)->with('products')->first();
        if (!$category) {
            return response()->json([
                'status'  => false,
                'message' => 'Category not found',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data'   => $category,
        ], 200);
    }
}
