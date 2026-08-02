"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSizeGuides, SizeGuideItem } from "@/utils/api";

export default function SizeGuidePage() {
  const [sizeGuides, setSizeGuides] = useState<SizeGuideItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchGuides() {
      setIsLoading(true);
      const data = await getSizeGuides();
      setSizeGuides(data);
      if (data.length > 0) {
        setActiveCategoryId(data[0].id);
      }
      setIsLoading(false);
    }
    fetchGuides();
  }, []);

  const activeGuide = sizeGuides.find((g) => g.id === activeCategoryId) || sizeGuides[0];

  return (
    <main
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#B6A47E] selection:text-[#0A0A0A] overflow-x-hidden"
    >
      <Navbar mode="dark" />

      {/* ── PAGE HEADER INTRO ── */}
      <section
        style={{
          paddingTop: "clamp(120px, 8vw, 144px)",
          paddingBottom: "clamp(36px, 4vw, 52px)",
        }}
        className="relative border-b border-[#222222]"
      >
        <div
          style={{
            paddingLeft: "clamp(32px, 6vw, 80px)",
            paddingRight: "clamp(32px, 6vw, 80px)",
          }}
          className="max-w-[1500px] mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-start max-w-5xl"
          >
            <span
              style={{ fontSize: "11px", letterSpacing: "0.28em" }}
              className="font-semibold uppercase text-[#8A8A8A] block mb-3"
            >
              FIT &amp; MEASUREMENT SPECIFICATIONS
            </span>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
                lineHeight: "1.1",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className="uppercase text-[#FFFFFF] tracking-tight mb-4 whitespace-normal md:whitespace-nowrap"
            >
              SIZE GUIDE
            </h1>

            <p
              style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)", fontWeight: 300 }}
              className="text-[#999999] leading-relaxed max-w-2xl"
            >
              Comprehensive sizing parameters and garment measurements for SECTOR MADNESS outerwear, t-shirts, and bottoms.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN SIZE GUIDE CONTENT ── */}
      <section
        style={{
          paddingTop: "clamp(48px, 5.5vw, 76px)",
          paddingBottom: "clamp(64px, 7.5vw, 96px)",
          paddingLeft: "clamp(32px, 6vw, 80px)",
          paddingRight: "clamp(32px, 6vw, 80px)",
        }}
        className="max-w-[1500px] mx-auto w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-start">
          
          {/* LEFT: DYNAMIC SIZE TABLES & MEASUREMENT INSTRUCTIONS (8 COLS) */}
          <div className="lg:col-span-8">
            
            {/* DYNAMIC CATEGORY SELECTOR TABS FROM DATABASE */}
            {sizeGuides.length > 0 && (
              <div className="flex items-center gap-8 md:gap-10 border-b border-[#222222] pb-5 mb-10 md:mb-14 overflow-x-auto no-scrollbar">
                {sizeGuides.map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => setActiveCategoryId(guide.id)}
                    className={`text-xs md:text-sm font-semibold tracking-[0.22em] uppercase transition-colors duration-200 shrink-0 pb-1 ${
                      activeCategoryId === guide.id
                        ? "text-[#B6A47E] border-b-2 border-[#B6A47E]"
                        : "text-[#8A8A8A] hover:text-[#FFFFFF]"
                    }`}
                  >
                    {guide.category_code ? `${guide.category_code} / ${guide.category}` : guide.category}
                  </button>
                ))}
              </div>
            )}

            {/* DYNAMIC ACTIVE CATEGORY MEASUREMENT TABLE */}
            {isLoading ? (
              <div className="py-20 text-center text-[#8A8A8A] text-sm animate-pulse tracking-widest uppercase">
                Loading Garment Measurements...
              </div>
            ) : activeGuide ? (
              <motion.div
                key={activeGuide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Section Header with Explicit Top Space from Tab Divider */}
                <div
                  style={{ marginTop: "24px", paddingTop: "20px", paddingBottom: "24px" }}
                  className="border-b border-[#333333] mb-10 md:mb-12"
                >
                  <h2
                    style={{ marginTop: "12px" }}
                    className="text-sm md:text-base lg:text-lg font-bold tracking-[0.25em] uppercase text-[#FFFFFF] mb-3"
                  >
                    {activeGuide.category} {activeGuide.fit_description ? `(${activeGuide.fit_description})` : ""}
                  </h2>
                  {activeGuide.description && (
                    <p className="text-xs md:text-sm text-[#999999] font-light leading-relaxed">
                      {activeGuide.description}
                    </p>
                  )}
                </div>

                {/* Table with Centered Dynamic Column Content */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-center border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-[#333333] text-[#B6A47E] font-mono tracking-[0.2em] uppercase">
                        {activeGuide.columns?.map((colHeader, index) => (
                          <th key={index} className="py-4 px-4 font-semibold text-center">
                            {colHeader}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {activeGuide.rows?.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-[#121212] transition-colors">
                          {activeGuide.columns?.map((colHeader, colIndex) => (
                            <td
                              key={colIndex}
                              className={`py-5 px-4 text-center ${
                                colIndex === 0 ? "font-bold text-[#FFFFFF]" : "text-[#A0A0A0]"
                              }`}
                            >
                              {row[colHeader] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : null}

            {/* HOW TO MEASURE SECTION */}
            <div
              style={{
                marginTop: "clamp(72px, 9vw, 112px)",
              }}
              className="space-y-8"
            >
              {/* Header block with generous padding BEFORE & AFTER bottom divider line */}
              <div
                style={{ paddingBottom: "32px", marginBottom: "40px" }}
                className="border-b border-[#333333]"
              >
                <span className="text-sm md:text-base font-mono font-bold tracking-[0.25em] text-[#B6A47E] uppercase block mb-3">
                  MEASUREMENT ADVICE
                </span>
                <h3 className="text-sm md:text-base lg:text-lg font-bold tracking-[0.25em] uppercase text-[#FFFFFF]">
                  HOW TO MEASURE YOUR BODY
                </h3>
              </div>

              {/* Instructions Grid with EXPLICIT marginTop (36px) and paddingTop (28px) so "1. CHEST / BUST" sits FAR BELOW line */}
              <div
                style={{ marginTop: "36px", paddingTop: "28px" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 text-xs md:text-sm"
              >
                <div className="space-y-3">
                  <h4
                    style={{ marginTop: "12px" }}
                    className="font-semibold text-[#FFFFFF] tracking-wider uppercase mb-2"
                  >
                    1. CHEST / BUST
                  </h4>
                  <p className="text-[#A0A0A0] font-light leading-relaxed">
                    Measure around the fullest part of your chest, keeping the tape measure horizontal and flat across your back.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4
                    style={{ marginTop: "12px" }}
                    className="font-semibold text-[#FFFFFF] tracking-wider uppercase mb-2"
                  >
                    2. SHOULDER WIDTH
                  </h4>
                  <p className="text-[#A0A0A0] font-light leading-relaxed">
                    Measure straight across the back from the edge of your left shoulder seam to your right shoulder seam.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4
                    style={{ marginTop: "12px" }}
                    className="font-semibold text-[#FFFFFF] tracking-wider uppercase mb-2"
                  >
                    3. GARMENT LENGTH
                  </h4>
                  <p className="text-[#A0A0A0] font-light leading-relaxed">
                    Measure vertically from the highest point of the shoulder seam straight down to the bottom hemline.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4
                    style={{ marginTop: "12px" }}
                    className="font-semibold text-[#FFFFFF] tracking-wider uppercase mb-2"
                  >
                    4. WAIST
                  </h4>
                  <p className="text-[#A0A0A0] font-light leading-relaxed">
                    Measure around your natural waistline, keeping the tape comfortably loose and level.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: FIT ASSISTANCE SIDEBAR (4 COLS) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div
              style={{
                padding: "clamp(28px, 4vw, 44px)",
              }}
              className="bg-[#121212] border border-[#222222] flex flex-col justify-between space-y-8"
            >
              <div className="space-y-4">
                <span className="text-[11px] font-semibold tracking-[0.28em] text-[#B6A47E] uppercase block">
                  PERSONAL ASSISTANCE
                </span>

                <h3
                  style={{
                    fontSize: "clamp(1.35rem, 2vw, 1.75rem)",
                    lineHeight: "1.15",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                  className="text-[#FFFFFF] uppercase"
                >
                  NEED FIT ADVICE?
                </h3>

                <p className="text-[14px] text-[#A0A0A0] font-light leading-relaxed">
                  Unsure which size fits your personal height and weight silhouette best? Contact our team directly on WhatsApp for tailored fit recommendation.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/6285946653103?text=Halo%20SECTOR%20MADNESS%2C%20saya%20ingin%20konsultasi%20mengenai%20panduan%20ukuran%20(Size%20Guide)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center text-[12px] md:text-[13px] tracking-[0.28em] uppercase font-medium text-[#F5F5F5] opacity-90 hover:opacity-100 hover:text-[#B6A47E] transition-all duration-300 ease-out"
                >
                  <span className="relative pb-2 border-b border-[#F5F5F5]/30 group-hover:border-[#B6A47E] transition-colors duration-300">
                    ASK FIT CONSULTANT
                  </span>
                  <span className="ml-4 transition-transform duration-300 ease-out group-hover:translate-x-2">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
