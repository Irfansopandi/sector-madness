"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getOrders } from "@/utils/api";
import { BagItemSkeleton, ErrorState, EmptyState } from "@/components/UIState";

export default function OrdersListPage() {
  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (status === "cancelled") {
      return <span className="px-2.5 py-1 bg-[#441111] text-[#FF8888] text-[10px] font-mono font-extrabold uppercase">CANCELLED</span>;
    }
    if (paymentStatus === "paid" || status === "processing" || status === "shipped") {
      return <span className="px-2.5 py-1 bg-[#1A442A] text-[#66FF99] text-[10px] font-mono font-extrabold uppercase">VERIFIED // PAID</span>;
    }
    return <span className="px-2.5 py-1 bg-[#4F3E17] text-[#FFCC00] text-[10px] font-mono font-extrabold uppercase animate-pulse">PENDING PAYMENT</span>;
  };

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex flex-col selection:bg-[#FFFFFF] selection:text-[#0A0A0A]"
    >
      <Navbar />

      {/* FULL-WIDTH HEADER SECTION WITH EDGE-TO-EDGE BORDER LINE */}
      <div style={{ paddingTop: "140px" }} className="w-full border-b border-[#262626] pb-8">
        <div className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20">
          <div style={{ paddingLeft: "60px", paddingRight: "60px" }} className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#8A8A8A] uppercase block mb-2 font-bold">
                MEMBER PROFILE // TRANSACTION ARCHIVE
              </span>
              <h1 className="text-3xl lg:text-5xl font-extrabold uppercase tracking-[0.08em] text-white">
                ORDER HISTORY
              </h1>
            </div>
            <Link href="/shop" className="font-mono text-xs text-[#8A8A8A] uppercase tracking-wider hover:text-white transition-colors">
              ← ATELIER STORE
            </Link>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION BELOW THE FULL-WIDTH LINE */}
      <div className="flex-1 w-full max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20 py-16 pb-36">
        <div style={{ paddingLeft: "60px", paddingRight: "60px" }}>
          {isLoading ? (
            <div className="space-y-6 pt-2">
              <BagItemSkeleton /><BagItemSkeleton /><BagItemSkeleton />
            </div>
          ) : isError ? (
            <div className="w-full flex flex-col items-center justify-center py-24 my-6">
              <ErrorState
                title="UNABLE TO RETRIEVE ORDER RECORDS"
                message="We experienced an interruption while fetching your transactional history from the Sector Madness backend database."
                onRetry={() => refetch()}
              />
            </div>
          ) : orders.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center py-24 my-6">
              <EmptyState
                title="NO PAST TRANSACTIONS ARCHIVED"
                message="You have not finalized any clothing acquisitions in your current account. Your future purchases will be recorded and traceable here."
                actionText="DISCOVER SECTOR COLLECTION"
                actionHref="/shop"
              />
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              {orders.map((order) => (
                <motion.div
                  key={order.order_number}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="p-8 bg-[#0E0E0E] border border-[#222222] hover:border-[#444444] transition-all duration-300 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#D4AF37] tracking-widest">
                        {order.order_number}
                      </span>
                      <span className="text-[#666666] font-mono">//</span>
                      <span className="text-xs font-mono text-[#8A8A8A]">{order.order_date}</span>
                      <span className="text-[#666666] font-mono">//</span>
                      {getStatusBadge(order.status, order.payment_status)}
                    </div>

                    <div className="flex items-baseline gap-8 pt-2 font-mono text-xs">
                      <div>
                        <span className="text-[#777777] uppercase block text-[10px]">TOTAL AMOUNT</span>
                        <span className="text-base font-bold text-white">Rp {(order.total || 0).toLocaleString("id-ID")}</span>
                      </div>
                      <div>
                        <span className="text-[#777777] uppercase block text-[10px]">ITEMS QUANTITY</span>
                        <span className="text-white font-bold">{order.items_count || 0} PCS</span>
                      </div>
                      <div>
                        <span className="text-[#777777] uppercase block text-[10px]">PAYMENT GATEWAY</span>
                        <span className="text-[#EDEDED] font-extrabold">{order.payment_method || "MIDTRANS // BITESHIP"}</span>
                      </div>
                      {order.tracking_number && (
                        <div className="hidden md:block">
                          <span className="text-[#777777] uppercase block text-[10px]">LOGISTICS RESI</span>
                          <span className="text-[#00FF66] font-extrabold">{order.tracking_number}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-auto shrink-0 justify-end pt-4 lg:pt-0 border-t lg:border-t-0 border-[#1C1C1C]">
                    {order.tracking_number && (
                      <Link
                        href={`/shipping/track/${order.tracking_number}`}
                        className="px-6 py-3.5 bg-[#141414] hover:bg-[#262626] text-white font-mono text-xs uppercase font-extrabold tracking-widest border border-[#3A3A3A] transition-colors text-center"
                      >
                        TRACK PACKAGE
                      </Link>
                    )}
                    <Link
                      href={`/orders/${order.order_number}`}
                      className="px-8 py-3.5 bg-[#FFFFFF] hover:bg-[#D4AF37] text-[#0A0A0A] font-mono text-xs uppercase font-extrabold tracking-[0.2em] transition-all shadow-md text-center"
                    >
                      VIEW DETAIL
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
