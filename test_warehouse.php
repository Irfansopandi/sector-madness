<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$w = App\Models\Warehouse::first();
if($w) {
    echo json_encode($w->toArray());
} else {
    echo 'No warehouse found';
}
