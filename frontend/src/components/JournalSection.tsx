"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getJournals, JournalArticle } from "@/utils/api";
import AnimatedSection from "./AnimatedSection";

const fallbackArticles = [
  {
    slug: "origin-sector-001",
    title: "The Origin of Sector 001",
    category: "Collection Stories",
    issue: "VOL. 01",
    summary: "A closer look at the inspiration behind our first collection and the ideas that shaped every silhouette.",
    image: "/images/campaign/campaign-1.png",
  },
  {
    slug: "designed-beyond-trends",
    title: "Designed Beyond Trends",
    category: "Brand Philosophy",
    issue: "VOL. 02",
    summary: "Why timeless design creates stronger identity than seasonal fashion.",
    image: "/images/story/brand-story.png",
  },
  {
    slug: "inside-the-fabric",
    title: "Inside the Fabric",
    category: "Materials & Craftsmanship",
    issue: "VOL. 03",
    summary: "Exploring heavyweight cotton, garment construction, and the importance of premium materials.",
    image: "/images/hero/hero-1.png",
  },
];

export default function JournalSection() {
  const { data: apiJournals } = useQuery({
    queryKey: ["journals"],
    queryFn: () => getJournals(),
  });

  const displayArticles = (apiJournals && apiJournals.length > 0)
    ? apiJournals.slice(0, 3)
    : fallbackArticles;

  return (
    <section id="journal" className="relative w-full bg-[#0A0A0A] text-[#F5F5F5] pt-24 md:pt-36 pb-24 md:pb-32">
      <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="max-w-[1720px] mx-auto">
        
        {/* Section Header */}
        <div style={{ paddingTop: "30px", marginBottom: "15px" }} className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
          <div>
            <AnimatedSection>
              <span style={{ fontSize: "11px", letterSpacing: "0.25em", fontWeight: 600 }} className="uppercase text-[#8A8A8A] block mb-4">
                INDEPENDENT FASHION PUBLICATION
              </span>
            </AnimatedSection>
            
            <AnimatedSection delay={0.1}>
              <h2
                style={{
                  fontSize: "clamp(2.6rem, 5.5vw, 5rem)",
                  lineHeight: "0.95",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
                className="uppercase text-[#FFFFFF] tracking-tighter"
              >
                JOURNAL
              </h2>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.2} className="hidden sm:block">
            <Link
              href="/journal"
              style={{ fontSize: "11.5px", letterSpacing: "0.22em" }}
              className="uppercase font-semibold text-[#B6A47E] hover:text-[#FFFFFF] transition-colors inline-flex items-center gap-2"
            >
              EXPLORE ALL ARTICLES →
            </Link>
          </AnimatedSection>
        </div>

        {/* 3-Column Magazine Grid without floating overlay boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
          {displayArticles.map((article, idx) => (
            <AnimatedSection
              key={article.slug || article.title}
              delay={0.15 + idx * 0.12}
              className="group flex flex-col justify-between"
            >
              <Link href="/journal" className="block cursor-pointer">
                <div className="relative w-full aspect-[4/3] bg-[#141414] overflow-hidden mb-8">
                  <Image
                    src={article.image || "/images/campaign/campaign-1.png"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="flex items-center justify-between text-[11.5px] text-[#A0A0A0] uppercase mb-4 tracking-[0.15em] font-medium">
                  <span className="text-[#B6A47E] font-semibold">{article.category}</span>
                  <span className="text-[#777777] group-hover:text-white transition-colors">READ MORE →</span>
                </div>

                <h3
                  style={{
                    fontSize: "clamp(1.3rem, 1.8vw, 1.9rem)",
                    lineHeight: "1.2",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                  className="text-[#FFFFFF] group-hover:opacity-85 transition-opacity duration-300 mb-5"
                >
                  {article.title}
                </h3>

                <p style={{ fontSize: "14.5px", lineHeight: "1.75", fontWeight: 300 }} className="text-[#888888] line-clamp-2">
                  {article.summary}
                </p>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
