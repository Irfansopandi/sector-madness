<?php
require 'vendor/autoload.php';
$vapid = Minishlink\WebPush\VAPID::createVapidKeys();
echo "PUBLIC_KEY=" . $vapid['publicKey'] . "\n";
echo "PRIVATE_KEY=" . $vapid['privateKey'] . "\n";
