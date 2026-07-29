"use client";

import { useState } from "react";
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
import { addItemToBag } from "@/utils/bag";
import { addToCart } from "@/utils/api";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import BagToast from "@/components/BagToast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProductBySlug } from "@/utils/api";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  
  const { data: apiProduct } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });

  const localProduct = products.find((p) => p.slug === slug);
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
    price: typeof apiProduct.price === 'number' ? (apiProduct.price > 1000 ? apiProduct.price / 15000 : apiProduct.price) : 285,
    image: apiProduct.image || "/images/products/product-1.png",
    gallery: apiProduct.gallery || [apiProduct.image || "/images/products/product-1.png"],
    colors: apiProduct.colors || [{ name: "Black", hex: "#0A0A0A" }],
    sizes: apiProduct.sizes || ["S", "M", "L", "XL"],
    details: apiProduct.details || ["Technical Construction"],
    story: apiProduct.story || apiProduct.description,
    limited: Boolean(apiProduct.limited),
    stock: apiProduct.stock ?? 25,
  } : localProduct;

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
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleAddToBag = () => {
    const size = selectedSize || product.sizes[0] || "M";
    const color = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0].name : "DEFAULT");
    if (!selectedSize) {
      setSelectedSize(size);
    }
    if (!selectedColor && product.colors && product.colors.length > 0) {
      setSelectedColor(color);
    }
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

  const totalCatalogStock = getTotalStock(product.slug);
  const variantStock = getVariantStock(product.slug, selectedColor, selectedSize);

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % product.gallery.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + product.gallery.length) % product.gallery.length);
  };

  const toggleAccordion = (section: string) => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  return (
    <main className="bg-[#0A0A0A] min-h-screen">
      <Navbar />

      {/* Main Product Content */}
      <Container className="pb-16 md:pb-24" style={{ paddingTop: "140px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 xl:gap-20 items-start">
          {/* Left Column: Gallery Slider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            {/* Main Image Box */}
            <div className="relative aspect-[3/4] bg-[#161616] overflow-hidden mb-4 group">
              <Image
                src={product.gallery[activeImage]}
                alt={product.name}
                fill
                className="object-cover transition-all duration-500"
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                quality={90}
              />

              {/* Left Arrow (<) */}
              <button
                onClick={prevImage}
                aria-label="Previous Image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 opacity-70 group-hover:opacity-100 cursor-pointer z-10"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {/* Right Arrow (>) */}
              <button
                onClick={nextImage}
                aria-label="Next Image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-300 opacity-70 group-hover:opacity-100 cursor-pointer z-10"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Bottom Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {product.gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-0.5 transition-all duration-300 cursor-pointer ${
                      activeImage === i
                        ? "w-8 bg-[#F5F5F5]"
                        : "w-4 bg-[#F5F5F5]/40 hover:bg-[#F5F5F5]/70"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnails below main image */}
            <div className="flex gap-4">
              {product.gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square w-16 md:w-20 overflow-hidden cursor-pointer transition-opacity duration-300 ${
                    activeImage === i
                      ? "opacity-100 border border-[#F5F5F5]/30"
                      : "opacity-50 hover:opacity-80 border border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Refined Spacious Luxury Detail Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 lg:sticky lg:top-28 self-start"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Category & Title Block */}
              <div>
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] font-light block mb-2">
                  {product.collectionCode} &nbsp;—&nbsp; {product.collection}
                </span>
                <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4vw,3.2rem)] text-[#F5F5F5] leading-[1.1] tracking-[-0.01em]">
                  {product.name}
                </h1>
              </div>

              {/* Price & Stock Display Row */}
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <p className="text-[24px] sm:text-[26px] text-[#F5F5F5] font-[family-name:var(--font-body)] font-light whitespace-nowrap shrink-0">
                      Rp {(product.price * 15000).toLocaleString("id-ID")}
                    </p>
                    <span className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-[family-name:var(--font-body)] text-[#B6A47E] font-medium bg-[#141414] px-3.5 py-1.5 border border-[#2B2B2B] whitespace-nowrap shrink-0">
                      FULL CATALOG STOCK: {totalCatalogStock} UNITS
                    </span>
                  </div>

                  {/* Dynamic Selected Variant Stock Indicator */}
                  <div className="flex items-center justify-between gap-4 text-xs font-mono tracking-wider bg-[#111111] border border-[#262626] flex-wrap sm:flex-nowrap" style={{ padding: "14px 20px" }}>
                    <span className="text-[#999999] uppercase whitespace-nowrap">
                      SELECTED VARIANT: <strong className="text-white font-extrabold">{selectedColor || product.colors[0]?.name || "DEFAULT"}</strong> / <strong className="text-white font-extrabold">{selectedSize || product.sizes[0] || "M"}</strong>
                    </span>
                    <span className="text-white font-black tracking-widest bg-[#222222] px-3.5 py-1 border border-[#333333] whitespace-nowrap shrink-0">
                      {variantStock} AVAILABLE
                    </span>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-[#222222]" />
              </div>

              {/* COLOR SELECTOR */}
              <div>
                <span className="text-xs tracking-[0.25em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block mb-3 font-medium">
                  COLOR: <span className="text-[#F5F5F5] font-bold">{selectedColor || "SELECT COLOR"}</span>
                </span>
                <div className="flex items-center gap-4 border-b border-[#222222]" style={{ paddingBottom: "20px" }}>
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-10 h-10 border cursor-pointer transition-all duration-300 flex items-center justify-center ${
                        selectedColor === color.name
                          ? "border-[#F5F5F5] p-[3px] scale-105"
                          : "border-[#222222] hover:border-[#8A8A8A]"
                      }`}
                    >
                      <span
                        className="w-full h-full"
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* SIZE SELECTOR */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: "12px" }}>
                  <span className="text-xs tracking-[0.25em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] font-medium">
                    SIZE
                  </span>
                  <button className="text-xs tracking-[0.2em] uppercase text-[#8A8A8A] hover:text-[#F5F5F5] underline underline-offset-4 transition-colors cursor-pointer font-medium">
                    SIZE CHART
                  </button>
                </div>

                {/* Connected Border Size Row with Per-Size Stock Breakdown */}
                <div className="flex border border-[#222222] divide-x divide-[#222222]">
                  {product.sizes.map((size) => {
                    const sizeStock = getSizeStock(product.slug, size, selectedColor);
                    const isSelected = (selectedSize || product.sizes[0]) === size;
                    return (
                      <button
                        key={size}
                        translate="no"
                        onClick={() => setSelectedSize(size)}
                        className={`flex-1 text-center font-[family-name:var(--font-body)] transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-[#F5F5F5] text-[#0A0A0A]"
                            : "bg-transparent text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#161616]"
                        }`}
                        style={{ padding: "14px 8px" }}
                      >
                        <span className={`text-[13px] tracking-[0.18em] ${isSelected ? "font-black" : "font-semibold"}`}>
                          {size}
                        </span>
                        <span className={`text-[9px] font-mono tracking-widest uppercase ${isSelected ? "text-[#333333] font-bold" : "text-[#777777]"}`}>
                          {sizeStock} LEFT
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "4px", paddingBottom: "4px" }}>
                <motion.button
                  whileTap={{ scale: 0.985 }}
                  onClick={handleAddToBag}
                  className="w-full bg-[#F5F5F5] text-[#0A0A0A] text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-body)] font-bold hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-colors duration-300 cursor-pointer shadow-xl"
                  style={{ padding: "18px 0px" }}
                >
                  ADD TO BAG
                </motion.button>

                <button
                  className="w-full border border-[#262626] bg-transparent text-[#F5F5F5] text-xs tracking-[0.3em] uppercase font-[family-name:var(--font-body)] font-medium hover:border-[#8A8A8A] transition-all duration-300 cursor-pointer"
                  style={{ padding: "18px 0px" }}
                >
                  ADD TO WISHLIST
                </button>
              </div>

              {/* Accordions / Information Collapsibles */}
              <div className="border-t border-[#222222] divide-y divide-[#222222]">
                {/* Accordion 1: Description */}
                <div>
                  <button
                    onClick={() => toggleAccordion("description")}
                    className="w-full py-8 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-xs tracking-[0.25em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-bold">
                      DESCRIPTION
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-base font-bold">
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
                        className="overflow-hidden pb-8"
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
                    className="w-full py-8 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-xs tracking-[0.25em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-bold">
                      MATERIAL & COMPOSITION
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-base font-bold">
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
                        className="overflow-hidden pb-8 space-y-3"
                      >
                        <p className="text-sm text-[#999999] font-[family-name:var(--font-body)] font-light leading-[1.9]">
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
                    className="w-full py-8 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-xs tracking-[0.25em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-bold">
                      DETAILS & SPECIFICATIONS
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-base font-bold">
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
                        className="overflow-hidden pb-8"
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

                {/* Accordion 4: Shipping & Returns */}
                <div>
                  <button
                    onClick={() => toggleAccordion("shipping")}
                    className="w-full py-8 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-xs tracking-[0.25em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-bold">
                      SHIPPING & RETURNS
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-base font-bold">
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
                        <p>Complimentary express shipping on orders over Rp 3.000.000.</p>
                        <p>Returns accepted within 14 days of delivery in original condition.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Story Section */}
        <AnimatedSection className="mt-28 md:mt-40 lg:mt-48 border-t border-[#222222] pt-16 md:pt-24 lg:pt-28 pb-28 md:pb-40 lg:pb-52">
          <div className="max-w-2xl">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block mb-6">
              The Story
            </span>
            <p className="font-[family-name:var(--font-display)] text-[15px] md:text-[18px] lg:text-[20px] font-light text-[#F5F5F5]/90 leading-[1.8] tracking-[-0.01em]">
              {product.story}
            </p>
          </div>
        </AnimatedSection>
      </Container>

      <AuthRequiredModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <BagToast show={showToast} onClose={() => setShowToast(false)} />
      <Footer />
    </main>
  );
}
