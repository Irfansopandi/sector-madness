<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Admin;
use App\Models\ShippingAddress;
use App\Models\Voucher;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Buat Akun Admin Eksperimen
        Admin::firstOrCreate([
            'email' => 'admin@sectormadness.com',
        ], [
            'name'     => 'Sector Madness Commander',
            'password' => 'admin2026',
        ]);

        // 2. Buat Akun Customer Demo
        $customer = User::firstOrCreate([
            'email' => 'member@sectormadness.com',
        ], [
            'name'     => 'Archive Member',
            'password' => 'protocol2026',
            'phone'    => '+6281234567890',
            'birth_date' => '1998-05-15',
        ]);

        // 3. Jalankan Seeder Katalog E-Commerce
        $this->call(EcommerceCatalogSeeder::class);

        // 4. Buat Alamat Kirim Default Customer
        ShippingAddress::firstOrCreate([
            'user_id' => $customer->id,
            'label'   => 'Rumah',
        ], [
            'receiver_name' => 'Archive Member (Rumah)',
            'phone_number'  => '081234567890',
            'province'      => 'DKI Jakarta',
            'city'          => 'Jakarta Selatan',
            'district'      => 'Kebayoran Baru',
            'postal_code'   => '12110',
            'street_address'=> 'Jl. Senopati Raya No. 28, Kebayoran Baru, Jakarta Selatan',
            'address_notes' => 'Tingkap di lobi utama atau hubungi sekuriti.',
            'area_id'       => 'IDNPJ001', // Biteship area sample for South Jakarta
            'is_default'    => true,
        ]);

        ShippingAddress::firstOrCreate([
            'user_id' => $customer->id,
            'label'   => 'Kantor',
        ], [
            'receiver_name' => 'Archive Member (Studio)',
            'phone_number'  => '081122334455',
            'province'      => 'DKI Jakarta',
            'city'          => 'Jakarta Pusat',
            'district'      => 'Menteng',
            'postal_code'   => '10310',
            'street_address'=> 'Jl. H. O. S. Cokroaminoto No. 45, Menteng',
            'address_notes' => 'Gedung Sector Madness Lantai 4.',
            'area_id'       => 'IDNPJ002',
            'is_default'    => false,
        ]);

        // 5. Buat Voucher Promosi
        Voucher::firstOrCreate(['code' => 'WELCOME10'], [
            'name' => 'Welcome Archive Discount (Rp 100.000 OFF)',
            'discount_type' => 'fixed',
            'discount_value' => 100000,
            'minimum_purchase' => 500000,
            'is_active' => true,
        ]);

        Voucher::firstOrCreate(['code' => 'SECTOR50'], [
            'name' => 'Sector Madness Special 50K Voucher',
            'discount_type' => 'fixed',
            'discount_value' => 50000,
            'minimum_purchase' => 250000,
            'is_active' => true,
        ]);

        Voucher::firstOrCreate(['code' => 'ARCHIVE20'], [
            'name' => 'Archive Vault 20% Discount',
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'minimum_purchase' => 1000000,
            'is_active' => true,
        ]);

        // 6. Jalankan Seeder FAQ, Size Guide & Contact Settings
        $this->call(FaqSeeder::class);
        $this->call(SizeGuideSeeder::class);
        $this->call(ContactSettingSeeder::class);
    }
}
