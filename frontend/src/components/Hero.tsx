"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Container from "./Container";

const heroImages = [
  "/images/hero/hero-1.png",
  "/images/hero/hero-2.png",
  "/images/hero/hero-3.png",
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  const transition = useCallback(() => {
    setPrevIndex(currentIndex);
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
  }, [currentIndex]);

  useEffect(() => {
    const timer = setInterval(transition, 6000);
    return () => clearInterval(timer);
  }, [transition]);

  // Clear prevIndex after crossfade completes
  useEffect(() => {
    if (prevIndex !== null) {
      const timeout = setTimeout(() => setPrevIndex(null), 1600);
      return () => clearTimeout(timeout);
    }
  }, [prevIndex]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Images with Ken Burns + Crossfade */}
      {heroImages.map((src, index) => {
        const isActive = index === currentIndex;
        const isPrev = index === prevIndex;
        const isVisible = isActive || isPrev;

        return (
          <div
            key={src}
            className="absolute inset-0 transition-opacity ease-in-out"
            style={{
              opacity: isActive ? 1 : isPrev ? 0 : 0,
              transitionDuration: "1.5s",
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
              visibility: isVisible ? "visible" : "hidden",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                animation: isActive ? "kenBurns 8s ease-out forwards" : "none",
              }}
            >
              <Image
                src={src}
                alt="SECTOR MADNESS Campaign"
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
                quality={90}
              />
            </div>
          </div>
        );
      })}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-[3]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-[3]" />

      {/* Hero Content wrapped in Container */}
      <div className="relative z-[4] h-full flex flex-col items-center justify-center">
        <Container className="flex flex-col items-center text-center">
          {/* Brand Mark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="mb-8 md:mb-10"
          >
            <span className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)]">
              Est. 2024
            </span>
          </motion.div>

          {/* Brand Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,8vw,7rem)] tracking-[-0.02em] text-[#F5F5F5] font-normal leading-[0.95] mb-10 md:mb-12"
          >
            SECTOR
            <br />
            MADNESS
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="text-[12px] md:text-[13px] tracking-[0.25em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] font-light mb-14 md:mb-16 max-w-md"
          >
            We trust quality
          </motion.p>

          {/* CTA - High End Luxury Streetwear Wide Button */}
          <motion.a
            href="#collection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="group relative inline-flex items-center justify-center overflow-hidden bg-[#F5F5F5] text-[#0A0A0A] px-14 md:px-20 lg:px-24 py-4.5 md:py-5 min-w-[280px] md:min-w-[360px] text-[11px] md:text-[12px] tracking-[0.3em] uppercase font-bold transition-all duration-500 hover:bg-[#B6A47E] hover:text-[#0A0A0A] shadow-[0_0_30px_rgba(245,245,245,0.15)] hover:shadow-[0_0_40px_rgba(182,164,126,0.3)] cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-4 w-full text-center">
              <span>EXPLORE COLLECTION</span>
              <span className="text-[14px] transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </span>
          </motion.a>
        </Container>
      </div>
    </section>
  );
}
