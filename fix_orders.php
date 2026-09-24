<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$updated = \Illuminate\Support\Facades\DB::table('order_shipments')
    ->where('tracking_number', 'like', 'BITESHIP-%')
    ->update(['tracking_number' => \Illuminate\Support\Facades\DB::raw("REPLACE(tracking_number, 'BITESHIP-', '')")]);
echo "Updated $updated old orders!";
