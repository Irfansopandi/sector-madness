<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Get Product Catalog with Filtering and Sorting
     * Endpoint: GET /api/products
     */
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Filter berdasarkan pencarian (name, description, collection)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('collection', 'like', "%{$search}%")
                  ->orWhere('tagline', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan kategori atau tag
        if ($request->filled('category')) {
            $cat = strtoupper($request->category);
            if (!in_array($cat, ['ALL', 'ALL PRODUCTS', 'SHOP'])) {
                if ($cat === 'NEW ARRIVALS') {
                    $query->where('collection_code', 'SECTOR 002')->orWhere('id', '>=', 5);
                } elseif ($cat === 'OUTERWEAR' || $cat === 'JACKETS') {
                    $query->where(function ($q) {
                        $q->where('name', 'like', '%bomber%')
                          ->orWhere('name', 'like', '%trench%')
                          ->orWhere('name', 'like', '%anorak%')
                          ->orWhere('name', 'like', '%vest%')
                          ->orWhere('name', 'like', '%jacket%')
                          ->orWhere('name', 'like', '%coat%');
                    });
                } elseif ($cat === 'T-SHIRT' || $cat === 'T-SHIRTS') {
                    $query->where('name', 'like', '%tee%')->orWhere('name', 'like', '%shirt%');
                } elseif ($cat === 'BOTTOMS' || $cat === 'CARGO' || $cat === 'TROUSERS') {
                    $query->where('name', 'like', '%cargo%')->orWhere('name', 'like', '%trousers%')->orWhere('name', 'like', '%pants%');
                } else {
                    $query->where('name', 'like', "%{$cat}%")->orWhere('collection', 'like', "%{$cat}%");
                }
            }
        }

        // Sorting
        if ($request->filled('sort_by')) {
            if ($request->sort_by === 'PRICE LOW TO HIGH') {
                $query->orderBy('price', 'asc');
            } elseif ($request->sort_by === 'PRICE HIGH TO LOW') {
                $query->orderBy('price', 'desc');
            } elseif ($request->sort_by === 'NEW IN') {
                $query->orderBy('id', 'desc');
            }
        } else {
            $query->orderBy('id', 'asc');
        }

        $products = $query->get();

        return response()->json([
            'status' => true,
            'count'  => $products->count(),
            'data'   => $products,
        ], 200);
    }

    /**
     * Get Product Detail by Slug
     * Endpoint: GET /api/products/{slug}
     */
    public function show($slug)
    {
        $product = Product::with(['category', 'variants'])->where('slug', $slug)->first();

        if (!$product) {
            return response()->json([
                'status'  => false,
                'message' => 'Product not found',
            ], 404);
        }

        // Ambil rekomendasi produk terkait
        $relatedProducts = Product::where('id', '!=', $product->id)->inRandomOrder()->take(4)->get();

        return response()->json([
            'status'  => true,
            'data'    => $product,
            'related' => $relatedProducts,
        ], 200);
    }

    /**
     * Get all variants for a product
     * Endpoint: GET /api/products/{slug}/variants
     */
    public function variants($slug)
    {
        $product = Product::where('slug', $slug)->first();
        if (!$product) {
            return response()->json([
                'status'  => false,
                'message' => 'Product not found',
            ], 404);
        }

        return response()->json($product->variants);
    }
}
