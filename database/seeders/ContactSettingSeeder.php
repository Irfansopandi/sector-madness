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
            'link' => 'mailto:info@sectormadness.com?subject=INQUIRY%20-%20EMAIL%20INQUIRIES',
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
            'value' => '085946653103',
            'link' => null,
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
            'code' => '05',
            'title' => 'OUR WAREHOUSE',
            'subtitle' => null,
            'value' => "Jl citarum No 51 Adiarsa barat\nKarawang, Jawa Barat 41311, Indonesia",
            'link' => null,
            'note' => 'LAT: -6.3117° S, LNG: 107.3015° E',
            'latitude' => -6.3117,
            'longitude' => 107.3015,
            'sort_order' => 5,
            'is_active' => true,
        ]);
    }
}
