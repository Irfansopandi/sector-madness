<?php
require 'vendor/autoload.php';

$response = Illuminate\Support\Facades\Http::withOptions([
    'curl' => [
        CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
    ]
])->timeout(30)->withHeaders([
    'Authorization' => 'Bearer ' . 'biteship_test.6a6a20b301557c5a15be2c59', // Will try with and without prefix
])->post('https://api.biteship.com/v1/rates/couriers', [
    'origin_area_id' => 'IDNPJ001',
    'destination_area_id' => 'IDNPJ002',
    'couriers' => 'jne',
    'items' => [
        ['name' => 'test', 'weight' => 1000, 'value' => 100000]
    ]
]);

echo "WITH PREFIX: " . $response->body() . "\n";

$response2 = Illuminate\Support\Facades\Http::withOptions([
    'curl' => [
        CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
    ]
])->timeout(30)->withHeaders([
    'Authorization' => 'Bearer ' . '6a6a20b301557c5a15be2c59', 
])->post('https://api.biteship.com/v1/rates/couriers', [
    'origin_area_id' => 'IDNPJ001',
    'destination_area_id' => 'IDNPJ002',
    'couriers' => 'jne',
    'items' => [
        ['name' => 'test', 'weight' => 1000, 'value' => 100000]
    ]
]);

echo "WITHOUT PREFIX: " . $response2->body() . "\n";
