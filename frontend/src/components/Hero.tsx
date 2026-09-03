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

  const { data: heroBanners = [], isLoading } = useQuery({
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
    const timer = setInterval(transition, 12000);
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
    // Ken Burns: scale 1.05 → 1.15 over 15s, cubic-bezier [0.25, 0.1, 0.25, 1]
    // Approximate with linear for simplicity (difference is negligible at this scale)
    const progress = Math.min(elapsed / 15, 1);
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
          transition={{ scale: { duration: 15, ease: [0.25, 0.1, 0.25, 1] } }}
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
                    // Remaining duration = 15s minus elapsed
                    duration: Math.max(0.1, 15 - (firstImageStartTime.current ? (Date.now() - firstImageStartTime.current) / 1000 : 0)),
                    ease: [0.25, 0.1, 0.25, 1],
                  }
                : { duration: 15, ease: [0.25, 0.1, 0.25, 1] },
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
      <div className="absolute inset-0 bg-black/30 z-[3]" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent z-[3]" />
      <div className="absolute inset-x-0 bottom-0 h-4 bg-[#0A0A0A] z-[4]" />

      {/* Hero Content */}
      <div 
        className="absolute inset-0 z-[4] flex items-end"
        style={{
          paddingBottom: "clamp(120px, 20vh, 250px)",
          paddingLeft: "clamp(32px, 6vw, 80px)",
          paddingRight: "clamp(32px, 6vw, 80px)",
        }}
      >
        <div className="w-full max-w-[1500px] mx-auto flex flex-col">
          <AnimatePresence mode="wait">
            {!isLoading && (
              <motion.div
                key={currentIndex}
                className={`w-fit max-w-full md:max-w-3xl flex flex-col ${
                currentIndex % 2 === 0
                  ? "items-start text-left self-start"
                  : "items-end text-right self-end"
              }`}
            >
              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ fontFamily: "'Poppins', 'Inter', sans-serif", fontWeight: 700 }}
                className="text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.1] text-white tracking-tight"
              >
                {currentBanner?.title || (
                  <>
                    {currentIndex % 3 === 0 && "New: Signature Collection"}
                    {currentIndex % 3 === 1 && "Essential Outerwear"}
                    {currentIndex % 3 === 2 && "Timeless Classics"}
                  </>
                )}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-sans text-[13px] md:text-[16px] text-gray-200 mt-3 md:mt-5 leading-relaxed font-light w-0 min-w-full"
              >
                {currentBanner?.description || (
                  <>
                    {currentIndex % 3 === 0 && "The latest collection revisits our streetwear origins, reworking classic graphics for the new season."}
                    {currentIndex % 3 === 1 && "Engineered for comfort and durability. Discover our new range of jackets designed for everyday wear."}
                    {currentIndex % 3 === 2 && "Staple pieces designed to be the foundation of your daily wardrobe, built to stand the test of time."}
                  </>
                )}
              </motion.p>

              {/* CTA Button */}
              <motion.a
                href={currentBanner?.link_url || "/shop"}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ padding: "clamp(8px, 1.5vw, 12px) clamp(24px, 4vw, 40px)" }}
                className="mt-16 md:mt-20 inline-flex items-center justify-center bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#0A0A0A] rounded-full font-sans font-medium text-[11px] md:text-[13px] transition-colors duration-300 shadow-lg"
              >
                Shop now
              </motion.a>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
