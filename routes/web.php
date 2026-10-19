<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Route pembersih cache tanpa Terminal (bisa diakses via browser di Hostinger)
Route::get('/clear-cache', function () {
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    Artisan::call('cache:clear');
    Artisan::call('view:clear');

    return response()->json([
        'status'  => true,
        'message' => 'Semua cache Laravel (config, route, cache, view) berhasil dibersihkan!',
        'midtrans_env' => [
            'is_production' => config('services.midtrans.is_production'),
            'server_key_set' => !empty(config('services.midtrans.server_key')),
        ]
    ]);
});

