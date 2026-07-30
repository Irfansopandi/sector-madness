"use client";

import React, { useEffect, Suspense } from "react";
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

  useEffect(() => {
    if (orderNumber) {
      success(`Order ${orderNumber} placed securely!`, "ATELIER DISPATCH CONFIRMATION");
    }
  }, [orderNumber, success]);

  return (
    <div className="p-10 md:p-16 bg-[#0E0E0E] border border-[#262626] shadow-2xl relative">
      {/* Badge */}
      <div className="inline-block px-5 py-2 bg-[#D4AF37] text-[#0A0A0A] font-mono text-xs font-black uppercase tracking-[0.25em] mb-8">
        [TRANSACTION AUTHORIZED // ATELIER VAULT]
      </div>

      <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-[0.12em] text-white mb-4">
        PAYMENT CONFIRMED
      </h1>

      <p className="text-sm font-mono text-[#8A8A8A] uppercase tracking-widest max-w-xl mx-auto leading-relaxed mb-12">
        Your technical garments have been allocated and scheduled for priority dispatch. A confirmation transmission with digital receipt has been routed to your member email.
      </p>

      {isLoading ? (
        <OrderDetailSkeleton />
      ) : isError || !order ? (
        <div className="p-6 bg-[#171717] border border-[#333333] mb-12 font-mono text-xs">
          <p className="text-[#AAAAAA] mb-2">ORDER REFERENCE: <strong className="text-white font-bold">{orderNumber || "SM-ORD-2026"}</strong></p>
          <p className="text-[#38A169]">✓ PRE-AUTHORIZED IN ATELIER SYSTEM</p>
        </div>
      ) : (
        <div className="bg-[#121212] border border-[#2A2A2A] p-8 text-left mb-12 space-y-6 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222222]">
            <div>
              <span className="text-[10px] text-[#777777] block uppercase tracking-widest">ORDER REFERENCE NUMBER</span>
              <span className="text-lg font-bold text-white tracking-widest">{order.order_number}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#777777] block uppercase tracking-widest">PAYMENT STATUS</span>
              <span className="inline-block px-3 py-1 bg-[#38A169] text-white font-bold text-xs uppercase tracking-widest mt-1">
                VERIFIED // PAID
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
            <div>
              <span className="text-[#888888] uppercase block mb-1">LOGISTICS DESTINATION</span>
              <strong className="text-white block">{order.shipping_address?.receiver_name}</strong>
              <span className="text-[#CCCCCC] block pt-1">{order.shipping_address?.street_address}</span>
              <span className="text-[#888888] block">{order.shipping_address?.city}, {order.shipping_address?.postal_code}</span>
            </div>

            <div>
              <span className="text-[#888888] uppercase block mb-1">COURIER PROTOCOL</span>
              <strong className="text-[#00FF66] block">{order.courier_info?.courier_name}</strong>
              <div className="pt-1.5 pb-1 font-mono">
                <span className="text-[10px] text-[#777777] uppercase block tracking-wider">RESI BITESHIP:</span>
                <span className="text-sm font-black text-[#D4AF37] tracking-widest block">
                  {order.courier_info?.tracking_number || (order as any).shipment?.tracking_number || "BITESHIP-PENDING"}
                </span>
              </div>
              <span className="text-[#CCCCCC] block text-[11px]">SERVICE: {order.courier_info?.service_code}</span>
              <span className="text-[#888888] block text-[11px]">EST: {order.courier_info?.estimated_delivery}</span>
            </div>

            <div>
              <span className="text-[#888888] uppercase block mb-1">TRANSACTION TOTAL</span>
              <strong className="text-[#D4AF37] text-lg font-black block pt-1">
                Rp {order.summary?.grand_total.toLocaleString("id-ID")}
              </strong>
              <span className="text-[#777777] block text-[10px] pt-0.5">INCL. PPN & BITESHIP DELIVERY</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 border-t border-[#222222]">
        <Link
          href="/dashboard/orders"
          className="w-full sm:w-auto px-10 py-5 bg-[#FFFFFF] text-[#0A0A0A] font-extrabold font-mono text-xs uppercase tracking-[0.25em] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all shadow-xl"
        >
          VIEW ORDERS & TIMELINE
        </Link>
        <Link
          href="/shop"
          className="w-full sm:w-auto px-10 py-5 bg-[#171717] text-[#FFFFFF] font-extrabold font-mono text-xs uppercase tracking-[0.25em] border border-[#333333] hover:bg-[#262626] transition-all"
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
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex flex-col selection:bg-[#FFFFFF] selection:text-[#0A0A0A]"
    >
      <Navbar />

      <div style={{ paddingTop: "140px" }} className="flex-1 w-full max-w-[1080px] mx-auto px-6 pb-28 text-center">
        <Suspense fallback={<OrderDetailSkeleton />}>
          <CheckoutSuccessContent />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
