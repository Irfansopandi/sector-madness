"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";

export default function BrandStory() {
  return (
    <section id="story" className="relative w-full bg-[#0A0A0A] border-b border-[#222222]/70 text-[#F5F5F5]">
      {/* Full-width container with symmetrical padding matching Featured Products & Footer */}
      <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="w-full max-w-[1720px] mx-auto pt-3 md:pt-4 pb-24 md:pb-36">
        
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
              STORIES
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.25}>
            <p
              style={{ fontSize: "clamp(1.2rem, 2.2vw, 2rem)", letterSpacing: "0.02em", fontWeight: 300 }}
              className="text-[#B6A47E] leading-relaxed max-w-2xl"
            >
              Sector Madness. We Trust Quality.
            </p>
          </AnimatedSection>
        </div>

        {/* Editorial Magazine Layout - Synchronized with Brand Page Section 01 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Pure Cinematic Imagery Container */}
          <AnimatedSection
            className="lg:col-span-6 relative w-full aspect-[4/5] overflow-hidden border border-[#222222] bg-[#141414]"
            delay={0.1}
          >
            <Image
              src="/images/story/deskripsi.webp"
              alt="SECTOR MADNESS Story"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
          </AnimatedSection>

          {/* Right Column: Impactful Editorial Copy */}
          <div style={{ paddingTop: "36px" }} className="lg:col-span-6 flex flex-col justify-between h-full space-y-10 pb-2">
            <AnimatedSection delay={0.2}>
              <div className="space-y-6 lg:space-y-8 max-w-2xl">
                <p
                  style={{ fontSize: "clamp(1.2rem, 2.8vw, 2.25rem)", lineHeight: "1.35", fontWeight: 500 }}
                  className="text-[#FFFFFF] tracking-tight"
                >
                  Sector Madness was born in <i className="font-serif">Karawang, Indonesia</i>, from experience, memories, and a passion for creating something meaningful.
                </p>

                <p className="text-[15px] lg:text-[18.5px] leading-[1.7] lg:leading-[1.85] font-light text-[#A3A3A3]">
                  The name <i className="font-serif text-[#F5F5F5]">Sector</i> was inspired by Sector Tiga, a place that holds a special meaning in the founder&apos;s journey. <i className="font-serif text-[#F5F5F5]">Madness</i> represents the courage to think differently, explore without limits, and create with purpose.
                </p>

                <p className="text-[15px] lg:text-[18.5px] leading-[1.7] lg:leading-[1.85] font-light text-[#A3A3A3]">
                  We believe quality clothing should never rely solely on a name or a trend. Every product should deliver comfort, durability, and craftsmanship that can be appreciated every day.
                </p>

                <p className="text-[15px] lg:text-[18.5px] leading-[1.7] lg:leading-[1.85] font-light text-[#A3A3A3]">
                  Inspired by streetwear culture and everyday life, each collection is thoughtfully developed with careful attention to materials, construction, and finishing details, creating garments made to stand the test of time.
                </p>

                <div className="py-4 lg:py-5 my-3 border-l-2 border-[#B6A47E] pl-5 lg:pl-6 bg-[#111111]/40">
                  <p className="text-[15px] lg:text-[19.5px] leading-[1.6] lg:leading-[1.65] text-[#F5F5F5] italic">
                    &ldquo;To us, clothing is more than what you wear. It is an expression of character and a part of every story you create.&rdquo;
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3} className="pt-8 border-t border-[#222222]/70">
              <Link
                href="/brand"
                className="inline-flex items-center justify-center bg-[#FFFFFF] text-[#0A0A0A] uppercase hover:bg-[#B6A47E] hover:text-[#FFFFFF] transition-all duration-300 rounded-none cursor-pointer whitespace-nowrap font-bold text-center"
                style={{
                  fontSize: "clamp(9px, 1.2vw, 12px)",
                  letterSpacing: "0.22em",
                  paddingTop: "22px",
                  paddingBottom: "22px",
                  paddingLeft: "clamp(24px, 4vw, 48px)",
                  paddingRight: "clamp(24px, 4vw, 48px)",
                  lineHeight: "1.2",
                }}
              >
                <span>EXPLORE FULL BRAND PHILOSOPHY →</span>
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
