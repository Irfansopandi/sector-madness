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
import { BagItemSkeleton, ErrorState } from "@/components/UIState";
import { useToast } from "@/components/Toast";
import { products } from "@/data/products";

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

                <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.15em] text-white mb-8">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-12">
                  {products.slice(0, 3).map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 * idx }}
                    >
                      <Link
                        href={`/product/${product.slug}`}
                        className="group block"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#161616] mb-5">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          />
                          {product.limited && (
                            <div className="absolute top-4 left-4">
                              <span className="text-[9px] tracking-[0.2em] uppercase text-[#B6A47E]">
                                Limited Release
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                          <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                            <span className="text-[10px] tracking-[0.2em] uppercase text-[#F5F5F5]">
                              View Product →
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] tracking-[0.25em] uppercase text-[#8A8A8A] block">
                            {product.collectionCode}
                          </span>
                          <h3 className="text-[14px] md:text-[15px] text-[#E0E0E0] font-light tracking-wide">
                            {product.name}
                          </h3>
                          <p className="text-[11px] text-[#666666] font-light">
                            {product.material} · {product.weight}
                          </p>
                          <p className="text-[13px] text-[#CCCCCC] font-light pt-1">
                            Rp {(product.price * 15000).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start pt-4">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between pb-6 border-b border-[#222222] font-mono text-[10px] tracking-[0.2em] text-[#666666] uppercase">
                <span>ITEMS IN YOUR BAG</span>
                <button
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  className="hover:text-white transition-colors uppercase cursor-pointer disabled:opacity-50"
                >
                  CLEAR ALL
                </button>
              </div>

              <div>
              {items.map((item, idx) => {
                const isOutOfStock = item.stock <= 0;
                // Perfectly match against frontend catalog (@/data/products) to ensure authentic name, image, and link
                const staticProduct = products.find(
                  (p) => parseInt(p.id, 10) === Number(item.product_id) || p.slug === (item as any).slug || p.name === item.product_name
                );
                const productName = staticProduct ? staticProduct.name : item.product_name;
                const imageSrc = staticProduct ? staticProduct.image : (item.product_image || "/collection1.png");
                const productLink = staticProduct ? `/product/${staticProduct.slug}` : `/product/${item.product_id}`;

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
                      paddingBottom: '40px',
                      marginBottom: '40px',
                      borderBottom: idx !== items.length - 1 ? '1px solid #222222' : 'none'
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-start" style={{ gap: '28px' }}>
                      {/* Product Image */}
                      <Link href={productLink} className="relative w-[110px] h-[145px] bg-[#141414] shrink-0 overflow-hidden border border-[#262626] group">
                        <Image
                          src={imageSrc}
                          alt={productName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Details & Controls Column (beside image) */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch w-full">
                        {/* Top Area: Info & Price in ONE row */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              {item.category && (
                                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#888888]">
                                  {item.category}
                                </span>
                              )}
                              {isOutOfStock && (
                                <span className="text-[10px] font-mono tracking-[0.2em] uppercase bg-[#881111] text-white px-2 py-0.5 font-bold">
                                  OUT OF STOCK
                                </span>
                              )}
                            </div>

                            <h3 className="text-base font-bold tracking-wide text-white uppercase hover:text-[#D4AF37] transition-colors">
                              <Link href={productLink}>{productName}</Link>
                            </h3>

                            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#888888] tracking-wider pt-1">
                              <span>COLOR: <strong className="text-[#EDEDED] font-normal">{item.color}</strong></span>
                              <span className="text-[#333333]">|</span>
                              <span>SIZE: <strong className="text-[#EDEDED] font-normal">{item.size}</strong></span>
                              <span className="text-[#333333]">|</span>
                              <span className="text-[#B6A47E] font-medium bg-[#141414] px-2 py-0.5 border border-[#262626]">
                                REMAINING STOCK: <strong className="text-white font-bold">{Math.max(0, item.stock - item.quantity)} UNITS</strong>
                              </span>
                            </div>
                          </div>

                          {/* Price block */}
                          <div className="text-left sm:text-right shrink-0 space-y-1">
                            {item.discount > 0 && (
                              <p className="text-[11px] font-mono text-[#38A169] tracking-wider">
                                −Rp {item.discount.toLocaleString("id-ID")}
                              </p>
                            )}
                            <p className="text-base font-bold font-mono text-white tracking-wide">
                              Rp {item.subtotal.toLocaleString("id-ID")}
                            </p>
                            <p className="text-[11px] font-mono text-[#666666] tracking-wider">
                              Rp {item.price.toLocaleString("id-ID")} each
                            </p>
                          </div>
                        </div>

                        {/* Bottom Area: Quantity Selector & Trash Icon perfectly aligned on same row */}
                        <div className="flex items-center justify-between mt-8 pt-2">
                          <div className="flex items-center border border-[#3A3A3A] bg-[#0E0E0E]">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock)}
                              disabled={updateMutation.isPending || item.quantity <= 1}
                              className="w-9 h-9 flex items-center justify-center text-sm font-mono text-[#CCCCCC] hover:bg-[#222] hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                            >
                              −
                            </button>
                            <span className="w-11 text-center font-mono text-sm font-bold text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock)}
                              disabled={updateMutation.isPending || item.quantity >= item.stock}
                              className="w-9 h-9 flex items-center justify-center text-sm font-mono text-[#CCCCCC] hover:bg-[#222] hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
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
                    </div>
                  </motion.div>
                );
              })}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-12">
                <Link
                  href="/shop"
                  className="group/shop inline-flex items-center gap-3 font-mono text-xs font-bold tracking-[0.2em] uppercase text-[#888888] hover:text-[#D4AF37] transition-colors duration-300 no-underline"
                >
                  CONTINUE SHOPPING
                  <span className="inline-block transition-transform duration-300 group-hover/shop:translate-x-2">→</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Sticky Summary */}
            <div className="lg:col-span-4 sticky top-36">
              <div 
                className="bg-[#090909] text-white shadow-2xl" 
                style={{ 
                  padding: '48px 40px', 
                  border: '1px solid #1D1D1D',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Title */}
                <h2 
                  className="font-serif uppercase font-bold text-white text-lg tracking-[0.2em]" 
                  style={{ marginBottom: '24px', letterSpacing: '0.2em' }}
                >
                  ORDER SUMMARY
                </h2>

                {/* Top Divider */}
                <div style={{ height: '1px', backgroundColor: '#1C1C1C', width: '100%', marginBottom: '32px' }} />

                {/* Line Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '36px' }}>
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
                    <span className="font-mono uppercase text-[13px] font-medium text-right" style={{ color: '#C6A875', letterSpacing: '0.15em', lineHeight: '1.6' }}>
                      CALCULATED<br />AT CHECKOUT
                    </span>
                  </div>
                </div>

                {/* Middle Divider */}
                <div style={{ height: '1px', backgroundColor: '#1C1C1C', width: '100%', marginBottom: '28px' }} />

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                  <Link
                    href={isCheckoutDisabled ? "#" : "/checkout"}
                    className={`w-full font-mono text-[12px] font-bold uppercase transition-all duration-300 ${
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
                    className="w-full font-mono text-[12px] font-bold uppercase bg-[#0D0D0D] text-white transition-all duration-300 hover:border-white"
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
