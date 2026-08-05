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
  index: number;
  hideDetailsOnIdle?: boolean;
  onHoverImageStart?: () => void;
  onHoverImageEnd?: () => void;
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
  index,
  hideDetailsOnIdle = false,
  onHoverImageStart,
  onHoverImageEnd,
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
            className="object-cover select-none pointer-events-none transition-all duration-500 ease-out brightness-[0.45] grayscale-[30%] group-hover:brightness-100 group-hover:grayscale-0 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            quality={85}
          />

          {/* Discount percentage badge */}
          {activeDiscount && (
            <div className="absolute top-3 left-3 bg-[#FF3B30] text-white text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-1 z-10 shadow-sm">
              -{discountPercentage}% OFF
            </div>
          )}

          {/* Flash sale countdown badge */}
          {activeTimer && (
            <div className="absolute top-3 right-3 z-10">
              <CountdownTimer expiresAt={discountExpiresAt} compact onExpire={() => setIsExpired(true)} />
            </div>
          )}

          {/* Limited label */}
          {limited && !activeDiscount && (
            <div className="absolute top-4 left-4 z-10">
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#B6A47E] font-[family-name:var(--font-body)]">
                Limited Release
              </span>
            </div>
          )}

          {/* VIEW PRODUCT label - inside image at bottom-4 left-4 */}
          <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[9px] tracking-[0.2em] uppercase text-[#F5F5F5] font-[family-name:var(--font-body)] font-medium">
              VIEW PRODUCT
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
        </div>

        {/* Info */}
        <div className={`mt-3.5 px-4 space-y-1 transition-all duration-300 ${hideDetailsOnIdle ? "opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0" : ""}`}>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block">
            {collectionCode}
          </span>
          <h3 className="text-[15px] text-[#F5F5F5] font-[family-name:var(--font-body)] font-normal tracking-wide">
            {name}
          </h3>
          <p className="text-[11px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light">
            {material} · {weight}
          </p>
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <span className="text-[14px] text-[#F5F5F5] font-[family-name:var(--font-body)] font-bold">
              Rp {displaySellingPrice.toLocaleString("id-ID")}
            </span>
            {displayOriginalPrice && (
              <span className="text-[11px] text-[#888888] line-through font-[family-name:var(--font-body)]">
                Rp {displayOriginalPrice.toLocaleString("id-ID")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
