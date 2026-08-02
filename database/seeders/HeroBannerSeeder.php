<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HeroBanner;

class HeroBannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banners = [
            [
                'image_path' => '/images/hero/hero-1.png',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'image_path' => '/images/hero/hero-2.png',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'image_path' => '/images/hero/hero-3.png',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $banner) {
            HeroBanner::updateOrCreate(
                ['image_path' => $banner['image_path']],
                $banner
            );
        }
    }
}
