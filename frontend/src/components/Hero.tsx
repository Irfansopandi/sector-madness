"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getHeroBanners, type HeroBanner } from "@/utils/api";
import Container from "./Container";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://brand.test";

function getImageUrl(imagePath: string): string {
  if (!imagePath) return "";
  // Jika sudah full URL (http/https), langsung pakai
  if (imagePath.startsWith("http")) return imagePath;
  // Hanya path /storage/... (upload Laravel) yang di-prefix backend URL
  if (imagePath.startsWith("/storage/")) return `${BACKEND_URL}${imagePath}`;
  // Path lokal (/images/...) tetap apa adanya → di-serve dari Next.js public folder
  return imagePath;
}

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: heroBanners = [] } = useQuery({
    queryKey: ["hero-banners"],
    queryFn: getHeroBanners,
  });

  const activeBanners: HeroBanner[] = heroBanners;

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

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#0A0A0A]">
      {/* Background Images with Continuous Smooth Ken Burns Crossfade */}
      <AnimatePresence mode="sync">
        {currentBanner && (
          <motion.div
            key={currentBanner.id || currentBanner.image_path || currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1.15 }}
            exit={{ opacity: 0, scale: 1.20 }}
            transition={{
              opacity: { duration: 1.8, ease: "easeInOut" },
              scale: { duration: 7, ease: [0.25, 0.1, 0.25, 1] },
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

          {/* Brand Name - Vertical Gap Collapse Entrance */}
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

          {/* CTA - High End Luxury Streetwear Wide Button */}
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
