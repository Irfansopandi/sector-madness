"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBagItems, updateItemQuantity, removeItemFromBag, BagItem } from "@/utils/bag";

export default function ShoppingBagPage() {
  const [items, setItems] = useState<BagItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadBag = () => {
    const bagData = getBagItems();
    setItems(bagData);
  };

  useEffect(() => {
    loadBag();
    setIsLoaded(true);

    const handleBagChange = () => loadBag();
    const handleAuthChange = () => loadBag();

    window.addEventListener("sector_bag_change", handleBagChange);
    window.addEventListener("sector_auth_change", handleAuthChange);

    return () => {
      window.removeEventListener("sector_bag_change", handleBagChange);
      window.removeEventListener("sector_auth_change", handleAuthChange);
    };
  }, []);

  const handleQtyChange = (id: string, newQty: number) => {
    updateItemQuantity(id, newQty);
    loadBag();
  };

  const handleRemove = (id: string) => {
    removeItemFromBag(id);
    loadBag();
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * 15000 * item.quantity, 0);

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#B6A47E] selection:text-[#0A0A0A] overflow-x-hidden flex flex-col justify-between"
    >
      <div>
        <Navbar mode="dark" activeLink="BAG" />

        <section style={{ paddingTop: "180px", paddingBottom: "120px" }} className="relative">
          <div style={{ paddingLeft: "clamp(32px, 6vw, 80px)", paddingRight: "clamp(32px, 6vw, 80px)" }} className="max-w-[1600px] mx-auto">
            
            {/* Header Title */}
            <div style={{ paddingBottom: "48px", marginBottom: "72px" }} className="border-b border-[#222222]/70">
              <span style={{ fontSize: "11px", letterSpacing: "0.25em" }} className="uppercase text-[#8A8A8A] block mb-3 font-semibold">
                SECTOR MADNESS ATELIER
              </span>
              <h1
                style={{
                  fontSize: "clamp(3rem, 6.5vw, 6.5rem)",
                  lineHeight: "0.95",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
                className="uppercase text-[#FFFFFF] tracking-tighter"
              >
                SHOPPING BAG
              </h1>
            </div>

            {!isLoaded ? (
              <div className="py-36 text-center text-[#777777] font-mono tracking-widest uppercase text-sm">
                INITIALIZING...
              </div>
            ) : items.length === 0 ? (
              /* ── ELEGANT EMPTY STATE ── */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="py-28 md:py-40 flex flex-col items-center justify-center text-center border-b border-[#222222]/70 mb-20"
              >
                <p
                  style={{
                    fontSize: "clamp(1.5rem, 2.5vw, 2.4rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                  className="text-[#FFFFFF] mb-4"
                >
                  Your Shopping Bag is currently empty.
                </p>
                <p style={{ fontSize: "15.5px", lineHeight: "1.7", fontWeight: 300 }} className="text-[#888888] mb-12 max-w-md">
                  Discover the latest SECTOR MADNESS collection.
                </p>
                <Link
                  href="/shop"
                  style={{ fontSize: "12px", letterSpacing: "0.26em", padding: "20px 52px" }}
                  className="bg-[#FFFFFF] text-[#0A0A0A] font-bold uppercase hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 rounded-none inline-block shadow-xl cursor-pointer"
                >
                  EXPLORE COLLECTION
                </Link>
              </motion.div>
            ) : (
              /* ── LUXURY EDITORIAL BAG LAYOUT ── */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
                
                {/* Left Column: Product Items Grid */}
                <div className="lg:col-span-8 flex flex-col">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.4 }}
                        style={{ paddingTop: "28px", paddingBottom: "32px", marginBottom: "0px" }}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-10 items-center border-b border-[#222222]/80 group first:pt-4"
                      >
                        {/* Large Product Photography */}
                        <div className="sm:col-span-4 relative w-full aspect-[4/5] bg-[#141414] overflow-hidden border border-[#222222] shadow-xl">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 30vw"
                            className="object-cover object-center transition-transform duration-700 group-hover:scale-103"
                          />
                        </div>

                        {/* Editorial Item Details & Actions */}
                        <div style={{ paddingLeft: "10px" }} className="sm:col-span-8 flex flex-col justify-between h-full py-1">
                          <div style={{ marginBottom: "28px" }} className="flex items-start justify-between gap-6">
                            <div>
                              <span style={{ fontSize: "11px", letterSpacing: "0.2em" }} className="uppercase text-[#8A8A8A] block mb-2 font-medium">
                                {item.collection}
                              </span>
                              <Link href={`/product/${item.slug}`} className="hover:text-[#B6A47E] transition-colors">
                                <h2
                                  style={{
                                    fontSize: "clamp(1.5rem, 2.2vw, 2.2rem)",
                                    fontWeight: 800,
                                    letterSpacing: "-0.02em",
                                  }}
                                  className="uppercase text-[#FFFFFF]"
                                >
                                  {item.name}
                                </h2>
                              </Link>
                              <div className="mt-3 flex flex-wrap items-center gap-4 text-[12px] uppercase text-[#CCCCCC] font-mono tracking-widest font-medium">
                                <span>SIZE // <span className="text-white font-bold">{item.size}</span></span>
                                {item.color && (
                                  <span>COLOR // <span className="text-[#B6A47E] font-bold">{item.color}</span></span>
                                )}
                              </div>
                            </div>

                            {/* Individual Price */}
                            <div className="text-right shrink-0">
                              <span style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.01em" }} className="text-[#FFFFFF] block font-mono">
                                Rp {(item.price * 15000).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          {/* Controls Row: Quantity Selector & Remove Action */}
                          <div style={{ paddingTop: "18px" }} className="border-t border-[#1D1D1D] flex items-center justify-between gap-6">
                            
                            {/* Minimalist Quantity Selector */}
                            <div className="flex items-center border border-[#2B2B2B] bg-[#0D0D0D]">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                                className="w-10 h-10 flex items-center justify-center text-[#888888] hover:text-[#FFFFFF] hover:bg-[#1A1A1A] transition-colors text-lg font-mono cursor-pointer"
                              >
                                −
                              </button>
                              <span className="w-12 text-center font-mono text-sm font-semibold text-[#FFFFFF] select-none">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center text-[#888888] hover:text-[#FFFFFF] hover:bg-[#1A1A1A] transition-colors text-lg font-mono cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            {/* Remove Action */}
                            <button
                              type="button"
                              onClick={() => handleRemove(item.id)}
                              style={{ fontSize: "11px", letterSpacing: "0.2em" }}
                              className="uppercase font-semibold text-[#666666] hover:text-[#B6A47E] transition-colors cursor-pointer"
                            >
                              REMOVE ×
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <div style={{ marginTop: "48px" }}>
                    <Link
                      href="/shop"
                      style={{ fontSize: "11.5px", letterSpacing: "0.22em" }}
                      className="uppercase font-semibold text-[#B6A47E] hover:text-[#FFFFFF] transition-colors inline-block"
                    >
                      ← CONTINUE SHOPPING
                    </Link>
                  </div>
                </div>

                {/* Right Column: Order Summary */}
                <div
                  style={{
                    padding: "44px 44px",
                    backgroundColor: "#0C0C0C",
                    border: "1px solid #262626",
                    fontFamily: "'Inter', -apple-system, sans-serif",
                  }}
                  className="lg:col-span-4 sticky top-36 shadow-2xl"
                >
                  {/* Title */}
                  <div style={{ paddingBottom: "24px", marginBottom: "28px", borderBottom: "1px solid #222222" }}>
                    <h3 style={{ fontSize: "15px", letterSpacing: "0.22em", fontWeight: 700 }} className="uppercase text-[#FFFFFF]">
                      ORDER SUMMARY
                    </h3>
                  </div>

                  {/* Detail Barang yang Dibeli User */}
                  <div style={{ paddingBottom: "24px", marginBottom: "28px", borderBottom: "1px solid #1E1E1E" }} className="space-y-4">
                    <span style={{ fontSize: "10.5px", letterSpacing: "0.2em" }} className="uppercase text-[#B6A47E] font-semibold block mb-4">
                      SELECTED GARMENTS ({items.reduce((acc, i) => acc + i.quantity, 0)})
                    </span>
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between gap-4 text-xs font-mono">
                        <div className="flex-1 text-[#CCCCCC] uppercase">
                          <span style={{ fontSize: "13px" }} className="font-semibold text-[#FFFFFF] block mb-1">
                            {item.name}
                          </span>
                          <span className="text-[#888888]" style={{ fontSize: "11px", letterSpacing: "0.1em" }}>
                            SIZE // {item.size}{item.color ? `  |  COLOR // ${item.color}` : ""}  [QTY: {item.quantity}]
                          </span>
                        </div>
                        <div className="text-right shrink-0 font-medium text-[#F5F5F5] pt-0.5 whitespace-nowrap">
                          Rp {(item.price * 15000 * item.quantity).toLocaleString("id-ID")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Line Items */}
                  <div className="space-y-4">
                    <div style={{ padding: "6px 0" }} className="flex items-center justify-between gap-4">
                      <span style={{ fontSize: "11.5px", letterSpacing: "0.18em" }} className="uppercase text-[#888888] font-medium shrink-0">
                        SUBTOTAL
                      </span>
                      <span style={{ fontSize: "14.5px" }} className="font-mono font-medium text-[#F5F5F5] text-right shrink-0 whitespace-nowrap">
                        Rp {subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div style={{ padding: "6px 0" }} className="flex items-center justify-between gap-4">
                      <span style={{ fontSize: "11.5px", letterSpacing: "0.18em" }} className="uppercase text-[#888888] font-medium shrink-0">
                        SHIPPING RATES
                      </span>
                      <span style={{ fontSize: "11px", letterSpacing: "0.12em" }} className="font-mono text-[#CCCCCC] uppercase font-medium text-right shrink-0 whitespace-nowrap">
                        CALCULATED AT CHECKOUT
                      </span>
                    </div>

                    {/* Total Row */}
                    <div style={{ marginTop: "28px", paddingTop: "28px", borderTop: "1px solid #262626" }} className="flex items-center justify-between gap-4">
                      <span style={{ fontSize: "14px", letterSpacing: "0.22em" }} className="uppercase font-extrabold text-[#FFFFFF] shrink-0">
                        TOTAL
                      </span>
                      <span style={{ fontSize: "20px", fontWeight: 700 }} className="font-mono text-[#FFFFFF] text-right shrink-0 whitespace-nowrap">
                        Rp {subtotal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons with generous spacing */}
                  <div style={{ marginTop: "44px" }}>
                    {/* Primary Button: Proceed to Checkout */}
                    <button
                      type="button"
                      onClick={() => alert("Protocol initiated: Welcome to SECTOR MADNESS Concierge Checkout.")}
                      style={{ fontSize: "11.5px", letterSpacing: "0.26em", padding: "22px 0", fontWeight: 700 }}
                      className="w-full bg-[#FFFFFF] text-[#0A0A0A] uppercase hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 rounded-none cursor-pointer block text-center shadow-xl"
                    >
                      PROCEED TO CHECKOUT
                    </button>

                    {/* Secondary Button: Continue Shopping */}
                    <div style={{ marginTop: "16px" }}>
                      <Link
                        href="/shop"
                        style={{ fontSize: "11px", letterSpacing: "0.24em", padding: "20px 0", fontWeight: 600 }}
                        className="w-full block text-center bg-transparent text-[#999999] border border-[#2E2E2E] hover:text-[#FFFFFF] hover:border-[#777777] transition-all uppercase"
                      >
                        CONTINUE SHOPPING
                      </Link>
                    </div>
                  </div>

                  {/* Footer Footnote */}
                  <div style={{ marginTop: "36px", paddingTop: "24px", borderTop: "1px solid #1A1A1A" }} className="text-center">
                    <span style={{ fontSize: "10px", letterSpacing: "0.2em" }} className="uppercase text-[#666666] block font-mono">
                      SECURE ATELIER ENCRYPTION // PROTOCOL 01
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
