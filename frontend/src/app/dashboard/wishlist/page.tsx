"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getWishlist, removeFromWishlist, addToCart, getProducts, getImageUrl, type WishlistItem } from "@/utils/api";
import { products, getVariantStock } from "@/data/products";
import BagToast from "@/components/BagToast";
import WishlistToast from "@/components/WishlistToast";
import CountdownTimer from "@/components/CountdownTimer";

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const [showBagToast, setShowBagToast] = useState(false);
  const [bagToastMsg, setBagToastMsg] = useState("");
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [wishlistToastMsg, setWishlistToastMsg] = useState("");
  const [wishlistToastActionHref, setWishlistToastActionHref] = useState("/dashboard/wishlist");
  const [wishlistToastActionText, setWishlistToastActionText] = useState("VIEW WISHLIST");

  const { data: apiProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: wishlistData = [], refetch } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const handleWishlistUpdate = () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    };

    window.addEventListener("sector_wishlist_change", handleWishlistUpdate);
    window.addEventListener("storage", handleWishlistUpdate);

    return () => {
      window.removeEventListener("sector_wishlist_change", handleWishlistUpdate);
      window.removeEventListener("storage", handleWishlistUpdate);
    };
  }, [refetch, queryClient]);

  const wishlistProducts = wishlistData;

  const handleMoveWishlistItemToBag = async (product: WishlistItem) => {
    try {
      await addToCart({
        product_id: product.product_id,
        quantity: 1,
        size: product.size || "M",
        color: (product.color && !["default", "none", "n/a", "null", ""].includes(product.color.toLowerCase())) ? product.color : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
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
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      setWishlistToastMsg(`"${prod.name}" removed from Wishlist.`);
      setWishlistToastActionHref("/dashboard/wishlist");
      setWishlistToastActionText("VIEW WISHLIST");
      setShowWishlistToast(true);
    } catch {
      setWishlistToastMsg("Failed to remove product. Please try again.");
      setWishlistToastActionHref("/dashboard/wishlist");
      setWishlistToastActionText("VIEW WISHLIST");
      setShowWishlistToast(true);
    }
  };

  return (
    <div className="bg-[#141414] border border-white/[0.08] p-8 md:p-10 lg:p-12 space-y-8 shadow-2xl">
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 639px) {
          .wishlist-details-col {
            padding-left: 12px !important;
          }
        }
      `}} />
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
              // Match against API & local product catalog for accurate image, price, and discount fields
              const matchedApiProduct = apiProducts.find(
                (p) => p.id === Number(prod.product_id) || p.slug === prod.slug || p.name === prod.name
              );
              const staticProduct = products.find(
                (p) =>
                  parseInt(p.id, 10) === Number(prod.product_id) ||
                  p.slug === prod.slug ||
                  p.name === prod.name
              );

              // Resolve image: prefer API product image, prepend backend URL for /storage/ paths
              const rawImage = matchedApiProduct?.image || staticProduct?.image || prod.image || "/images/campaign/campaign-1.png";
              const resolvedImage = getImageUrl(rawImage);
              const rawPrice = matchedApiProduct?.price ?? staticProduct?.price ?? prod.price ?? 0;
              const resolvedPrice = typeof rawPrice === 'number' ? (rawPrice < 1000 ? rawPrice * 1000 : rawPrice) : 285000;
              const rawOriginalPrice = matchedApiProduct?.original_price ?? staticProduct?.originalPrice;
              const originalPrice = rawOriginalPrice ? (rawOriginalPrice < 1000 ? rawOriginalPrice * 1000 : rawOriginalPrice) : undefined;
              const discountPercentage = matchedApiProduct?.discount_percentage ?? staticProduct?.discountPercentage;
              const discountExpiresAt = matchedApiProduct?.discount_expires_at ?? staticProduct?.discountExpiresAt;
              const resolvedName = matchedApiProduct?.name || staticProduct?.name || prod.name;
              const productLink = matchedApiProduct ? `/product/${matchedApiProduct.slug}` : (staticProduct ? `/product/${staticProduct.slug}` : `/product/${prod.slug || prod.product_id}`);
              const itemCategory = (prod.category || matchedApiProduct?.collection_code || staticProduct?.collectionCode || "T-SHIRT").toUpperCase();

              // Real-time stock: prefer API variant stock, then wishlist API stock, then static as last resort
              const resolvedStock: number | null = (() => {
                // 1. From wishlist API response (already variant-aware from backend)
                if (prod.stock_quantity !== null && prod.stock_quantity !== undefined) return prod.stock_quantity;
                // 2. From matched API product stock
                if (matchedApiProduct?.stock !== null && matchedApiProduct?.stock !== undefined) return matchedApiProduct.stock;
                // 3. Static product variant stock
                if (staticProduct) return getVariantStock(staticProduct.slug, prod.color || null, prod.size || null);
                return null;
              })();

              const isSoldOut = resolvedStock !== null && resolvedStock !== undefined ? resolvedStock <= 0 : !prod.in_stock;

              return (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  style={{
                    paddingTop: "24px",
                    paddingBottom: "24px",
                    marginBottom: "0px",
                    borderBottom: idx !== wishlistProducts.length - 1 ? "1px solid #222222" : "none",
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start" style={{ gap: "28px" }}>
                    {/* Product Image — with left breathing room */}
                    {prod.is_available === false ? (
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          setWishlistToastMsg("This product is no longer available in the catalog.");
                          setWishlistToastActionHref("/shop");
                          setWishlistToastActionText("RETURN TO SHOP");
                          setShowWishlistToast(true);
                        }}
                        className="relative w-[110px] h-[145px] bg-[#141414] shrink-0 overflow-hidden border border-[#262626] group cursor-pointer"
                        style={{ marginLeft: "12px" }}
                      >
                        <Image
                          src={resolvedImage}
                          alt={resolvedName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
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
                    )}

                    {/* Details & Controls Column */}
                    <div className="wishlist-details-col flex-1 min-w-0 flex flex-col justify-between self-stretch w-full">
                      {/* Top: Info & Price */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#888888]">
                              {itemCategory}
                            </span>
                            {discountExpiresAt && (
                              <CountdownTimer expiresAt={discountExpiresAt} compact />
                            )}
                            {!prod.in_stock && (
                              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#FF6666]">
                                OUT OF STOCK
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold tracking-wide text-white uppercase hover:text-[#D4AF37] transition-colors">
                            {prod.is_available === false ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setWishlistToastMsg("This product is no longer available in the catalog.");
                                  setWishlistToastActionHref("/shop");
                                  setWishlistToastActionText("RETURN TO SHOP");
                                  setShowWishlistToast(true);
                                }}
                                className="uppercase border-none bg-transparent cursor-pointer text-inherit font-inherit p-0 text-left"
                              >
                                {resolvedName}
                              </button>
                            ) : (
                              <Link href={productLink}>{resolvedName}</Link>
                            )}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#888888] tracking-wider pt-1">
                            {prod.color && !["default", "none", "n/a", "null", "undefined", ""].includes(prod.color.trim().toLowerCase()) && (
                              <>
                                <span>
                                  COLOR: <strong className="text-[#EDEDED] font-normal">{prod.color}</strong>
                                </span>
                                <span className="text-[#333333]">|</span>
                              </>
                            )}
                            <span>
                              SIZE: <strong className="text-[#EDEDED] font-normal">{prod.size || "—"}</strong>
                            </span>
                            <span className="text-[#333333]">|</span>
                            {prod.is_available === false ? (
                              <strong className="text-[#777777] font-bold">UNAVAILABLE</strong>
                            ) : isSoldOut ? (
                              <strong className="text-[#FF6666] font-bold">SOLD OUT</strong>
                            ) : (
                              <span className="text-[#B6A47E] font-medium">
                                {resolvedStock !== null && resolvedStock !== undefined ? (
                                  <><strong className="text-white font-bold">{resolvedStock}</strong> UNITS IN STOCK</>
                                ) : (
                                  <strong className="text-white font-bold">AVAILABLE IN STOCK</strong>
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price Section */}
                        <div className="text-left sm:text-right shrink-0 flex flex-col items-start sm:items-end gap-0.5" style={{ paddingRight: "12px" }}>
                          {/* Top: Promo / Discounted Price (BOLD) */}
                          <p className="text-base font-bold font-mono text-white tracking-wide">
                            Rp {(resolvedPrice).toLocaleString("id-ID")}
                          </p>

                          {/* Bottom: Normal / Original Price (NOT BOLD, CROSSED OUT) */}
                          {originalPrice && originalPrice > resolvedPrice && (
                            <span className="text-xs font-mono font-normal text-[#888888] line-through">
                              Rp {(originalPrice).toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom: Add to Bag & Remove */}
                      <div className={`flex items-center mt-8 pt-2 ${(isSoldOut || prod.is_available === false) ? 'justify-between' : 'justify-between'}`}>
                        {/* Add to Bag — styled inline like Shopping Bag (no button element) */}
                        {prod.is_available === false ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 text-[#777777] font-mono text-[11px] font-bold uppercase tracking-widest select-none cursor-not-allowed">
                            PRODUCT UNAVAILABLE
                          </span>
                        ) : !isSoldOut ? (
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
                        ) : (
                          <div /> // Placeholder to keep Trash Icon on the right if sold out
                        )}

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
      <WishlistToast show={showWishlistToast} onClose={() => setShowWishlistToast(false)} message={wishlistToastMsg} actionHref={wishlistToastActionHref} actionText={wishlistToastActionText} />
    </div>
  );
}
