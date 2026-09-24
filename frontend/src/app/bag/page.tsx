"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCart, updateCartQuantity, deleteCartItem, clearCart, addToCart, getImageUrl, getProducts } from "@/utils/api";
import { getBagItems, saveBagItems } from "@/utils/bag";
import { BagItemSkeleton, ErrorState } from "@/components/UIState";
import { useToast } from "@/components/Toast";
import ProductCard from "@/components/ProductCard";

export default function ShoppingBagPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast, success, error } = useToast();

  const { data: realProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

  const currentToken = typeof window !== "undefined" ? localStorage.getItem("sector_madness_token") : null;
  const [editingQty, setEditingQty] = useState<Record<string | number, string>>({});
  const [mounted, setMounted] = useState(false);

  // Auto-scroll animation for mobile/tablet recommended products
  useEffect(() => {
    if (!mounted) return;
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes bagMarquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .animate-bag-marquee {
        animation: bagMarquee 20s linear infinite;
        will-change: transform;
      }
      .animate-bag-marquee:hover {
        animation-play-state: paused;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const userDataStr = localStorage.getItem("sector_madness_user");
        if (userDataStr) {
          const parsed = JSON.parse(userDataStr);
          const isAdminUser = parsed && (parsed.is_admin === true || parsed.isAdmin === true || parsed.role === "admin" || parsed.role === "administrator" || parsed.role === "Administrator");
          if (isAdminUser) {
            // Admin is strictly not allowed to use customer bag -> Redirect to Admin Control Panel
            router.replace("/admin");
          }
        }
      } catch {}
    }
  }, [router]);

  // Load cart directly from Laravel API with real-time sync
  const { data: cartData, isLoading, isError, refetch } = useQuery({
    queryKey: ["cart", currentToken ?? "guest"],
    queryFn: getCart,
    refetchInterval: currentToken ? 8000 : false,
    refetchOnWindowFocus: true,
    enabled: !!currentToken,
  });

  useEffect(() => {
    const handleBagUpdate = () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    };

    window.addEventListener("sector_bag_change", handleBagUpdate);
    window.addEventListener("sector_bag_update", handleBagUpdate);
    window.addEventListener("storage", handleBagUpdate);

    return () => {
      window.removeEventListener("sector_bag_change", handleBagUpdate);
      window.removeEventListener("sector_bag_update", handleBagUpdate);
      window.removeEventListener("storage", handleBagUpdate);
    };
  }, [refetch, queryClient]);

  // Automatically sync any items waiting in browser localStorage into Laravel MySQL API
  useEffect(() => {
    const localItems = getBagItems();
    if (localItems.length > 0 && cartData && cartData.total_quantity === 0) {
      Promise.all(
        localItems.map(async (item) => {
          await addToCart({
            slug: item.slug,
            name: item.name,
            color: (item.color && !["default", "none", "n/a", "null", ""].includes(item.color.toLowerCase())) ? item.color : undefined,
            size: (item.size && !["default", "none", "n/a", "null", ""].includes(item.size.toLowerCase())) ? item.size : undefined,
            quantity: item.quantity,
          }).catch(() => {});
        })
      ).then(() => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        saveBagItems([]);
      });
    }
  }, [cartData, refetch, queryClient]);

  // Mutation to update quantity
  const updateMutation = useMutation({
    mutationFn: ({ id, qty }: { id: number | string; qty: number }) =>
      updateCartQuantity(id, qty),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      success("Bag quantity updated automatically.", "PROTOCOL // UPDATE");
    },
    onError: (err: any) => {
      error(err.response?.data?.message || "Failed to update quantity against stock limits.");
    },
  });

  // Mutation to delete item (optimistic update — removes instantly from UI)
  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteCartItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["cart", currentToken ?? "guest"] });
      const previous = queryClient.getQueryData(["cart", currentToken ?? "guest"]);
      queryClient.setQueryData(["cart", currentToken ?? "guest"], (old: any) => {
        if (!old) return old;
        const removed = old.items.find((i: any) => String(i.id) === String(id));
        return {
          ...old,
          items: old.items.filter((item: any) => String(item.id) !== String(id)),
          total_quantity: Math.max(0, (old.total_quantity || 0) - (removed?.quantity || 0)),
        };
      });
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      success("Item removed from your shopping bag.", "SECTOR // REMOVED");
    },
    onError: (err: any, _id, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart", currentToken ?? "guest"], context.previous);
      }
      error(err.response?.data?.message || "Failed to remove item.");
    },
  });

  // Mutation to clear cart (optimistic update — clears instantly from UI)
  const clearMutation = useMutation({
    mutationFn: clearCart,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart", currentToken ?? "guest"] });
      const previous = queryClient.getQueryData(["cart", currentToken ?? "guest"]);
      queryClient.setQueryData(["cart", currentToken ?? "guest"], (old: any) => {
        if (!old) return old;
        return { ...old, items: [], total_quantity: 0 };
      });
      return { previous };
    },
    onSuccess: () => {
      // Delay invalidation so Laravel queue finishes before the next background poll fires
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }, 2500);
      showToast("Shopping bag cleared completely.", "info", "VOID // ATELIER");
    },
    onError: (err: any, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart", currentToken ?? "guest"], context.previous);
      }
      error(err.response?.data?.message || "Failed to clear bag.");
    },
  });

  const handleQuantityChange = (id: number | string, newQty: number, maxStock: number) => {
    if (newQty <= 0) {
      deleteMutation.mutate(id);
      return;
    }
    if (newQty > maxStock) {
      error(`Cannot exceed maximum available stock (${maxStock} items).`);
      return;
    }
    updateMutation.mutate({ id, qty: newQty });
  };

  const items = cartData?.items || [];
  const hasOutOfStockItem = items.some((item: any) => item.stock <= 0);
  const isCheckoutDisabled = items.length === 0 || hasOutOfStockItem || isLoading || isError;

  const recommendedProducts = React.useMemo(() => {
    return (realProducts || [])
      .filter((product: any) => {
        const isOutOfStock = product.variants && Array.isArray(product.variants)
          ? product.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0) <= 0
          : false;
        return !isOutOfStock;
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        if (dateB !== dateA) return dateB - dateA;
        const soldA = a.sales_count || a.sold_count || 0;
        const soldB = b.sales_count || b.sold_count || 0;
        return soldB - soldA;
      })
      .slice(0, 4);
  }, [realProducts]);

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex flex-col selection:bg-[#FFFFFF] selection:text-[#0A0A0A]"
    >
      <Navbar />

      {/* FULL-WIDTH HEADER SECTION WITH EDGE-TO-EDGE BORDER LINE */}
      <div style={{ paddingTop: "140px" }} className="w-full border-b border-[#262626] pb-8">
        <div className="max-w-[1480px] mx-auto w-full" style={{ paddingLeft: "clamp(20px, 6vw, 60px)", paddingRight: "clamp(20px, 6vw, 60px)" }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Left Column: Breadcrumb & Title */}
            <div>
              {/* Breadcrumb Navigation replacing SECTOR // ATELIER VAULT */}
              <div className="flex items-center gap-2.5 text-xs md:text-sm font-mono tracking-[0.2em] uppercase mb-3 font-bold">
                <Link
                  href="/"
                  className="group text-[#A0A0A0] hover:text-white transition-colors font-bold flex items-center gap-1.5 py-1 pr-2 -ml-1 rounded cursor-pointer"
                >
                  <span className="text-base leading-none transition-transform duration-300 group-hover:-translate-x-1">
                    ←
                  </span>
                  <span>HOME</span>
                </Link>
                <span className="text-[#555555]">//</span>
                <span className="text-white font-bold">SHOPPING BAG</span>
              </div>

              <h1 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 600 }} className="text-3xl lg:text-5xl uppercase tracking-[0.08em] text-white">
                SHOPPING BAG
              </h1>
            </div>

            {/* Right Column: Total Items Count */}
            <div className="font-mono text-sm tracking-[0.15em] text-[#A0A0A0] shrink-0 whitespace-nowrap md:text-right pb-1">
              TOTAL ITEMS: <span className="text-white font-bold ml-1">{cartData?.total_quantity || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION BELOW THE FULL-WIDTH LINE */}
      <div className="flex-1 w-full max-w-[1480px] mx-auto py-16 pb-36" style={{ paddingLeft: "clamp(20px, 6vw, 60px)", paddingRight: "clamp(20px, 6vw, 60px)" }}>
        <div className="w-full">
          {!mounted || isLoading ? (
            <div className="space-y-6 pt-2">
              <BagItemSkeleton />
              <BagItemSkeleton />
              <BagItemSkeleton />
            </div>
          ) : isError ? (
            <div className="w-full flex flex-col items-center justify-center py-24 my-6">
              <ErrorState
                title="FAILED TO CONNECT TO LARAVEL CART API"
                message="We encountered an interruption while fetching your bag records from the Sector Madness archive server."
                onRetry={() => refetch()}
              />
            </div>
          ) : items.length === 0 ? (
            <div className="w-full flex flex-col items-center pt-16 pb-8">
              {/* Empty Bag Icon & Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center mb-40"
              >
                {/* Shopping Bag SVG Icon */}
                <div className="mb-8">
                  <svg
                    width="80"
                    height="80"
                    viewBox="0 0 80 80"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#3A3A3A]"
                  >
                    <path
                      d="M20 26H60L58 68H22L20 26Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M30 26V22C30 16.4772 34.4772 12 40 12C45.5228 12 50 16.4772 50 22V26"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="26"
                      y1="38"
                      x2="54"
                      y2="38"
                      stroke="currentColor"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  </svg>
                </div>

                <h2 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 600 }} className="text-xl md:text-2xl uppercase tracking-[0.15em] text-white mb-8">
                  YOUR SHOPPING BAG IS EMPTY
                </h2>
                <Link
                  href="/shop"
                  className="group/cta inline-flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.25em] text-[#AAAAAA] hover:text-white transition-colors duration-300 no-underline"
                >
                  RETURN TO CATALOG
                  <span className="inline-block transition-transform duration-300 group-hover/cta:translate-x-2">→</span>
                </Link>
              </motion.div>

              {/* Recommended Products */}
              <div className="w-full max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-px flex-1 bg-[#262626]" />
                  <span className="text-[11px] font-mono tracking-[0.25em] text-[#666666] uppercase whitespace-nowrap">
                    RECOMMENDED FOR YOU
                  </span>
                  <div className="h-px flex-1 bg-[#262626]" />
                </div>

                {/* Responsive Grid (All Devices) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-5 lg:gap-y-12">
                  {recommendedProducts.map((product: any, idx: number) => {
                    const outOfStock = false; // Already filtered out

                    return (
                      <motion.div
                        key={`desktop-${product.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.15 * idx }}
                      >
                        <ProductCard
                          index={idx}
                          slug={product.slug}
                          name={product.name}
                          collection={product.collection || "The Atelier Series"}
                          collectionCode={product.collection_code || product.collection || "SECTOR 001"}
                          material={product.material || "Technical Blend"}
                          weight={product.weight || "450 GSM"}
                          price={typeof product.price === 'number' ? (product.price < 1000 ? product.price * 1000 : product.price) : 285000}
                          originalPrice={product.original_price ? (product.original_price < 1000 ? product.original_price * 1000 : product.original_price) : undefined}
                          discountPercentage={product.discount_percentage}
                          discountExpiresAt={product.discount_expires_at}
                          isFlashSale={product.is_flash_sale}
                          image={product.image || "/images/products/product-1.png"}
                          limited={Boolean(product.limited)}
                          outOfStock={outOfStock}
                        />
                      </motion.div>
                    );
                  })}
                </div>

              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start pt-4">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-8">
              <div
                style={{
                  paddingTop: "15px",
                  paddingBottom: "20px",
                  marginTop: "12px",
                  marginBottom: "15px",
                  borderBottom: "1px solid #222222",
                }}
                className="flex items-center justify-between font-mono text-[12px] font-bold tracking-[0.2em] text-[#999999] uppercase"
              >
                <span>ITEMS IN YOUR BAG</span>
                <button
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  className="flex items-center gap-2 hover:text-[#FF6666] transition-colors uppercase cursor-pointer disabled:opacity-50 font-bold border-0 bg-transparent p-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  <span>CLEAR ALL</span>
                </button>
              </div>

              <div>
              {items.map((item, idx) => {
                const productName = item.product_name || "Technical Garment";
                const matchingProduct = (realProducts && realProducts.length > 0 ? realProducts : []).find(
                  (p: any) =>
                    (item as any).slug === p.slug ||
                    (p.name && p.name.toLowerCase() === productName.toLowerCase()) ||
                    String(p.id) === String(item.product_id) ||
                    String(p.id).padStart(3, "0") === String(item.product_id).padStart(3, "0")
                );

                const itemCategory = (item.category || "T-SHIRT").toUpperCase();
                const hasColor =
                  item.color &&
                  !["default", "none", "n/a", "null", "undefined", ""].includes(
                    item.color.trim().toLowerCase()
                  );
                const hasSize =
                  item.size &&
                  !["default", "none", "n/a", "null", "undefined", "one size", "onsize", ""].includes(
                    item.size.trim().toLowerCase()
                  );

                let displayStock = item.stock;
                if (matchingProduct && Array.isArray(matchingProduct.variants)) {
                  if (hasColor) {
                    const variant = matchingProduct.variants.find((v: any) => 
                      v.color?.toLowerCase() === item.color.trim().toLowerCase() &&
                      v.size?.toLowerCase() === (item.size || "").trim().toLowerCase()
                    );
                    if (variant && typeof variant.stock === 'number') {
                      displayStock = variant.stock;
                    }
                  } else {
                    const sizeVariants = matchingProduct.variants.filter((v: any) => 
                      v.size?.toLowerCase() === (item.size || "").trim().toLowerCase()
                    );
                    if (sizeVariants.length > 0) {
                      displayStock = sizeVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
                    }
                  }
                }
                const isOutOfStock = displayStock <= 0;
                const rawImage =
                  item.product_image && item.product_image.trim() !== ""
                    ? item.product_image
                    : matchingProduct?.image || "/images/products/product-1.png";
                const imageSrc = getImageUrl(rawImage);
                const productSlug = (item as any).slug || matchingProduct?.slug || item.product_id;
                const productLink = `/product/${productSlug}`;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className={`transition-opacity ${
                      updateMutation.isPending ? "opacity-70" : "opacity-100"
                    } ${isOutOfStock ? "bg-[#1A0C0C]/30 p-6 rounded-none" : ""}`}
                    style={{
                      paddingTop: '20px',
                      paddingBottom: '35px',
                      borderBottom: idx !== items.length - 1 ? '1px solid #222222' : 'none'
                    }}
                  >
                    <div className="grid grid-cols-[90px_1fr] sm:grid-cols-[110px_1fr] gap-x-4 gap-y-5 sm:gap-x-7 sm:gap-y-0">
                      {/* Product Image */}
                      <Link href={productLink} className="relative w-full aspect-[3/4] bg-[#141414] overflow-hidden border border-[#262626] group sm:row-span-2">
                        <Image
                          src={imageSrc}
                          alt={productName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Details & Price Column */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 min-w-0">
                        <div className="space-y-1 sm:space-y-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase text-[#888888]">
                              {itemCategory}
                            </span>
                            {isOutOfStock && (
                              <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.2em] uppercase bg-[#881111] text-white px-2 py-0.5 font-bold">
                                OUT OF STOCK
                              </span>
                            )}
                          </div>

                          <h3 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 600 }} className="text-[13px] sm:text-base tracking-wide text-white uppercase hover:text-[#8A8A8A] transition-colors leading-snug">
                            <Link href={productLink}>{productName}</Link>
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 text-[10px] sm:text-xs font-mono text-[#888888] tracking-wider pt-0.5 sm:pt-1">
                            {hasColor && (
                              <>
                                <span>COLOR: <strong className="text-[#EDEDED] font-normal">{item.color}</strong></span>
                                <span className="text-[#333333]">|</span>
                              </>
                            )}
                            {hasSize && (
                              <>
                                <span>SIZE: <strong className="text-[#EDEDED] font-normal">{item.size}</strong></span>
                                <span className="text-[#333333]">|</span>
                              </>
                            )}
                            <span className="text-[#FFFFFF] font-medium">
                              <strong className="text-white font-bold">{Math.max(0, displayStock - item.quantity)}</strong> IN STOCK
                            </span>
                          </div>
                        </div>

                        {/* Price block */}
                        <div className="text-left sm:text-right shrink-0 space-y-0.5 sm:space-y-1 pt-1 sm:pt-0">
                          {/* TOP: Final Discounted Subtotal Price */}
                          <p className="text-[13px] sm:text-base font-bold font-mono text-white tracking-wide">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </p>

                          {/* BOTTOM: Normal / Original Price (strike-through) */}
                          {item.discount > 0 && (
                            <p className="text-[10px] sm:text-[11px] font-mono text-[#777777] line-through tracking-wider">
                              Rp {((item.original_price || (item.price + item.discount)) * item.quantity).toLocaleString("id-ID")}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Area: Quantity Selector & Trash Icon perfectly aligned on same row */}
                      <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:mt-auto sm:pt-6 pt-2 border-t sm:border-none border-[#1C1C1C]">
                        <div className="flex items-center border border-[#3A3A3A] bg-[#0E0E0E]">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1, displayStock)}
                            disabled={updateMutation.isPending || item.quantity <= 1}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm font-mono text-[#CCCCCC] hover:bg-[#222] hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            −
                          </button>
                          {(() => {
                            const displayQty = editingQty[item.id] !== undefined ? editingQty[item.id] : String(item.quantity);
                            return (
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={displayQty}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "" || /^\d+$/.test(val)) {
                                    setEditingQty((prev: Record<string | number, string>) => ({ ...prev, [item.id]: val }));
                                  }
                                }}
                                onBlur={() => {
                                  const rawVal = editingQty[item.id];
                                  if (rawVal !== undefined) {
                                    const parsed = parseInt(rawVal, 10);
                                    setEditingQty((prev: Record<string | number, string>) => {
                                      const copy = { ...prev };
                                      delete copy[item.id];
                                      return copy;
                                    });
                                    if (!isNaN(parsed) && parsed > 0 && parsed !== item.quantity) {
                                      handleQuantityChange(item.id, Math.min(parsed, displayStock), displayStock);
                                    }
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                className="w-10 sm:w-12 text-center font-mono text-xs sm:text-sm font-bold text-white bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0"
                              />
                            );
                          })()}
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1, displayStock)}
                            disabled={updateMutation.isPending || item.quantity >= displayStock}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm font-mono text-[#CCCCCC] hover:bg-[#222] hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Trash Icon aligned far right with price & quantity */}
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-[#777777] hover:text-[#E53E3E] transition-colors cursor-pointer disabled:opacity-40"
                          aria-label="Remove item"
                          title="Remove item"
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
                  </motion.div>
                );
              })}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-12">
                <Link
                  href="/shop"
                  className="group/shop inline-flex items-center gap-3 font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#888888] hover:text-[#FFFFFF] transition-colors duration-300 no-underline"
                >
                  CONTINUE SHOPPING
                  <span className="inline-block transition-transform duration-300 group-hover/shop:translate-x-2">→</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Sticky Summary */}
            <div className="lg:col-span-4 sticky top-36">
              <style dangerouslySetInnerHTML={{__html: `
                @media (max-width: 1023px) {
                  .os-box { padding: 24px !important; }
                  .os-title { margin-bottom: 16px !important; font-size: 16px !important; }
                  .os-divider { margin-bottom: 20px !important; }
                  .os-line-items { gap: 16px !important; margin-bottom: 20px !important; }
                  .os-total { margin-bottom: 24px !important; }
                  .os-buttons { gap: 12px !important; margin-bottom: 24px !important; }
                  .os-btn { padding: 14px 0 !important; }
                }
              `}} />

              <div 
                className="bg-[#090909] text-white shadow-2xl os-box" 
                style={{ 
                  padding: '48px 40px', 
                  border: '1px solid #1D1D1D',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Title */}
                <h2 
                  className="uppercase text-white text-lg tracking-[0.2em] os-title" 
                  style={{ marginBottom: '24px', letterSpacing: '0.2em', fontFamily: "'Roboto', sans-serif", fontWeight: 600 }}
                >
                  ORDER SUMMARY
                </h2>

                {/* Top Divider */}
                <div className="os-divider" style={{ height: '1px', backgroundColor: '#1C1C1C', width: '100%', marginBottom: '32px' }} />

                {/* Line Items */}
                <div className="os-line-items" style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '36px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="font-mono uppercase text-[13px]" style={{ color: '#888888', letterSpacing: '0.15em' }}>
                      SUBTOTAL
                    </span>
                    <span className="font-mono font-semibold text-[15px] text-white tracking-wider">
                      Rp {(cartData?.subtotal || 0).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className="font-mono uppercase text-[13px]" style={{ color: '#888888', letterSpacing: '0.15em', lineHeight: '1.6' }}>
                      ESTIMATED<br />SHIPPING
                    </span>
                    <span className="font-mono uppercase text-[13px] font-medium text-right" style={{ color: '#FFFFFF', letterSpacing: '0.15em', lineHeight: '1.6' }}>
                      CALCULATED<br />AT CHECKOUT
                    </span>
                  </div>
                </div>

                {/* Middle Divider */}
                <div className="os-divider" style={{ height: '1px', backgroundColor: '#1C1C1C', width: '100%', marginBottom: '28px' }} />

                {/* Total */}
                <div className="os-total" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                  <span className="font-mono text-base font-extrabold uppercase text-white" style={{ letterSpacing: '0.2em' }}>
                    TOTAL
                  </span>
                  <span className="font-mono text-2xl font-extrabold text-white tracking-wider">
                    Rp {(cartData?.subtotal || 0).toLocaleString("id-ID")}
                  </span>
                </div>

                {hasOutOfStockItem && (
                  <div 
                    className="bg-[#2A0A0A] text-[#FFAA88] font-mono text-xs uppercase text-center" 
                    style={{ padding: '16px', border: '1px solid rgba(229, 62, 62, 0.5)', marginBottom: '32px', letterSpacing: '0.1em' }}
                  >
                    ⚠️ OUT OF STOCK ITEMS IN BAG. ADJUST QUANTITIES TO PROCEED.
                  </div>
                )}

                {/* Buttons */}
                <div className="os-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  <Link
                    href={isCheckoutDisabled ? "#" : "/checkout"}
                    className={`os-btn w-full font-mono text-[12px] font-bold uppercase transition-all duration-300 ${
                      isCheckoutDisabled
                        ? "bg-[#1A1A1A] text-[#555555] pointer-events-none cursor-not-allowed"
                        : "bg-white text-[#0A0A0A] hover:bg-[#E0E0E0] cursor-pointer"
                    }`}
                    style={{ padding: '18px 0', textAlign: 'center', letterSpacing: '0.25em', display: 'block', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                  >
                    PROCEED TO CHECKOUT
                  </Link>

                  <Link
                    href="/shop"
                    className="os-btn w-full font-mono text-[12px] font-bold uppercase bg-[#0D0D0D] text-white transition-all duration-300 hover:border-white"
                    style={{ padding: '18px 0', textAlign: 'center', letterSpacing: '0.25em', display: 'block', border: '1px solid #2B2B2B' }}
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>

                {/* Bottom Protocol Divider & Footer */}
                <div style={{ height: '1px', backgroundColor: '#1C1C1C', width: '100%', marginBottom: '24px' }} />
                <p className="font-mono uppercase text-center block w-full" style={{ color: '#555555', fontSize: '9px', letterSpacing: '0.12em', margin: 0, whiteSpace: 'nowrap' }}>
                  SECURE ATELIER ENCRYPTION // PROTOCOL 01
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
