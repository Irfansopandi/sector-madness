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
                'slug'            => 'sector-002-tactical-vest',
                'name'            => 'Sector 002 Tactical Vest',
                'collection'      => 'The Atelier Series',
                'collection_code' => 'SECTOR 002',
                'tagline'         => 'Modular storage meets uncompromising utility.',
                'description'     => 'Engineered from Japanese military-grade nylon ripstop with dual water-repellent finishing. Features fully modular pocket configurations and Fidlock® magnetic rapid-release closures.',
                'material'        => 'Japanese Nylon Ripstop & Fidlock® Hardware',
                'weight'          => '340 GSM',
                'price'           => 420,
                'image'           => '/images/products/product-2.png',
                'gallery'         => ['/images/products/product-2.png', '/images/campaign/campaign-2.png'],
                'colors'          => [
                    ['name' => 'Obsidian Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Olive Drab', 'hex' => '#3D4035'],
                ],
                'sizes'           => ['M', 'L', 'XL'],
                'details'         => [
                    'Hydrophobic military-grade ripstop outer shell',
                    'Fidlock® magnetic V-Buckles on chest and shoulders',
                    'Four expandable bellows pockets with storm flap protection',
                ],
                'story'           => 'The Tactical Vest was initially conceptualized for urban field agents and extreme weather utility.',
                'limited'         => true,
                'stock'           => 20,
            ],
            [
                'category_id'     => $tshirts->id,
                'slug'            => 'sector-003-essential-tee',
                'name'            => 'Sector 003 Essential Tee',
                'collection'      => 'The Origin Collection',
                'collection_code' => 'SECTOR 001',
                'tagline'         => 'Everyday utility reimagined through luxury heavy fabric.',
                'description'     => 'Crafted from 280 GSM long-staple organic Supima cotton. Features an oversized architectural boxy cut with ribbed structured collar that maintains its shape after years of heavy wear.',
                'material'        => '100% Supima Cotton',
                'weight'          => '280 GSM',
                'price'           => 145,
                'image'           => '/images/products/product-3.png',
                'gallery'         => ['/images/products/product-3.png'],
                'colors'          => [
                    ['name' => 'Obsidian Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Optic White', 'hex' => '#FAFAFA'],
                ],
                'sizes'           => ['S', 'M', 'L', 'XL', 'XXL'],
                'details'         => [
                    '280 GSM long-staple organic Supima cotton',
                    'Boxy architectural fit with slightly cropped silhouette',
                    'High-density silk screen Archive imprint on dorsal collar',
                ],
                'story'           => 'There is nothing ordinary about a perfect t-shirt. The Sector 001 Essential Tee took eighteen prototypes to finalize.',
                'limited'         => false,
                'stock'           => 120,
            ],
            [
                'category_id'     => $bottoms->id,
                'slug'            => 'sector-004-cargo-trousers',
                'name'            => 'Sector 004 Cargo Trousers',
                'collection'      => 'The Origin Collection',
                'collection_code' => 'SECTOR 001',
                'tagline'         => 'Articulated mobility for the urban landscape.',
                'description'     => 'Anatomical knee articulation combined with stretch water-resistant softshell nylon. Designed with ergonomic slant utility pockets and adjustable ankle cinch cords for customizable taper.',
                'material'        => 'Water-Resistant Stretch Nylon',
                'weight'          => '320 GSM',
                'price'           => 360,
                'image'           => '/images/products/product-4.png',
                'gallery'         => ['/images/products/product-4.png'],
                'colors'          => [
                    ['name' => 'Obsidian Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Midnight Slate', 'hex' => '#1A1E24'],
                ],
                'sizes'           => ['30', '32', '34', '36'],
                'details'         => [
                    'DWR treated stretch performance nylon softshell',
                    'Ergonomic slanted dual thigh pockets with waterproof YKK AquaGuard® zips',
                    'Ankle bungee drawstrings with matte aluminum toggles',
                ],
                'story'           => 'Form follows mobility. Built to withstand sudden meteorological shifts in modern metropolitan terrains.',
                'limited'         => true,
                'stock'           => 35,
            ],
            [
                'category_id'     => $outerwear->id,
                'slug'            => 'sector-005-trench-coat',
                'name'            => 'Sector 005 Trench Coat',
                'collection'      => 'The Atelier Series',
                'collection_code' => 'SECTOR 002',
                'tagline'         => 'Architectural silhouette with severe elemental defense.',
                'description'     => 'A commanding floor-sweeping profile constructed from bonded 3-layer weatherproof Gabardine. Features internal carry straps allowing the coat to be worn over the shoulders when transitioning indoors.',
                'material'        => '3-Layer Bonded Weatherproof Gabardine',
                'weight'          => '520 GSM',
                'price'           => 790,
                'image'           => '/images/products/product-5.png',
                'gallery'         => ['/images/products/product-5.png', '/images/hero/hero-2.png'],
                'colors'          => [
                    ['name' => 'Obsidian Black', 'hex' => '#0A0A0A'],
                ],
                'sizes'           => ['M', 'L', 'XL'],
                'details'         => [
                    '3-Layer bonded hydrophobic Gabardine exterior with taped seams',
                    'Integrated interior elastic backpacking suspension shoulder straps',
                    'Oversized storm collar with detachable magnetic throat tab',
                ],
                'story'           => 'Our homage to historical military espionage apparel re-engineered with 21st-century hydrophobic membrane technology.',
                'limited'         => true,
                'stock'           => 12,
            ],
            [
                'category_id'     => $outerwear->id,
                'slug'            => 'sector-006-anorak',
                'name'            => 'Sector 006 Anorak',
                'collection'      => 'The Origin Collection',
                'collection_code' => 'SECTOR 001',
                'tagline'         => 'Lightweight protection with oversized storage capacity.',
                'description'     => 'Pullover weather-shield anorak made from translucent reinforced polyurethane ripstop. Packs entirely into its own central kangaroo pouch pocket for emergency storm deployment.',
                'material'        => 'Reinforced PU Ripstop Shell',
                'weight'          => '210 GSM',
                'price'           => 310,
                'image'           => '/images/products/product-6.png',
                'gallery'         => ['/images/products/product-6.png'],
                'colors'          => [
                    ['name' => 'Obsidian Black', 'hex' => '#0A0A0A'],
                    ['name' => 'Translucent Fog', 'hex' => '#C4C8CC'],
                ],
                'sizes'           => ['S', 'M', 'L', 'XL'],
                'details'         => [
                    'Ultra-lightweight windproof and highly water-resistant PU ripstop',
                    'Central XL kangaroo bellows compartment with dual side zip entry',
                    'Packable structural design converts into tactile carry pouch',
                ],
                'story'           => 'Inspired by alpine expedition shell garments, miniaturized and calibrated for metropolitan rapid transit.',
                'limited'         => false,
                'stock'           => 60,
            ],
            [
                'category_id'     => $outerwear->id,
                'slug'            => 'sector-007-zip-jacket',
                'name'            => 'Sector 007 Zip Jacket',
                'collection'      => 'The Atelier Series',
                'collection_code' => 'SECTOR 002',
                'tagline'         => 'Minimalist front profile with heavy thermal retention.',
                'description'     => 'High-collared zip jacket insulated with recycled synthetic down. Engineered with seamless shoulder construction to completely prevent water intrusion during heavy rainfall.',
                'material'        => 'Polyamide Shell with Recycled Insulation',
                'weight'          => '450 GSM',
                'price'           => 550,
                'image'           => '/images/products/product-7.png',
                'gallery'         => ['/images/products/product-7.png'],
                'colors'          => [
                    ['name' => 'Obsidian Black', 'hex' => '#0A0A0A'],
                ],
                'sizes'           => ['M', 'L', 'XL', 'XXL'],
                'details'         => [
                    '100% Recycled micro-denier insulating fill for extreme cold resistance',
                    'Seamless rolled raglan shoulder architecture prevents seam leakages',
                    'Two-way custom matte black YKK vislon front closure',
                ],
                'story'           => 'Designed to bridge the gap between extreme outdoor thermography and avant-garde architectural street fashion.',
                'limited'         => true,
                'stock'           => 18,
            ],
            [
                'category_id'     => $accessories->id,
                'slug'            => 'sector-008-tactical-cap',
                'name'            => 'Sector 008 Tactical Cap',
                'collection'      => 'The Origin Collection',
                'collection_code' => 'SECTOR 001',
                'tagline'         => 'Unforgiving utility headwear with laser-cut ventilation.',
                'description'     => 'Six-panel engineered cap crafted from durable cordura ballistic fabric. Features laser-perforated side breathability channels and an adjustable magnetic buckle clasp.',
                'material'        => 'Cordura® Ballistic Nylon',
                'weight'          => '190 GSM',
                'price'           => 120,
                'image'           => '/images/products/product-8.png',
                'gallery'         => ['/images/products/product-8.png'],
                'colors'          => [
                    ['name' => 'Obsidian Black', 'hex' => '#0A0A0A'],
                ],
                'sizes'           => ['ONE SIZE'],
                'details'         => [
                    'Heavy-duty abrasion-resistant Cordura® ballistic nylon crown',
                    'Laser-cut micro ventilation matrix on temporal side panels',
                    'Internal moisture-wicking antimicrobial cushioned sweatband',
                ],
                'story'           => 'The final accent piece of the initial Sector 001 rollout, engineered to survive extreme abrasive exposure.',
                'limited'         => false,
                'stock'           => 95,
            ],
        ];

        foreach ($products as $p) {
            Product::firstOrCreate(['slug' => $p['slug']], $p);
        }
    }
}
