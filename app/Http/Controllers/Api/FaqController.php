<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    /**
     * Display a listing of active FAQs grouped by category for frontend.
     */
    public function index()
    {
        // Auto seed default initial FAQs if table is empty
        if (Faq::count() === 0) {
            $this->seedDefaults();
        }

        $faqs = Faq::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        // Group by category
        $grouped = [];
        $categoryCodes = [
            'GENERAL' => '01',
            'ORDERS' => '02',
            'SHIPPING' => '03',
            'PAYMENTS' => '04',
        ];

        foreach ($faqs as $faq) {
            $catName = strtoupper($faq->category);
            $catCode = $faq->category_code ?: ($categoryCodes[$catName] ?? '01');

            if (!isset($grouped[$catName])) {
                $grouped[$catName] = [
                    'id' => strtolower($catName),
                    'code' => $catCode,
                    'category' => $catName,
                    'items' => [],
                ];
            }

            $grouped[$catName]['items'][] = [
                'id' => (string) $faq->id,
                'question' => $faq->question,
                'answer' => $faq->answer,
                'sort_order' => $faq->sort_order,
                'is_active' => $faq->is_active,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => array_values($grouped),
            'raw' => $faqs,
        ]);
    }

    /**
     * Display a full listing of all FAQs for Admin management.
     */
    public function adminIndex()
    {
        if (Faq::count() === 0) {
            $this->seedDefaults();
        }

        $faqs = Faq::orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $faqs,
        ]);
    }

    /**
     * Store a newly created FAQ item (Admin API).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'category_code' => 'nullable|string|max:10',
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $categoryCodes = [
            'GENERAL' => '01',
            'ORDERS' => '02',
            'SHIPPING' => '03',
            'PAYMENTS' => '04',
        ];

        $catUpper = strtoupper($validated['category']);
        $validated['category'] = $catUpper;
        if (empty($validated['category_code'])) {
            $validated['category_code'] = $categoryCodes[$catUpper] ?? '01';
        }

        $faq = Faq::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'FAQ successfully created.',
            'data' => $faq,
        ], 201);
    }

    /**
     * Update the specified FAQ item (Admin API).
     */
    public function update(Request $request, $id)
    {
        $faq = Faq::findOrFail($id);

        $validated = $request->validate([
            'category' => 'sometimes|required|string|max:100',
            'category_code' => 'nullable|string|max:10',
            'question' => 'sometimes|required|string|max:255',
            'answer' => 'sometimes|required|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['category'])) {
            $validated['category'] = strtoupper($validated['category']);
        }

        $faq->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'FAQ successfully updated.',
            'data' => $faq,
        ]);
    }

    /**
     * Remove the specified FAQ item from storage (Admin API).
     */
    public function destroy($id)
    {
        $faq = Faq::findOrFail($id);
        $faq->delete();

        return response()->json([
            'success' => true,
            'message' => 'FAQ successfully deleted.',
        ]);
    }

    /**
     * Internal helper to seed initial defaults.
     */
    private function seedDefaults()
    {
        $defaults = [
            [
                'category' => 'GENERAL',
                'category_code' => '01',
                'question' => 'What is SECTOR MADNESS?',
                'answer' => 'SECTOR MADNESS is an independent contemporary fashion brand based in Indonesia, crafted for individuals who define their own direction. We combine Quiet Luxury visual codes with uncompromising craftsmanship and raw streetwear attitude.',
                'sort_order' => 1,
            ],
            [
                'category' => 'GENERAL',
                'category_code' => '01',
                'question' => 'Where is SECTOR MADNESS based?',
                'answer' => 'Our central studio and fulfillment atelier are based in Karawang, West Java, Indonesia. All items are quality-inspected and dispatched directly from our headquarters.',
                'sort_order' => 2,
            ],
            [
                'category' => 'GENERAL',
                'category_code' => '01',
                'question' => 'How can I contact Customer Support?',
                'answer' => 'You can reach out directly to our dedicated support team via WhatsApp at +62 859-4665-3103 or through our official Instagram (@sectormadness.id).',
                'sort_order' => 3,
            ],
            [
                'category' => 'ORDERS',
                'category_code' => '02',
                'question' => 'How can I place an order?',
                'answer' => 'Browse our collection online, select your size, and add the product to your bag. Proceed to checkout to enter your delivery address and complete payment.',
                'sort_order' => 4,
            ],
            [
                'category' => 'ORDERS',
                'category_code' => '02',
                'question' => 'Can I modify or cancel my order after checkout?',
                'answer' => 'Once an order is confirmed, our fulfillment team begins processing immediately. If you need to make urgent changes to your address or item size, please contact us via WhatsApp immediately after placing your order.',
                'sort_order' => 5,
            ],
            [
                'category' => 'ORDERS',
                'category_code' => '02',
                'question' => 'How can I check my order status?',
                'answer' => 'Real-time status notifications and order progression are displayed directly in your SECTOR MADNESS website account order history under your profile.',
                'sort_order' => 6,
            ],
            [
                'category' => 'SHIPPING',
                'category_code' => '03',
                'question' => 'Which shipping services are available?',
                'answer' => 'We partner with JNE and J&T express delivery services to ensure safe and reliable nationwide shipping across Indonesia.',
                'sort_order' => 7,
            ],
            [
                'category' => 'SHIPPING',
                'category_code' => '03',
                'question' => 'How long does shipping take?',
                'answer' => 'Orders are processed within 1 to 2 business days. Estimated delivery times depend on your destination city (typically 1–3 business days for Java, 2–5 business days for outer islands).',
                'sort_order' => 8,
            ],
            [
                'category' => 'SHIPPING',
                'category_code' => '03',
                'question' => 'How can I track my order?',
                'answer' => 'You can track your package progress from payment confirmation up to final delivery directly on our website inside your account dashboard, or use your tracking code on the official JNE or J&T website.',
                'sort_order' => 9,
            ],
            [
                'category' => 'PAYMENTS',
                'category_code' => '04',
                'question' => 'Which payment methods are accepted?',
                'answer' => 'We accept Bank Transfers (BCA, Mandiri, BNI, BRI) and automated online payment gateways available during the checkout process.',
                'sort_order' => 10,
            ],
            [
                'category' => 'PAYMENTS',
                'category_code' => '04',
                'question' => 'When is my payment confirmed?',
                'answer' => 'Automated payment confirmations are processed instantly upon completion. Manual bank transfers are verified within 1 to 12 hours of upload.',
                'sort_order' => 11,
            ],
        ];

        foreach ($defaults as $d) {
            Faq::create($d);
        }
    }
}
