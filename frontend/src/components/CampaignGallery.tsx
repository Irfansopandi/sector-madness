"use client";

import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";

export default function CampaignGallery() {
  return (
    <section id="campaign" className="relative w-full bg-[#0A0A0A]">
      {/* Full-width Divider Line positioned right in the middle (40px top & bottom clearance) */}
      <div
        style={{ marginTop: "20px", marginBottom: "0px" }}
        className="w-full h-[1px] bg-[#222222]"
      />

      {/* Row 1: Left Image (50%) | Right Editorial Banner (50%) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Campaign Image 1 */}
        <AnimatedSection className="relative min-h-[440px] sm:min-h-[520px] lg:min-h-[640px] w-full bg-[#161616] overflow-hidden">
          <Image
            src="/images/campaign/campaign-1.png"
            alt="SPRING / SUMMER 026 - SECTOR MADNESS"
            fill
            className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={90}
          />
        </AnimatedSection>

        {/* Right Side: Editorial Black Banner Content 1 */}
        <div
          style={{ paddingLeft: "80px", paddingRight: "80px", paddingTop: "80px", paddingBottom: "80px" }}
          className="flex flex-col justify-center bg-[#0A0A0A] w-full"
        >
          <AnimatedSection delay={0.1}>
            <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block mb-4">
              SPRING SUMMER 026
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-[28px] md:text-[36px] lg:text-[44px] text-[#F5F5F5] font-bold tracking-[0.02em] uppercase leading-[1.1] mb-6">
              SPRING/SUMMER 026
              <br />
              SALE
            </h2>
            <p className="text-[14px] md:text-[15px] text-[#A0A0A0] font-[family-name:var(--font-body)] font-light leading-relaxed mb-10 max-w-md">
              Discover iconic pieces from the collection, now at 30% off.
            </p>

            <div className="w-full h-[1px] bg-[#222222] mb-10" />

            {/* Authentic Luxury Editorial Text Link with Arrow */}
            <div>
              <Link
                href="/shop?category=SALE"
                className="group/cta inline-flex items-center gap-3 text-[11px] md:text-[12px] tracking-[0.3em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium transition-colors hover:text-[#B6A47E]"
              >
                <span className="relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#F5F5F5] group-hover/cta:after:bg-[#B6A47E] after:transition-colors">
                  EXPLORE SELECTION
                </span>
                <span className="text-[14px] transition-transform duration-300 group-hover/cta:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Row 2: Left Editorial Banner (50%) | Right Image (50%) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Editorial Black Banner Content 2 */}
        <div
          style={{ paddingLeft: "60px", paddingRight: "80px", paddingTop: "80px", paddingBottom: "80px" }}
          className="flex flex-col justify-center bg-[#0A0A0A] w-full order-2 lg:order-1"
        >
          <AnimatedSection delay={0.1}>
            <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block mb-4">
              FALL WINTER 026
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-[28px] md:text-[36px] lg:text-[44px] text-[#F5F5F5] font-bold tracking-[0.02em] uppercase leading-[1.1] mb-6">
              BI-FACE | FW026
            </h2>
            <p className="text-[14px] md:text-[15px] text-[#A0A0A0] font-[family-name:var(--font-body)] font-light leading-relaxed mb-10 max-w-md">
              A reversible jacket combining functional design and dyeing experimentation.
            </p>

            <div className="w-full h-[1px] bg-[#222222] mb-10" />

            {/* Authentic Luxury Editorial Text Link with Arrow */}
            <div>
              <Link
                href="/shop?category=FW026"
                className="group/cta inline-flex items-center gap-3 text-[11px] md:text-[12px] tracking-[0.3em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium transition-colors hover:text-[#B6A47E]"
              >
                <span className="relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#F5F5F5] group-hover/cta:after:bg-[#B6A47E] after:transition-colors">
                  DISCOVER THE FW026
                </span>
                <span className="text-[14px] transition-transform duration-300 group-hover/cta:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </AnimatedSection>
        </div>

        {/* Right Side: Campaign Image 2 */}
        <AnimatedSection className="relative min-h-[440px] sm:min-h-[520px] lg:min-h-[640px] w-full bg-[#161616] overflow-hidden order-1 lg:order-2">
          <Image
            src="/images/campaign/campaign-2.png"
            alt="FALL WINTER 026 - SECTOR MADNESS"
            fill
            className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={90}
          />
        </AnimatedSection>
      </div>

      {/* Row 3: Left Image (50%) | Right Editorial Banner (50%) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Campaign Image 3 */}
        <AnimatedSection className="relative min-h-[440px] sm:min-h-[520px] lg:min-h-[640px] w-full bg-[#161616] overflow-hidden">
          <Image
            src="/images/campaign/campaign-3.png"
            alt="ATELIER ARCHIVE - SECTOR MADNESS"
            fill
            className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={90}
          />
        </AnimatedSection>

        {/* Right Side: Editorial Black Banner Content 3 */}
        <div
          style={{ paddingLeft: "80px", paddingRight: "80px", paddingTop: "80px", paddingBottom: "80px" }}
          className="flex flex-col justify-center bg-[#0A0A0A] w-full"
        >
          <AnimatedSection delay={0.1}>
            <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block mb-4">
              ATELIER ARCHIVE
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-[28px] md:text-[36px] lg:text-[44px] text-[#F5F5F5] font-bold tracking-[0.02em] uppercase leading-[1.1] mb-6">
              ATELIER ARCHIVE
              <br />
              SS026
            </h2>
            <p className="text-[14px] md:text-[15px] text-[#A0A0A0] font-[family-name:var(--font-body)] font-light leading-relaxed mb-10 max-w-md">
              Explorations of tactile density, raw structural silhouettes, and textile longevity.
            </p>

            <div className="w-full h-[1px] bg-[#222222] mb-10" />

            {/* Authentic Luxury Editorial Text Link with Arrow */}
            <div>
              <Link
                href="/shop?category=ATELIER+ARCHIVE"
                className="group/cta inline-flex items-center gap-3 text-[11px] md:text-[12px] tracking-[0.3em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium transition-colors hover:text-[#B6A47E]"
              >
                <span className="relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#F5F5F5] group-hover/cta:after:bg-[#B6A47E] after:transition-colors">
                  VIEW ATELIER ARCHIVE
                </span>
                <span className="text-[14px] transition-transform duration-300 group-hover/cta:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Row 4: Left Editorial Banner (50%) | Right Image (50%) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Editorial Black Banner Content 4 */}
        <div
          style={{ paddingLeft: "60px", paddingRight: "80px", paddingTop: "80px", paddingBottom: "80px" }}
          className="flex flex-col justify-center bg-[#0A0A0A] w-full order-2 lg:order-1"
        >
          <AnimatedSection delay={0.1}>
            <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block mb-4">
              TACTICAL SERIES
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-[28px] md:text-[36px] lg:text-[44px] text-[#F5F5F5] font-bold tracking-[0.02em] uppercase leading-[1.1] mb-6">
              TACTICAL CORE
              <br />
              FW026
            </h2>
            <p className="text-[14px] md:text-[15px] text-[#A0A0A0] font-[family-name:var(--font-body)] font-light leading-relaxed mb-10 max-w-md">
              Weatherproof utility outerwear built with uncompromised urban functionality.
            </p>

            <div className="w-full h-[1px] bg-[#222222] mb-10" />

            {/* Authentic Luxury Editorial Text Link with Arrow */}
            <div>
              <Link
                href="/shop?category=TACTICAL+SERIES"
                className="group/cta inline-flex items-center gap-3 text-[11px] md:text-[12px] tracking-[0.3em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium transition-colors hover:text-[#B6A47E]"
              >
                <span className="relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#F5F5F5] group-hover/cta:after:bg-[#B6A47E] after:transition-colors">
                  SHOP TACTICAL SERIES
                </span>
                <span className="text-[14px] transition-transform duration-300 group-hover/cta:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </AnimatedSection>
        </div>

        {/* Right Side: Campaign Image 4 */}
        <AnimatedSection className="relative min-h-[440px] sm:min-h-[520px] lg:min-h-[640px] w-full bg-[#161616] overflow-hidden order-1 lg:order-2">
          <Image
            src="/images/campaign/campaign-4.png"
            alt="TACTICAL CORE - SECTOR MADNESS"
            fill
            className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={90}
          />
        </AnimatedSection>
      </div>
    </section>
  );
}
