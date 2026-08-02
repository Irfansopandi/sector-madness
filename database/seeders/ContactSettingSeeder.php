<?php

namespace Database\Seeders;

use App\Models\ContactSetting;
use Illuminate\Database\Seeder;

class ContactSettingSeeder extends Seeder
{
    public function run(): void
    {
        ContactSetting::truncate();

        // 01. EMAIL INQUIRIES
        ContactSetting::create([
            'type' => 'channel',
            'code' => '01',
            'title' => 'EMAIL INQUIRIES',
            'subtitle' => 'GENERAL & ORDER SUPPORT',
            'value' => 'info@sectormadness.com',
            'link' => 'mailto:info@sectormadness.com',
            'note' => 'Response protocol: Within 24 business hours.',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // 02. DIRECT MESSAGING (WHATSAPP)
        ContactSetting::create([
            'type' => 'channel',
            'code' => '02',
            'title' => 'DIRECT MESSAGING',
            'subtitle' => 'WHATSAPP CONSULTANT',
            'value' => '+62 859-4665-3103',
            'link' => 'https://wa.me/6285946653103?text=Halo%20SECTOR%20MADNESS%2C%20saya%20ingin%20bertanya%20mengenai%20produk%20dan%20layanan.',
            'note' => 'Direct fit, sizing & immediate shipping assistance.',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // 03. OPERATIONAL HOURS
        ContactSetting::create([
            'type' => 'channel',
            'code' => '03',
            'title' => 'OPERATIONAL HOURS',
            'subtitle' => 'CUSTOMER SUPPORT SCHEDULE',
            'value' => "Monday — Friday\n09:00 AM — 06:00 PM WIB",
            'link' => null,
            'note' => null,
            'sort_order' => 3,
            'is_active' => true,
        ]);

        // 04. DIGITAL ARCHIVE (INSTAGRAM)
        ContactSetting::create([
            'type' => 'channel',
            'code' => '04',
            'title' => 'DIGITAL ARCHIVE',
            'subtitle' => 'SOCIAL MEDIA',
            'value' => 'INSTAGRAM',
            'link' => 'https://www.instagram.com/sectormadness.id?igsh=dWRjeGR4M3l3ZWw5',
            'note' => null,
            'sort_order' => 4,
            'is_active' => true,
        ]);

        // 05. WAREHOUSE & LOCATION MAP
        ContactSetting::create([
            'type' => 'warehouse',
            'code' => 'W1',
            'title' => 'CENTRAL FULFILLMENT DOCK',
            'subtitle' => 'OUR WAREHOUSE',
            'value' => "Sector Madness Central Warehouse & Archive Lab\nKawasan Industri KIIC, Jl. Harapan V Lot KK-2\nKarawang Barat, Jawa Barat 41361, Indonesia",
            'link' => null,
            'note' => 'LAT: -6.3533° S, LNG: 107.2831° E',
            'latitude' => -6.3533,
            'longitude' => 107.2831,
            'sort_order' => 5,
            'is_active' => true,
        ]);
    }
}
