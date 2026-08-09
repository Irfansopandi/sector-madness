<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SECTOR MADNESS // Order Update</title>
    <style>
        body { margin: 0; padding: 0; background-color: #F5F5F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0A0A0A; }
        .container { max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E5E5E5; }
        .header { padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #E5E5E5; background-color: #0A0A0A; color: #FFFFFF; }
        .header h1 { margin: 0; font-size: 16px; letter-spacing: 0.25em; text-transform: uppercase; font-family: monospace; font-weight: 700; }
        .header p { margin: 10px 0 0; font-size: 11px; letter-spacing: 0.15em; color: #A0A0A0; font-family: monospace; }
        .content { padding: 40px; text-align: center; }
        .title { font-size: 18px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 24px; text-align: center; }
        .desc { font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 24px; text-align: center; }
        .order-box { display: inline-block; background-color: #F9FAFB; border: 2px dashed #CCCCCC; padding: 24px 40px; margin-bottom: 32px; text-align: center;}
        .order-box strong { display:block; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
        .order-box span { display: block; font-size: 20px; font-weight: 700; letter-spacing: 0.1em; font-family: monospace; color: #0A0A0A; }
        .order-box .kurir { font-size: 16px; margin-bottom: 16px; font-weight: bold; font-family: sans-serif; letter-spacing: normal;}
        .btn { display: inline-block; padding: 14px 28px; background-color: #0A0A0A; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid #0A0A0A; transition: all 0.2s ease; margin-bottom: 32px;}
        .warning { font-size: 12px; color: #888888; line-height: 1.5; margin: 0; padding-top: 32px; border-top: 1px solid #E5E5E5; }
        .footer { padding: 24px 40px; text-align: center; background-color: #F9FAFB; border-top: 1px solid #E5E5E5; font-size: 11px; color: #888888; }
    </style>
</head>
<body>
    <div class="container" style="max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E5E5E5;">
        <div class="header" style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #E5E5E5; background-color: #0A0A0A; color: #FFFFFF;">
            <h1 style="margin: 0; font-size: 16px; letter-spacing: 0.25em; text-transform: uppercase; font-family: monospace; font-weight: 700; color: #FFFFFF; text-align: center;">SECTOR MADNESS</h1>
            <p style="margin: 10px 0 0; font-size: 11px; letter-spacing: 0.15em; color: #A0A0A0; font-family: monospace; text-align: center;">ORDER PROTOCOL // ARCHIVE LABS</p>
        </div>
        <div class="content" style="padding: 40px; text-align: center;">
            <h2 class="title" style="font-size: 18px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 24px; text-align: center; color: #0A0A0A;">ORDER UPDATE: #{{ $order->order_number }}</h2>
            
            <p class="desc" style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 24px; text-align: center;">
                Halo, <strong style="color: #0A0A0A;">{{ $order->user ? $order->user->name : 'Pelanggan' }}</strong>!<br>
            @if($messageType === 'tracking' && $order->shipment && $order->shipment->tracking_number)
                Kabar baik! Pesanan Anda sedang dalam perjalanan menggunakan kurir <strong style="color: #0A0A0A;">{{ $order->shipment->courier_company }}</strong>.<br>
                Berikut adalah nomor resi pengiriman Anda:
            </p>
            
            <div class="order-box" style="padding: 24px 40px; display: inline-block; background-color: #F9FAFB; border: 2px dashed #CCCCCC; margin-bottom: 32px; text-align: center;">
                <span style="font-size: 28px; font-weight: 700; letter-spacing: 0.1em; font-family: monospace; color: #0A0A0A;">
                    {{ $order->shipment->tracking_number }}
                </span>
            </div>
            
            <p class="desc" style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 32px; text-align: center;">
                Anda bisa melacak pesanan Anda melalui website kurir terkait<br>atau langsung melalui dashboard akun Anda.
            </p>
            @else
                Status pesanan Anda telah diperbarui menjadi: <strong style="color: #0A0A0A;">{{ ucfirst($order->status) }}</strong>.
            </p>
            @endif
            
            <div style="text-align: center; margin-bottom: 40px;">
                <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/dashboard/orders?view_order={{ $order->order_number }}" class="btn" style="display: inline-block; padding: 14px 28px; background-color: #0A0A0A; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid #0A0A0A;">
                    Lihat Detail Pesanan
                </a>
            </div>
            
            <p class="warning" style="font-size: 12px; color: #888888; line-height: 1.6; margin: 0; padding: 32px 20px 0; border-top: 1px solid #E5E5E5; text-align: center;">
                Terima kasih telah berbelanja di Sector Madness!<br>
                Jika Anda memiliki pertanyaan, silakan hubungi tim support kami.
            </p>
        </div>
        <div class="footer" style="padding: 24px 40px; text-align: center; background-color: #F9FAFB; border-top: 1px solid #E5E5E5; font-size: 11px; color: #888888;">
            &copy; {{ date('Y') }} SECTOR MADNESS. All rights reserved.
        </div>
    </div>
</body>
</html>
