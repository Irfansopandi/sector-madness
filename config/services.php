    <?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'biteship' => [
        'api_key'  => env('BITESHIP_API_KEY'),
        'base_url' => env('BITESHIP_BASE_URL', 'https://api.biteship.com'),
    ],

    'duitku' => [
        'merchant_code' => env('DUITKU_MERCHANT_CODE'),
        'api_key'       => env('DUITKU_API_KEY'),
        'env'           => env('DUITKU_ENV', 'sandbox'),
        'callback_url'  => env('DUITKU_CALLBACK_URL'),
        'return_url'    => env('DUITKU_RETURN_URL', 'https://sectormadness.com/dashboard/orders'),
        'expiry_period' => env('DUITKU_EXPIRY_PERIOD', 1440), // in minutes (24 hours)
    ],

];

