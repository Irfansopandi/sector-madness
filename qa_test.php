<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::create(
        '/api/shipping/rates',
        'POST',
        [
            'city' => 'Karawang',
            'province' => 'Jawa Barat',
            'couriers' => 'jne,jnt,gosend',
            'destination_area_id' => 'IDNPJ002'
        ]
    )
);
echo "TC-001 - Karawang:\n";
echo $response->getContent() . "\n\n";

$response2 = $kernel->handle(
    Illuminate\Http\Request::create(
        '/api/shipping/rates',
        'POST',
        [
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'couriers' => 'jne,jnt,gosend'
        ]
    )
);
echo "TC-004 - Jakarta:\n";
echo $response2->getContent() . "\n\n";
