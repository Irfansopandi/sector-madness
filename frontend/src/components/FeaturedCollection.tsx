"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getImageUrl } from "@/utils/api";
import ProductCard from "./ProductCard";

export default function FeaturedCollection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasInitializedScrollRef = useRef(false);

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

  // Triple duplicated list for seamless bidirectional infinite scrolling
  const displayProducts = featuredProducts.length > 0
    ? [...featuredProducts, ...featuredProducts, ...featuredProducts]
    : [];

  // Normalize scroll position seamlessly in mid-range (0.5x to 1.5x setWidth) to eliminate any edge boundary pause/jeda
  const normalizeScroll = useCallback(() => {
    if (!scrollRef.current || featuredProducts.length === 0) return;
    const container = scrollRef.current;
    const children = container.children;
    const N = featuredProducts.length;

    if (children.length < N * 2) return;

    const item0 = children[0] as HTMLElement;
    const itemN = children[N] as HTMLElement;
    if (!item0 || !itemN) return;

    const setWidth = itemN.offsetLeft - item0.offsetLeft;
    if (setWidth <= 0) return;

    if (container.scrollLeft >= setWidth * 1.5) {
      container.scrollLeft -= setWidth;
    } else if (container.scrollLeft <= setWidth * 0.5) {
      container.scrollLeft += setWidth;
    }
  }, [featuredProducts.length]);

  // Set initial scroll position to the middle set (Set 2)
  useEffect(() => {
    if (scrollRef.current && featuredProducts.length > 0 && !hasInitializedScrollRef.current) {
      const container = scrollRef.current;
      const children = container.children;
      const N = featuredProducts.length;
      if (children.length >= N * 2) {
        const item0 = children[0] as HTMLElement;
        const itemN = children[N] as HTMLElement;
        if (item0 && itemN) {
          const setWidth = itemN.offsetLeft - item0.offsetLeft;
          container.scrollLeft = setWidth;
          hasInitializedScrollRef.current = true;
        }
      }
    }
  }, [featuredProducts.length]);

  // Continuous Smooth Auto-Scroll
  useEffect(() => {
    let animationFrameId: number;

    const autoScrollStep = () => {
      if (!isPaused && !isDraggingRef.current && scrollRef.current) {
        scrollRef.current.scrollLeft += 0.8;
        normalizeScroll();
      }
      animationFrameId = requestAnimationFrame(autoScrollStep);
    };

    animationFrameId = requestAnimationFrame(autoScrollStep);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, normalizeScroll]);

  // Mouse Drag Handlers for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    setIsPaused(true);
    startXRef.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStartRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftStartRef.current - walk;
    normalizeScroll();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setIsPaused(false);
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
        {/* Parent Track Wrapper with Symmetrical 60px Left & Right Inset */}
        <div style={{ paddingLeft: "60px", paddingRight: "60px" }} className="w-full">
          <div
            ref={scrollRef}
            onScroll={normalizeScroll}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", touchAction: "pan-x" }}
            className="w-full flex overflow-x-auto overflow-y-hidden gap-4 md:gap-5 lg:gap-6 scrollbar-none pb-6 select-none cursor-grab active:cursor-grabbing"
          >
            {displayProducts.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="flex-none w-[270px] sm:w-[310px] md:w-[340px] lg:w-[360px]"
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
                  index={index % (featuredProducts.length || 1)}
                  hideDetailsOnIdle={true}
                  onHoverImageStart={() => setIsPaused(true)}
                  onHoverImageEnd={() => setIsPaused(false)}
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
