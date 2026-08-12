"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getHeroBanners, type HeroBanner } from "@/utils/api";
import Container from "./Container";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://brand.test";

function getImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/storage/")) return `${BACKEND_URL}${imagePath}`;
  return imagePath;
}

const CACHE_KEY = "sm_hero_first_image";

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cached image URL — only set on client via useEffect to avoid hydration mismatch
  const [cachedFirstImageUrl, setCachedFirstImageUrl] = useState<string | null>(null);

  // Load cache from localStorage after mount (client-only, safe for SSR)
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setCachedFirstImageUrl(cached);
    } catch {}
  }, []);

  const { data: heroBanners = [] } = useQuery({
    queryKey: ["hero-banners"],
    queryFn: getHeroBanners,
    staleTime: 60_000,
  });

  const activeBanners: HeroBanner[] = heroBanners;

  // Save first banner URL to localStorage once API responds
  useEffect(() => {
    if (activeBanners.length > 0) {
      const firstUrl = getImageUrl(activeBanners[0].image_path);
      try { localStorage.setItem(CACHE_KEY, firstUrl); } catch {}
    }
  }, [activeBanners]);

  const transition = useCallback(() => {
    if (activeBanners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(transition, 5000);
    return () => clearInterval(timer);
  }, [transition, activeBanners.length]);

  const currentBanner = activeBanners.length > 0
    ? activeBanners[currentIndex % activeBanners.length]
    : null;

  // Track when the first image started showing (for seamless scale handoff)
  const firstImageStartTime = useRef<number | null>(null);

  // Track whether API has just loaded the first slide for the first time
  const hasShownFirstBanner = useRef(false);

  // For the first banner coming from the API (not a slide transition),
  // skip opacity animation so image + zoom appear instantly together.
  const skipOpacityAnim = !hasShownFirstBanner.current && currentIndex === 0;

  useEffect(() => {
    if (currentBanner && !hasShownFirstBanner.current) {
      hasShownFirstBanner.current = true;
    }
  }, [currentBanner]);

  // Calculate the current Ken Burns scale based on how long the first image has been visible
  // This allows the API image to continue the zoom from where the cached image left off
  const getSeamlessInitialScale = () => {
    if (!firstImageStartTime.current) return 1.05;
    const elapsed = (Date.now() - firstImageStartTime.current) / 1000;
    // Ken Burns: scale 1.05 → 1.15 over 7s, cubic-bezier [0.25, 0.1, 0.25, 1]
    // Approximate with linear for simplicity (difference is negligible at this scale)
    const progress = Math.min(elapsed / 7, 1);
    return 1.05 + progress * 0.10;
  };

  return (
    <section className="relative z-0 h-screen w-full overflow-hidden bg-[#0A0A0A]">

      {/* Cached first image — shown instantly on refresh BEFORE API responds */}
      {/* Uses motion.div with same Ken Burns so zoom is already running when API image takes over */}
      {!currentBanner && cachedFirstImageUrl && (
        <motion.div
          className="absolute inset-0 z-[1]"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.15 }}
          transition={{ scale: { duration: 7, ease: [0.25, 0.1, 0.25, 1] } }}
          onAnimationStart={() => {
            if (!firstImageStartTime.current) {
              firstImageStartTime.current = Date.now();
            }
          }}
        >
          <Image
            src={cachedFirstImageUrl}
            alt="SECTOR MADNESS Campaign"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={90}
          />
        </motion.div>
      )}

      {/* Background Images — Ken Burns + Crossfade */}
      <AnimatePresence mode="sync">
        {currentBanner && (
          <motion.div
            key={currentBanner.id || currentBanner.image_path || currentIndex}
            initial={{
              opacity: skipOpacityAnim ? 1 : 0,
              // Continue from wherever the cached image's zoom was
              scale: skipOpacityAnim ? getSeamlessInitialScale() : 1.05,
            }}
            animate={{ opacity: 1, scale: 1.15 }}
            exit={{ opacity: 0, scale: 1.20 }}
            transition={{
              opacity: skipOpacityAnim
                ? { duration: 0 }
                : { duration: 1.8, ease: "easeInOut" },
              scale: skipOpacityAnim
                ? {
                    // Remaining duration = 7s minus elapsed
                    duration: Math.max(0.1, 7 - (firstImageStartTime.current ? (Date.now() - firstImageStartTime.current) / 1000 : 0)),
                    ease: [0.25, 0.1, 0.25, 1],
                  }
                : { duration: 7, ease: [0.25, 0.1, 0.25, 1] },
            }}
            className="absolute inset-0 z-[1]"
          >
            <Image
              src={getImageUrl(currentBanner.image_path)}
              alt="SECTOR MADNESS Campaign"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              quality={90}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-[3]" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent z-[3]" />
      {/* Solid block to completely prevent image bleeding at the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-4 bg-[#0A0A0A] z-[4]" />

      {/* Hero Content */}
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
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,8vw,7rem)] tracking-[-0.02em] text-[#F5F5F5] font-normal leading-[0.95] mb-10 md:mb-12 flex flex-col items-center text-center">
            <motion.span
              initial={{ opacity: 0, y: -45 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="block"
            >
              SECTOR
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 45 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="block"
            >
              MADNESS
            </motion.span>
          </h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="text-[12px] md:text-[13px] tracking-[0.25em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] font-light mb-14 md:mb-16 max-w-md"
          >
            We trust quality
          </motion.p>

          {/* CTA Button */}
          <motion.a
            href="#collection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="group relative inline-flex items-center justify-center overflow-hidden bg-[#F5F5F5] text-[#0A0A0A] px-10 md:px-20 lg:px-24 py-4 md:py-5 min-w-[200px] sm:min-w-[260px] md:min-w-[360px] text-[9px] md:text-[12px] tracking-[0.25em] md:tracking-[0.3em] uppercase font-bold transition-all duration-500 hover:bg-[#B6A47E] hover:text-[#0A0A0A] shadow-[0_0_30px_rgba(245,245,245,0.15)] hover:shadow-[0_0_40px_rgba(182,164,126,0.3)] cursor-pointer"
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
