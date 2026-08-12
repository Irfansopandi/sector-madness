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
      <section style={{ paddingTop: "130px", paddingBottom: "12px" }} className="relative border-b border-[#222222]/70">
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
              Sector Madness. We Trust Quality.
            </p>
          </motion.div>

          {/* Panoramic Editorial Banner - Full Unobstructed Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative w-full full-bleed-brand aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] lg:min-h-[480px] bg-[#141414] overflow-hidden border-y lg:border border-[#222222]"
          >
            <Image
              src="/images/story/stories.webp"
              alt="SECTOR MADNESS Hero Banner"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 01: INDIVIDUALITY & CREATIVITY ── */}
      <section className="pt-12 md:pt-20 pb-24 md:pb-36 border-b border-[#222222]/70">
        <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* Left Column: Core Editorial Statement */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              style={{ paddingTop: "36px" }}
              className="lg:col-span-6 space-y-8"
            >
              <span className="inline-block h-[2px] w-16 bg-[#B6A47E] mb-2" />
              
              <p
                style={{
                  fontSize: "clamp(1.2rem, 2.8vw, 2.5rem)",
                  lineHeight: "1.35",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
                className="text-[#FFFFFF] mb-6 tracking-tight"
              >
                Sector Madness was born from experience, memories, and a passion for creating something meaningful.
              </p>
              
              <div className="space-y-6 lg:space-y-8 max-w-2xl text-justify md:text-left">
                <p className="text-[15px] lg:text-[17.5px] leading-[1.7] lg:leading-[1.85] font-light text-[#A3A3A3]">
                  The name Sector was inspired by Sector Tiga, a place that holds a special meaning in the founder&apos;s journey. Madness represents the courage to think differently, explore without limits, and create with purpose.
                </p>

                <p className="text-[15px] lg:text-[17.5px] leading-[1.7] lg:leading-[1.85] font-light text-[#A3A3A3]">
                  We believe quality clothing should never rely solely on a name or a trend. Every product should deliver comfort, durability, and craftsmanship that can be appreciated every day.
                </p>

                <p className="text-[15px] lg:text-[17.5px] leading-[1.7] lg:leading-[1.85] font-light text-[#A3A3A3]">
                  Inspired by streetwear culture and everyday life, each collection is thoughtfully developed with careful attention to materials, construction, and finishing details, creating garments made to stand the test of time.
                </p>

                <div className="py-4 lg:py-5 my-4 border-l-2 border-[#B6A47E] pl-5 lg:pl-6 bg-[#111111]/40">
                  <p className="text-[15px] lg:text-[18.5px] leading-[1.6] lg:leading-[1.65] text-[#F5F5F5] italic text-left">
                    &ldquo;To us, clothing is more than what you wear. It is an expression of character and a part of every story you create.&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Story Description Photograph */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 relative w-full aspect-[4/5] bg-[#141414] overflow-hidden border border-[#222222]"
            >
              <Image
                src="/images/story/deskripsi.webp"
                alt="SECTOR MADNESS Story"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 02: VISI & MISI ── */}
      <section className="py-24 md:py-32 bg-[#060606] relative border-b border-[#222222]/70">
        <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* Left Column: Vision & Mission Model Photograph */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 order-2 lg:order-1 relative w-full aspect-[4/5] bg-[#111111] overflow-hidden border border-[#262626]"
            >
              <Image
                src="/images/story/vision-mission.webp"
                alt="SECTOR MADNESS Vision & Mission"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </motion.div>

            {/* Right Column: Vision & Mission Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-6 order-1 lg:order-2"
            >
              {/* TITLE HEADER */}
              <div style={{ paddingTop: "24px", marginBottom: "16px" }} className="space-y-3">
                <span className="text-[11.5px] font-semibold tracking-[0.25em] text-[#B6A47E] uppercase block">
                  PURPOSE & DIRECTION
                </span>

                <h2
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
                    lineHeight: "1.1",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    fontFamily: "'Inter', -apple-system, sans-serif",
                  }}
                  className="text-[#FFFFFF] uppercase tracking-tight"
                >
                  VISION &amp; MISSION
                </h2>
              </div>
              
              {/* VISION BLOCK */}
              <div
                style={{
                  borderTop: "1px solid #222222",
                  paddingTop: "18px",
                  paddingBottom: "16px",
                }}
              >
                <div style={{ marginBottom: "16px" }} className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-[#B6A47E]" />
                  <span className="text-[12px] font-bold tracking-[0.25em] text-[#B6A47E] uppercase">
                    OUR VISION
                  </span>
                </div>
                <p
                  style={{ fontSize: "16.5px", lineHeight: "1.8", fontWeight: 300 }}
                  className="text-[#F0F0F0] pl-1"
                >
                  To become a leading local streetwear brand recognized for quality, comfort, and distinctive characterful design.
                </p>
              </div>

              {/* MISSION BLOCK */}
              <div
                style={{
                  borderTop: "1px solid #222222",
                  paddingTop: "24px",
                }}
              >
                <div style={{ marginBottom: "16px" }} className="flex items-center gap-3">
                  <span className="h-[2px] w-8 bg-[#B6A47E]" />
                  <span className="text-[12px] font-bold tracking-[0.25em] text-[#B6A47E] uppercase">
                    OUR MISSION
                  </span>
                </div>
                
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <span className="text-[12px] font-mono font-bold text-[#B6A47E] pt-1">01</span>
                    <span style={{ fontSize: "15.5px", lineHeight: "1.75", fontWeight: 300 }} className="text-[#A3A3A3]">
                      Deliver high-quality products at a fair, proportional value.
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-[12px] font-mono font-bold text-[#B6A47E] pt-1">02</span>
                    <span style={{ fontSize: "15.5px", lineHeight: "1.75", fontWeight: 300 }} className="text-[#A3A3A3]">
                      Create simple, functional, and versatile designs for diverse daily activities.
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-[12px] font-mono font-bold text-[#B6A47E] pt-1">03</span>
                    <span style={{ fontSize: "15.5px", lineHeight: "1.75", fontWeight: 300 }} className="text-[#A3A3A3]">
                      Maintain rigorous quality control across every stage, from material selection to production.
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-[12px] font-mono font-bold text-[#B6A47E] pt-1">04</span>
                    <span style={{ fontSize: "15.5px", lineHeight: "1.75", fontWeight: 300 }} className="text-[#A3A3A3]">
                      Build lasting customer trust through consistent product quality and reliable service.
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 03: BRAND VALUES & UNIQUENESS ── */}
      <section className="py-12 md:py-20 bg-[#0A0A0A] relative border-b border-[#222222]/70">
        <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* Left Column: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 order-1"
            >
              {/* TITLE HEADER */}
              <div style={{ paddingTop: "24px", marginBottom: "16px" }} className="space-y-3">
                <span className="text-[11.5px] font-semibold tracking-[0.25em] text-[#B6A47E] uppercase block">
                  IDENTITY &amp; CHARACTER
                </span>

                <h2
                  style={{
                    fontSize: "clamp(2rem, 3.8vw, 3.2rem)",
                    lineHeight: "1.15",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    fontFamily: "'Inter', -apple-system, sans-serif",
                  }}
                  className="text-[#FFFFFF] uppercase tracking-tight"
                >
                  BRAND VALUES &amp; UNIQUENESS
                </h2>
              </div>

              {/* CONTENT BODY */}
              <div
                style={{
                  borderTop: "1px solid #222222",
                  paddingTop: "18px",
                }}
                className="space-y-6"
              >
                <p
                  style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)", lineHeight: "1.45", fontWeight: 500 }}
                  className="text-[#FFFFFF] tracking-tight"
                >
                  Sector Madness was born from the core principle: &ldquo;We Trust Quality.&rdquo;
                </p>

                <p
                  style={{ fontSize: "16.5px", lineHeight: "1.85", fontWeight: 300 }}
                  className="text-[#A3A3A3]"
                >
                  We believe that exceptional products must offer value that is fully proportional to their quality.
                </p>

                <p
                  style={{ fontSize: "16.5px", lineHeight: "1.85", fontWeight: 300 }}
                  className="text-[#A3A3A3]"
                >
                  Every collection is thoughtfully designed with an uncompromised focus on comfort, enduring quality, and versatile aesthetic suited for diverse daily activities.
                </p>
              </div>
            </motion.div>

            {/* Right Column: Campaign Photograph (Image on the Right) */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 order-2 relative w-full aspect-[4/5] bg-[#141414] overflow-hidden border border-[#222222]"
            >
              <Image
                src="/images/story/deskrip.webp"
                alt="Sector Madness Brand Values & Uniqueness"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
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
                fontSize: "clamp(1.2rem, 3.6vw, 3.2rem)",
                lineHeight: "1.4",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className="text-[#FFFFFF] tracking-tight px-2 md:px-0 md:font-extrabold md:leading-[1.3]"
            >
              &ldquo;Because quality is not just a standard, it is our commitment. Sector Madness. Built from Experience. Made for Every Story.&rdquo;
            </p>

            <div className="w-20 h-[1px] bg-[#B6A47E]/60 mx-auto" />

            <p className="text-[12px] tracking-[0.25em] uppercase text-[#8A8A8A] font-medium">
              SECTOR MADNESS
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
