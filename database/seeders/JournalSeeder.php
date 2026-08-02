<?php

namespace Database\Seeders;

use App\Models\Journal;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class JournalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $articles = [
            [
                'slug' => 'origin-sector-001',
                'title' => 'The Origin of Sector 001',
                'category' => 'Collection Stories',
                'issue' => 'VOL. 01',
                'date' => 'MILAN ATELIER',
                'summary' => 'A closer look at the inspiration behind our first collection and the ideas that shaped every silhouette.',
                'image' => '/images/campaign/campaign-1.png',
                'featured' => true,
                'content' => [
                    'In conception, Sector 001 was never intended to participate in the traditional rotating runway calendar. It emerged from an observation of modern architectural engineering and everyday urban durability—a synthesis where utility is not compromised by aesthetic trim, but rather intensified by it.',
                    'Our design team began with a simple premise: what does an individual need when moving through city environments and shifting daily terrain? The answer did not lie in synthetic seasonal colors or visible branding overlays. Instead, we turned to structured silhouettes that stand alone as confident, functional expression.',
                    'Every seam and garment construction choice in Sector 001 was carefully refined to withstand long-term wear while maintaining an elegant visual shape. This collection marks a dedicated step toward building an enduring personal wardrobe.'
                ],
                'quote' => 'We believe clothing should offer genuine confidence and timeless structure rather than transient seasonal appeal.',
                'sort_order' => 1,
                'is_published' => true,
            ],
            [
                'slug' => 'designed-beyond-trends',
                'title' => 'Designed Beyond Trends',
                'category' => 'Brand Philosophy',
                'issue' => 'VOL. 02',
                'date' => 'EDITORIAL STUDY',
                'summary' => 'Why timeless design creates stronger identity than seasonal fashion.',
                'image' => '/images/story/brand-story.png',
                'featured' => false,
                'content' => [
                    'The modern commercial fashion cycle profits from intentional obsolescence. By designating garments as valid for merely a single season, the industry often dilutes the real connection between individuals and their personal wardrobe.',
                    'At Sector Madness, our design philosophy operates on timeless consistency: Designed Beyond Trends. True quality is found in permanence—pieces created with such clear aesthetic proportions and reliable materials that they become more valued with time.',
                    'When design is liberated from traditional seasonal calendars, clothing gains authentic purpose. A beautifully cut outerwear jacket or a heavyweight sweatshirt ceases to be tied to a specific year; it becomes a reliable expression of personal confidence.'
                ],
                'quote' => 'True luxury is found in permanence—garments designed to survive shifting trends and mature with the wearer.',
                'sort_order' => 2,
                'is_published' => true,
            ],
            [
                'slug' => 'inside-the-fabric',
                'title' => 'Inside the Fabric',
                'category' => 'Materials & Craftsmanship',
                'issue' => 'VOL. 03',
                'date' => 'TEXTILE FOCUS',
                'summary' => 'Exploring heavyweight cotton, garment construction, and the importance of premium materials.',
                'image' => '/images/hero/hero-1.png',
                'featured' => false,
                'content' => [
                    'Before an initial silhouette takes shape, dozens of material fabrics undergo evaluation for density, drape, and texture. We prioritize high-weight cotton weaves ranging from 450 to 550 GSM, selected specifically for their rich structural feel and resilience.',
                    'Why prioritize such density? Because fabric substance dictates how a garment drapes across the body. Where lightweight conventional fabrics slump over time, well-crafted heavyweight materials preserve their intended contour, providing comfort and enduring distinction.',
                    'Internal garment construction receives the exact same attention as exterior appearance. We focus on clean internal finishing, precise stitching, and comfortable pattern articulation across every point of the garment.'
                ],
                'quote' => 'Where lightweight fabrics lose structure, premium heavyweight cotton preserves its intended contour and elegant drape.',
                'sort_order' => 3,
                'is_published' => true,
            ],
            [
                'slug' => 'campaign-001-bts',
                'title' => 'Campaign 001',
                'category' => 'Campaign',
                'issue' => 'VOL. 04',
                'date' => 'CREATIVE DIRECTION',
                'summary' => 'Behind the scenes of our first editorial campaign and creative direction.',
                'image' => '/images/hero/hero-2.png',
                'featured' => false,
                'content' => [
                    'Shot against authentic structural environments and calm city backdrops, Campaign 001 was conceived to illustrate the natural movement and confidence of our silhouettes in everyday light.',
                    'Rather than relying on rigid theatrical styling, the photography emphasizes natural posture, shadow interplay, and tactile fabric textures. The imagery captures how sunlight and atmosphere interact with clean dark textiles and precise hardware.',
                    'This visual diary shares an honest perspective on our creative vision—an uncompromising focus on atmosphere, simplicity, and authentic presence.'
                ],
                'quote' => 'An honest approach to photography focusing on atmosphere, natural movement, and authentic visual character.',
                'sort_order' => 4,
                'is_published' => true,
            ],
            [
                'slug' => 'archive-protocol-outerwear',
                'title' => 'Outerwear Architecture',
                'category' => 'Archive',
                'issue' => 'ARCHIVE 01',
                'date' => 'TECHNICAL FOCUS',
                'summary' => 'A study of our foundational outerwear forms, weather-resistant materials, and ergonomic structural details.',
                'image' => '/images/products/product-2.png',
                'featured' => false,
                'content' => [
                    'The Archive serves as an ongoing record of our design evolution—documenting our exploration of outerwear silhouettes, reliable hardware, and functional everyday refinements.',
                    'In our outerwear studies, attention naturally centers on balance and protection: tailoring clean hood structures, accommodating effortless layering, and positioning pocket storage where it naturally aligns with hand movement.',
                    'These archival records reflect our continuous commitment to refining high-quality modern sportswear with simplicity and strength.'
                ],
                'quote' => 'Our ongoing dedication to refining functional outerwear with simplicity, clear proportion, and strength.',
                'sort_order' => 5,
                'is_published' => true,
            ],
        ];

        foreach ($articles as $art) {
            Journal::updateOrCreate(
                ['slug' => $art['slug']],
                $art
            );
        }
    }
}
