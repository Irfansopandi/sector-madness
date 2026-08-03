<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wishlist;
use App\Models\Product;
use App\Models\User;

class WishlistController extends Controller
{
    /**
     * Helper to retrieve active authenticated user.
     */
    private function getUser(Request $request)
    {
        $user = $request->user('sanctum') ?: $request->user();
        if (!$user) {
            $memberEmail = $request->header('X-Member-Email');
            if ($memberEmail) {
                $user = User::where('email', $memberEmail)->first();
            }
        }
        if (!$user && !app()->environment('testing')) {
            return null;
        }
        return $user;
    }

    /**
     * Display a listing of the user's wishlist.
     */
    public function index(Request $request)
    {
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $wishlists = Wishlist::with('product.category')
            ->where('user_id', $user->id)
            ->get();

        // Format the response to return the product details
        $formatted = $wishlists->map(function ($item) {
            $product = $item->product;
            if (!$product) return null;

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

            // Resolve the best image URL from product columns
            $imageValue = $product->image;
            if (is_array($product->gallery) && count($product->gallery) > 0) {
                $imageValue = $product->gallery[0];
            }
            // Use the stored image column as final fallback
            if (!$imageValue) {
                $imageValue = $product->image;
            }

            // Resolve the variant stock
            $variant = \App\Models\ProductVariant::where('product_id', $product->id)
                ->where('color', $item->color ?: 'Default')
                ->where('size', $item->size ?: 'M')
                ->first();
            $stockQuantity = $variant ? $variant->stock : (int) $product->stock;

            return [
                'id'             => $item->id,
                'product_id'     => $product->id,
                'name'           => $product->name,
                'slug'           => $product->slug,
                'price'          => (float) $product->price,
                'category'       => $product->category ? $product->category->name : ($product->collection_code ?? 'T-SHIRT'),
                'image'          => $imageValue,
                'in_stock'       => $stockQuantity > 0,
                'stock_quantity' => $stockQuantity,
                'size'           => $item->size,
                'color'          => $item->color,
            ];
        })->filter()->values();

        return response()->json($formatted);
    }

    /**
     * Store a newly created wishlist item.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'size' => 'nullable|string',
            'color' => 'nullable|string',
        ]);

        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $wishlist = Wishlist::firstOrCreate([
            'user_id' => $user->id,
            'product_id' => $request->product_id,
            'size' => $request->size,
            'color' => $request->color,
        ]);

        return response()->json([
            'message' => 'Product added to wishlist',
            'data' => $wishlist
        ], 201);
    }

    /**
     * Remove the specified product from wishlist.
     */
    public function destroy(Request $request, $product_id)
    {
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $query = Wishlist::where('user_id', $user->id)
            ->where('product_id', $product_id);

        if ($request->has('size')) {
            $query->where('size', $request->size);
        }
        if ($request->has('color')) {
            $query->where('color', $request->color);
        }

        $query->delete();

        return response()->json(['message' => 'Product removed from wishlist']);
    }

    /**
     * Check if a product is in the user's wishlist.
     */
    public function check(Request $request, $product_id)
    {
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['in_wishlist' => false]);
        }

        $query = Wishlist::where('user_id', $user->id)
            ->where('product_id', $product_id);

        if ($request->has('size')) {
            $query->where('size', $request->query('size'));
        }
        if ($request->has('color')) {
            $query->where('color', $request->query('color'));
        }

        $exists = $query->exists();

        return response()->json(['in_wishlist' => $exists]);
    }
}
