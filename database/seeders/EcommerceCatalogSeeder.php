<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class EcommerceCatalogSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat Kategori Katalog
        $outerwear = Category::firstOrCreate([
            'slug' => 'outerwear',
        ], [
            'name' => 'OUTERWEAR',
            'description' => 'Weatherproof tactical jackets, anoraks, and coats engineered for urban performance.',
        ]);

        $tshirts = Category::firstOrCreate([
            'slug' => 't-shirt',
        ], [
            'name' => 'T-SHIRT',
            'description' => 'Heavyweight organic cotton tees featuring structural seams and relaxed technical silhouettes.',
        ]);

        $bottoms = Category::firstOrCreate([
            'slug' => 'bottoms',
        ], [
            'name' => 'BOTTOMS',
            'description' => 'Utility cargos, structured trousers, and tactical shorts with articulated mobility.',
        ]);

        $accessories = Category::firstOrCreate([
            'slug' => 'accessories',
        ], [
            'name' => 'ACCESSORIES',
            'description' => 'Technical headwear, modular harnesses, and rugged utility essentials.',
        ]);

        // 2. Insert Katalog Produk SECTOR MADNESS persis dengan spesifikasi frontend
        $products = [
            [
                'category_id'     => $tshirts->id,
                'slug'            => 'sector-001-hoodie',
                'name'            => 'Sector 001 Hoodie',
                'collection'      => 'The Origin Collection',
                'collection_code' => 'SECTOR 001',
                'tagline'         => 'A study of structure, comfort, and identity.',
                'description'     => 'The foundational piece of Sector Madness. Built from 480 GSM premium heavy cotton, the Sector 001 Hoodie represents the intersection of comfort and intention. Every seam, every stitch is deliberate.',
                'material'        => '100% Premium Heavy Cotton',
                'weight'          => '480 GSM',
                'price'           => 285,
                'image'           => '/images/products/product-1.png',
                'gallery'         => ['/images/products/product-1.png', '/images/campaign/campaign-1.png', '/images/campaign/campaign-3.png'],
                'colors'          => [
                    ['name' => 'Obsidian Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Charcoal Grey', 'hex' => '#262626'],
                    ['name' => 'Raw Washed Bone', 'hex' => '#D6D3CC'],
                ],
                'sizes'           => ['S', 'M', 'L', 'XL', 'XXL'],
                'details'         => [
                    'Heavyweight 480 GSM organic combed cotton jersey',
                    'Oversized drop-shoulder structural silhouette',
                    'Double-layered hood with hidden internal reinforced drawstring',
                    'Reinforced ribbed cuffs and split anatomical waist hem',
                ],
                'story'           => 'Designed in our experimental design lab in downtown Jakarta, the Sector 001 Hoodie went through 14 iterations to achieve the exact drape and silhouette.',
                'limited'         => true,
                'stock'           => 45,
            ],
            [
                'category_id'     => $outerwear->id,
                'slug'            => 'sector-001-bomber',
                'name'            => 'Sector 001 Bomber',
                'collection'      => 'The Origin Collection',
                'collection_code' => 'SECTOR 001',
                'tagline'         => 'Engineered for presence.',
                'description'     => 'A structured bomber jacket that commands attention through proportion and material. Built with a water-resistant technical shell and premium cotton lining.',
                'material'        => 'Technical Shell / Cotton Lining',
                'weight'          => '360 GSM Shell',
                'price'           => 425,
                'image'           => '/images/products/product-2.png',
                'gallery'         => ['/images/products/product-2.png', '/images/campaign/campaign-2.png', '/images/campaign/campaign-4.png'],
                'colors'          => [
                    ['name' => 'Pitch Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Tactical Olive', 'hex' => '#353B31'],
                    ['name' => 'Slate Grey', 'hex' => '#4A4E54'],
                ],
                'sizes'           => ['S', 'M', 'L', 'XL'],
                'details'         => [
                    'Oversized structured fit',
                    'Water-resistant outer shell',
                    'Premium cotton interior lining',
                    'YKK zippers throughout',
                    'Made in Portugal',
                ],
                'story'           => 'The Sector 001 Bomber bridges technical outerwear and luxury streetwear.',
                'limited'         => true,
                'stock'           => 30,
            ],
            [
                'category_id'     => $tshirts->id,
                'slug'            => 'sector-001-tee',
                'name'            => 'Sector 001 Essential Tee',
                'collection'      => 'The Origin Collection',
                'collection_code' => 'SECTOR 001',
                'tagline'         => 'The foundation of every statement.',
                'description'     => 'A heavyweight essential tee that elevates the everyday. Cut from 300 GSM premium cotton with a relaxed, dropped shoulder silhouette.',
                'material'        => '100% Premium Cotton',
                'weight'          => '300 GSM',
                'price'           => 145,
                'image'           => '/images/products/product-3.png',
                'gallery'         => ['/images/products/product-3.png', '/images/hero/hero-3.png'],
                'colors'          => [
                    ['name' => 'Deep Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Soft White', 'hex' => '#F5F5F5'],
                    ['name' => 'Muted Taupe', 'hex' => '#8C8275'],
                ],
                'sizes'           => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                'details'         => [
                    'Relaxed dropped-shoulder fit',
                    'Reinforced collar seam',
                    'Side-seam construction',
                    'Made in Portugal',
                ],
                'story'           => 'There is nothing ordinary about a perfect t-shirt. The Sector 001 Essential Tee took eighteen prototypes to finalize.',
                'limited'         => false,
                'stock'           => 120,
            ],
            [
                'category_id'     => $bottoms->id,
                'slug'            => 'sector-001-cargo',
                'name'            => 'Sector 001 Cargo',
                'collection'      => 'The Origin Collection',
                'collection_code' => 'SECTOR 001',
                'tagline'         => 'Built for movement. Designed for intent.',
                'description'     => 'Structured cargo pants with a modern tapered silhouette. Utility-driven design meets premium construction.',
                'material'        => 'Cotton Twill / Ripstop',
                'weight'          => '320 GSM',
                'price'           => 345,
                'image'           => '/images/products/product-4.png',
                'gallery'         => ['/images/products/product-4.png', '/images/campaign/campaign-4.png'],
                'colors'          => [
                    ['name' => 'Stealth Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Military Green', 'hex' => '#3B4236'],
                    ['name' => 'Washed Grey', 'hex' => '#4D5157'],
                ],
                'sizes'           => ['28', '30', '32', '34', '36'],
                'details'         => [
                    'Modern tapered fit',
                    'Six-pocket utility design',
                    'Adjustable ankle cuffs',
                    'Made in Portugal',
                ],
                'story'           => 'The Sector 001 Cargo reimagines utility wear for the modern wardrobe.',
                'limited'         => true,
                'stock'           => 40,
            ],
            [
                'category_id'     => $outerwear->id,
                'slug'            => 'sector-002-trench',
                'name'            => 'Sector 002 Oversized Trench',
                'collection'      => 'The Atelier Series',
                'collection_code' => 'SECTOR 002',
                'tagline'         => 'Architectural proportions for cold weather.',
                'description'     => 'An oversized double-breasted trench coat with storm flap detailing and structured shoulders.',
                'material'        => 'Heavyweight Gabardine',
                'weight'          => '420 GSM',
                'price'           => 520,
                'image'           => '/images/products/product-5.png',
                'gallery'         => ['/images/products/product-5.png'],
                'colors'          => [
                    ['name' => 'Midnight Navy', 'hex' => '#0E1525'],
                    ['name' => 'Obsidian Black', 'hex' => '#0A0A0A'],
                ],
                'sizes'           => ['S', 'M', 'L', 'XL'],
                'details'         => ['Double-breasted closure', 'Belted waist and cuffs', 'Made in Portugal'],
                'story'           => 'Designed as an architectural outer shield against urban climate elements.',
                'limited'         => true,
                'stock'           => 15,
            ],
            [
                'category_id'     => $outerwear->id,
                'slug'            => 'sector-002-knit',
                'name'            => 'Sector 002 Heavyweight Knit',
                'collection'      => 'The Atelier Series',
                'collection_code' => 'SECTOR 002',
                'tagline'         => 'Tactile depth and relaxed warmth.',
                'description'     => 'A chunky rib-knit sweater crafted from 100% merino wool with exaggerated dropped shoulder seams.',
                'material'        => '100% Merino Wool',
                'weight'          => '550 GSM',
                'price'           => 310,
                'image'           => '/images/products/product-6.png',
                'gallery'         => ['/images/products/product-6.png'],
                'colors'          => [
                    ['name' => 'Raw Washed Bone', 'hex' => '#D6D3CC'],
                    ['name' => 'Pitch Black', 'hex' => '#0A0A0A'],
                ],
                'sizes'           => ['S', 'M', 'L', 'XL'],
                'details'         => ['Chunk rib knit', 'Seamless shoulder transition', 'Made in Italy'],
                'story'           => 'Explores raw tactile textures with heavy wool density.',
                'limited'         => true,
                'stock'           => 30,
            ],
            [
                'category_id'     => $outerwear->id,
                'slug'            => 'sector-002-anorak',
                'name'            => 'Sector 002 Technical Anorak',
                'collection'      => 'The Atelier Series',
                'collection_code' => 'SECTOR 002',
                'tagline'         => 'Weatherproof utility with minimal form.',
                'description'     => 'A half-zip pullover anorak with storm hood, front kangaroo pocket, and waterproof seam taping.',
                'material'        => '3-Layer Nylon Ripstop',
                'weight'          => '280 GSM',
                'price'           => 550,
                'image'           => '/images/products/product-7.png',
                'gallery'         => ['/images/products/product-7.png'],
                'colors'          => [
                    ['name' => 'Tactical Olive', 'hex' => '#353B31'],
                    ['name' => 'Stealth Black', 'hex' => '#0A0A0A'],
                ],
                'sizes'           => ['S', 'M', 'L', 'XL'],
                'details'         => ['3-layer membrane', 'Taped waterproof seams', 'Made in Portugal'],
                'story'           => 'A lightweight protective shell engineered for uncompromised mobility.',
                'limited'         => true,
                'stock'           => 18,
            ],
            [
                'category_id'     => $outerwear->id,
                'slug'            => 'sector-002-vest',
                'name'            => 'Sector 002 Utility Vest',
                'collection'      => 'The Atelier Series',
                'collection_code' => 'SECTOR 002',
                'tagline'         => 'Layered function for transitional climate.',
                'description'     => 'A modular padded tactical vest featuring 3D chest pockets and heavy-duty front zip fastening.',
                'material'        => 'Technical Cordura Nylon',
                'weight'          => '340 GSM',
                'price'           => 260,
                'image'           => '/images/products/product-8.png',
                'gallery'         => ['/images/products/product-8.png'],
                'colors'          => [
                    ['name' => 'Obsidian Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Charcoal Grey', 'hex' => '#262626'],
                ],
                'sizes'           => ['S', 'M', 'L', 'XL'],
                'details'         => ['Modular 3D pockets', 'Padded interior layer', 'Made in Portugal'],
                'story'           => 'Functionality stripped down to its core essentials.',
                'limited'         => true,
                'stock'           => 20,
            ],
            [
                'category_id'     => $bottoms->id,
                'slug'            => 'sector-002-trousers',
                'name'            => 'Sector 002 Pleated Trousers',
                'collection'      => 'The Atelier Series',
                'collection_code' => 'SECTOR 002',
                'tagline'         => 'Tailored elegance in relaxed drape.',
                'description'     => 'Wide-leg pleated trousers with front pintucks and hidden drawstrings for a relaxed drape.',
                'material'        => 'Wool Blend Twill',
                'weight'          => '310 GSM',
                'price'           => 295,
                'image'           => '/images/products/product-9.png',
                'gallery'         => ['/images/products/product-9.png'],
                'colors'          => [
                    ['name' => 'Pitch Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Muted Taupe', 'hex' => '#8C8275'],
                ],
                'sizes'           => ['28', '30', '32', '34', '36'],
                'details'         => ['Front double pleats', 'Wide fluid drape', 'Made in Portugal'],
                'story'           => 'Bridging formal tailoring with relaxed modern streetwear proportions.',
                'limited'         => false,
                'stock'           => 35,
            ],
            [
                'category_id'     => $outerwear->id,
                'slug'            => 'sector-002-zip-hoodie',
                'name'            => 'Sector 002 Tactical Zip Hoodie',
                'collection'      => 'The Atelier Series',
                'collection_code' => 'SECTOR 002',
                'tagline'         => 'Full-zip structural comfort.',
                'description'     => 'A heavy full-zip hoodie with double-headed metal zipper and high-coverage funnel neck hood.',
                'material'        => '500 GSM Brushed Heavy Cotton',
                'weight'          => '500 GSM',
                'price'           => 320,
                'image'           => '/images/products/product-10.png',
                'gallery'         => ['/images/products/product-10.png'],
                'colors'          => [
                    ['name' => 'Deep Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Washed Slate', 'hex' => '#4A4E54'],
                ],
                'sizes'           => ['S', 'M', 'L', 'XL', 'XXL'],
                'details'         => ['500 GSM heavy fleece', 'Double YKK zip closure', 'Made in Portugal'],
                'story'           => 'Maximum warmth and structural presence in a zip silhouette.',
                'limited'         => true,
                'stock'           => 25,
            ],
        ];

        foreach ($products as $p) {
            $guide = [];
            foreach ($p['sizes'] as $s) {
                if ($s == 'S') $guide[] = ['size' => 'S', 'chest' => '90 - 95', 'waist' => '75 - 80'];
                if ($s == 'M') $guide[] = ['size' => 'M', 'chest' => '96 - 101', 'waist' => '81 - 86'];
                if ($s == 'L') $guide[] = ['size' => 'L', 'chest' => '102 - 107', 'waist' => '87 - 92'];
                if ($s == 'XL') $guide[] = ['size' => 'XL', 'chest' => '108 - 113', 'waist' => '93 - 98'];
                if ($s == 'XXL') $guide[] = ['size' => 'XXL', 'chest' => '114 - 119', 'waist' => '99 - 104'];
            }
            $p['size_guide'] = $guide;
            Product::firstOrCreate(['slug' => $p['slug']], $p);
        }

        // 3. Seed Primary Warehouse / Office Hub Location
        \App\Models\Warehouse::firstOrCreate(
            ['is_primary' => true],
            [
                'name'         => 'Sector Madness Central Warehouse & Archive Lab',
                'contact_name' => 'Logistics Operations Lead',
                'phone'        => '081299887766',
                'email'        => 'logistics@sectormadness.com',
                'address'      => 'Kawasan Industri KIIC, Jl. Harapan V Lot KK-2, Karawang Barat',
                'city'         => 'Karawang',
                'province'     => 'Jawa Barat',
                'postal_code'  => '41361',
                'area_id'      => 'IDNPJ_KRWB',
                'is_primary'   => true,
                'notes'        => 'Main Fulfillment Dock B - Sector Madness Headquarter',
            ]
        );
    }
}
