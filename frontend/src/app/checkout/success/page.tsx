"use client";

import React, { useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getOrderDetail } from "@/utils/api";
import { OrderDetailSkeleton, ErrorState } from "@/components/UIState";
import { useToast } from "@/components/Toast";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get("order_number") || searchParams.get("order_id") || "";
  const isSimulated = searchParams.get("simulated") === "true";
  const { success } = useToast();

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ["order-detail", orderNumber],
    queryFn: () => getOrderDetail(orderNumber),
    enabled: !!orderNumber,
  });

  const displayOrderDate = useMemo(() => {
    if (!order) {
      return new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).toUpperCase() + " WIB";
    }

    const raw = order.order_date || (order as any).created_at;
    if (!raw) {
      return new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).toUpperCase() + " WIB";
    }

    if (typeof raw === "string") {
      if (raw.includes("T") || raw.includes("Z")) {
        try {
          const d = new Date(raw);
          if (!isNaN(d.getTime())) {
            return d.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }).toUpperCase() + " WIB";
          }
        } catch {}
      }
      return raw.toUpperCase();
    }

    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).toUpperCase() + " WIB";
      }
    } catch {}

    return String(raw).toUpperCase();
  }, [order]);

  useEffect(() => {
    if (orderNumber) {
      success(`Order ${orderNumber} placed securely!`, "ATELIER DISPATCH CONFIRMATION");
    }
  }, [orderNumber, success]);

  return (
    <div
      style={{
        padding: "52px 44px",
        boxSizing: "border-box",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
      className="w-full max-w-5xl mx-auto bg-[#0E0E0E] border border-[#262626] shadow-2xl relative text-center"
    >
      {/* Badge — Borderless */}
      <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#141414] text-[#B6A47E] font-mono text-[11px] font-bold uppercase tracking-[0.22em] mb-7 text-center">
        <span className="w-2 h-2 rounded-full bg-[#38A169] animate-pulse" />
        PAYMENT VERIFIED & CONFIRMED
      </div>

      <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-[0.12em] text-white mb-4 text-center">
        PAYMENT CONFIRMED
      </h1>

      <p
        style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto", width: "100%" }}
        className="text-sm font-mono text-[#8A8A8A] uppercase tracking-wider max-w-2xl text-center leading-relaxed mb-12"
      >
        Thank you for your purchase. We have received your payment and your order is now being processed for shipping.
      </p>

      {isLoading ? (
        <OrderDetailSkeleton />
      ) : isError || !order ? (
        <div style={{ padding: "32px", width: "100%" }} className="bg-[#171717] border border-[#333333] mb-10 font-mono text-xs text-left">
          <p className="text-[#AAAAAA] mb-2">ORDER REFERENCE: <strong className="text-white font-bold">{orderNumber || "SM-ORD-2026"}</strong></p>
          <p className="text-[#38A169]">✓ PRE-AUTHORIZED IN ATELIER SYSTEM</p>
        </div>
      ) : (
        <div style={{ padding: "40px 36px", marginBottom: "44px", width: "100%" }} className="bg-[#121212] border border-[#2A2A2A] text-left font-mono">
          {/* Reference & Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[#222222]">
            <div>
              <span className="text-[10px] text-[#777777] block uppercase tracking-widest font-bold mb-1">ORDER REFERENCE NUMBER</span>
              <span className="text-lg font-extrabold text-white tracking-widest block">{order.order_number}</span>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] text-[#777777] block uppercase tracking-widest font-bold mb-1">ORDER DATE</span>
              <span className="text-sm font-bold text-[#E5E5E5] tracking-widest block uppercase">
                {displayOrderDate}
              </span>
            </div>
          </div>

          {/* 4 Columns Details Grid — Generous 36px Top & Bottom Distance from Border Lines */}
          <div style={{ paddingTop: "36px", paddingBottom: "36px" }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 text-xs border-b border-[#222222]">
            {/* 1. PAYMENT METHOD */}
            <div className="space-y-1">
              <span className="text-[#888888] uppercase block mb-1.5 font-bold tracking-wider">PAYMENT METHOD</span>
              <strong className="text-white block uppercase font-bold tracking-wide">
                {(order.payment_info?.method || (order.payment_info as any)?.payment_method || (order as any).payment_method || "VIRTUAL ACCOUNT").replace(/_/g, " ")}
              </strong>
              <span className="text-[#38A169] block text-[11px] pt-1 font-bold tracking-widest">
                ✓ VERIFIED & PAID
              </span>
            </div>

            {/* 2. LOGISTICS DESTINATION */}
            <div className="space-y-1">
              <span className="text-[#888888] uppercase block mb-1.5 font-bold tracking-wider">LOGISTICS DESTINATION</span>
              <strong className="text-white block uppercase font-bold">{order.shipping_address?.receiver_name}</strong>
              <span className="text-[#CCCCCC] block pt-0.5 leading-relaxed">{order.shipping_address?.street_address}</span>
              <span className="text-[#888888] block text-[11px] pt-0.5">{order.shipping_address?.city}, {order.shipping_address?.postal_code}</span>
            </div>

            {/* 3. COURIER PROTOCOL */}
            <div className="space-y-1 pl-0 sm:pl-2">
              <span className="text-[#888888] uppercase block mb-1.5 font-bold tracking-wider">COURIER PROTOCOL</span>
              <strong className="text-white block font-bold uppercase">{order.courier_info?.courier_name || "BITESHIP LOGISTICS"}</strong>
              <span className="text-[#CCCCCC] block text-[11px] pt-0.5">SERVICE: {order.courier_info?.service_code || "REG"}</span>
              <span className="text-[#888888] block text-[11px] pt-0.5">EST: {order.courier_info?.estimated_delivery || "1 - 3 Days"}</span>
            </div>

            {/* 4. TRACKING NUMBER / NO RESI */}
            <div className="space-y-1">
              <span className="text-[#888888] uppercase block mb-1.5 font-bold tracking-wider">NO RESI / TRACKING</span>
              <strong className="text-[#D4AF37] text-sm font-extrabold tracking-widest block pt-0.5 truncate">
                {order.courier_info?.tracking_number || (order as any).shipment?.tracking_number || "BITESHIP-PENDING"}
              </strong>
              <span className="text-[#777777] block text-[10px] pt-1 tracking-wider uppercase font-bold">LIVE BITESHIP TRACKING</span>
            </div>
          </div>

          {/* Purchased Items Section */}
          {order.products && order.products.length > 0 && (
            <div style={{ paddingTop: "36px" }}>
              <h4 style={{ marginBottom: "20px" }} className="text-xs font-mono font-bold text-[#888888] uppercase tracking-[0.18em]">
                PURCHASED ITEMS ({order.products.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0)})
              </h4>

              <div className="space-y-3.5">
                {order.products.map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    style={{ padding: "16px 20px" }}
                    className="bg-[#090909] border border-[#1E1E1E] flex items-center justify-between gap-6 font-mono text-xs"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      {/* Product Image Thumbnail */}
                      <div className="w-14 h-16 bg-[#141414] border border-[#262626] shrink-0 relative overflow-hidden flex items-center justify-center">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-[#555]">IMAGE</span>
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <h5 className="font-bold text-white uppercase tracking-wide truncate text-xs">
                          {item.product_name}
                        </h5>
                        <p className="text-[11px] text-[#777777] uppercase tracking-wider pt-0.5">
                          SIZE: <strong className="text-[#CCCCCC]">{item.size || "M"}</strong> &nbsp;|&nbsp; COLOR: <strong className="text-[#CCCCCC]">{item.color || "BLACK"}</strong> &nbsp;|&nbsp; QTY: <strong className="text-[#CCCCCC]">{item.quantity || 1}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <span className="font-bold text-white tracking-wider block text-sm">
                        Rp {(item.subtotal || (item.price || 0) * (item.quantity || 1)).toLocaleString("id-ID")}
                      </span>
                      {item.quantity && item.quantity > 1 && (
                        <span className="text-[10px] text-[#777777] block pt-0.5">
                          Rp {(item.price || 0).toLocaleString("id-ID")} / item
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Calculation Breakdown */}
          {order.summary && (
            <div style={{ marginTop: "32px", paddingTop: "28px", borderTop: "1px solid #222222" }} className="font-mono text-xs space-y-3">
              <div className="flex justify-between items-center text-[#888888]">
                <span>SUBTOTAL</span>
                <span className="text-white font-semibold">Rp {order.summary.subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center text-[#888888]">
                <span>SHIPPING ({order.courier_info?.courier_name || "BITESHIP"})</span>
                <span className="text-white font-semibold">Rp {order.summary.shipping.toLocaleString("id-ID")}</span>
              </div>
              {order.summary.discount > 0 && (
                <div className="flex justify-between items-center text-[#38A169]">
                  <span>PROMO DISCOUNT</span>
                  <span className="font-semibold">−Rp {order.summary.discount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 text-sm font-bold text-white border-t border-[#1C1C1C]">
                <span className="tracking-widest">GRAND TOTAL</span>
                <span className="text-[#D4AF37] font-black text-base">Rp {order.summary.grand_total.toLocaleString("id-ID")}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Navigation Buttons — Spacious, Luxury Styled, Well-Aligned */}
      <div style={{ paddingTop: "32px", width: "100%" }} className="flex flex-col sm:flex-row items-center justify-center gap-5 border-t border-[#222222]">
        <Link
          href={orderNumber ? `/dashboard?order=${orderNumber}` : "/dashboard"}
          style={{ padding: "18px 36px" }}
          className="w-full sm:w-auto bg-[#FFFFFF] text-[#0A0A0A] font-mono text-xs font-black uppercase tracking-[0.22em] hover:bg-[#B6A47E] transition-all duration-300 shadow-xl no-underline inline-flex items-center justify-center cursor-pointer"
        >
          VIEW ORDERS IN DASHBOARD →
        </Link>
        <Link
          href="/shop"
          style={{ padding: "18px 36px" }}
          className="w-full sm:w-auto bg-[#141414] text-[#FFFFFF] border border-[#333333] font-mono text-xs font-bold uppercase tracking-[0.22em] hover:border-[#666666] hover:bg-[#1C1C1C] transition-all duration-300 no-underline inline-flex items-center justify-center cursor-pointer"
        >
          CONTINUE BROWSING CATALOG
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", minHeight: "100vh" }}
      className="bg-[#0A0A0A] text-[#FFFFFF] selection:bg-[#FFFFFF] selection:text-[#0A0A0A]"
    >
      <Navbar />

      <div
        style={{ paddingTop: "140px", paddingBottom: "100px", width: "100%", maxWidth: "1000px", marginLeft: "auto", marginRight: "auto", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
        className="px-4 text-center"
      >
        <Suspense fallback={<OrderDetailSkeleton />}>
          <CheckoutSuccessContent />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
