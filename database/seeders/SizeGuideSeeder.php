<?php

namespace Database\Seeders;

use App\Models\SizeGuide;
use App\Models\Category;
use Illuminate\Database\Seeder;

class SizeGuideSeeder extends Seeder
{
    public function run(): void
    {
        SizeGuide::truncate();

        $tshirtCat = Category::where('name', 'T-SHIRT')->first();
        $outerwearCat = Category::where('name', 'OUTERWEAR')->first();
        $bottomsCat = Category::where('name', 'BOTTOMS')->first();

        SizeGuide::create([
            'category_code' => $tshirtCat ? sprintf('%02d', $tshirtCat->id) : '06',
            'category' => $tshirtCat ? $tshirtCat->name : 'T-SHIRT',
            'fit_description' => 'BOXY OVERSIZED FIT',
            'description' => 'All measurements are taken flat in centimeters. Designed with a signature boxy silhouette and dropped shoulders.',
            'columns' => ['SIZE', 'CHEST (WIDTH)', 'LENGTH', 'SHOULDER', 'SLEEVE'],
            'rows' => [
                ['SIZE' => 'S', 'CHEST (WIDTH)' => '56 cm', 'LENGTH' => '70 cm', 'SHOULDER' => '52 cm', 'SLEEVE' => '22 cm'],
                ['SIZE' => 'M', 'CHEST (WIDTH)' => '59 cm', 'LENGTH' => '73 cm', 'SHOULDER' => '54 cm', 'SLEEVE' => '23 cm'],
                ['SIZE' => 'L', 'CHEST (WIDTH)' => '62 cm', 'LENGTH' => '76 cm', 'SHOULDER' => '56 cm', 'SLEEVE' => '24 cm'],
                ['SIZE' => 'XL', 'CHEST (WIDTH)' => '65 cm', 'LENGTH' => '79 cm', 'SHOULDER' => '58 cm', 'SLEEVE' => '25 cm'],
            ],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SizeGuide::create([
            'category_code' => $outerwearCat ? sprintf('%02d', $outerwearCat->id) : '08',
            'category' => $outerwearCat ? $outerwearCat->name : 'OUTERWEAR',
            'fit_description' => 'RELAXED TAILORED FIT',
            'description' => 'Measurements are taken with garment zipped or buttoned flat. Designed to comfortably accommodate layering underneath.',
            'columns' => ['SIZE', 'CHEST (WIDTH)', 'LENGTH', 'SHOULDER', 'SLEEVE'],
            'rows' => [
                ['SIZE' => 'S', 'CHEST (WIDTH)' => '58 cm', 'LENGTH' => '68 cm', 'SHOULDER' => '50 cm', 'SLEEVE' => '61 cm'],
                ['SIZE' => 'M', 'CHEST (WIDTH)' => '61 cm', 'LENGTH' => '71 cm', 'SHOULDER' => '52 cm', 'SLEEVE' => '63 cm'],
                ['SIZE' => 'L', 'CHEST (WIDTH)' => '64 cm', 'LENGTH' => '74 cm', 'SHOULDER' => '54 cm', 'SLEEVE' => '65 cm'],
                ['SIZE' => 'XL', 'CHEST (WIDTH)' => '67 cm', 'LENGTH' => '77 cm', 'SHOULDER' => '56 cm', 'SLEEVE' => '67 cm'],
            ],
            'sort_order' => 1,
            'is_active' => true,
        ]);

        SizeGuide::create([
            'category_code' => $bottomsCat ? sprintf('%02d', $bottomsCat->id) : '09',
            'category' => $bottomsCat ? $bottomsCat->name : 'BOTTOMS',
            'fit_description' => 'WIDE & TAPERED FIT',
            'description' => 'Waist measurements indicate natural stretch or belt fit range. Length is total outseam length.',
            'columns' => ['SIZE (INCH)', 'WAIST', 'HIP', 'THIGH', 'OUTSEAM'],
            'rows' => [
                ['SIZE (INCH)' => 'S (28-30)', 'WAIST' => '76-80 cm', 'HIP' => '102 cm', 'THIGH' => '32 cm', 'OUTSEAM' => '104 cm'],
                ['SIZE (INCH)' => 'M (31-32)', 'WAIST' => '81-85 cm', 'HIP' => '107 cm', 'THIGH' => '34 cm', 'OUTSEAM' => '106 cm'],
                ['SIZE (INCH)' => 'L (33-34)', 'WAIST' => '86-90 cm', 'HIP' => '112 cm', 'THIGH' => '36 cm', 'OUTSEAM' => '108 cm'],
                ['SIZE (INCH)' => 'XL (35-36)', 'WAIST' => '91-95 cm', 'HIP' => '117 cm', 'THIGH' => '38 cm', 'OUTSEAM' => '110 cm'],
            ],
            'sort_order' => 1,
            'is_active' => true,
        ]);
    }
}
