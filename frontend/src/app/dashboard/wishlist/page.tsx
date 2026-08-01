"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getWishlist, removeFromWishlist, addToCart, type WishlistItem } from "@/utils/api";
import { products, getVariantStock } from "@/data/products";
import BagToast from "@/components/BagToast";
import WishlistToast from "@/components/WishlistToast";

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<WishlistItem[]>([]);
  const [showBagToast, setShowBagToast] = useState(false);
  const [bagToastMsg, setBagToastMsg] = useState("");
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [wishlistToastMsg, setWishlistToastMsg] = useState("");

  useEffect(() => {
    try {
      const cached = localStorage.getItem("sector_madness_wishlist");
      if (cached) {
        setWishlistProducts(JSON.parse(cached));
      }
    } catch {}

    const fetchWishlist = async () => {
      try {
        const data = await getWishlist();
        setWishlistProducts(data);
        if (typeof window !== "undefined") {
          localStorage.setItem("sector_madness_wishlist", JSON.stringify(data));
        }
      } catch (err) {
        // Silent error fallback
      }
    };
    fetchWishlist();
  }, []);

  const handleMoveWishlistItemToBag = async (product: WishlistItem) => {
    try {
      await addToCart({
        product_id: product.product_id,
        quantity: 1,
        size: product.size || "M",
        color: product.color || "DEFAULT",
      });
      setBagToastMsg(`"${product.name}" added to Shopping Bag.`);
      setShowBagToast(true);
    } catch {
      setBagToastMsg(`Failed to add "${product.name}" to Bag.`);
      setShowBagToast(true);
    }
  };

  const handleRemoveWishlistItem = async (prod: WishlistItem) => {
    try {
      await removeFromWishlist(prod.product_id, prod.size, prod.color);
      setWishlistProducts((prev) => prev.filter((p) => p.id !== prod.id));
      setWishlistToastMsg(`"${prod.name}" removed from Wishlist.`);
      setShowWishlistToast(true);
    } catch {
      setWishlistToastMsg("Failed to remove product. Please try again.");
      setShowWishlistToast(true);
    }
  };

  return (
    <div className="bg-[#141414] border border-white/[0.08] p-8 md:p-10 lg:p-12 space-y-8 shadow-2xl">
      {/* Header */}
      <div style={{ paddingTop: "24px", paddingBottom: "24px", paddingLeft: "28px", paddingRight: "28px" }} className="border-b border-white/[0.08] flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#F5F5F5]">WISHLIST</h2>
          <p className="text-xs text-[#8A8A8A] mt-1 font-mono">Manage your favorite products</p>
        </div>
        <span suppressHydrationWarning className="text-xs font-mono text-[#B6A47E] font-bold tracking-widest">{wishlistProducts.length} ITEMS</span>
      </div>

      {/* Content */}
      <div>
        {wishlistProducts.length === 0 ? (
          <div style={{ padding: "72px 0 88px 0" }} className="w-full flex flex-col items-center justify-center text-center">
            <div style={{ marginBottom: "28px" }} className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#B6A47E]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <p style={{ marginBottom: "18px" }} className="text-sm font-mono uppercase tracking-[0.2em] text-[#8A8A8A] font-bold">NO ITEMS IN YOUR WISHLIST YET.</p>
            <Link
              href="/shop"
              style={{ padding: "16px 36px" }}
              className="inline-block bg-white text-[#0A0A0A] font-mono text-xs uppercase font-black tracking-[0.25em] hover:bg-[#B6A47E] transition-all shadow-xl"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div>
            {wishlistProducts.map((prod, idx) => {
              // Match against local product catalog for accurate image & price — same strategy as Shopping Bag
              const staticProduct = products.find(
                (p) =>
                  parseInt(p.id, 10) === Number(prod.product_id) ||
                  p.slug === prod.slug ||
                  p.name === prod.name
              );
              const resolvedImage = staticProduct?.image || prod.image || "/images/campaign/campaign-1.png";
              const resolvedPrice = staticProduct?.price ?? prod.price ?? 0;
              const resolvedName = staticProduct?.name || prod.name;
              const productLink = staticProduct ? `/product/${staticProduct.slug}` : `/product/${prod.slug || prod.product_id}`;
              const itemCategory = (prod.category || staticProduct?.collectionCode || staticProduct?.collection || "T-SHIRT").toUpperCase();

              return (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    paddingTop: idx === 0 ? "24px" : "0px",
                    paddingBottom: "24px",
                    marginBottom: "0px",
                    borderBottom: idx !== wishlistProducts.length - 1 ? "1px solid #222222" : "none",
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start" style={{ gap: "28px" }}>
                    {/* Product Image — with left breathing room */}
                    <Link
                      href={productLink}
                      className="relative w-[110px] h-[145px] bg-[#141414] shrink-0 overflow-hidden border border-[#262626] group"
                      style={{ marginLeft: "12px" }}
                    >
                      <Image
                        src={resolvedImage}
                        alt={resolvedName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Details & Controls Column */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch w-full">
                      {/* Top: Info & Price */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#888888]">
                              {itemCategory}
                            </span>
                            {!prod.in_stock && (
                              <span className="text-[10px] font-mono tracking-[0.2em] uppercase bg-[#881111] text-white px-2 py-0.5 font-bold">
                                OUT OF STOCK
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold tracking-wide text-white uppercase hover:text-[#D4AF37] transition-colors">
                            <Link href={productLink}>{resolvedName}</Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#888888] tracking-wider pt-1">
                            <span>
                              COLOR: <strong className="text-[#EDEDED] font-normal">{prod.color || "—"}</strong>
                            </span>
                            <span className="text-[#333333]">|</span>
                            <span>
                              SIZE: <strong className="text-[#EDEDED] font-normal">{prod.size || "—"}</strong>
                            </span>
                            <span className="text-[#333333]">|</span>
                            {(() => {
                              const variantStock = staticProduct
                                ? getVariantStock(staticProduct.slug, prod.color || null, prod.size || null)
                                : (prod.stock_quantity ?? null);
                              return (
                                <span className="text-[#B6A47E] font-medium bg-[#141414] px-2 py-0.5 border border-[#262626]">
                                  {variantStock !== null && variantStock !== undefined ? (
                                    variantStock > 0 ? (
                                      <strong className="text-white font-bold">{variantStock} UNITS IN STOCK</strong>
                                    ) : (
                                      <strong className="text-[#FF6666] font-bold">SOLD OUT</strong>
                                    )
                                  ) : prod.in_stock ? (
                                    <strong className="text-white font-bold">
                                      {prod.stock_quantity ? `${prod.stock_quantity} UNITS IN STOCK` : "AVAILABLE IN STOCK"}
                                    </strong>
                                  ) : (
                                    <strong className="text-[#FF6666] font-bold">SOLD OUT</strong>
                                  )}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0 space-y-1" style={{ paddingRight: "12px" }}>
                          <p className="text-base font-bold font-mono text-white tracking-wide">
                            Rp {staticProduct
                              ? (resolvedPrice * 15000).toLocaleString("id-ID")
                              : resolvedPrice.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      {/* Bottom: Add to Bag & Remove */}
                      <div className="flex items-center justify-between mt-8 pt-2">
                        {/* Add to Bag — styled inline like Shopping Bag (no button element) */}
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => handleMoveWishlistItemToBag(prod)}
                          onKeyDown={(e) => e.key === "Enter" && handleMoveWishlistItemToBag(prod)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-[#B6A47E] font-mono text-[11px] font-bold uppercase tracking-widest hover:text-white transition-all duration-300 cursor-pointer select-none"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          ADD TO BAG
                        </span>

                        {/* Trash Icon — with right breathing room */}
                        <button
                          type="button"
                          onClick={() => handleRemoveWishlistItem(prod)}
                          className="p-2 text-[#777777] hover:text-[#E53E3E] transition-colors cursor-pointer"
                          style={{ marginRight: "12px" }}
                          aria-label="Remove from wishlist"
                          title="Remove from wishlist"
                        >
                          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" className="transition-transform hover:scale-110">
                            <path d="M2 4h12" />
                            <path d="M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4" />
                            <path d="M3.5 4l.7 9.5a1 1 0 0 0 1 .9h5.6a1 1 0 0 0 1-.9L12.5 4" />
                            <line x1="6.5" y1="7" x2="6.5" y2="12" />
                            <line x1="9.5" y1="7" x2="9.5" y2="12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BagToast show={showBagToast} onClose={() => setShowBagToast(false)} message={bagToastMsg} />
      <WishlistToast show={showWishlistToast} onClose={() => setShowWishlistToast(false)} message={wishlistToastMsg} />
    </div>
  );
}
