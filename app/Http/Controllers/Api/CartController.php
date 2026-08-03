<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Helper to retrieve active authenticated user.
     */
    private function getUser(Request $request)
    {
        // Only trust Sanctum token authentication — no header fallback
        $user = $request->user('sanctum') ?: $request->user();

        // CRITICAL: Admin model has separate ID space from User model.
        // Admin(id=1) != User(id=1). Reject Admin models to prevent cart leakage.
        if ($user && !($user instanceof \App\Models\User)) {
            return null;
        }

        if (!$user && !app()->environment('testing')) {
            return null;
        }
        return $user;
    }

    /**
     * Get Customer Cart & Items
     * Endpoint: GET /api/cart
     */
    public function index(Request $request)
    {
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json([
                'status' => true,
                'data' => [
                    'cart_id'        => 0,
                    'items'          => [],
                    'total_quantity' => 0,
                    'subtotal'       => 0,
                ],
            ]);
        }
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        $cartItems = CartItem::with('product.category')->where('cart_id', $cart->id)->get();
        
        $formattedItems = $cartItems->map(function ($item) {
            $product = $item->product;

            if ($product && $product->discount_expires_at && \Carbon\Carbon::parse($product->discount_expires_at)->isPast()) {
                if ($product->original_price && $product->original_price > $product->price) {
                    $product->price = $product->original_price;
                }
                $product->original_price = null;
                $product->discount_percentage = null;
                $product->discount_expires_at = null;
                $product->is_flash_sale = false;
                $product->save();
            }

            $rawPrice = $product ? (float)$product->price : (float)$item->price;
            $priceIdr = $rawPrice < 1000 ? $rawPrice * 1000 : $rawPrice;
            
            $origPrice = $product && $product->original_price ? (float)$product->original_price : 0;
            $origPriceIdr = $origPrice > 0 ? ($origPrice < 1000 ? $origPrice * 1000 : $origPrice) : 0;
            $discountIdr = ($origPriceIdr > $priceIdr) ? ($origPriceIdr - $priceIdr) : 0;
            
            $subtotalIdr = $priceIdr * $item->quantity;

            $variant = null;
            if ($product && $item->color && $item->size && $item->color !== 'DEFAULT' && $item->color !== 'Default') {
                $variant = \App\Models\ProductVariant::where('product_id', $product->id)
                    ->where('color', $item->color)
                    ->where('size', $item->size)
                    ->first();
            }
            $stock = $variant ? $variant->stock : ($product ? (int)$product->stock : 49);
            $remainingStock = max(0, $stock - $item->quantity);
            
            $itemColor = $item->color;
            if ($itemColor && in_array(strtolower(trim($itemColor)), ['default', 'none', 'n/a', 'null', ''])) {
                $itemColor = null;
            }

            $itemSize = $item->size;
            if ($itemSize && in_array(strtolower(trim($itemSize)), ['default', 'none', 'n/a', 'null', ''])) {
                $itemSize = null;
            }

            return [
                'id'              => $item->id,
                'product_id'      => $item->product_id,
                'slug'            => $product ? $product->slug : '',
                'product_image'   => $product ? $product->image : '/images/products/product-1.png',
                'product_name'    => $product ? $product->name : 'Technical Garment',
                'category'        => $product ? ($product->category ? $product->category->name : ($product->collection_code ?? 'T-SHIRT')) : 'T-SHIRT',
                'variant'         => ($itemColor ? "Color: {$itemColor}" : '') . ($itemSize ? " | Size: {$itemSize}" : ''),
                'color'           => $itemColor,
                'size'            => $itemSize,
                'quantity'        => $item->quantity,
                'stock'           => $stock,
                'remaining_stock' => $remainingStock,
                'price'           => $priceIdr,
                'original_price'  => $origPriceIdr > 0 ? $origPriceIdr : ($priceIdr + $discountIdr),
                'discount'        => $discountIdr,
                'subtotal'        => $subtotalIdr,
            ];
        });

        $totalQuantity = $formattedItems->sum('quantity');
        $subtotal = $formattedItems->sum('subtotal');

        return response()->json([
            'status' => true,
            'data'   => [
                'cart_id'        => $cart->id,
                'items'          => $formattedItems,
                'total_quantity' => $totalQuantity,
                'subtotal'       => $subtotal,
            ],
        ], 200);
    }

    /**
     * Add Item to Cart
     * Endpoint: POST /api/cart/items atau POST /api/cart
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable',
            'slug'       => 'nullable|string',
            'name'       => 'nullable|string',
            'color'      => 'nullable|string',
            'size'       => 'nullable|string',
            'quantity'   => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = $this->getUser($request);
        if (!$user) {
            return response()->json([
                'status'  => false,
                'message' => 'Unauthenticated. Please log in to add items to bag.',
            ], 401);
        }

        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        
        $product = null;
        if ($request->filled('product_id') && is_numeric($request->product_id)) {
            $product = Product::find($request->product_id);
        }
        if (!$product && $request->filled('slug')) {
            $product = Product::where('slug', $request->slug)->first();
        }
        if (!$product && $request->filled('name')) {
            $product = Product::where('name', $request->name)->first();
        }
        if (!$product) {
            $product = Product::first();
        }

        if (!$product) {
            return response()->json([
                'status'  => false,
                'message' => 'Product catalog is empty.',
            ], 422);
        }

        $qty = $request->quantity ?: 1;

        $variant = $product ? \App\Models\ProductVariant::where('product_id', $product->id)
            ->where('color', $request->color ?: 'Default')
            ->where('size', $request->size ?: 'M')
            ->first() : null;
        $variantStock = $variant ? $variant->stock : ($product ? $product->stock : 0);

        if ($variantStock < $qty) {
            return response()->json([
                'status'  => false,
                'message' => 'Insufficient stock for this variant.',
            ], 422);
        }

        $colorVal = ($request->color && !in_array(strtolower(trim($request->color)), ['default', 'none', 'n/a', 'null', ''])) ? $request->color : null;
        $sizeVal = ($request->size && !in_array(strtolower(trim($request->size)), ['default', 'none', 'n/a', 'null', ''])) ? $request->size : null;

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->where('color', $colorVal)
            ->where('size', $sizeVal)
            ->first();

        if ($cartItem) {
            $newQty = $cartItem->quantity + $qty;
            if ($variantStock < $newQty) {
                return response()->json([
                    'status' => false,
                    'message' => 'Cannot add more quantity than available stock for this variant.',
                ], 422);
            }
            $cartItem->quantity = $newQty;
            $cartItem->save();
        } else {
            $cartItem = CartItem::create([
                'cart_id'    => $cart->id,
                'product_id' => $product->id,
                'color'      => $colorVal,
                'size'       => $sizeVal,
                'quantity'   => $qty,
                'price'      => $product->price,
            ]);
        }

        return response()->json([
            'status'  => true,
            'message' => 'Product added to bag successfully',
            'data'    => $cartItem->load('product'),
        ], 200);
    }

    /**
     * Update Item Quantity
     * Endpoint: PUT /api/cart/{id} atau PUT /api/cart/items/{id}
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validation Error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
        }
        $cart = Cart::where('user_id', $user->id)->first();
        if (!$cart) {
            return response()->json(['status' => false, 'message' => 'Cart not found'], 404);
        }

        $cartItem = CartItem::with('product')->where('cart_id', $cart->id)->where('id', $id)->first();

        if (!$cartItem) {
            return response()->json(['status' => false, 'message' => 'Item not found in bag'], 404);
        }

        $product = $cartItem->product;
        $variant = $product ? \App\Models\ProductVariant::where('product_id', $product->id)
            ->where('color', $cartItem->color ?: 'Default')
            ->where('size', $cartItem->size ?: 'M')
            ->first() : null;
        $variantStock = $variant ? $variant->stock : ($product ? $product->stock : 0);

        if ($product && $variantStock < $request->quantity) {
            return response()->json([
                'status'  => false,
                'message' => 'Requested quantity exceeds available variant stock (' . $variantStock . ').',
            ], 422);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json([
            'status'  => true,
            'message' => 'Quantity updated successfully',
            'data'    => $cartItem,
        ], 200);
    }

    /**
     * Remove Item from Cart
     * Endpoint: DELETE /api/cart/{id} atau DELETE /api/cart/items/{id}
     */
    public function destroy(Request $request, $id)
    {
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
        }
        $cart = Cart::where('user_id', $user->id)->first();

        if ($cart) {
            CartItem::where('cart_id', $cart->id)->where('id', $id)->delete();
        }

        return response()->json([
            'status'  => true,
            'message' => 'Item removed from bag',
        ], 200);
    }

    /**
     * Clear All Items in Cart
     * Endpoint: DELETE /api/cart
     */
    public function clear(Request $request)
    {
        $user = $this->getUser($request);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'Unauthenticated.'], 401);
        }
        $cart = Cart::where('user_id', $user->id)->first();
        if ($cart) {
            CartItem::where('cart_id', $cart->id)->delete();
        }

        return response()->json([
            'status'  => true,
            'message' => 'Bag cleared successfully',
        ], 200);
    }
}
