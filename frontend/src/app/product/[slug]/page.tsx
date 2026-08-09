"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { notFound } from "next/navigation";
import { products, getVariantStock, getTotalStock, getSizeStock } from "@/data/products";
import { use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import Container from "@/components/Container";
import CountdownTimer from "@/components/CountdownTimer";
import { addItemToBag } from "@/utils/bag";
import BagToast from "@/components/BagToast";
import WishlistToast from "@/components/WishlistToast";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProductBySlug, checkWishlistStatus, addToWishlist, removeFromWishlist, addToCart, getImageUrl } from "@/utils/api";
import { useEffect } from "react";

const getColorHex = (colorInput: any): string => {
  if (!colorInput) return "#0A0A0A";

  if (typeof colorInput === "object" && colorInput !== null) {
    if (colorInput.hex && typeof colorInput.hex === "string" && colorInput.hex.trim()) {
      return colorInput.hex.trim();
    }
    colorInput = colorInput.name || colorInput.color || String(colorInput);
  }

  const str = String(colorInput).trim();
  if (str.startsWith("#") || str.startsWith("rgb") || str.startsWith("hsl")) {
    return str;
  }

  const nameUpper = str.toUpperCase();

  const COLOR_MAP: Record<string, string> = {
    WHITE: "#FFFFFF",
    "OFF WHITE": "#F8F8F0",
    IVORY: "#FFFFF0",
    SNOW: "#FAFAFA",
    CREAM: "#FFFDD0",
    BLACK: "#0A0A0A",
    "STEALTH BLACK": "#0A0A0A",
    "JET BLACK": "#050505",
    CHARCOAL: "#333333",
    "WASHED GREY": "#4D5157",
    "WASHED GRAY": "#4D5157",
    "WASHED BLUE": "#4B6B94",
    GREY: "#808080",
    GRAY: "#808080",
    "LIGHT GREY": "#D3D3D3",
    "DARK GREY": "#555555",
    SAND: "#D4C5A9",
    BEIGE: "#F5F5DC",
    KHAKI: "#C3B091",
    OLIVE: "#3B4236",
    "MILITARY GREEN": "#3B4236",
    GREEN: "#2E7D32",
    "FOREST GREEN": "#228B22",
    NAVY: "#1B263B",
    "NAVY BLUE": "#1B263B",
    BLUE: "#1E88E5",
    "LIGHT BLUE": "#ADD8E6",
    RED: "#E53935",
    MAROON: "#800000",
    BURGUNDY: "#800020",
    BROWN: "#795548",
    CHOCOLATE: "#7B3F00",
    YELLOW: "#FBC02D",
    ORANGE: "#FB8C00",
    PURPLE: "#8E24AA",
    PINK: "#EC407A",
  };

  if (COLOR_MAP[nameUpper]) {
    return COLOR_MAP[nameUpper];
  }

  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (nameUpper.includes(key) || key.includes(nameUpper)) {
      return hex;
    }
  }

  return nameUpper.toLowerCase();
};

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  
  const { data: apiProduct, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col justify-between">
        <Navbar mode="dark" />
        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-6">
          <div className="w-10 h-10 border-2 border-[#B6A47E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono tracking-[0.3em] text-[#8A8A8A] uppercase animate-pulse mt-2">
            LOADING PRODUCT DETAILS...
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!apiProduct && isError) {
    notFound();
  }

  const targetProduct = apiProduct ? {
    id: String(apiProduct.id).padStart(3, '0'),
    slug: apiProduct.slug,
    name: apiProduct.name,
    collection: apiProduct.collection || "The Atelier Series",
    collectionCode: apiProduct.collection_code || "SECTOR 001",
    tagline: apiProduct.tagline || apiProduct.name,
    description: apiProduct.description || "",
    material: apiProduct.material || "Technical Blend",
    weight: apiProduct.weight || "450 GSM",
    price: typeof apiProduct.price === 'number' ? (apiProduct.price < 1000 ? apiProduct.price * 1000 : apiProduct.price) : 285000,
    originalPrice: (() => {
      const p = typeof apiProduct.price === 'number' ? (apiProduct.price < 1000 ? apiProduct.price * 1000 : apiProduct.price) : 285000;
      let op = apiProduct.original_price ? (apiProduct.original_price < 1000 ? apiProduct.original_price * 1000 : apiProduct.original_price) : undefined;
      if (op && op <= p) return p + op;
      return op;
    })(),
    discountPercentage: (() => {
      const p = typeof apiProduct.price === 'number' ? (apiProduct.price < 1000 ? apiProduct.price * 1000 : apiProduct.price) : 285000;
      let op = apiProduct.original_price ? (apiProduct.original_price < 1000 ? apiProduct.original_price * 1000 : apiProduct.original_price) : undefined;
      if (op && op <= p) op = p + op;
      if (op && op > p) return Math.round(((op - p) / op) * 100);
      return apiProduct.discount_percentage;
    })(),
    discountExpiresAt: apiProduct.discount_expires_at,
    isFlashSale: apiProduct.is_flash_sale,
    image: getImageUrl(apiProduct.image),
    gallery: (() => {
      const cover = getImageUrl(apiProduct.image);
      const list = Array.isArray(apiProduct.gallery) && apiProduct.gallery.length > 0
        ? apiProduct.gallery.map(getImageUrl)
        : [cover];
      if (cover && (list.length === 0 || list[0] !== cover)) {
        return [cover, ...list.filter((g: string) => g !== cover)];
      }
      return list;
    })(),
    colors: Array.isArray(apiProduct.colors) ? apiProduct.colors : [],
    sizes: Array.isArray(apiProduct.sizes) ? apiProduct.sizes : [],
    details: Array.isArray(apiProduct.details) ? apiProduct.details : (apiProduct.details ? [apiProduct.details] : []),
    story: apiProduct.story || apiProduct.description,
    limited: Boolean(apiProduct.limited),
    stock: apiProduct.stock ?? 25,
    size_guide: (apiProduct as any).size_guide || [],
    variants: (apiProduct as any).variants || [],
    category: apiProduct.category,
  } : null;

  if (!targetProduct) {
    notFound();
  }

  return <ProductDetail product={targetProduct} />;
}

