<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\ProductVariant;

class ProductVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        foreach ($products as $product) {
            $colors = $product->colors;
            $sizes = $product->sizes;

            // Normalize colors list
            if (empty($colors) || !is_array($colors)) {
                $colors = [['name' => 'Default']];
            }

            // Normalize sizes list
            if (empty($sizes) || !is_array($sizes)) {
                $sizes = ['M'];
            }

            foreach ($colors as $c) {
                $colorName = is_array($c) && isset($c['name']) ? $c['name'] : (is_string($c) ? $c : 'Default');
                foreach ($sizes as $sizeName) {
                    $stock = $this->calculateVariantStock($product->slug, $colorName, $sizeName);

                    ProductVariant::updateOrCreate([
                        'product_id' => $product->id,
                        'color' => $colorName,
                        'size' => $sizeName,
                    ], [
                        'stock' => $stock,
                    ]);
                }
            }

            // Recalculate total product stock
            $totalStock = ProductVariant::where('product_id', $product->id)->sum('stock');
            $product->update(['stock' => $totalStock]);
        }
    }

    /**
     * Deterministcally calculate variant stock to match frontend logic
     */
    private function calculateVariantStock(string $slug, string $colorName, string $sizeName): int
    {
        $colorStr = $colorName ?: "default";
        $sizeStr = $sizeName ?: "M";
        
        $seed = 0;
        $str = "{$slug}-{$colorStr}-{$sizeStr}";
        for ($i = 0; $i < strlen($str); $i++) {
            $seed = ($seed + ord($str[$i]) * ($i + 1)) % 100;
        }
        return ($seed % 12) + 3; // Returns 3 to 14 units per variant
    }
}
