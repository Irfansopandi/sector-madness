"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Categories matching exact user specification
const categories = [
  "ALL",
  "Collection Stories",
  "Brand Philosophy",
  "Materials & Craftsmanship",
  "Campaign",
  "Archive",
];

// Sample Editorial Articles matching exact user specification + 1 Archive vault item
const articles = [
  {
    id: "origin-sector-001",
    title: "The Origin of Sector 001",
    category: "Collection Stories",
    issue: "VOL. 01",
    date: "MILAN ATELIER",
    summary: "A closer look at the inspiration behind our first collection and the ideas that shaped every silhouette.",
    image: "/images/campaign/campaign-1.png",
    featured: true,
    content: [
      "In conception, Sector 001 was never intended to participate in the traditional rotating runway calendar. It emerged from an observation of modern architectural engineering and everyday urban durability—a synthesis where utility is not compromised by aesthetic trim, but rather intensified by it.",
      "Our design team began with a simple premise: what does an individual need when moving through city environments and shifting daily terrain? The answer did not lie in synthetic seasonal colors or visible branding overlays. Instead, we turned to structured silhouettes that stand alone as confident, functional expression.",
      "Every seam and garment construction choice in Sector 001 was carefully refined to withstand long-term wear while maintaining an elegant visual shape. This collection marks a dedicated step toward building an enduring personal wardrobe."
    ],
    quote: "We believe clothing should offer genuine confidence and timeless structure rather than transient seasonal appeal."
  },
  {
    id: "designed-beyond-trends",
    title: "Designed Beyond Trends",
    category: "Brand Philosophy",
    issue: "VOL. 02",
    date: "EDITORIAL STUDY",
    summary: "Why timeless design creates stronger identity than seasonal fashion.",
    image: "/images/story/brand-story.png",
    featured: false,
    content: [
      "The modern commercial fashion cycle profits from intentional obsolescence. By designating garments as valid for merely a single season, the industry often dilutes the real connection between individuals and their personal wardrobe.",
      "At Sector Madness, our design philosophy operates on timeless consistency: Designed Beyond Trends. True quality is found in permanence—pieces created with such clear aesthetic proportions and reliable materials that they become more valued with time.",
      "When design is liberated from traditional seasonal calendars, clothing gains authentic purpose. A beautifully cut outerwear jacket or a heavyweight sweatshirt ceases to be tied to a specific year; it becomes a reliable expression of personal confidence."
    ],
    quote: "True luxury is found in permanence—garments designed to survive shifting trends and mature with the wearer."
  },
  {
    id: "inside-the-fabric",
    title: "Inside the Fabric",
    category: "Materials & Craftsmanship",
    issue: "VOL. 03",
    date: "TEXTILE FOCUS",
    summary: "Exploring heavyweight cotton, garment construction, and the importance of premium materials.",
    image: "/images/hero/hero-1.png",
    featured: false,
    content: [
      "Before an initial silhouette takes shape, dozens of material fabrics undergo evaluation for density, drape, and texture. We prioritize high-weight cotton weaves ranging from 450 to 550 GSM, selected specifically for their rich structural feel and resilience.",
      "Why prioritize such density? Because fabric substance dictates how a garment drapes across the body. Where lightweight conventional fabrics slump over time, well-crafted heavyweight materials preserve their intended contour, providing comfort and enduring distinction.",
      "Internal garment construction receives the exact same attention as exterior appearance. We focus on clean internal finishing, precise stitching, and comfortable pattern articulation across every point of the garment."
    ],
    quote: "Where lightweight fabrics lose structure, premium heavyweight cotton preserves its intended contour and elegant drape."
  },
  {
    id: "campaign-001-bts",
    title: "Campaign 001",
    category: "Campaign",
    issue: "VOL. 04",
    date: "CREATIVE DIRECTION",
    summary: "Behind the scenes of our first editorial campaign and creative direction.",
    image: "/images/hero/hero-2.png",
    featured: false,
    content: [
      "Shot against authentic structural environments and calm city backdrops, Campaign 001 was conceived to illustrate the natural movement and confidence of our silhouettes in everyday light.",
      "Rather than relying on rigid theatrical styling, the photography emphasizes natural posture, shadow interplay, and tactile fabric textures. The imagery captures how sunlight and atmosphere interact with clean dark textiles and precise hardware.",
      "This visual diary shares an honest perspective on our creative vision—an uncompromising focus on atmosphere, simplicity, and authentic presence."
    ],
    quote: "An honest approach to photography focusing on atmosphere, natural movement, and authentic visual character."
  },
  {
    id: "archive-protocol-outerwear",
    title: "Outerwear Architecture",
    category: "Archive",
    issue: "ARCHIVE 01",
    date: "TECHNICAL FOCUS",
    summary: "A study of our foundational outerwear forms, weather-resistant materials, and ergonomic structural details.",
    image: "/images/products/product-2.png",
    featured: false,
    content: [
      "The Archive serves as an ongoing record of our design evolution—documenting our exploration of outerwear silhouettes, reliable hardware, and functional everyday refinements.",
      "In our outerwear studies, attention naturally centers on balance and protection: tailoring clean hood structures, accommodating effortless layering, and positioning pocket storage where it naturally aligns with hand movement.",
      "These archival records reflect our continuous commitment to refining high-quality modern sportswear with simplicity and strength."
    ],
    quote: "Our ongoing dedication to refining functional outerwear with simplicity, clear proportion, and strength."
  },
];

