<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faqs = [
            [
                'category' => 'GENERAL',
                'category_code' => '01',
                'question' => 'What is SECTOR MADNESS?',
                'answer' => 'SECTOR MADNESS is an independent contemporary fashion brand based in Indonesia, crafted for individuals who define their own direction. We combine Quiet Luxury visual codes with uncompromising craftsmanship and raw streetwear attitude.',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'category' => 'GENERAL',
                'category_code' => '01',
                'question' => 'Where is SECTOR MADNESS based?',
                'answer' => 'Our central studio and fulfillment atelier are based in Karawang, West Java, Indonesia. All items are quality-inspected and dispatched directly from our headquarters.',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'category' => 'GENERAL',
                'category_code' => '01',
                'question' => 'How can I contact Customer Support?',
                'answer' => 'You can reach out directly to our dedicated support team via WhatsApp at +62 859-4665-3103 or through our official Instagram (@sectormadness.id).',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'category' => 'ORDERS',
                'category_code' => '02',
                'question' => 'How can I place an order?',
                'answer' => 'Browse our collection online, select your size, and add the product to your bag. Proceed to checkout to enter your delivery address and complete payment.',
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'category' => 'ORDERS',
                'category_code' => '02',
                'question' => 'Can I modify or cancel my order after checkout?',
                'answer' => 'Once an order is confirmed, our fulfillment team begins processing immediately. If you need to make urgent changes to your address or item size, please contact us via WhatsApp immediately after placing your order.',
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'category' => 'ORDERS',
                'category_code' => '02',
                'question' => 'How can I check my order status?',
                'answer' => 'Real-time status notifications and order progression are displayed directly in your SECTOR MADNESS website account order history under your profile.',
                'sort_order' => 6,
                'is_active' => true,
            ],
            [
                'category' => 'SHIPPING',
                'category_code' => '03',
                'question' => 'Which shipping services are available?',
                'answer' => 'We partner with JNE and J&T express delivery services to ensure safe and reliable nationwide shipping across Indonesia.',
                'sort_order' => 7,
                'is_active' => true,
            ],
            [
                'category' => 'SHIPPING',
                'category_code' => '03',
                'question' => 'How long does shipping take?',
                'answer' => 'Orders are processed within 1 to 2 business days. Estimated delivery times depend on your destination city (typically 1–3 business days for Java, 2–5 business days for outer islands).',
                'sort_order' => 8,
                'is_active' => true,
            ],
            [
                'category' => 'SHIPPING',
                'category_code' => '03',
                'question' => 'How can I track my order?',
                'answer' => 'You can track your package progress from payment confirmation up to final delivery directly on our website inside your account dashboard, or use your tracking code on the official JNE or J&T website.',
                'sort_order' => 9,
                'is_active' => true,
            ],
            [
                'category' => 'PAYMENTS',
                'category_code' => '04',
                'question' => 'Which payment methods are accepted?',
                'answer' => 'We accept Bank Transfers (BCA, Mandiri, BNI, BRI) and automated online payment gateways available during the checkout process.',
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'category' => 'PAYMENTS',
                'category_code' => '04',
                'question' => 'When is my payment confirmed?',
                'answer' => 'Automated payment confirmations are processed instantly upon completion. Manual bank transfers are verified within 1 to 12 hours of upload.',
                'sort_order' => 11,
                'is_active' => true,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::firstOrCreate(
                [
                    'category' => $faq['category'],
                    'question' => $faq['question'],
                ],
                $faq
            );
        }
    }
}
