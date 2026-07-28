"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BrandPage() {
  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#B6A47E] selection:text-[#0A0A0A] overflow-x-hidden"
    >
      <Navbar mode="dark" activeLink="STORIES" />

      {/* ── HERO PROLOGUE STAGE (DARK CINEMATIC ATMOSPHERE) ── */}
      <section style={{ paddingTop: "200px", paddingBottom: "100px" }} className="relative border-b border-[#222222]/70">
        <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="max-w-[1720px] mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start gap-4 mb-16 md:mb-24"
          >
            <span style={{ fontSize: "11px", letterSpacing: "0.25em", fontWeight: 600 }} className="uppercase text-[#8A8A8A] block">
              PHILOSOPHY & VISION
            </span>
            
            {/* Suggested Headline */}
            <h1
              style={{
                fontSize: "clamp(3.5rem, 9.5vw, 9rem)",
                lineHeight: "0.95",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className="uppercase text-[#FFFFFF] tracking-tighter"
            >
              STORIES
            </h1>

            {/* Suggested Subheading */}
            <p
              style={{ fontSize: "clamp(1.2rem, 2.5vw, 2.4rem)", letterSpacing: "0.02em", fontWeight: 300 }}
              className="text-[#B6A47E] mt-2 max-w-3xl leading-snug"
            >
              Beyond Trends. Beyond Identity.
            </p>
          </motion.div>

          {/* Panoramic Editorial Banner - Pure unobstructed campaign photography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative w-full aspect-[21/9] min-h-[480px] bg-[#161616] overflow-hidden border border-[#222222]"
          >
            <Image
              src="/images/hero/hero-2.png"
              alt="SECTOR MADNESS Campaign"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
            />
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 01: INDIVIDUALITY & CREATIVITY ── */}
      <section className="py-24 md:py-36 border-b border-[#222222]/70">
        <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* Left Column: Core Editorial Statement */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 space-y-8"
            >
              <span className="inline-block h-[2px] w-16 bg-[#B6A47E] mb-2" />
              
              <p
                style={{
                  fontSize: "clamp(1.4rem, 2.8vw, 2.5rem)",
                  lineHeight: "1.4",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                }}
                className="text-[#FFFFFF]"
              >
                SECTOR MADNESS was created for those who refuse to be defined by trends.
              </p>
              
              <p
                style={{ fontSize: "16.5px", lineHeight: "1.9", fontWeight: 300 }}
                className="text-[#999999] max-w-2xl text-justify md:text-left"
              >
                Every collection explores a different sector of creativity, individuality, and movement—transforming clothing into a statement of identity rather than a seasonal product. Our focus remains centered on lasting presence, allowing each silhouette to stand independently as a confident, permanent addition to the wardrobe.
              </p>
            </motion.div>

            {/* Right Column: Unobstructed Editorial Photograph */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 relative w-full aspect-[3/4] bg-[#141414] overflow-hidden border border-[#222222]"
            >
              <Image
                src="/images/campaign/campaign-1.png"
                alt="SECTOR MADNESS Silhouette"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-top"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 02: THOUGHTFUL DESIGN & CONSTRUCTION ── */}
      <section className="py-24 md:py-40 bg-[#060606] relative border-b border-[#222222]/70">
        <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* Left Column: Clean Atelier Photograph */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 order-2 lg:order-1 relative w-full aspect-[16/11] bg-[#111111] overflow-hidden border border-[#262626]"
            >
              <Image
                src="/images/story/brand-story.png"
                alt="SECTOR MADNESS Materials and Craftsmanship"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>

            {/* Right Column: Editorial Copy */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-6 order-1 lg:order-2 space-y-8"
            >
              <span className="text-[11.5px] font-semibold tracking-[0.22em] text-[#B6A47E] uppercase block">
                CRAFTSMANSHIP & MATERIALS
              </span>

              <h2
                style={{
                  fontSize: "clamp(1.6rem, 3.2vw, 2.8rem)",
                  lineHeight: "1.25",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
                className="text-[#FFFFFF]"
              >
                We believe great garments are built through thoughtful design, quality materials, and purposeful construction.
              </h2>
              
              <p style={{ fontSize: "16.5px", lineHeight: "1.9", fontWeight: 300 }} className="text-[#999999]">
                Every piece is designed to become part of a larger story rather than simply another product. We emphasize enduring structural textiles, careful fit geometry, and refined stitching—ensuring that every garment retains its physical integrity and aesthetic clarity over extended wear.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 03: THE MOVEMENT MANIFESTO ── */}
      <section className="py-32 md:py-48 relative overflow-hidden bg-[#0A0A0A]">
        <div className="max-w-[1100px] mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="space-y-12"
          >
            <p
              style={{
                fontSize: "clamp(2rem, 4.5vw, 4.2rem)",
                lineHeight: "1.2",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className="text-[#FFFFFF] tracking-tight"
            >
              &ldquo;This is more than fashion. It is a movement shaped by expression, confidence, and individuality.&rdquo;
            </p>

            <div className="w-20 h-[1px] bg-[#B6A47E]/60 mx-auto" />

            <p className="text-[12px] tracking-[0.25em] uppercase text-[#8A8A8A] font-medium">
              SECTOR MADNESS STUDIO
            </p>

            <div className="pt-10">
              <Link
                href="/shop"
                style={{ fontSize: "12px", letterSpacing: "0.25em", padding: "18px 46px" }}
                className="inline-block bg-[#FFFFFF] text-[#0A0A0A] font-bold uppercase hover:bg-[#B6A47E] hover:text-[#FFFFFF] transition-all duration-300 rounded-none tracking-widest cursor-pointer"
              >
                DISCOVER THE COLLECTION →
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Subtle radial glow in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B6A47E]/5 rounded-full blur-[120px] pointer-events-none" />
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
