<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\ShippingAddressController;

/*
|--------------------------------------------------------------------------
| Customer & Admin Authentication Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);

Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);

/*
|--------------------------------------------------------------------------
| Public E-Commerce Catalog & Integrations
|--------------------------------------------------------------------------
*/
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

// Biteship Area, Rates, Tracking & Warehouse Database Info
Route::get('/warehouse', [ShippingController::class, 'getWarehouseInfo']);
Route::get('/store/info', [ShippingController::class, 'getWarehouseInfo']);
Route::post('/shipping/rates', [ShippingController::class, 'rates']);
Route::get('/shipping/areas', [ShippingController::class, 'searchAreas']);
Route::get('/shipping/track/{tracking_number}', [ShippingController::class, 'track']);
Route::post('/shipping/create/{order_number}', [ShippingController::class, 'createShipment']);

// Midtrans Webhooks & Tokens
Route::post('/payment/token/{order_number}', [PaymentController::class, 'generateToken']);
Route::post('/payment/instant-token', [PaymentController::class, 'instantToken']);
Route::post('/webhook/midtrans', [PaymentController::class, 'webhook']);

/*
|--------------------------------------------------------------------------
| Customer Profile, Cart, Checkout, Address Book & Orders API
| Dirancang mendukung autentikasi Sanctum serta seamless dev/testing fallback
|--------------------------------------------------------------------------
*/
// Customer Profile
Route::get('/user', [AuthController::class, 'profile'])->middleware('auth:sanctum');
// Also provide fallback without middleware if sanctum fails in local development
Route::get('/user/profile-info', [AuthController::class, 'profile']);
Route::put('/user/profile', [AuthController::class, 'updateProfile']);

// Shipping Address Book (CRUD)
Route::get('/shipping-address', [ShippingAddressController::class, 'index']);
Route::post('/shipping-address', [ShippingAddressController::class, 'store']);
Route::put('/shipping-address/{id}', [ShippingAddressController::class, 'update']);
Route::delete('/shipping-address/{id}', [ShippingAddressController::class, 'destroy']);

// Shopping Bag / Cart API
Route::get('/cart', [CartController::class, 'index']);
Route::post('/cart', [CartController::class, 'store']);
Route::post('/cart/items', [CartController::class, 'store']);
Route::put('/cart/{id}', [CartController::class, 'update']);
Route::put('/cart/items/{id}', [CartController::class, 'update']);
Route::delete('/cart/{id}', [CartController::class, 'destroy']);
Route::delete('/cart/items/{id}', [CartController::class, 'destroy']);
Route::delete('/cart', [CartController::class, 'clear']);

// Checkout, Voucher & Payment Methods API
Route::get('/checkout/summary', [CheckoutController::class, 'summary']);
Route::post('/checkout/summary', [CheckoutController::class, 'summary']);
Route::get('/checkout/status/{order_number}', [CheckoutController::class, 'checkPaymentStatus']);
Route::post('/voucher/check', [CheckoutController::class, 'checkVoucher']);
Route::get('/payment-methods', [CheckoutController::class, 'paymentMethods']);
Route::post('/payment/create', [CheckoutController::class, 'createPayment']);
Route::post('/checkout', [CheckoutController::class, 'createPayment']);

// Orders History & Detail API
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{order_number}', [OrderController::class, 'show']);
Route::post('/orders/{order_number}/cancel', [OrderController::class, 'cancel']);

// Admin Order & Shipment Tracking Control API
Route::get('/admin/orders', [OrderController::class, 'adminOrders']);
Route::put('/admin/orders/{order_number}/shipment', [OrderController::class, 'adminUpdateShipment']);

/*
|--------------------------------------------------------------------------
| Strict Authenticated Logout Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/admin/logout', [AuthController::class, 'adminLogout']);
});
