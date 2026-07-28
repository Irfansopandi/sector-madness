"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProductCardProps {
  slug: string;
  name: string;
  collection: string;
  collectionCode: string;
  material: string;
  weight: string;
  price: number;
  image: string;
  limited: boolean;
  index: number;
}

export default function ProductCard({
  slug,
  name,
  collectionCode,
  material,
  weight,
  price,
  image,
  limited,
  index,
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.12,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <Link
        href={`/product/${slug}`}
        className="group block cursor-pointer select-none"
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#161616] mb-5 select-none">
          <Image
            src={image}
            alt={name}
            fill
            draggable={false}
            className="object-cover select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            quality={85}
          />

          {/* Limited label */}
          {limited && (
            <div className="absolute top-4 left-4">
              <span className="text-[9px] tracking-[0.2em] uppercase text-[#B6A47E] font-[family-name:var(--font-body)]">
                Limited Release
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

          {/* View Product - appears on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#F5F5F5]">
              View Product →
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <span className="text-[9px] tracking-[0.25em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)] block">
            {collectionCode}
          </span>
          <h3 className="text-[14px] md:text-[15px] text-[#F5F5F5] font-[family-name:var(--font-body)] font-light tracking-wide">
            {name}
          </h3>
          <p className="text-[11px] text-[#8A8A8A] font-[family-name:var(--font-body)] font-light">
            {material} · {weight}
          </p>
          <p className="text-[13px] text-[#F5F5F5] font-[family-name:var(--font-body)] font-light pt-1">
            Rp {(price * 15000).toLocaleString("id-ID")}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
