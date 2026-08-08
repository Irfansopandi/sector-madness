<?php

$kernel = app()->make(Illuminate\Contracts\Http\Kernel::class);

$admin = \App\Models\Admin::first();
if (!$admin) {
    $admin = \App\Models\Admin::create([
        'name' => 'Test Admin',
        'email' => 'admin@example.com',
        'password' => bcrypt('password')
    ]);
}
$adminToken = $admin->createToken('admin_token', ['admin'])->plainTextToken;

$adminRequest = Illuminate\Http\Request::create('/api/admin/products', 'GET');
$adminRequest->headers->set('Authorization', 'Bearer ' . $adminToken);
$adminRequest->headers->set('Accept', 'application/json');
$adminResponse = $kernel->handle($adminRequest);
echo "Status: " . $adminResponse->getStatusCode() . "\n";
echo "Content: " . $adminResponse->getContent() . "\n";
