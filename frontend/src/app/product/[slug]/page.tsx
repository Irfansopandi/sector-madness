"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { notFound } from "next/navigation";
import { products, getVariantStock } from "@/data/products";
import { use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import Container from "@/components/Container";
import { addItemToBag } from "@/utils/bag";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import BagToast from "@/components/BagToast";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={typeof product === "undefined" ? products[0] : product} />;
}

function ProductDetail({ product }: { product: (typeof products)[0] }) {
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
    }
  };

  const stockCount = getVariantStock(product.slug, selectedColor, selectedSize);

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
            <div>
              {/* Category / Collection Breadcrumb */}
              <div className="mb-4">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] font-light">
                  {product.collectionCode} &nbsp;—&nbsp; {product.collection}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,3vw,2.8rem)] text-[#F5F5F5] leading-[1.12] tracking-[-0.01em] mb-6">
                {product.name}
              </h1>

              {/* Price & Stock Display Row */}
              <div className="mb-12">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="text-[22px] text-[#F5F5F5] font-[family-name:var(--font-body)] font-light">
                    Rp {(product.price * 15000).toLocaleString("id-ID")}
                  </p>
                  <span
                    className={`text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-body)] transition-colors duration-300 ${
                      stockCount !== null
                        ? "text-[#B6A47E] font-medium"
                        : "text-[#8A8A8A] font-light"
                    }`}
                  >
                    {stockCount !== null
                      ? `STOCK: ${stockCount} ${stockCount === 1 ? "UNIT" : "UNITS"} REMAINING`
                      : selectedColor || selectedSize
                      ? "SELECT COLOR & SIZE FOR STOCK"
                      : "LIMITED EDITION"}
                  </span>
                </div>
                <div className="w-full h-[1px] bg-[#222222]" />
              </div>

              {/* COLOR SELECTOR */}
              <div className="mb-8">
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block mb-4">
                  COLOR: <span className="text-[#F5F5F5] font-medium">{selectedColor || "SELECT COLOR"}</span>
                </span>
                <div className="flex items-center gap-3.5 pb-8 border-b border-[#222222]">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-9 h-9 border cursor-pointer transition-all duration-300 flex items-center justify-center ${
                        selectedColor === color.name
                          ? "border-[#F5F5F5] p-[2px]"
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
              <div className="pt-2 mb-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)]">
                    SIZE
                  </span>
                  <button className="text-[10px] tracking-[0.15em] uppercase text-[#8A8A8A] hover:text-[#F5F5F5] underline underline-offset-4 transition-colors cursor-pointer">
                    SIZE CHART
                  </button>
                </div>

                {/* Connected Border Size Row */}
                <div className="flex border border-[#222222] divide-x divide-[#222222]">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      translate="no"
                      onClick={() => setSelectedSize(size)}
                      className={`flex-1 py-4 text-center text-[11px] tracking-[0.15em] font-[family-name:var(--font-body)] transition-all cursor-pointer ${
                        selectedSize === size
                          ? "bg-[#F5F5F5] text-[#0A0A0A] font-semibold"
                          : "bg-transparent text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-[#161616]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-10 mb-16">
                <motion.button
                  whileTap={{ scale: 0.985 }}
                  onClick={handleAddToBag}
                  className="w-full py-5 bg-[#F5F5F5] text-[#0A0A0A] text-[11px] tracking-[0.25em] uppercase font-[family-name:var(--font-body)] font-medium hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-colors duration-300 cursor-pointer shadow-lg"
                >
                  ADD TO BAG
                </motion.button>

                <button
                  className="w-full py-5 border border-[#222222] bg-transparent text-[#F5F5F5] text-[11px] tracking-[0.25em] uppercase font-[family-name:var(--font-body)] font-light hover:border-[#8A8A8A] transition-all duration-300 cursor-pointer"
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
                    className="w-full py-6 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-[11px] tracking-[0.2em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)]">
                      DESCRIPTION
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-sm">
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
                        className="overflow-hidden pb-6"
                      >
                        <p className="text-[13px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light leading-[1.85]">
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
                    className="w-full py-6 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-[11px] tracking-[0.2em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)]">
                      MATERIAL & COMPOSITION
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-sm">
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
                        className="overflow-hidden pb-6 space-y-2"
                      >
                        <p className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light">
                          {product.material}
                        </p>
                        <p className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light">
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
                    className="w-full py-6 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-[11px] tracking-[0.2em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)]">
                      DETAILS & SPECIFICATIONS
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-sm">
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
                        className="overflow-hidden pb-6"
                      >
                        <ul className="space-y-3">
                          {product.details.map((detail, i) => (
                            <li
                              key={i}
                              className="text-[12px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light flex items-start gap-2"
                            >
                              <span className="text-[#8A8A8A]/40 mt-0.5">—</span>
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
                    className="w-full py-6 flex items-center justify-between text-left cursor-pointer group"
                  >
                    <span className="text-[11px] tracking-[0.2em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)]">
                      SHIPPING & RETURNS
                    </span>
                    <span className="text-[#8A8A8A] group-hover:text-[#F5F5F5] text-sm">
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
