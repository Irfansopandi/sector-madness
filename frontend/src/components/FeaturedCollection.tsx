"use client";

import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getImageUrl } from "@/utils/api";
import { products as localProducts } from "@/data/products";
import ProductCard from "./ProductCard";

export default function FeaturedCollection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: apiProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const productsList = apiProducts && apiProducts.length > 0 ? apiProducts.map(p => ({
    id: String(p.id).padStart(3, '0'),
    slug: p.slug,
    name: p.name,
    collection: p.collection || "The Atelier Series",
    collectionCode: p.collection_code || "SECTOR 001",
    tagline: p.tagline || p.name,
    description: p.description || "",
    material: p.material || "Technical Blend",
    weight: p.weight || "450 GSM",
    price: typeof p.price === 'number' ? (p.price < 1000 ? p.price * 1000 : p.price) : 285000,
    originalPrice: p.original_price ? (p.original_price < 1000 ? p.original_price * 1000 : p.original_price) : undefined,
    discountPercentage: p.discount_percentage,
    discountExpiresAt: p.discount_expires_at,
    isFlashSale: p.is_flash_sale,
    image: getImageUrl(p.image),
    limited: Boolean(p.limited),
  })) : [];

  const featuredProducts = productsList.slice(0, 10);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -450 : 450;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="collection" className="relative w-full bg-[#0A0A0A] pt-[220px] md:pt-[280px] lg:pt-[350px] pb-4">
      {/* Top Header Row - Aligned 60px with Navbar & Footer */}
      <div
        style={{ marginBottom: "60px", paddingLeft: "60px", paddingRight: "60px", marginTop: "30px"}}
        className="w-full flex items-center justify-between"
      >
        <div>
          <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block mb-3">
            Sector
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-[20px] md:text-[24px] lg:text-[28px] text-[#F5F5F5] font-bold tracking-[0.05em] uppercase">
            FEATURED PRODUCTS
          </h2>
        </div>
        <span className="text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase text-[#B6A47E] font-medium hidden sm:inline-block">
          TOP {featuredProducts.length} SELECTIONS
        </span>
      </div>

      {/* 100% Full Screen Viewport Width Carousel Wrapper */}
      <div className="relative w-full">
        {/* Floating Left Arrow Button */}
        <button
          onClick={() => scroll("left")}
          aria-label="Previous"
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-[#F5F5F5] text-[#0A0A0A] flex items-center justify-center shadow-2xl opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer"
        >
          <span className="text-[20px] font-bold">‹</span>
        </button>

        {/* Floating Right Arrow Button */}
        <button
          onClick={() => scroll("right")}
          aria-label="Next"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-[#F5F5F5] text-[#0A0A0A] flex items-center justify-center shadow-2xl opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer"
        >
          <span className="text-[20px] font-bold">›</span>
        </button>

        {/* Parent Track Wrapper with Symmetrical 60px Left & Right Inset */}
        <div style={{ paddingLeft: "60px", paddingRight: "60px" }} className="w-full">
          <div
            ref={scrollRef}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", touchAction: "pan-x" }}
            className="w-full flex overflow-x-auto overflow-y-hidden gap-4 md:gap-5 lg:gap-6 scrollbar-none snap-x snap-mandatory scroll-smooth pb-6 select-none"
          >
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex-none w-[270px] sm:w-[310px] md:w-[340px] lg:w-[360px] snap-start"
              >
                <ProductCard
                  slug={product.slug}
                  name={product.name}
                  collection={product.collection}
                  collectionCode={product.collectionCode}
                  material={product.material}
                  weight={product.weight}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  discountPercentage={product.discountPercentage}
                  discountExpiresAt={product.discountExpiresAt}
                  isFlashSale={product.isFlashSale}
                  image={product.image}
                  limited={product.limited}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full-width Divider Line */}
      <div
        style={{ marginTop: "75px", marginBottom: "30px" }}
        className="w-full h-[1px] bg-[#222222]"
      />
    </section>
  );
}
