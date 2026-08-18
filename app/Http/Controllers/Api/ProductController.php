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
        $query = Product::with(['category', 'variants']);

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

        // Filter berdasarkan kategori dari Single Source of Truth database categories
        if ($request->filled('category')) {
            $catParam = trim($request->category);
            $catUpper = strtoupper($catParam);

            if (!in_array($catUpper, ['ALL', 'ALL PRODUCTS', 'SHOP'])) {
                if ($catUpper === 'NEW ARRIVALS') {
                    $query->where('collection_code', 'SECTOR 002')->orWhere('id', '>=', 5);
                } else {
                    // Cari kategori di database berdasarkan ID, slug, atau nama
                    $categoryModel = null;
                    if (is_numeric($catParam)) {
                        $categoryModel = \App\Models\Category::find($catParam);
                    }
                    if (!$categoryModel) {
                        $catSlug = \Illuminate\Support\Str::slug($catParam);
                        $categoryModel = \App\Models\Category::where('slug', $catSlug)
                            ->orWhere('name', $catUpper)
                            ->orWhereRaw('LOWER(name) = ?', [strtolower($catParam)])
                            ->first();
                    }

                    if ($categoryModel) {
                        $query->where('category_id', $categoryModel->id);
                    } else {
                        // Jika kategori tidak terdaftar di database, return 0 hasil dengan aman
                        $query->whereRaw('1 = 0');
                    }
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

        // Auto-cleanup expired discounts
        foreach ($products as $product) {
            if ($product->discount_expires_at && \Carbon\Carbon::parse($product->discount_expires_at)->isPast()) {
                if ($product->original_price && $product->original_price > $product->price) {
                    $product->price = $product->original_price;
                }
                $product->original_price = null;
                $product->discount_percentage = null;
                $product->discount_expires_at = null;
                $product->is_flash_sale = false;
                $product->save();
            }
        }

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

        if ($product->discount_expires_at && \Carbon\Carbon::parse($product->discount_expires_at)->isPast()) {
            if ($product->original_price && $product->original_price > $product->price) {
                $product->price = $product->original_price;
            }
            $product->original_price = null;
            $product->discount_percentage = null;
            $product->discount_expires_at = null;
            $product->is_flash_sale = false;
            $product->save();
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

    /**
     * Store new Product
     * Endpoint: POST /api/admin/products
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
        ]);

        $data = $request->only([
            'category_id',
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
            'details',
            'size_guide',
            'story',
            'limited',
            'stock',
        ]);

        if (isset($data['original_price']) && isset($data['price']) && $data['original_price'] !== null) {
            $origPrice = (float) $data['original_price'];
            $price = (float) $data['price'];
            if ($origPrice > 0 && $origPrice < $price) {
                $data['original_price'] = $price;
                $data['price'] = max(0, $price - $origPrice);
            }
            if ($data['original_price'] > $data['price']) {
                $data['discount_percentage'] = round((($data['original_price'] - $data['price']) / $data['original_price']) * 100);
            } else {
                $data['original_price'] = null;
                $data['discount_percentage'] = null;
                $data['discount_expires_at'] = null;
            }
        }

        $data['description'] = $data['description'] ?? '';
        $data['slug'] = \Illuminate\Support\Str::slug($request->name) . '-' . time();

        $product = Product::create($data);

        if ($request->has('variants') && is_array($request->variants)) {
            $totalStock = 0;
            foreach ($request->variants as $v) {
                $stk = (int) ($v['stock'] ?? 0);
                $totalStock += $stk;
                $product->variants()->create([
                    'color' => $v['color'] ?? 'Default',
                    'size'  => $v['size'] ?? 'M',
                    'stock' => $stk,
                ]);
            }
            if ($totalStock > 0) {
                $product->update(['stock' => $totalStock]);
            }
        }

        // PUSH NOTIFICATION: Trigger for New Product Release
        \App\Jobs\SendNewProductPush::dispatch($product);

        return response()->json([
            'status'  => true,
            'message' => 'Product created successfully',
            'data'    => $product->fresh()->load(['category', 'variants']),
        ], 201);
    }

    /**
     * Update Product
     * Endpoint: PUT /api/admin/products/{id}
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status'  => false,
                'message' => 'Product not found',
            ], 404);
        }

        $data = $request->only([
            'category_id',
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
            'details',
            'size_guide',
            'story',
            'limited',
            'stock',
        ]);

        if ($request->filled('name') && $request->name !== $product->name) {
            $data['slug'] = \Illuminate\Support\Str::slug($request->name) . '-' . time();
        }

        if ($request->filled('image')) {
            $newImage = $request->image;
            $currentGallery = $request->input('gallery', $product->gallery ?? []);
            if (!is_array($currentGallery)) {
                $currentGallery = [];
            }
            if (empty($currentGallery) || $currentGallery[0] !== $newImage) {
                $data['gallery'] = array_merge([$newImage], array_values(array_filter($currentGallery, fn($g) => $g !== $newImage)));
            }
        }

        if (isset($data['original_price']) && isset($data['price']) && $data['original_price'] !== null) {
            $origPrice = (float) $data['original_price'];
            $price = (float) $data['price'];
            if ($origPrice > 0 && $origPrice < $price) {
                $data['original_price'] = $price;
                $data['price'] = max(0, $price - $origPrice);
            }
            if ($data['original_price'] > $data['price']) {
                $data['discount_percentage'] = round((($data['original_price'] - $data['price']) / $data['original_price']) * 100);
            } else {
                $data['original_price'] = null;
                $data['discount_percentage'] = null;
                $data['discount_expires_at'] = null;
            }
        } else if ($request->exists('original_price') && $request->input('original_price') === null) {
            $data['original_price'] = null;
            $data['discount_percentage'] = null;
            $data['discount_expires_at'] = null;
        }

        $oldDiscount = $product->discount_percentage;
        
        $updateData = array_filter($data, function($value, $key) use ($request) {
            if ($value !== null) return true;
            if (in_array($key, ['original_price', 'discount_percentage', 'discount_expires_at'])) {
                if ($request->exists('original_price') && $request->input('original_price') === null) {
                    return true;
                }
                return $request->exists($key);
            }
            return false;
        }, ARRAY_FILTER_USE_BOTH);

        $product->update($updateData);

        // PUSH NOTIFICATION: Trigger only if discount increases and is > 0
        if (
            isset($data['discount_percentage']) && 
            $data['discount_percentage'] > 0 && 
            $data['discount_percentage'] != $oldDiscount
        ) {
            \App\Jobs\SendProductDiscountPush::dispatch($product, $oldDiscount);
        }

        if ($request->has('variants') && is_array($request->variants)) {
            $product->variants()->delete();
            $totalStock = 0;
            foreach ($request->variants as $v) {
                $stk = (int) ($v['stock'] ?? 0);
                $totalStock += $stk;
                $product->variants()->create([
                    'color' => $v['color'] ?? 'Default',
                    'size'  => $v['size'] ?? 'M',
                    'stock' => $stk,
                ]);
            }
            if ($totalStock > 0) {
                $product->update(['stock' => $totalStock]);
            }
        }

        return response()->json([
            'status'  => true,
            'message' => 'Product updated successfully',
            'data'    => $product->fresh()->load(['category', 'variants']),
        ], 200);
    }

    /**
     * Delete Product
     * Endpoint: DELETE /api/admin/products/{id}
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'status'  => false,
                'message' => 'Product not found',
            ], 404);
        }

        // Remove from shopping carts automatically when deleted by admin
        \Illuminate\Support\Facades\DB::table('cart_items')->where('product_id', $product->id)->delete();

        $product->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Product deleted successfully',
        ], 200);
    }
}
