import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import CountdownTimer from "./CountdownTimer";
import { getImageUrl } from "@/utils/api";

interface ProductCardProps {
  slug: string;
  name: string;
  collection: string;
  collectionCode: string;
  material: string;
  weight: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  discountExpiresAt?: string;
  isFlashSale?: boolean;
  image: string;
  limited: boolean;
  outOfStock?: boolean;
  index: number;
  hideDetailsOnIdle?: boolean;
  onHoverImageStart?: () => void;
  onHoverImageEnd?: () => void;
  isActive?: boolean;
}

export default function ProductCard({
  slug,
  name,
  collectionCode,
  material,
  weight,
  price,
  originalPrice,
  discountPercentage,
  discountExpiresAt,
  image,
  limited,
  outOfStock = false,
  index,
  hideDetailsOnIdle = false,
  onHoverImageStart,
  onHoverImageEnd,
  isActive = false,
}: ProductCardProps) {
  const [isExpired, setIsExpired] = useState(() => {
    if (discountExpiresAt) {
      return new Date(discountExpiresAt).getTime() <= Date.now();
    }
    return false;
  });

  const activeDiscount = !isExpired && discountPercentage && discountPercentage > 0;
  const activeTimer = !isExpired && discountExpiresAt;

  // Determine final display price
  const displaySellingPrice = !isExpired
    ? (price < 1000 ? price * 1000 : price)
    : (originalPrice ? (originalPrice < 1000 ? originalPrice * 1000 : originalPrice) : (price < 1000 ? price * 1000 : price));

  const displayOriginalPrice = !isExpired && originalPrice && originalPrice > price
    ? (originalPrice < 1000 ? originalPrice * 1000 : originalPrice)
    : undefined;

  return (
    <div>
      <Link
        href={`/product/${slug}`}
        className="group block cursor-pointer select-none"
      >
        {/* Image */}
        <div
          onMouseEnter={onHoverImageStart}
          onMouseLeave={onHoverImageEnd}
          className="relative aspect-[3/4] overflow-hidden bg-[#161616] mb-4 select-none"
        >
          <Image
            src={getImageUrl(image)}
            alt={name}
            fill
            draggable={false}
            className={`object-cover select-none pointer-events-none transition-all duration-500 ease-out ${
              isActive
                ? "brightness-100 grayscale-0 scale-[1.03]"
                : "brightness-[0.45] grayscale-[30%] group-hover:brightness-100 group-hover:grayscale-0 group-hover:scale-[1.03]"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            quality={85}
          />

          {/* Out of Stock badge */}
          {outOfStock && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 scale-[0.65] origin-top-right md:scale-100 z-10">
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#FF3B30] font-[family-name:var(--font-body)] font-bold">
                Out of Stock
              </span>
            </div>
          )}

          {/* Discount percentage badge */}
          {activeDiscount && !outOfStock && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3 scale-[0.65] origin-top-left md:scale-100 bg-[#FF3B30] text-white text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-1 z-10 shadow-sm">
              -{discountPercentage}% OFF
            </div>
          )}

          {/* Flash sale countdown badge */}
          {activeTimer && !outOfStock && (
            <div className="absolute top-2 right-2 md:top-3 md:right-3 scale-[0.65] origin-top-right md:scale-100 z-10">
              <CountdownTimer expiresAt={discountExpiresAt} compact onExpire={() => setIsExpired(true)} />
            </div>
          )}

          {/* Limited label */}
          {limited && !activeDiscount && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 scale-[0.65] origin-top-left md:scale-100 z-10">
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#B6A47E] font-[family-name:var(--font-body)]">
                Limited Release
              </span>
            </div>
          )}

          {/* VIEW PRODUCT label - inside image at bottom-4 left-4 */}
          <div className={`absolute bottom-2 left-2 md:bottom-4 md:left-4 z-10 scale-[0.65] origin-bottom-left md:scale-100 transition-opacity duration-300 ${
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}>
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium">
              VIEW PRODUCT
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>

        {/* Info */}
        <div
          className={`mt-2.5 md:mt-3.5 px-2 md:px-4 space-y-1 transition-all duration-300 ${
            hideDetailsOnIdle
              ? isActive
                ? "opacity-100 transform translate-y-0"
                : "opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0"
              : ""
          }`}
        >
          <span className="text-[8px] md:text-[10px] tracking-[0.2em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block">
            {collectionCode}
          </span>
          <h3 className="text-[12px] md:text-[15px] text-[#F5F5F5] font-[family-name:var(--font-body)] font-normal tracking-wide leading-tight md:leading-normal">
            {name}
          </h3>
          <p className="text-[9px] md:text-[11px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light">
            {material} · {weight}
          </p>
          <div className="flex items-center gap-1.5 md:gap-2 pt-0.5 flex-wrap">
            <span className="text-[11px] md:text-[14px] text-[#F5F5F5] font-[family-name:var(--font-body)] font-bold">
              Rp {displaySellingPrice.toLocaleString("id-ID")}
            </span>
            {displayOriginalPrice && (
              <span className="text-[9px] md:text-[11px] text-[#888888] line-through font-[family-name:var(--font-body)]">
                Rp {displayOriginalPrice.toLocaleString("id-ID")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
