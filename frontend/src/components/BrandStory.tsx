"use client";

import Image from "next/image";
import AnimatedSection from "./AnimatedSection";

export default function BrandStory() {
  return (
    <section id="story" className="relative w-full bg-[#0A0A0A]">
      {/* Full-width container with symmetrical 60px padding matching Featured Products & Footer */}
      <div style={{ paddingLeft: "60px", paddingRight: "60px" }} className="w-full">
        {/* Section Header */}
        <div className="pt-16 md:pt-24 lg:pt-28 pb-12 md:pb-16">
          <AnimatedSection>
            <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block mb-4 md:mb-6">
              Our Philosophy
            </span>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.8rem,3.5vw,3.2rem)] text-[#F5F5F5] leading-[1.15] max-w-4xl tracking-[-0.01em]">
              Sector Madness represents the balance between chaos and creation.
            </h2>
          </AnimatedSection>
        </div>

        {/* Editorial Layout - Medium sized image & spacious text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center pb-20 lg:pb-28">
          {/* Medium Sized Image Container */}
          <AnimatedSection
            className="lg:col-span-5 relative w-full max-w-[540px] aspect-[4/3] overflow-hidden"
            delay={0.1}
          >
            <Image
              src="/images/story/brand-story.png"
              alt="SECTOR MADNESS Atelier"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
              quality={85}
            />
          </AnimatedSection>

          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <AnimatedSection delay={0.2}>
              <div className="space-y-8 md:space-y-10 max-w-2xl">
                <p className="text-[14px] md:text-[15px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light leading-[1.85]">
                  Every piece is designed as a statement of identity, movement,
                  and individuality. We don&apos;t follow seasons. We don&apos;t follow
                  trends. Each collection represents a different sector of
                  creativity — a new territory of expression.
                </p>

                <p className="text-[14px] md:text-[15px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light leading-[1.85]">
                  Our garments are built with intention. Premium materials,
                  considered construction, and an unwillingness to compromise.
                  From the weight of the fabric to the fall of the silhouette,
                  nothing is accidental.
                </p>

                <div className="pt-6 md:pt-8">
                  <div className="w-16 h-[1px] bg-[#222222] mb-6 md:mb-8" />
                  <p className="text-[13px] md:text-[14px] text-[#F5F5F5] font-[family-name:var(--font-body)] font-light tracking-wide leading-relaxed">
                    &ldquo;We build for those who understand that clothing is not
                    decoration — it is declaration.&rdquo;
                  </p>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-[#8A8A8A] mt-4">
                    — Sector Madness Studio
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}
