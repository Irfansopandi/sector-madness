"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getOrderDetail } from "@/utils/api";
import api from "@/utils/api";
import { OrderDetailSkeleton, ErrorState } from "@/components/UIState";
import { useToast } from "@/components/Toast";

declare global {
  interface Window {
    snap: any;
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = String(params.order_number || "");
  const queryClient = useQueryClient();
  const { showToast, success, error } = useToast();

  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ["order-detail", orderNumber],
    queryFn: () => getOrderDetail(orderNumber),
    enabled: !!orderNumber,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/orders/${orderNumber}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderNumber] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      success("Order cancelled successfully.", "TRANSACTION CANCELLED");
    },
    onError: (err: any) => {
      error(err.response?.data?.message || "Failed to cancel order.");
    },
  });

  const handleResumePayment = () => {
    if (!order?.payment_info?.snap_token) {
      error("No valid Midtrans authorization token available for this transaction.");
      return;
    }
    showToast("Re-opening Midtrans gateway popup...", "info", "MIDTRANS SNAP");
    if (typeof window !== "undefined" && window.snap) {
      window.snap.pay(order.payment_info.snap_token, {
        onSuccess: function () {
          queryClient.invalidateQueries({ queryKey: ["order-detail", orderNumber] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          success("Payment completed successfully!", "AUTHORIZATION SUCCESS");
        },
        onPending: function () {
          showToast("Payment verification is pending via banking network.", "warning", "STATUS PENDING");
          refetch();
        },
        onError: function () {
          error("Transaction declined by gateway.");
        },
      });
    } else {
      error("Midtrans Gateway SDK not ready yet. Please refresh page.");
    }
  };

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex flex-col selection:bg-[#FFFFFF] selection:text-[#0A0A0A]"
    >
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="Mid-client-sBSqTk7RhzcH4GEK" strategy="afterInteractive" />
      
      <Navbar />

      {/* FULL-WIDTH HEADER SECTION WITH EDGE-TO-EDGE BORDER LINE */}
      <div style={{ paddingTop: "140px" }} className="w-full border-b border-[#262626] pb-8">
        <div className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20">
          <div style={{ paddingLeft: "60px", paddingRight: "60px" }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#8A8A8A] uppercase block mb-2 font-bold">
                TRANSACTION RECORD // ATELIER ARCHIVE
              </span>
              <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-[0.08em] text-white">
                ORDER DETAIL: <span className="text-[#D4AF37] font-mono">{orderNumber}</span>
              </h1>
            </div>
            <Link href="/orders" className="font-mono text-xs text-[#8A8A8A] uppercase tracking-wider hover:text-white transition-colors">
              ← BACK TO ORDER HISTORY
            </Link>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION BELOW THE FULL-WIDTH LINE */}
      <div className="flex-1 w-full max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20 py-16 pb-36">
        <div style={{ paddingLeft: "60px", paddingRight: "60px" }}>
          {isLoading ? (
            <div className="pt-2"><OrderDetailSkeleton /></div>
          ) : isError || !order ? (
            <div className="w-full flex flex-col items-center justify-center py-24 my-6">
              <ErrorState
                title="UNABLE TO RETRIEVE ORDER SPECIFICATION"
                message={`We could not locate transaction records for ${orderNumber} in our secure database.`}
                onRetry={() => refetch()}
              />
            </div>
          ) : (
            <div className="space-y-16 pt-4">
            {/* STATUS & ACTIONS BAR */}
            <div className="p-8 bg-[#101010] border border-[#2A2A2A] shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#777777] uppercase tracking-[0.2em] block">TRANSACTION STATUS</span>
                <div className="flex items-center gap-4">
                  {order.payment_info.payment_status === "paid" || order.shipping_status === "shipped" ? (
                    <span className="px-4 py-1.5 bg-[#1A442A] text-[#66FF99] font-mono text-xs font-black uppercase tracking-widest">
                      ✓ VERIFIED & CONFIRMED // PAID
                    </span>
                  ) : order.payment_info.payment_status === "failed" || order.shipping_status === "cancelled" ? (
                    <span className="px-4 py-1.5 bg-[#441111] text-[#FF8888] font-mono text-xs font-black uppercase tracking-widest">
                      ✕ CANCELLED / VOIDED
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 bg-[#4F3E17] text-[#FFCC00] font-mono text-xs font-black uppercase tracking-widest animate-pulse">
                      ● PENDING AUTHORIZATION
                    </span>
                  )}
                  <span className="text-xs font-mono text-[#CCCCCC] uppercase">
                    DATE: {order.order_date}
                  </span>
                </div>
              </div>

              {/* Payment Retry / Cancel Buttons */}
              <div className="flex flex-wrap gap-4 w-full lg:w-auto justify-end">
                {order.courier_info?.tracking_number && (
                  <Link
                    href={`/shipping/track/${order.courier_info.tracking_number}`}
                    className="px-6 py-3.5 bg-[#141414] hover:bg-[#262626] text-[#00FF66] font-mono text-xs font-extrabold uppercase tracking-widest border border-[#333] transition-all text-center"
                  >
                    🚀 TRACK RESI ({order.courier_info.tracking_number})
                  </Link>
                )}

                {order.payment_info.payment_status === "unpaid" && order.shipping_status !== "cancelled" && (
                  <>
                    <button
                      type="button"
                      onClick={handleResumePayment}
                      className="px-8 py-3.5 bg-[#D4AF37] hover:bg-[#FFFFFF] text-[#0A0A0A] font-mono text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl cursor-pointer"
                    >
                      LANJUTKAN PEMBAYARAN / BAYAR LAGI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you certain you wish to void and cancel this reservation?")) {
                          cancelMutation.mutate();
                        }
                      }}
                      disabled={cancelMutation.isPending}
                      className="px-6 py-3.5 bg-[#2A0A0A] hover:bg-[#441111] text-[#FF8888] font-mono text-xs font-extrabold uppercase tracking-widest border border-[#552222] transition-colors cursor-pointer"
                    >
                      BATALKAN PESANAN
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 3 COLUMN SPECIFICATION: CUSTOMER, ADDRESS, COURIER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-mono text-xs">
              <div className="p-6 bg-[#0E0E0E] border border-[#222222] space-y-3">
                <span className="text-[10px] text-[#D4AF37] uppercase font-extrabold tracking-widest block pb-2 border-b border-[#1E1E1E]">
                  01 // CUSTOMER DATA
                </span>
                <p><strong className="text-[#888888]">NAME:</strong> <span className="text-white block pt-0.5 font-bold">{order.customer_info.name}</span></p>
                <p><strong className="text-[#888888]">EMAIL:</strong> <span className="text-white block pt-0.5 truncate">{order.customer_info.email}</span></p>
                <p><strong className="text-[#888888]">PHONE:</strong> <span className="text-white block pt-0.5">{order.customer_info.phone}</span></p>
              </div>

              <div className="p-6 bg-[#0E0E0E] border border-[#222222] space-y-3">
                <span className="text-[10px] text-[#D4AF37] uppercase font-extrabold tracking-widest block pb-2 border-b border-[#1E1E1E]">
                  02 // SHIPPING ADDRESS
                </span>
                <p><strong className="text-[#888888]">RECEIVER ({order.shipping_address.label || "RUMAH"}):</strong> <span className="text-white font-bold block pt-0.5">{order.shipping_address.receiver_name}</span></p>
                <p className="text-[#CCCCCC] leading-relaxed pt-1">{order.shipping_address.street_address}</p>
                <p className="text-[#888888]">{order.shipping_address.city}, {order.shipping_address.province} — {order.shipping_address.postal_code}</p>
              </div>

              <div className="p-6 bg-[#0E0E0E] border border-[#222222] space-y-3">
                <span className="text-[10px] text-[#D4AF37] uppercase font-extrabold tracking-widest block pb-2 border-b border-[#1E1E1E]">
                  03 // COURIER & LOGISTICS
                </span>
                <p><strong className="text-[#888888]">COURIER:</strong> <span className="text-[#00FF66] font-extrabold block pt-0.5">{order.courier_info.courier_name}</span></p>
                <p><strong className="text-[#888888]">SERVICE:</strong> <span className="text-white block pt-0.5">{order.courier_info.service_name} ({order.courier_info.service_code})</span></p>
                <p><strong className="text-[#888888]">RESI NUMBER:</strong> <span className="text-white block pt-0.5 font-bold tracking-wider">{order.courier_info.tracking_number || "PENDING ALLOCATION"}</span></p>
              </div>
            </div>

            {/* PRODUCT ITEMS TABLE */}
            <section className="space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] font-mono text-[#8A8A8A]">
                RESERVED GARMENTS // SPECIFICATION
              </h2>
              <div className="border border-[#222222] bg-[#0E0E0E]">
                {order.products.map((item) => (
                  <div key={item.id} className="p-6 border-b border-[#1F1F1F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative w-20 h-24 bg-[#171717] border border-[#333] shrink-0 overflow-hidden">
                        <Image src={item.product_image || "/collection1.png"} alt={item.product_name} fill className="object-cover" />
                      </div>
                      <div className="space-y-1 font-mono">
                        <h3 className="text-base font-bold text-white uppercase tracking-wider">{item.product_name}</h3>
                        <p className="text-xs text-[#8A8A8A] uppercase">
                          COLOR: <span className="text-white font-bold">{item.color || "Obsidian"}</span> // SIZE: <span className="text-white font-bold">{item.size || "M"}</span>
                        </p>
                        <p className="text-xs text-[#CCCCCC]">QTY: <strong className="text-[#D4AF37] font-bold">{item.quantity} PCS</strong></p>
                      </div>
                    </div>
                    <div className="font-mono text-right shrink-0 w-full sm:w-auto">
                      <span className="text-xs text-[#777777] uppercase block">ITEM TOTAL</span>
                      <span className="text-base font-black text-white">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ORDER TIMELINE TRACKING */}
            <section className="space-y-6">
              <h2 className="text-sm font-extrabold uppercase tracking-[0.2em] font-mono text-[#8A8A8A]">
                CHRONOLOGICAL ORDER TIMELINE
              </h2>
              <div className="p-8 bg-[#101010] border border-[#262626] relative">
                <div className="space-y-8 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-0.5 before:bg-[#2A2A2A]">
                  {order.timeline?.map((t, idx) => (
                    <div key={idx} className="flex items-start gap-6 relative">
                      <span className={`w-6 h-6 rounded-none shrink-0 z-10 border-2 mt-0.5 flex items-center justify-center font-mono text-[10px] font-bold ${
                        t.done ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_10px_#D4AF37]" : "bg-[#111111] text-[#555555] border-[#333333]"
                      }`}>
                        {t.done ? "✓" : "○"}
                      </span>
                      <div className="space-y-1 font-mono">
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-extrabold uppercase tracking-wider ${t.done ? "text-white" : "text-[#777777]"}`}>
                            {t.status}
                          </span>
                          <span className="text-xs text-[#8A8A8A] border border-[#2A2A2A] px-2 py-0.5">{t.date}</span>
                        </div>
                        <p className="text-xs text-[#AAAAAA] leading-relaxed uppercase pt-1">{t.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SUMMARY CALCULATION FOOTER */}
            <section className="flex justify-end">
              <div className="w-full max-w-md p-8 bg-[#121212] border border-[#2E2E2E] shadow-2xl space-y-4 font-mono text-xs">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white pb-3 border-b border-[#222]">
                  FINAL TRANSACTION SUMMARY
                </h3>
                <div className="flex justify-between text-[#BBBBBB]">
                  <span>SUBTOTAL</span>
                  <span className="font-bold">Rp {(order.summary?.subtotal || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-[#BBBBBB]">
                  <span>SHIPPING ({order.courier_info.courier_code})</span>
                  <span className="font-bold">Rp {(order.summary?.shipping || 0).toLocaleString("id-ID")}</span>
                </div>
                {(order.summary?.discount || 0) > 0 && (
                  <div className="flex justify-between text-[#38A169]">
                    <span>PROMOTION DISC</span>
                    <span className="font-bold">−Rp {(order.summary?.discount || 0).toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#BBBBBB]">
                  <span>EST. VAT (PPN 11%)</span>
                  <span className="font-bold">Rp {(order.summary?.tax || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="pt-4 border-t border-[#333] flex justify-between items-baseline">
                  <span className="text-sm font-black text-white">GRAND TOTAL</span>
                  <span className="text-2xl font-black text-[#D4AF37]">Rp {(order.summary?.grand_total || 0).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </section>

          </div>
        )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