function ProductDetail({ product }: { product: (typeof products)[0] }) {
  const queryClient = useQueryClient();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  const scrollToImage = (index: number) => {
    if (!product.gallery || product.gallery.length === 0) return;
    const nextIdx = Math.max(0, Math.min(index, product.gallery.length - 1));
    setActiveImage(nextIdx);
    if (galleryTrackRef.current) {
      const container = galleryTrackRef.current;
      const targetSlide = container.children[nextIdx] as HTMLElement;
      if (targetSlide) {
        container.scrollTo({
          left: targetSlide.offsetLeft,
          behavior: "smooth",
        });
      }
    }
  };

  const nextImage = () => {
    if (!product.gallery || product.gallery.length <= 1) return;
    if (activeImage < product.gallery.length - 1) {
      scrollToImage(activeImage + 1);
    }
  };

  const prevImage = () => {
    if (!product.gallery || product.gallery.length <= 1) return;
    if (activeImage > 0) {
      scrollToImage(activeImage - 1);
    }
  };

  const handleGalleryScroll = () => {
    if (!galleryTrackRef.current) return;
    const container = galleryTrackRef.current;
    const slideWidth = container.clientWidth;
    if (slideWidth > 0) {
      const currentIdx = Math.round(container.scrollLeft / slideWidth);
      if (currentIdx >= 0 && product.gallery && currentIdx < product.gallery.length && currentIdx !== activeImage) {
        setActiveImage(currentIdx);
      }
    }
  };
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [wishlistToastMsg, setWishlistToastMsg] = useState("");
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isExpired, setIsExpired] = useState(() => {
    const exp = (product as any).discountExpiresAt;
    if (exp) {
      return new Date(exp).getTime() <= Date.now();
    }
    return false;
  });

  const hasExpired = isExpired || ((product as any).discountExpiresAt ? new Date((product as any).discountExpiresAt).getTime() <= Date.now() : false);
  const displaySellingPrice = !hasExpired
    ? product.price
    : ((product as any).originalPrice && (product as any).originalPrice > product.price ? (product as any).originalPrice : product.price);
  const displayOriginalPrice = !hasExpired && (product as any).originalPrice && (product as any).originalPrice > product.price
    ? (product as any).originalPrice
    : undefined;

  // currentSize/currentColor are for display & bag — always have a value
  const currentSize = selectedSize || product.sizes[0] || "M";
  const currentColor = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0].name : "");

  // wishlistSize/wishlistColor: ONLY what the user explicitly clicked — null if not yet chosen
  const wishlistSize = selectedSize;
  const wishlistColor = selectedColor;

  useEffect(() => {
    const checkWishlist = async () => {
      const token = localStorage.getItem("sector_madness_token");
      if (token && product.id && wishlistSize && wishlistColor) {
        try {
          const status = await checkWishlistStatus(parseInt(product.id, 10), wishlistSize, wishlistColor);
          setIsInWishlist(status);
        } catch {
          // ignore
        }
      }
    };
    checkWishlist();
  }, [product.id, wishlistSize, wishlistColor]);

  const handleToggleWishlist = async () => {
    const token = localStorage.getItem("sector_madness_token");
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    // Validate: must select size and color first
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      setValidationError("Please select a SIZE before adding to Wishlist.");
      setTimeout(() => setValidationError(null), 3500);
      return;
    }
    if (!selectedColor && product.colors && product.colors.length > 0) {
      setValidationError("Please select a COLOR before adding to Wishlist.");
      setTimeout(() => setValidationError(null), 3500);
      return;
    }

    if (isWishlistLoading || !product.id) return;

    // Require explicit user selection before saving to wishlist
    const sizeToSave = selectedSize || currentSize;
    const colorToSave = selectedColor || currentColor;

    setValidationError(null);
    setIsWishlistLoading(true);
    try {
      const productId = parseInt(product.id, 10);
      if (isInWishlist) {
        await removeFromWishlist(productId, sizeToSave, colorToSave);
        setIsInWishlist(false);
        setWishlistToastMsg("REMOVED FROM WISHLIST");
        setShowWishlistToast(true);
      } else {
        await addToWishlist(productId, sizeToSave, colorToSave);
        setIsInWishlist(true);
        setWishlistToastMsg(`ADDED TO WISHLIST — ${sizeToSave} / ${colorToSave}`);
        setShowWishlistToast(true);
      }
    } catch {
      // Keep previous state if failed
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToBag = () => {
    // Validate: must select size and color first
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      setValidationError("Please select a SIZE before adding to Bag.");
      setTimeout(() => setValidationError(null), 3500);
      return;
    }
    if (!selectedColor && product.colors && product.colors.length > 0) {
      setValidationError("Please select a COLOR before adding to Bag.");
      setTimeout(() => setValidationError(null), 3500);
      return;
    }

    setValidationError(null);
    const size = selectedSize || product.sizes[0] || "M";
    const color = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0].name : "");
    const res = addItemToBag(
      {
        slug: product.slug,
        name: product.name,
        collection: product.collection || "ATELIER COLLECTION",
        size,
        color,
        price: product.price,
        image: product.image,
      },
      1
    );

    if (res.requiresAuth) {
      setShowAuthModal(true);
    } else if (res.success) {
      setShowToast(true);
      // Sync item directly with Laravel MySQL API database
      addToCart({
        product_id: !isNaN(parseInt(product.id, 10)) ? parseInt(product.id, 10) : undefined,
        slug: product.slug,
        name: product.name,
        color,
        size,
        quantity: 1,
      })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["cart"] });
        })
        .catch(() => {});
    }
  };

  const totalProductStock = typeof (product as any).stock === "number"
    ? (product as any).stock
    : 49;

  const activeVariant = (product as any).variants?.find(
    (v: any) =>
      v.color.toLowerCase() === (selectedColor || "").toLowerCase() &&
      v.size.toLowerCase() === (selectedSize || "").toLowerCase()
  );

  const variantStock = selectedColor && selectedSize
    ? (activeVariant ? activeVariant.stock : totalProductStock)
    : totalProductStock;

  // Helper to get stock for a specific size (and optional selected color)
  const getDbSizeStock = (sizeName: string, colorOverride?: string | null) => {
    const targetColor = colorOverride !== undefined ? colorOverride : selectedColor;
    if (Array.isArray((product as any).variants) && (product as any).variants.length > 0) {
      if (targetColor) {
        const v = (product as any).variants.find(
          (variant: any) =>
            variant.color.toLowerCase() === targetColor.toLowerCase() &&
            variant.size.toLowerCase() === sizeName.toLowerCase()
        );
        return v ? v.stock : 0;
      }
      return (product as any).variants
        .filter((variant: any) => variant.size.toLowerCase() === sizeName.toLowerCase())
        .reduce((sum: number, variant: any) => sum + variant.stock, 0);
    }
    const numSizes = product.sizes && product.sizes.length > 0 ? product.sizes.length : 1;
    return Math.max(0, Math.floor(totalProductStock / numSizes));
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  return (
    <main className="bg-[#0A0A0A] min-h-screen">
      <Navbar />

      {/* Main Product Content */}
      <Container className="pb-8 md:pb-12" style={{ paddingTop: "140px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-start">
          {/* Left Column: Single Bounded Horizontal Photo Gallery Track (All Viewports) */}
          <div className="lg:col-span-7 w-full">
            <div className="relative w-full group overflow-hidden full-bleed-mobile">
              {/* Navigation Arrows (Rendered only if gallery has > 1 image) */}
              {product.gallery.length > 1 && (
                <>
                  {activeImage > 0 && (
                    <button
                      onClick={prevImage}
                      aria-label="Previous Image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer z-30"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                  )}

                  {activeImage < product.gallery.length - 1 && (
                    <button
                      onClick={nextImage}
                      aria-label="Next Image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer z-30"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  )}
                </>
              )}

              {/* Horizontal Gallery Track */}
              <div
                ref={galleryTrackRef}
                onScroll={handleGalleryScroll}
                className="relative aspect-[3/4] w-full bg-[#161616] overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-none flex flex-nowrap rounded-none border border-[#222222]/40"
                style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
              >
                {product.gallery.map((img: string, i: number) => (
                  <div
                    key={i}
                    className="relative aspect-[3/4] w-full min-w-full flex-shrink-0 snap-start bg-[#161616]"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      priority={i === 0}
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      quality={90}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Dot Indicators (Moved outside scrolling track) */}
              {product.gallery.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30 pointer-events-none">
                  {product.gallery.map((_, i) => (
                    <span
                      key={i}
                      className={`h-0.5 transition-all duration-300 ${
                        activeImage === i ? "w-8 bg-[#F5F5F5]" : "w-4 bg-[#F5F5F5]/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

              {/* Thumbnails below gallery track with expanded spacing */}
              {product.gallery.length > 1 && (
                <div className="flex items-center gap-4 mt-16 md:mt-20 lg:mt-12 mb-16 md:mb-24 lg:mb-64 overflow-x-auto scrollbar-none pb-4">
                  {product.gallery.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => scrollToImage(i)}
                      className={`relative aspect-square w-16 md:w-20 shrink-0 cursor-pointer transition-all duration-300 rounded-sm ${
                        activeImage === i
                          ? "opacity-100 border border-[#F5F5F5] p-1"
                          : "opacity-45 hover:opacity-85 border border-transparent p-1"
                      }`}
                    >
                      <div className="relative w-full h-full overflow-hidden">
                        <Image
                          src={img}
                          alt={`${product.name} thumbnail ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Product Story Section — Spacious High-Fashion Termination Boundary */}
              <AnimatedSection className="mt-16 md:mt-24 lg:mt-12 border-t border-[#222222] pt-12 md:pt-16 pb-6 md:pb-10 flex flex-col justify-center">
                <div className="max-w-2xl my-auto">
                  <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block mb-6 md:mb-8">
                    The Story
                  </span>
                  <p className="font-[family-name:var(--font-display)] text-[15px] md:text-[18px] lg:text-[20px] font-light text-[#F5F5F5]/90 leading-[1.8] tracking-[-0.01em]">
                    {product.story}
                  </p>
                </div>
              </AnimatedSection>
            </div>

          {/* Right Column: Unified Product Detail Sticky Container */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start z-20">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Breadcrumb / Back Link */}
              <div>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-[#8A8A8A] hover:text-[#B6A47E] transition-colors uppercase mb-1 group cursor-pointer"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform group-hover:-translate-x-1"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  BACK TO CATALOG
                </Link>
              </div>

              {/* Category & Title Block */}
              <div>
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] font-light block mb-2">
                  {product.category?.name || "Uncategorized"} &nbsp;—&nbsp; {product.collection}
                </span>
                <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4vw,3.2rem)] text-[#F5F5F5] leading-[1.1] tracking-[-0.01em]">
                  {product.name}
                </h1>
              </div>

              {/* Price & Stock Display Row */}
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  {/* Flash sale live countdown timer */}
                  {!hasExpired && (product as any).discountExpiresAt && (
                    <CountdownTimer expiresAt={(product as any).discountExpiresAt} onExpire={() => setIsExpired(true)} />
                  )}

                  <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div className="flex flex-col gap-1">
                      {displayOriginalPrice && (
                        <div className="flex items-center gap-2">
                          {!hasExpired && (product as any).discountPercentage && (product as any).discountPercentage > 0 && (
                            <span className="bg-[#FF3B30] text-white text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 uppercase">
                              -{(product as any).discountPercentage}% OFF
                            </span>
                          )}
                          <p className="text-[13px] sm:text-[14px] text-[#888888] line-through font-[family-name:var(--font-body)]">
                            Rp {displayOriginalPrice.toLocaleString("id-ID")}
                          </p>
                        </div>
                      )}
                      <p className="text-[26px] sm:text-[28px] text-[#F5F5F5] font-[family-name:var(--font-body)] font-[600] whitespace-nowrap shrink-0">
                        Rp {displaySellingPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span className={`text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-[family-name:var(--font-body)] font-medium px-3.5 py-1.5 border whitespace-nowrap shrink-0 ${
                      (selectedSize && getDbSizeStock(selectedSize) <= 0) || totalProductStock <= 0
                        ? "bg-[#2A0C0C] text-[#FF6666] border-[#552222]"
                        : "bg-[#141414] text-[#B6A47E] border-[#2B2B2B]"
                    }`}>
                      TOTAL PRODUCT STOCK: {selectedSize ? Math.max(0, getDbSizeStock(selectedSize)) : Math.max(0, totalProductStock)} UNITS
                    </span>
                  </div>
                  {/* Dynamic Selected Variant Stock Indicator */}
                  {((product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0)) && (
                    <div className="flex items-center justify-between gap-4 text-xs font-mono tracking-wider bg-[#111111] border border-[#262626] flex-wrap sm:flex-nowrap" style={{ padding: "14px 16px" }}>
                      <span className="text-[#999999] uppercase text-[10px] sm:text-xs">
                        {product.colors && product.colors.length > 0 && product.sizes && product.sizes.length > 0 ? (
                          <>SELECTED: <strong className="text-white font-extrabold">{selectedColor || "NOT SELECTED"}</strong> / <strong className="text-white font-extrabold">{selectedSize || "NOT SELECTED"}</strong></>
                        ) : product.colors && product.colors.length > 0 ? (
                          <>COLOR: <strong className="text-white font-extrabold">{selectedColor || "NOT SELECTED"}</strong></>
                        ) : (
                          <>SIZE: <strong className="text-white font-extrabold">{selectedSize || "NOT SELECTED"}</strong></>
                        )}
                      </span>
                      <span className={`font-black tracking-widest px-2.5 py-1 border whitespace-nowrap shrink-0 text-[9px] sm:text-xs ${
                        selectedSize && getDbSizeStock(selectedSize) <= 0
                          ? "bg-[#331111] text-[#FF6666] border-[#662222]"
                          : "bg-[#222222] text-white border-[#333333]"
                      }`}>
                        {product.colors && product.colors.length > 0 && product.sizes && product.sizes.length > 0 ? (
                          selectedColor && selectedSize ? (
                            variantStock > 0 ? `${variantStock} AVAILABLE` : "OUT OF STOCK"
                          ) : "SELECT"
                        ) : product.colors && product.colors.length > 0 ? (
                          selectedColor ? `${totalProductStock} AVAILABLE` : "SELECT COLOR"
                        ) : (
                          selectedSize ? (
                            getDbSizeStock(selectedSize) > 0 ? `${getDbSizeStock(selectedSize)} AVAILABLE` : "OUT OF STOCK"
                          ) : "SELECT SIZE"
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <div className="w-full h-[1px] bg-[#222222]" />
              </div>

              {/* COLOR SELECTOR */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <span className="text-xs tracking-[0.25em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block font-medium" style={{ marginBottom: "18px" }}>
                    COLOR: <span className="text-[#F5F5F5] font-bold">{selectedColor || "SELECT COLOR"}</span>
                  </span>
                  <div className="flex items-center gap-4 border-b border-[#222222]" style={{ paddingBottom: "20px" }}>
                    {product.colors.map((colorItem: any) => {
                      const colorName = typeof colorItem === "string" ? colorItem : colorItem.name || String(colorItem);
                      const hexVal = getColorHex(colorItem);
                      const isWhiteOrLight =
                        hexVal.toUpperCase() === "#FFFFFF" ||
                        hexVal.toUpperCase() === "#FAFAFA" ||
                        hexVal.toUpperCase() === "#FFFFF0" ||
                        hexVal.toUpperCase() === "#F8F8F0" ||
                        hexVal.toUpperCase() === "#FFFDD0" ||
                        hexVal.toUpperCase() === "#F5F5DC";

                      return (
                        <button
                          key={colorName}
                          type="button"
                          onClick={() => {
                            setSelectedColor(colorName);
                            // If selected size is out of stock for this new color, reset size
                            if (selectedSize && getDbSizeStock(selectedSize, colorName) <= 0) {
                              setSelectedSize(null);
                            }
                          }}
                          title={colorName}
                          className={`w-10 h-10 border cursor-pointer transition-all duration-300 flex items-center justify-center ${
                            selectedColor === colorName
                              ? "border-[#B6A47E] p-[3px] scale-105 shadow-md"
                              : "border-[#333333] hover:border-[#8A8A8A]"
                          }`}
                        >
                          <span
                            className={`w-full h-full block ${isWhiteOrLight ? "border border-gray-400" : ""}`}
                            style={{ backgroundColor: hexVal }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SIZE SELECTOR */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
                    <span className="text-xs tracking-[0.25em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] font-medium">
                      SIZE
                    </span>
                    <span className="text-xs tracking-[0.2em] uppercase text-[#8A8A8A] font-medium select-none">
                      SIZE CHART
                    </span>
                  </div>

                  {/* Connected Border Size Row with Per-Size Stock Breakdown */}
                  <div className="flex border border-[#222222] divide-x divide-[#222222]">
                    {product.sizes.map((sizeItem: any) => {
                      const sizeName = typeof sizeItem === "string" ? sizeItem : sizeItem.size || sizeItem.name || String(sizeItem);
                      const sizeStock = getDbSizeStock(sizeName);
                      const isSelected = selectedSize === sizeName;
                      const isOutOfStock = sizeStock <= 0;
                      return (
                        <button
                          key={sizeName}
                          translate="no"
                          disabled={isOutOfStock}
                          onClick={() => {
                            if (!isOutOfStock) {
                              setSelectedSize(sizeName);
                            }
                          }}
                          className={`flex-1 text-center font-[family-name:var(--font-body)] transition-all flex flex-col items-center justify-center gap-1.5 ${
                            isOutOfStock
                              ? "opacity-35 cursor-not-allowed bg-[#0E0E0E] text-[#555555] line-through select-none"
                              : isSelected
                              ? "bg-[#F5F5F5] text-[#0A0A0A] cursor-pointer"
                              : "bg-transparent text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#161616] cursor-pointer"
                          }`}
                          style={{ padding: "14px 8px" }}
                        >
                          <span className={`text-[13px] tracking-[0.18em] ${isSelected ? "font-black" : "font-semibold"}`}>
                            {sizeName}
                          </span>
                          <span className={`text-[9px] font-mono tracking-widest uppercase ${
                            isOutOfStock
                              ? "text-[#555555]"
                              : isSelected
                              ? "text-[#333333] font-bold"
                              : "text-[#777777]"
                          }`}>
                            {sizeStock > 0 ? `${sizeStock} LEFT` : "0 LEFT"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Validation Error */}
              {validationError && (
                <div className="flex items-center gap-2 px-4 py-3 border border-[#CC3333]/40 bg-[#CC3333]/10 text-[#FF6666] text-[11px] font-mono font-bold uppercase tracking-widest">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {validationError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "4px", paddingBottom: "4px" }}>
                {(() => {
                  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
                  const allSizesOutOfStock = hasSizes
                    ? product.sizes.every((s: any) => {
                        const sName = typeof s === "string" ? s : s.size || s.name || String(s);
                        return getDbSizeStock(sName) <= 0;
                      })
                    : false;

                  const isItemOutOfStock =
                    totalProductStock <= 0 ||
                    allSizesOutOfStock ||
                    (selectedSize ? getDbSizeStock(selectedSize) <= 0 : false);

                  return (
                    <>
                      <motion.button
                        whileTap={!isItemOutOfStock ? { scale: 0.985 } : undefined}
                        disabled={isItemOutOfStock}
                        onClick={handleAddToBag}
                        className={`w-full text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-body)] font-bold transition-colors duration-300 shadow-xl ${
                          isItemOutOfStock
                            ? "bg-[#1C1C1C] text-[#666666] border border-[#2A2A2A] cursor-not-allowed opacity-60"
                            : "bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#B6A47E] hover:text-[#0A0A0A] cursor-pointer"
                        }`}
                        style={{ padding: "18px 0px" }}
                      >
                        {isItemOutOfStock ? "OUT OF STOCK" : "ADD TO BAG"}
                      </motion.button>

                      <button
                        onClick={handleToggleWishlist}
                        disabled={isWishlistLoading || isItemOutOfStock}
                        className={`w-full border border-[#262626] text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-body)] font-medium transition-all duration-300 ${
                          isItemOutOfStock
                            ? "bg-[#141414] text-[#555555] border-[#222222] cursor-not-allowed opacity-50"
                            : isInWishlist
                            ? "bg-[#B6A47E] text-[#0A0A0A] hover:bg-white cursor-pointer"
                            : "bg-transparent text-[#F5F5F5] hover:border-[#8A8A8A] cursor-pointer"
                        } ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{ padding: "18px 0px" }}
                      >
                        {isItemOutOfStock ? "OUT OF STOCK" : isInWishlist ? "WISHLISTED" : "ADD TO WISHLIST"}
                      </button>
                    </>
                  );
                })()}
              </div>

              {/* Accordions / Information Collapsibles */}
              <div className="mt-10 md:mt-12 border-y border-[#2A2A2A] divide-y divide-[#2A2A2A]">
                {/* Accordion 1: Description */}
                <div>
                  <button
                    onClick={() => toggleAccordion("description")}
                    className="w-full py-6 md:py-7 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-[13px] md:text-[14px] lg:text-[15px] tracking-[0.15em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium">
                      DESCRIPTION
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-xl font-light">
                      {openAccordion === "description" ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openAccordion === "description" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pb-6 md:pb-8 lg:pb-10"
                      >
                        <p className="text-sm text-[#999999] font-[family-name:var(--font-body)] font-light leading-[2]">
                          {product.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 2: Material & Composition */}
                <div>
                  <button
                    onClick={() => toggleAccordion("material")}
                    className="w-full py-6 md:py-7 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-[13px] md:text-[14px] lg:text-[15px] tracking-[0.15em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium">
                      MATERIAL & COMPOSITION
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-xl font-light">
                      {openAccordion === "material" ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openAccordion === "material" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pb-6 md:pb-8 lg:pb-10 space-y-3"
                      >
                        <p className="text-sm text-[#999999] font-[family-name:var(--font-body)] font-light leading-[1.9] whitespace-pre-line">
                          {product.material}
                        </p>
                        <p className="text-sm text-[#999999] font-[family-name:var(--font-body)] font-light leading-[1.9]">
                          Weight: {product.weight}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Accordion 3: Details & Specifications */}
                <div>
                  <button
                    onClick={() => toggleAccordion("details")}
                    className="w-full py-6 md:py-7 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-[13px] md:text-[14px] lg:text-[15px] tracking-[0.15em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium">
                      DETAILS & SPECIFICATIONS
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-xl font-light">
                      {openAccordion === "details" ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openAccordion === "details" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pb-6 md:pb-8 lg:pb-10"
                      >
                        <ul className="space-y-4">
                          {product.details.map((detail, i) => (
                            <li
                              key={i}
                              className="text-sm text-[#999999] font-[family-name:var(--font-body)] font-light flex items-start gap-3 leading-[1.8]"
                            >
                              <span className="text-[#8A8A8A]/50 mt-0.5">—</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {((product as any).size_guide && (product as any).size_guide.length > 0) && (
                  <div>
                    <button
                      onClick={() => toggleAccordion("size_guide")}
                      className="w-full py-6 md:py-7 flex items-center justify-between text-left cursor-pointer group"
                    >
                      <span className="text-[13px] md:text-[14px] lg:text-[15px] tracking-[0.15em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium">
                        SIZE GUIDE
                      </span>
                      <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-xl font-light">
                        {openAccordion === "size_guide" ? "-" : "+"}
                      </span>
                    </button>
                    <AnimatePresence>
                      {openAccordion === "size_guide" && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden pb-6 space-y-3 text-[12px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light leading-[1.8]"
                        >
                          {(() => {
                            const guideData = (product as any).size_guide;
                            return (
                              <table className="w-full text-center border-collapse border border-[#222222] text-[11px] font-mono tracking-wider mt-2">
                                <thead>
                                  <tr className="border-b border-[#222222] bg-[#111111]">
                                    <th className="py-2 px-3 text-white font-bold uppercase text-center notranslate" translate="no">SIZE</th>
                                    <th className="py-2 px-3 text-white font-bold uppercase text-center">CHEST (CM)</th>
                                    <th className="py-2 px-3 text-white font-bold uppercase text-center">WAIST (CM)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#222222]">
                                  {guideData.map((row: any) => (
                                    <tr key={row.size}>
                                      <td className="py-2.5 px-3 font-bold text-white bg-[#141414] text-center notranslate" translate="no">
                                        {row.size}
                                      </td>
                                      <td className="py-2.5 px-3 text-[#999999] text-center">
                                        {row.chest}
                                      </td>
                                      <td className="py-2.5 px-3 text-[#999999] text-center">
                                        {row.waist}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            );
                          })()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Accordion 4: Shipping & Returns */}
                <div>
                  <button
                    onClick={() => toggleAccordion("shipping")}
                    className="w-full py-6 md:py-7 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-[13px] md:text-[14px] lg:text-[15px] tracking-[0.15em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium">
                      SHIPPING & CANCEL
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-xl font-light">
                      {openAccordion === "shipping" ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openAccordion === "shipping" && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden pb-6 space-y-2 text-[12px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light"
                      >
                        <p>Shipping rates are calculated automatically at checkout based on your destination address.</p>
                        <p>For paid orders, cancellation refunds are processed within 1-3 working days and will be visible in the user dashboard.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </Container>

      <AuthRequiredModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <BagToast show={showToast} onClose={() => setShowToast(false)} />
      <WishlistToast show={showWishlistToast} onClose={() => setShowWishlistToast(false)} message={wishlistToastMsg} />
      <Footer />
    </main>
  );
}