export default function JournalPage() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [selectedArticle, setSelectedArticle] = useState<typeof articles[0] | null>(null);

  const filteredArticles = activeCategory === "ALL" 
    ? articles 
    : articles.filter((a) => a.category === activeCategory);

  const featuredArticle = filteredArticles.find((a) => a.featured) || filteredArticles[0];
  const gridArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id);

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#FFFFFF] selection:text-[#0A0A0A] overflow-x-hidden"
    >
      <Navbar mode="dark" activeLink="JOURNAL" />

      {/* ── JOURNAL PROLOGUE & PUBLICATION HEADER ── */}
      <section style={{ paddingTop: "200px", paddingBottom: "32px" }} className="relative border-b border-[#222222]/70">
        <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="max-w-[1780px] mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 md:mb-16"
          >
            <div>
              <span style={{ fontSize: "11px", letterSpacing: "0.25em", fontWeight: 600 }} className="uppercase text-[#8A8A8A] block mb-4">
                INDEPENDENT FASHION PUBLICATION
              </span>
              
              <h1
                style={{
                  fontSize: "clamp(3.5rem, 8.5vw, 8rem)",
                  lineHeight: "0.95",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
                className="uppercase text-[#FFFFFF] tracking-tighter"
              >
                JOURNAL
              </h1>
            </div>

            <div className="max-w-md pb-2">
              <p style={{ fontSize: "15px", lineHeight: "1.75", fontWeight: 300 }} className="text-[#999999]">
                Documenting the creative world of <strong className="text-white font-normal">SECTOR MADNESS</strong> through stories, campaigns, materials, craftsmanship, and brand philosophy.
              </p>
            </div>
          </motion.div>

          {/* ── EDITORIAL CATEGORY NAVIGATOR ── */}
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-4 border-t border-[#222222]/80">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{ fontSize: "12px", letterSpacing: "0.15em", padding: "8px 0" }}
                  className={`uppercase transition-all duration-300 whitespace-nowrap cursor-pointer relative ${
                    isActive
                      ? "text-[#FFFFFF] font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#FFFFFF]"
                      : "text-[#777777] hover:text-[#FFFFFF]"
                  }`}
                >
                  {cat} {cat === "ALL" ? `(${articles.length})` : ""}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── EDITORIAL MAGAZINE ARCHIVE GRID ── */}
      <section className="pt-10 md:pt-14 pb-16 md:pb-28">
        <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="max-w-[1780px] mx-auto">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
            >
              {/* 1. FEATURED ARTICLE SPREAD */}
              {featuredArticle && (
                <div
                  onClick={() => setSelectedArticle(featuredArticle)}
                  style={{ marginBottom: "60px" }}
                  className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch pb-16 border-b border-[#222222]/70"
                >
                  {/* Raw Photographic Canvas - ZERO Floating Badges / ZERO AI Slop over images */}
                  <div className="lg:col-span-8 relative w-full aspect-[16/10] bg-[#161616] overflow-hidden border border-[#222222]">
                    <Image
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 70vw"
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-103"
                    />
                  </div>

                  {/* Editorial Column Copy with clean typographic Category labeling */}
                  <div className="lg:col-span-4 flex flex-col justify-between h-full py-2 space-y-8">
                    <div>
                      <div className="flex items-center gap-3 text-[11.5px] text-[#A0A0A0] uppercase mb-4 tracking-[0.2em] font-medium">
                        <span className="text-[#B6A47E] font-semibold">{featuredArticle.category}</span>
                        <span>•</span>
                        <span>{featuredArticle.issue}</span>
                      </div>

                      <h2
                        style={{
                          fontSize: "clamp(2rem, 3.5vw, 3.5rem)",
                          lineHeight: "1.08",
                          fontWeight: 800,
                          letterSpacing: "-0.03em",
                          fontFamily: "'Inter', -apple-system, sans-serif",
                        }}
                        className="text-[#FFFFFF] group-hover:opacity-85 transition-opacity duration-300 mb-6"
                      >
                        {featuredArticle.title}
                      </h2>

                      <p style={{ fontSize: "16px", lineHeight: "1.8", fontWeight: 300 }} className="text-[#999999]">
                        {featuredArticle.summary}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-[#222222]/70">
                      <span style={{ fontSize: "12px", letterSpacing: "0.2em" }} className="uppercase font-medium text-[#FFFFFF] group-hover:translate-x-2 transition-transform duration-300 inline-block">
                        READ ARTICLE →
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SECONDARY EDITORIAL GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-x-12 md:gap-y-12">
                {gridArticles.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    onClick={() => setSelectedArticle(item)}
                    className={`group cursor-pointer flex flex-col justify-start ${
                      idx === 0 && gridArticles.length % 3 !== 0 ? "md:col-span-2 lg:col-span-2" : ""
                    }`}
                  >
                    <div>
                      {/* Clean Unfettered Photograph */}
                      <div className={`relative w-full ${idx === 0 && gridArticles.length % 3 !== 0 ? "aspect-[16/9]" : "aspect-[4/3]"} bg-[#141414] overflow-hidden mb-8 border border-[#222222]`}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 40vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>

                      {/* Typographic Metadata below photo */}
                      <div className="flex items-center gap-3 text-[11.5px] text-[#A0A0A0] uppercase mb-4 tracking-[0.18em] font-medium">
                        <span className="text-[#B6A47E] font-semibold">{item.category}</span>
                        <span>•</span>
                        <span>{item.issue}</span>
                      </div>

                      <h3
                        style={{
                          fontSize: "clamp(1.4rem, 2vw, 2.2rem)",
                          lineHeight: "1.2",
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                        }}
                        className="text-[#FFFFFF] group-hover:opacity-85 transition-opacity duration-300 mb-5"
                      >
                        {item.title}
                      </h3>

                      <p style={{ fontSize: "14.5px", lineHeight: "1.75", fontWeight: 300 }} className="text-[#888888] mb-8 line-clamp-3">
                        {item.summary}
                      </p>
                    </div>

                    <div className="border-t border-[#222222]/70 pt-4">
                      <span style={{ fontSize: "11.5px", letterSpacing: "0.2em" }} className="uppercase font-medium text-[#FFFFFF] group-hover:translate-x-1.5 transition-transform duration-200 inline-block">
                        READ ARTICLE →
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {filteredArticles.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-lg text-[#666666] tracking-widest uppercase">No articles found in this section.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── IMMERSIVE ARTICLE PUBLICATION READER ── */}
      <AnimatePresence>
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => setSelectedArticle(null)}
            className="fixed inset-0 z-50 bg-[#000000]/95 backdrop-blur-md overflow-y-auto p-4 sm:p-8 md:p-12 sm:flex items-center justify-center cursor-zoom-out"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[960px] bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F5] my-auto cursor-auto shadow-2xl overflow-hidden"
            >
              {/* Top Navigation Bar */}
              <div className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-10 py-5 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222222]">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#A0A0A0] font-medium">
                  SECTOR MADNESS JOURNAL — {selectedArticle.category}
                </span>
                <button
                  onClick={() => setSelectedArticle(null)}
                  style={{ fontSize: "11px", letterSpacing: "0.2em" }}
                  className="uppercase font-bold text-white hover:opacity-60 transition-opacity cursor-pointer px-3 py-1"
                >
                  CLOSE [X]
                </button>
              </div>

              {/* Unobstructed Cover Photograph */}
              <div className="relative w-full aspect-[21/10] bg-[#161616]">
                <Image
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </div>

              {/* Editorial Article Body */}
              <div style={{ paddingLeft: "clamp(32px, 5vw, 64px)", paddingRight: "clamp(32px, 5vw, 64px)" }} className="py-10 md:py-16 space-y-10">
                
                <div className="space-y-4 border-b border-[#222222] pb-8">
                  <div className="flex items-center gap-3 text-[12px] text-[#B6A47E] uppercase tracking-[0.2em] font-semibold">
                    <span>{selectedArticle.category}</span>
                    <span>•</span>
                    <span>{selectedArticle.date}</span>
                  </div>
                  
                  <h2
                    style={{
                      fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
                      lineHeight: "1.05",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      fontFamily: "'Inter', -apple-system, sans-serif",
                    }}
                    className="text-[#FFFFFF]"
                  >
                    {selectedArticle.title}
                  </h2>
                </div>

                {/* Body Paragraphs */}
                <div className="space-y-6 sm:space-y-8 text-[16px] md:text-[17px] text-[#C2C2C2] leading-[1.9] font-light text-justify md:text-left">
                  {selectedArticle.content.map((paragraph, idx) => (
                    <p key={idx}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Highlight Quote Box */}
                {selectedArticle.quote && (
                  <div className="my-10 p-8 border-l-4 border-[#B6A47E] bg-[#141414]/60">
                    <p style={{ fontSize: "20px", lineHeight: "1.5", fontWeight: 600 }} className="text-[#FFFFFF] italic">
                      &ldquo;{selectedArticle.quote}&rdquo;
                    </p>
                  </div>
                )}

                {/* Bottom Footer Action */}
                <div className="pt-8 border-t border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#777777]">
                    SECTOR MADNESS EDITORIAL ARCHIVES
                  </span>
                  <Link
                    href="/shop"
                    onClick={() => setSelectedArticle(null)}
                    style={{ fontSize: "11.5px", letterSpacing: "0.22em", padding: "14px 28px" }}
                    className="bg-[#FFFFFF] text-[#0A0A0A] uppercase font-bold hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-colors rounded-none text-center sm:text-right"
                  >
                    EXPLORE THE COLLECTION →
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </main>
  );
}
