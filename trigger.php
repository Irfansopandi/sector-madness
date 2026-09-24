<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$product = \App\Models\Product::first();
if ($product) {
    \App\Jobs\SendProductDiscountPush::dispatch($product, 0);
    echo "Dispatched!";
}
