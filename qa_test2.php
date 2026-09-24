<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Support\Facades\Http;

Http::fake([
    'api.biteship.com/v1/rates/couriers' => Http::response([
        'pricing' => [
            [
                'company' => 'gosend',
                'type' => 'instant',
                'name' => 'GoSend Instant',
                'price' => 20000,
                'duration' => '1-3 hours'
            ],
            [
                'company' => 'jne',
                'type' => 'reg',
                'name' => 'JNE Reguler',
                'price' => 10000,
                'duration' => '1-2 days'
            ]
        ]
    ], 200)
]);

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
echo "TC-001 - Karawang (Mocked API):\n";
echo $response->getContent() . "\n\n";

Http::fake([
    'api.biteship.com/v1/rates/couriers' => Http::response([
        'pricing' => [
            [
                'company' => 'jne',
                'type' => 'reg',
                'name' => 'JNE Reguler',
                'price' => 15000,
                'duration' => '1-2 days'
            ]
        ]
    ], 200)
]);

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
echo "TC-004 - Jakarta (Mocked API):\n";
echo $response2->getContent() . "\n\n";

$recorded = Http::recorded();
if (count($recorded) > 0) {
    echo "Payload sent for Jakarta:\n";
    echo json_encode($recorded[1][0]->data()) . "\n";
}
