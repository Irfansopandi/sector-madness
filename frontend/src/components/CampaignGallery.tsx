"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getImageUrl } from "@/utils/api";
import AnimatedSection from "./AnimatedSection";

export default function CampaignGallery() {
  const { data: apiProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const items = apiProducts && apiProducts.length > 0 ? apiProducts.slice(0, 4) : [];

  if (items.length === 0) return null;

  return (
    <section id="campaign" className="relative w-full bg-[#0A0A0A]">
      {/* Top Divider Line */}
      <div
        style={{ marginTop: "70px", marginBottom: "0px" }}
        className="w-full h-[1px] bg-[#222222]"
      />

      {items.map((product, index) => {
        const title = product.name;
        const categoryCode = `CATEGORY 0${index + 1}`;
        const categoryName = (product.collection_code || product.category?.name || "COLLECTION").toUpperCase();
        const tagline = `${product.weight ? product.weight + " · " : ""}${product.material ? product.material.toUpperCase() : "PREMIUM ARCHITECTURAL PIECE"}`;
        const description = product.description || "The foundational piece of Sector Madness. Crafted with high intention, precision construction, and timeless presence.";
        const image = getImageUrl(product.image);
        
        const rawPrice = product.price;
        const priceVal = typeof rawPrice === "number" ? (rawPrice < 1000 ? rawPrice * 1000 : rawPrice) : 285000;
        const price = `Rp ${priceVal.toLocaleString("id-ID")}`;

        const isEven = index % 2 === 0;

        return (
          <div key={product.id || index} className="w-full grid grid-cols-1 lg:grid-cols-2 border-b border-[#222222]">
            {/* Image Column */}
            <AnimatedSection
              className={`relative min-h-[440px] sm:min-h-[520px] lg:min-h-[640px] w-full bg-[#141414] overflow-hidden ${
                isEven ? "order-1" : "order-1 lg:order-2"
              }`}
            >
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={90}
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent opacity-80" />

              {/* Best Seller Tag */}
              <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-transparent p-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B6A47E] animate-pulse" />
                <span className="text-[10px] tracking-[0.25em] font-mono uppercase text-[#B6A47E] font-medium drop-shadow-md">
                  FEATURED CAMPAIGN
                </span>
              </div>

              {/* Bottom Image Tag */}
              <div className="absolute bottom-6 left-6 z-10 text-[11px] font-mono tracking-[0.2em] uppercase text-[#A0A0A0] bg-transparent p-0 drop-shadow-md">
                {categoryName} • {price}
              </div>
            </AnimatedSection>

            {/* Text Banner Column */}
            <div
              style={{
                paddingLeft: "60px",
                paddingRight: "60px",
                paddingTop: "70px",
                paddingBottom: "70px",
              }}
              className={`flex flex-col justify-center bg-[#0A0A0A] w-full ${
                isEven ? "order-2" : "order-2 lg:order-1"
              }`}
            >
              <AnimatedSection delay={0.1}>
                {/* Category & Badge Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block">
                    {categoryCode} / {categoryName}
                  </span>
                </div>

                {/* Main Product Title */}
                <h2 className="font-[family-name:var(--font-display)] text-[28px] md:text-[36px] lg:text-[42px] text-[#F5F5F5] font-bold tracking-[0.02em] uppercase leading-[1.1] mb-3">
                  {title}
                </h2>

                {/* Subtitle / Tagline */}
                <p className="text-[11px] md:text-[12px] font-mono tracking-[0.2em] text-[#B6A47E] uppercase mb-5 font-medium">
                  {tagline}
                </p>

                {/* Compelling Description */}
                <p className="text-[14px] md:text-[15px] text-[#A0A0A0] font-[family-name:var(--font-body)] font-light leading-relaxed mb-8 max-w-md">
                  {description}
                </p>

                <div className="w-full h-[1px] bg-[#222222] mb-8" />

                {/* Action Links */}
                <div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="group/cta inline-flex items-center gap-3 text-[11px] md:text-[12px] tracking-[0.3em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium transition-colors hover:text-[#B6A47E]"
                  >
                    <span className="relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#F5F5F5] group-hover/cta:after:bg-[#B6A47E] after:transition-colors">
                      EXPLORE PRODUCT
                    </span>
                    <span className="text-[14px] transition-transform duration-300 group-hover/cta:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </AnimatedSection>
            </div>
          </div>
        );
      })}
    </section>
  );
}
