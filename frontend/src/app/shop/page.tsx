"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState(categoryParam || "ALL");
  const [gridCols, setGridCols] = useState<3 | 4 | 5 | 6>(4);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("SELECTED");

  // Sync URL query param with state
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  // Extract unique categories from product names/collections
  const categories = [
    "ALL",
    "ALL PRODUCTS",
    "HOODIE",
    "JACKETS",
    "BOMBER",
    "T-SHIRT",
    "POLO SHIRT",
    "CARGO",
    "TROUSERS",
    "SWEATS",
    "KNIT",
    "VEST",
    "ANORAK",
  ];

  // Filter products logic
  const filteredProducts = products.filter((p) => {
    if (activeCategory === "ALL" || activeCategory === "ALL PRODUCTS") return true;
    return p.name.toLowerCase().includes(activeCategory.toLowerCase());
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "PRICE LOW TO HIGH") return a.price - b.price;
    if (sortBy === "PRICE HIGH TO LOW") return b.price - a.price;
    if (sortBy === "NEW IN") return Number(b.id) - Number(a.id);
    return 0; // SELECTED = default order
  });

  return (
    <div className="bg-[#FFFFFF] text-[#0A0A0A] min-h-screen flex flex-col font-[family-name:var(--font-body)]">
      {/* Light Navbar Mode */}
      <Navbar mode="light" activeLink="SHOP" />

      {/* Main Content Area */}
      <main className="flex-1" style={{ paddingTop: "120px", paddingBottom: "160px" }}>
        {/* Main Aligned Container matching Navbar & Footer max-w-[1480px] & 60px padding */}
        <div
          style={{ paddingLeft: "60px", paddingRight: "60px" }}
          className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20 w-full"
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-4">
            <Link
              href="/"
              className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#777777] hover:text-[#0A0A0A] transition-colors"
            >
              HOME
            </Link>
            <span className="text-[10px] text-[#777777]">&gt;</span>
            {activeCategory === "ALL" || activeCategory === "ALL PRODUCTS" ? (
              <span className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#0A0A0A] font-medium">
                SHOP
              </span>
            ) : (
              <>
                <Link
                  href="/shop"
                  onClick={(e) => { e.preventDefault(); setActiveCategory("ALL"); }}
                  className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#777777] hover:text-[#0A0A0A] transition-colors cursor-pointer"
                >
                  SHOP
                </Link>
                <span className="text-[10px] text-[#777777]">&gt;</span>
                <span className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#0A0A0A] font-medium">
                  {activeCategory}
                </span>
              </>
            )}
          </nav>

          {/* Page Title */}
          <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold tracking-[0.02em] uppercase text-[#0A0A0A]" style={{ marginBottom: "40px" }}>
            {activeCategory === "ALL" || activeCategory === "ALL PRODUCTS" ? "SHOP" : activeCategory}
          </h1>

          {/* Filter / Controls Bar */}
          <div className="border-t border-[#E5E5E5] py-4 flex items-center justify-between" style={{ marginBottom: "50px" }}>
            {/* Left: Product Count */}
            <span className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#555555] font-medium">
              {sortedProducts.length} PRODUCTS
            </span>

            {/* Right: FILTERS text + Grid View Icons */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => setShowFilters(true)}
                className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#555555] font-medium hover:text-[#0A0A0A] transition-colors cursor-pointer"
              >
                FILTERS
              </button>

              {/* Separator */}
              <span className="w-px h-4 bg-[#D0D0D0]" />

              {/* 3-column grid icon */}
              <button
                onClick={() => setGridCols(3)}
                className={`cursor-pointer transition-opacity ${
                  gridCols === 3 ? "opacity-100" : "opacity-30 hover:opacity-70"
                }`}
                aria-label="3 Column Grid"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="0" width="4" height="16" />
                  <rect x="6" y="0" width="4" height="16" />
                  <rect x="12" y="0" width="4" height="16" />
                </svg>
              </button>

              {/* 4-column grid icon */}
              <button
                onClick={() => setGridCols(4)}
                className={`cursor-pointer transition-opacity ${
                  gridCols === 4 ? "opacity-100" : "opacity-30 hover:opacity-70"
                }`}
                aria-label="4 Column Grid"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="0" width="3" height="7" />
                  <rect x="4.3" y="0" width="3" height="7" />
                  <rect x="8.7" y="0" width="3" height="7" />
                  <rect x="13" y="0" width="3" height="7" />
                  <rect x="0" y="9" width="3" height="7" />
                  <rect x="4.3" y="9" width="3" height="7" />
                  <rect x="8.7" y="9" width="3" height="7" />
                  <rect x="13" y="9" width="3" height="7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div
            className={`grid gap-x-5 gap-y-12 transition-all duration-300 ${
              gridCols === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}
          >
            {sortedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group block cursor-pointer select-none"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#161616] mb-5 select-none">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    draggable={false}
                    className="object-cover select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    quality={85}
                  />

                  {/* Limited label */}
                  {product.limited && (
                    <div className="absolute top-4 left-4">
                      <span className="text-[9px] tracking-[0.2em] uppercase text-[#B6A47E] font-[family-name:var(--font-body)]">
                        Limited Release
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

                  {/* View Product - appears on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#F5F5F5]">
                      View Product →
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block">
                    {product.collectionCode}
                  </span>
                  <h3 className="text-[14px] md:text-[15px] text-[#0A0A0A] font-[family-name:var(--font-body)] font-light tracking-wide">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light">
                    {product.material} · {product.weight}
                  </p>
                  <p className="text-[13px] text-[#0A0A0A] font-[family-name:var(--font-body)] font-light pt-1">
                    Rp {(product.price * 15000).toLocaleString("id-ID")}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-[14px] text-[#777777] uppercase tracking-[0.2em]">
                No products found matching your selection.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Filter & Sort Sidebar Panel */}
      {showFilters && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setShowFilters(false)}
          />

          {/* Slide-in Panel from Right */}
          <div
            className="fixed top-0 right-0 h-full bg-white z-[70] overflow-y-auto animate-slide-in-right"
            style={{ width: "100%", maxWidth: "440px", boxShadow: "-4px 0 30px rgba(0,0,0,0.15)" }}
          >
            {/* Header: FILTER & SORT / CLOSE X */}
            <div
              style={{ padding: "28px 32px", borderBottom: "1px solid #E5E5E5" }}
              className="flex items-center justify-between"
            >
              <h2
                style={{ fontSize: "15px", letterSpacing: "0.15em", fontWeight: 700 }}
                className="uppercase text-[#0A0A0A]"
              >
                FILTER & SORT
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                style={{ fontSize: "11px", letterSpacing: "0.2em", gap: "8px" }}
                className="uppercase text-[#555555] hover:text-[#0A0A0A] transition-colors cursor-pointer flex items-center"
              >
                CLOSE
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="1" y1="1" x2="11" y2="11" />
                  <line x1="11" y1="1" x2="1" y2="11" />
                </svg>
              </button>
            </div>

            {/* Panel Body */}
            <div style={{ padding: "36px 32px" }}>

              {/* ── SORT BY ── */}
              <h3
                style={{ fontSize: "14px", letterSpacing: "0.12em", fontWeight: 700, marginBottom: "20px" }}
                className="uppercase text-[#0A0A0A]"
              >
                SORT BY
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "48px" }}>
                {["SELECTED", "PRICE LOW TO HIGH", "PRICE HIGH TO LOW", "NEW IN"].map((sort) => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    style={{
                      padding: "10px 20px",
                      fontSize: "10px",
                      letterSpacing: "0.15em",
                      fontWeight: 600,
                      borderRadius: "30px",
                      border: "1.5px solid #0A0A0A",
                      backgroundColor: sortBy === sort ? "#0A0A0A" : "#FFFFFF",
                      color: sortBy === sort ? "#FFFFFF" : "#0A0A0A",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    className="uppercase hover:opacity-80"
                  >
                    {sort}
                  </button>
                ))}
              </div>

              {/* ── Divider ── */}
              <div style={{ width: "100%", height: "1px", backgroundColor: "#E5E5E5", marginBottom: "48px" }} />

              {/* ── CATEGORY ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <h3
                  style={{ fontSize: "14px", letterSpacing: "0.12em", fontWeight: 700 }}
                  className="uppercase text-[#0A0A0A]"
                >
                  CATEGORY
                </h3>
                {/* Collapse icon (decorative) */}
                <span style={{ fontSize: "18px", color: "#999", lineHeight: 1 }}>—</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "10px 20px",
                      fontSize: "10px",
                      letterSpacing: "0.15em",
                      fontWeight: 600,
                      borderRadius: "30px",
                      border: "1.5px solid #0A0A0A",
                      backgroundColor: activeCategory === cat ? "#0A0A0A" : "#FFFFFF",
                      color: activeCategory === cat ? "#FFFFFF" : "#0A0A0A",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    className="uppercase hover:opacity-80"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
