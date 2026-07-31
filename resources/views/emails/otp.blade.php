<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SECTOR MADNESS // OTP Verification</title>
    <style>
        body { margin: 0; padding: 0; background-color: #F5F5F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0A0A0A; }
        .container { max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E5E5E5; }
        .header { padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #E5E5E5; background-color: #0A0A0A; color: #FFFFFF; }
        .header h1 { margin: 0; font-size: 16px; letter-spacing: 0.25em; text-transform: uppercase; font-family: monospace; font-weight: 700; }
        .header p { margin: 10px 0 0; font-size: 11px; letter-spacing: 0.15em; color: #A0A0A0; font-family: monospace; }
        .content { padding: 40px; text-align: center; }
        .title { font-size: 18px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 16px; }
        .desc { font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 32px; }
        .otp-box { display: inline-block; background-color: #F9FAFB; border: 2px dashed #CCCCCC; padding: 20px 40px; margin-bottom: 32px; }
        .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 0.3em; font-family: monospace; color: #0A0A0A; margin-left: 0.3em; }
        .warning { font-size: 12px; color: #888888; line-height: 1.5; margin: 0; padding-top: 32px; border-top: 1px solid #E5E5E5; }
        .footer { padding: 24px 40px; text-align: center; background-color: #F9FAFB; border-top: 1px solid #E5E5E5; font-size: 11px; color: #888888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SECTOR MADNESS</h1>
            <p>SECURITY PROTOCOL // ARCHIVE LABS</p>
        </div>
        <div class="content">
            <h2 class="title">Password Reset Code</h2>
            <p class="desc">We received a request to reset your password. Enter the verification code below on the reset page.</p>
            
            <div class="otp-box">
                <span class="otp-code">{{ $otp }}</span>
            </div>
            
            <p class="warning">
                This code will expire in 15 minutes.<br>
                If you didn't request a password reset, please ignore this email or contact support.
            </p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} SECTOR MADNESS. All rights reserved.
        </div>
    </div>
</body>
</html>
