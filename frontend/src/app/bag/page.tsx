"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCart, updateCartQuantity, deleteCartItem, clearCart, addToCart } from "@/utils/api";
import { getBagItems, saveBagItems } from "@/utils/bag";
import { BagItemSkeleton, ErrorState, EmptyState } from "@/components/UIState";
import { useToast } from "@/components/Toast";

export default function ShoppingBagPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast, success, error } = useToast();

  // Load cart directly from Laravel API
  const { data: cartData, isLoading, isError, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });

  // Automatically sync any items waiting in browser localStorage into Laravel MySQL API
  useEffect(() => {
    const localItems = getBagItems();
    if (localItems.length > 0 && cartData && cartData.total_quantity === 0) {
      Promise.all(
        localItems.map(async (item) => {
          await addToCart({
            slug: item.slug,
            name: item.name,
            color: item.color || "Obsidian Black",
            size: item.size || "M",
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

  // Mutation to delete item
  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteCartItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      success("Item removed from your shopping bag.", "SECTOR // REMOVED");
    },
    onError: (err: any) => {
      error(err.response?.data?.message || "Failed to remove item.");
    },
  });

  // Mutation to clear cart
  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      showToast("Shopping bag cleared completely.", "info", "VOlD // ATELIER");
    },
    onError: (err: any) => {
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
  const hasOutOfStockItem = items.some((item) => item.stock <= 0);
  const isCheckoutDisabled = items.length === 0 || hasOutOfStockItem || isLoading || isError;

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex flex-col selection:bg-[#FFFFFF] selection:text-[#0A0A0A]"
    >
      <Navbar />

      {/* FULL-WIDTH HEADER SECTION WITH EDGE-TO-EDGE BORDER LINE */}
      <div style={{ paddingTop: "140px" }} className="w-full border-b border-[#262626] pb-8">
        <div className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20">
          <div style={{ paddingLeft: "60px", paddingRight: "60px" }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#8A8A8A] uppercase block mb-2 font-bold">
                SECTOR // ATELIER VAULT
              </span>
              <h1 className="text-3xl lg:text-5xl font-extrabold uppercase tracking-[0.08em] text-white">
                SHOPPING BAG
              </h1>
            </div>
            <div className="text-right font-mono text-sm tracking-[0.15em] text-[#A0A0A0]">
              TOTAL ITEMS: <span className="text-white font-bold">{cartData?.total_quantity || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION BELOW THE FULL-WIDTH LINE */}
      <div className="flex-1 w-full max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20 py-16 pb-36">
        <div style={{ paddingLeft: "60px", paddingRight: "60px" }}>
          {isLoading ? (
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
            <div className="w-full flex flex-col items-center justify-center py-24 my-6">
              <EmptyState
                title="YOUR SHOPPING BAG IS EMPTY"
                message="No technical garments have been selected in your active session. Discover our iconic pieces and limited editions."
                actionText="RETURN TO CATALOG"
                actionHref="/shop"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pt-4">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-8 space-y-2">
              <div className="flex items-center justify-between pb-4 border-b border-[#222222] font-mono text-[11px] tracking-[0.2em] text-[#777777] uppercase">
                <span>GARMENT DETAILS // SPECIFICATIONS</span>
                <button
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  className="hover:text-white transition-colors uppercase font-bold cursor-pointer disabled:opacity-50"
                >
                  [CLEAR ALL ITEMS]
                </button>
              </div>

              {items.map((item) => {
                const isOutOfStock = item.stock <= 0;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 py-8 border-b border-[#262626] transition-opacity ${
                      updateMutation.isPending ? "opacity-70" : "opacity-100"
                    } ${isOutOfStock ? "bg-[#1A0C0C]/50 p-4 border border-[#441111]" : ""}`}
                  >
                    {/* Product Image */}
                    <Link href={`/product/${item.product_id}`} className="relative w-28 h-36 bg-[#171717] shrink-0 overflow-hidden border border-[#333333] group">
                      <Image
                        src={item.product_image || "/collection1.png"}
                        alt={item.product_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                      />
                    </Link>

                    {/* Details: Name, Category, Variant, Color, Size, Stock */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-[#1F1F1F] text-[#AAAAAA] border border-[#333333]">
                          {item.category}
                        </span>
                        {isOutOfStock && (
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 bg-[#881111] text-white font-extrabold animate-pulse">
                            OUT OF STOCK
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold tracking-[0.06em] text-white uppercase hover:text-[#D4AF37] transition-colors">
                        <Link href={`/product/${item.product_id}`}>{item.product_name}</Link>
                      </h3>

                      <div className="font-mono text-xs text-[#8A8A8A] uppercase tracking-wider space-x-3">
                        <span>COLOR: <strong className="text-[#EDEDED]">{item.color}</strong></span>
                        <span>//</span>
                        <span>SIZE: <strong className="text-[#EDEDED]">{item.size}</strong></span>
                        <span>//</span>
                        <span>STOCK: <strong className={item.stock > 3 ? "text-[#38A169]" : "text-[#E53E3E]"}>{item.stock} AVAIL</strong></span>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center gap-6 pt-3">
                        <div className="flex items-center border border-[#3A3A3A] bg-[#0E0E0E]">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock)}
                            disabled={updateMutation.isPending || item.quantity <= 1}
                            className="w-9 h-9 flex items-center justify-center text-sm font-mono text-[#CCCCCC] hover:bg-[#222] hover:text-white transition-colors disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-mono text-sm font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock)}
                            disabled={updateMutation.isPending || item.quantity >= item.stock}
                            className="w-9 h-9 flex items-center justify-center text-sm font-mono text-[#CCCCCC] hover:bg-[#222] hover:text-white transition-colors disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#777777] hover:text-[#E53E3E] transition-colors cursor-pointer"
                        >
                          [REMOVE]
                        </button>
                      </div>
                    </div>

                    {/* Price, Discount & Subtotal (All calculated by Backend) */}
                    <div className="text-left sm:text-right shrink-0 w-full sm:w-auto mt-2 sm:mt-0 space-y-1">
                      <p className="text-[11px] font-mono text-[#888888] uppercase tracking-widest">
                        UNIT: Rp {item.price.toLocaleString("id-ID")}
                      </p>
                      {item.discount > 0 && (
                        <p className="text-[11px] font-mono text-[#38A169] uppercase tracking-wider">
                          DISC: −Rp {item.discount.toLocaleString("id-ID")}
                        </p>
                      )}
                      <p className="text-base font-bold font-mono text-[#FFFFFF] tracking-wider pt-1">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Right Column: Sticky Summary */}
            <div className="lg:col-span-4 sticky top-36 p-8 bg-[#101010] border border-[#262626] shadow-2xl space-y-6">
              <h2 className="text-lg font-black uppercase tracking-[0.15em] text-white pb-4 border-b border-[#222222]">
                ATELIER BAG SUMMARY
              </h2>

              <div className="space-y-4 font-mono text-xs tracking-wider">
                <div className="flex justify-between text-[#B0B0B0]">
                  <span>TOTAL QUANTITY</span>
                  <span className="text-white font-bold">{cartData?.total_quantity || 0} PCS</span>
                </div>
                <div className="flex justify-between text-[#B0B0B0]">
                  <span>SUBTOTAL (EX. TAX)</span>
                  <span className="text-white font-bold">Rp {(cartData?.subtotal || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-[#8A8A8A] text-[11px]">
                  <span>SHIPPING & VAT</span>
                  <span>CALCULATED AT CHECKOUT</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#262626] flex justify-between items-baseline">
                <span className="font-mono text-sm font-bold tracking-widest text-[#CCCCCC]">
                  EST. TOTAL
                </span>
                <span className="font-mono text-xl font-extrabold text-[#D4AF37] tracking-wider">
                  Rp {(cartData?.subtotal || 0).toLocaleString("id-ID")}
                </span>
              </div>

              {hasOutOfStockItem && (
                <div className="p-4 bg-[#2A0A0A] border border-[#E53E3E]/50 text-[#FFAA88] font-mono text-xs uppercase tracking-wider text-center">
                  ⚠️ ONE OR MORE ITEMS IN YOUR BAG ARE OUT OF STOCK. PLEASE ADJUST QUANTITIES TO PROCEED.
                </div>
              )}

              <Link
                href={isCheckoutDisabled ? "#" : "/checkout"}
                className={`block w-full py-5 text-center font-bold text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-xl border ${
                  isCheckoutDisabled
                    ? "bg-[#222222] text-[#666666] border-[#333333] pointer-events-none cursor-not-allowed"
                    : "bg-[#FFFFFF] text-[#0A0A0A] border-[#FFFFFF] hover:bg-[#D4AF37] hover:text-[#0A0A0A] cursor-pointer"
                }`}
              >
                PROCEED TO CHECKOUT
              </Link>

              <p className="text-[11px] font-mono text-[#666666] text-center uppercase tracking-widest leading-normal pt-2">
                🔒 FULLY ENCRYPTED MIDTRANS TRANSACTIONS & BITESHIP LIVE TELEMETRY.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
