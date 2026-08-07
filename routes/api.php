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
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\FaqController;
use App\Http\Controllers\Api\SizeGuideController;
use App\Http\Controllers\Api\ContactSettingController;
use App\Http\Controllers\Api\SortOptionController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\HeroBannerController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\ReportController;

/*
|--------------------------------------------------------------------------
| Customer & Admin Authentication Routes
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/admin/login', [AuthController::class, 'adminLogin'])->middleware('throttle:10,1');

// Hero Banners API (Public & Admin Management)
Route::get('/hero-banners', [HeroBannerController::class, 'index']);
Route::get('/admin/hero-banners', [HeroBannerController::class, 'adminIndex']);
Route::post('/admin/hero-banners', [HeroBannerController::class, 'store']);
Route::put('/admin/hero-banners/{id}', [HeroBannerController::class, 'update']);
Route::delete('/admin/hero-banners/{id}', [HeroBannerController::class, 'destroy']);

// Admin Image Upload
Route::post('/admin/upload', [UploadController::class, 'uploadImage']);

Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp'])->middleware('throttle:5,1');
Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp'])->middleware('throttle:5,1');
Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword'])->middleware('throttle:5,1');

// Categories API (Public & Admin Management)
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::post('/admin/categories', [CategoryController::class, 'store']);
Route::put('/admin/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy']);

// Collections / Focus On API (Public & Admin Management)
Route::get('/collections', [CollectionController::class, 'index']);
Route::post('/admin/collections', [CollectionController::class, 'store']);
Route::put('/admin/collections/{id}', [CollectionController::class, 'update']);
Route::delete('/admin/collections/{id}', [CollectionController::class, 'destroy']);

// Sort Options API (Public & Admin Management)
Route::get('/sort-options', [SortOptionController::class, 'index']);
Route::post('/admin/sort-options', [SortOptionController::class, 'store']);
Route::put('/admin/sort-options/{id}', [SortOptionController::class, 'update']);
Route::delete('/admin/sort-options/{id}', [SortOptionController::class, 'destroy']);

// FAQ API (Public & Admin Management)
Route::get('/faqs', [FaqController::class, 'index']);
Route::get('/admin/faqs', [FaqController::class, 'adminIndex']);
Route::post('/admin/faqs', [FaqController::class, 'store']);
Route::put('/admin/faqs/{id}', [FaqController::class, 'update']);
Route::delete('/admin/faqs/{id}', [FaqController::class, 'destroy']);

// Size Guide API (Public & Admin Management)
Route::get('/size-guides', [SizeGuideController::class, 'index']);
Route::get('/admin/size-guides', [SizeGuideController::class, 'adminIndex']);
Route::post('/admin/size-guides', [SizeGuideController::class, 'store']);
Route::put('/admin/size-guides/{id}', [SizeGuideController::class, 'update']);
Route::delete('/admin/size-guides/{id}', [SizeGuideController::class, 'destroy']);

// Journal API (Public & Admin Management)
Route::get('/journals', [JournalController::class, 'index']);
Route::get('/journals/{slug}', [JournalController::class, 'show']);
Route::post('/admin/journals', [JournalController::class, 'store']);
Route::put('/admin/journals/{id}', [JournalController::class, 'update']);
Route::delete('/admin/journals/{id}', [JournalController::class, 'destroy']);

// Contact Settings API (Public & Admin Management)
Route::get('/contact-settings', [ContactSettingController::class, 'index']);
Route::get('/admin/contact-settings', [ContactSettingController::class, 'adminIndex']);
Route::post('/admin/contact-settings', [ContactSettingController::class, 'store']);
Route::put('/admin/contact-settings/{id}', [ContactSettingController::class, 'update']);
Route::delete('/admin/contact-settings/{id}', [ContactSettingController::class, 'destroy']);

// Products API (Public & Admin Management)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/products/{slug}/variants', [ProductController::class, 'variants']);
Route::get('/admin/products', [ProductController::class, 'index']);
Route::post('/admin/products', [ProductController::class, 'store']);
Route::put('/admin/products/{id}', [ProductController::class, 'update']);
Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);

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

// Wishlist API
Route::get('/wishlist', [WishlistController::class, 'index']);
Route::post('/wishlist', [WishlistController::class, 'store']);
Route::delete('/wishlist/{product_id}', [WishlistController::class, 'destroy']);
Route::get('/wishlist/check/{product_id}', [WishlistController::class, 'check']);

// Checkout, Voucher & Payment Methods API
Route::get('/checkout/summary', [CheckoutController::class, 'summary']);
Route::post('/checkout/summary', [CheckoutController::class, 'summary']);
Route::get('/checkout/status/{order_number}', [CheckoutController::class, 'checkPaymentStatus']);
Route::post('/voucher/check', [CheckoutController::class, 'checkVoucher'])->middleware('throttle:15,1');
Route::get('/payment-methods', [CheckoutController::class, 'paymentMethods']);
Route::post('/payment/create', [CheckoutController::class, 'createPayment']);
Route::post('/checkout', [CheckoutController::class, 'createPayment']);

// Orders History & Detail API
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{order_number}', [OrderController::class, 'show']);
Route::post('/orders/{order_number}/cancel', [OrderController::class, 'cancel']);
Route::post('/orders/{order_number}/confirm-received', [OrderController::class, 'confirmReceived']);

// Admin Order, Dashboard Charts & Shipment Tracking Control API
Route::get('/admin/orders', [OrderController::class, 'adminOrders']);
Route::get('/admin/dashboard-charts', [OrderController::class, 'adminDashboardCharts']);
Route::put('/admin/orders/{order_number}/shipment', [OrderController::class, 'adminUpdateShipment']);

// Admin Customer Management API
Route::get('/admin/customers', [CustomerController::class, 'adminIndex']);
Route::post('/admin/customers', [CustomerController::class, 'adminStore']);
Route::get('/admin/customers/{id}', [CustomerController::class, 'adminShow']);
Route::put('/admin/customers/{id}', [CustomerController::class, 'adminUpdate']);
Route::put('/admin/customers/{id}/status', [CustomerController::class, 'adminToggleStatus']);
Route::delete('/admin/customers/{id}', [CustomerController::class, 'adminDestroy']);

// Admin Voucher Management API
Route::get('/admin/vouchers', [VoucherController::class, 'adminIndex']);
Route::post('/admin/vouchers', [VoucherController::class, 'adminStore']);
Route::get('/admin/vouchers/{id}', [VoucherController::class, 'adminShow']);
Route::put('/admin/vouchers/{id}', [VoucherController::class, 'adminUpdate']);
Route::put('/admin/vouchers/{id}/status', [VoucherController::class, 'adminToggleStatus']);
Route::delete('/admin/vouchers/{id}', [VoucherController::class, 'adminDestroy']);

// Admin Reports API (Penjualan & Customer)
Route::get('/admin/reports/sales', [ReportController::class, 'sales']);
Route::get('/admin/reports/customers', [ReportController::class, 'customers']);

// Admin Profile Management API
Route::get('/admin/profile', [AuthController::class, 'getAdminProfile']);
Route::put('/admin/profile', [AuthController::class, 'updateAdminProfile']);

/*
|--------------------------------------------------------------------------
| Strict Authenticated Logout Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/admin/logout', [AuthController::class, 'adminLogout']);
});
