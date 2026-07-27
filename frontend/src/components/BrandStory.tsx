"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";

export default function BrandStory() {
  return (
    <section id="story" className="relative w-full bg-[#0A0A0A] border-b border-[#222222]/70 text-[#F5F5F5]">
      {/* Full-width container with symmetrical padding matching Featured Products & Footer */}
      <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="w-full max-w-[1720px] mx-auto py-24 md:py-36">
        
        {/* Section Header */}
        <div className="pb-16 md:pb-24 border-b border-[#222222]/40 mb-16 md:mb-24">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: "11px", letterSpacing: "0.25em", fontWeight: 600 }} className="uppercase text-[#8A8A8A]">
                PHILOSOPHY & VISION
              </span>
              <span className="hidden sm:inline-block text-[11px] tracking-[0.2em] uppercase text-[#B6A47E] font-medium">
                SECTOR MADNESS
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <h2
              style={{
                fontSize: "clamp(2.8rem, 6.5vw, 6rem)",
                lineHeight: "0.95",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className="uppercase text-[#FFFFFF] mb-4 tracking-tighter"
            >
              THE BRAND
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.25}>
            <p
              style={{ fontSize: "clamp(1.2rem, 2.2vw, 2rem)", letterSpacing: "0.02em", fontWeight: 300 }}
              className="text-[#B6A47E] leading-relaxed max-w-2xl"
            >
              Beyond Trends. Beyond Identity.
            </p>
          </AnimatedSection>
        </div>

        {/* Editorial Magazine Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Pure Cinematic Imagery Container without artificial badges */}
          <AnimatedSection
            className="lg:col-span-6 relative w-full aspect-[4/5] overflow-hidden border border-[#222222] bg-[#141414]"
            delay={0.1}
          >
            <Image
              src="/images/story/brand-story.png"
              alt="SECTOR MADNESS Atelier"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
          </AnimatedSection>

          {/* Impactful Editorial Copy */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-12 py-2">
            <AnimatedSection delay={0.2}>
              <div className="space-y-8 max-w-xl">
                <p
                  style={{ fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)", lineHeight: "1.45", fontWeight: 500 }}
                  className="text-[#FFFFFF] tracking-tight"
                >
                  SECTOR MADNESS was created for those who refuse to be defined by trends.
                </p>

                <p style={{ fontSize: "16px", lineHeight: "1.85", fontWeight: 300 }} className="text-[#999999]">
                  Every collection explores a different sector of creativity, individuality, and movement—transforming clothing into a statement of identity rather than a seasonal product.
                </p>

                <p style={{ fontSize: "16px", lineHeight: "1.85", fontWeight: 300 }} className="text-[#999999]">
                  We believe great garments are built through thoughtful design, quality materials, and purposeful construction. Every piece is designed to become part of a larger story rather than simply another product.
                </p>

                <div className="py-6 my-4 border-l-2 border-[#B6A47E] pl-6 bg-[#111111]/30">
                  <p
                    style={{ fontSize: "18px", lineHeight: "1.5", fontWeight: 600 }}
                    className="text-[#F5F5F5]"
                  >
                    &ldquo;This is more than fashion. It is a movement shaped by expression, confidence, and individuality.&rdquo;
                  </p>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.3} className="pt-8 border-t border-[#222222]/70">
              <Link
                href="/brand"
                style={{ fontSize: "12px", letterSpacing: "0.25em", fontWeight: 700, padding: "18px 40px" }}
                className="inline-block bg-[#FFFFFF] text-[#0A0A0A] uppercase hover:bg-[#B6A47E] hover:text-[#FFFFFF] transition-all duration-300 rounded-none cursor-pointer"
              >
                EXPLORE FULL BRAND PHILOSOPHY →
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
