<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Admin;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ReportController;

$admin = Admin::first() ?? User::where('is_admin', true)->first();

if (!$admin) {
    echo "No admin found in DB, creating temporary mock test check...\n";
} else {
    echo "Testing with Admin ID: {$admin->id}\n";
}

$controller = new ReportController();

// Test 1: Sales report with valid period
$req1 = Request::create('/api/admin/reports/sales', 'GET', [
    'start_date' => '2026-01-01',
    'end_date' => '2026-12-31',
]);
if ($admin) {
    $req1->setUserResolver(fn() => $admin);
}

$res1 = $controller->sales($req1);
echo "Sales Report Response Status Code: " . $res1->getStatusCode() . "\n";
echo "Sales Report JSON Response: " . json_encode($res1->getData(), JSON_PRETTY_PRINT) . "\n\n";

// Test 2: Customer report with valid period
$req2 = Request::create('/api/admin/reports/customers', 'GET', [
    'start_date' => '2026-01-01',
    'end_date' => '2026-12-31',
]);
if ($admin) {
    $req2->setUserResolver(fn() => $admin);
}

$res2 = $controller->customers($req2);
echo "Customer Report Response Status Code: " . $res2->getStatusCode() . "\n";
echo "Customer Report JSON Response: " . json_encode($res2->getData(), JSON_PRETTY_PRINT) . "\n\n";

// Test 3: Invalid period start_date > end_date
$req3 = Request::create('/api/admin/reports/sales', 'GET', [
    'start_date' => '2026-12-31',
    'end_date' => '2026-01-01',
]);
if ($admin) {
    $req3->setUserResolver(fn() => $admin);
}
$res3 = $controller->sales($req3);
echo "Invalid Period Response Status Code: " . $res3->getStatusCode() . "\n";
echo "Invalid Period JSON Response: " . json_encode($res3->getData(), JSON_PRETTY_PRINT) . "\n";
