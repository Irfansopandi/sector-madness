<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://brand.test/api/shipping/rates');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'weight' => 1000,
    'city' => 'Karawang',
    'province' => 'Jawa Barat'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP CODE: " . $httpcode . "\n";
echo "RESPONSE: " . $response . "\n";
