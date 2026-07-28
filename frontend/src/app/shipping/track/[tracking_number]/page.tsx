"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getShipmentTracking } from "@/utils/api";
import { TrackingSkeleton, ErrorState } from "@/components/UIState";

export default function ShipmentTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const trackingNumber = String(params.tracking_number || "");

  const { data: tracking, isLoading, isError, refetch } = useQuery({
    queryKey: ["tracking", trackingNumber],
    queryFn: () => getShipmentTracking(trackingNumber),
    enabled: !!trackingNumber,
  });

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
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#00FF66] uppercase block mb-2 font-bold animate-pulse">
                ● BITESHIP LIVE TELEMETRY // REALTIME COURIER SYNC
              </span>
              <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-[0.08em] text-white">
                LOGISTICS RESI: <span className="text-[#D4AF37] font-mono text-2xl lg:text-4xl">{trackingNumber}</span>
              </h1>
            </div>
            <button
              onClick={() => router.back()}
              className="font-mono text-xs text-[#8A8A8A] uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-left md:text-right"
            >
              ← BACK TO PREVIOUS ARCHIVE
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION BELOW THE FULL-WIDTH LINE */}
      <div className="flex-1 w-full max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20 py-16 pb-36">
        <div style={{ paddingLeft: "60px", paddingRight: "60px" }}>
          {isLoading ? (
            <div className="pt-2"><TrackingSkeleton /></div>
          ) : isError || !tracking ? (
            <div className="w-full flex flex-col items-center justify-center py-24 my-6">
              <ErrorState
                title="BITESHIP TRACKING RECORD UNAVAILABLE"
                message={`Logistics telemetric data for resi ${trackingNumber} has not propagated across the courier distribution network yet or connection timed out.`}
                onRetry={() => refetch()}
              />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-12 pt-4"
            >
            {/* Courier & Status Banner */}
            <div className="p-8 md:p-10 bg-[#101010] border border-[#2A2A2A] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 font-mono">
                <span className="text-[10px] text-[#777777] uppercase tracking-[0.2em] block">CURRENT DISPATCH STATE</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-[#FFFFFF]">
                  {tracking.current_status}
                </h2>
                <p className="text-xs text-[#8A8A8A] uppercase">
                  COURIER NETWORK: <strong className="text-[#00FF66] font-extrabold">{tracking.courier}</strong> // EST. DELIVERY: <strong className="text-[#D4AF37] font-bold">{tracking.estimated_delivery}</strong>
                </p>
              </div>

              <div className="shrink-0">
                <span className="px-5 py-3 bg-[#171717] border border-[#3A3A3A] font-mono text-xs font-black uppercase tracking-widest text-[#D4AF37] inline-block">
                  [ATELIER INSURED SHIPMENT]
                </span>
              </div>
            </div>

            {/* Chronological Tracking Feed */}
            <div className="p-8 md:p-12 bg-[#0E0E0E] border border-[#222222] space-y-10">
              <div className="pb-4 border-b border-[#1C1C1C] flex justify-between items-center font-mono text-xs uppercase text-[#888888]">
                <span>TRANSMISSION HISTORY // BITESHIP WAYPOINTS</span>
                <span>SYNCED WITH WAREHOUSE</span>
              </div>

              <div className="space-y-10 relative before:absolute before:top-3 before:bottom-3 before:left-[13px] before:w-0.5 before:bg-[#2A2A2A]">
                {tracking.timeline.map((point, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="flex items-start gap-8 relative pl-2"
                    >
                      <span className={`w-7 h-7 rounded-none shrink-0 z-10 border-2 mt-0.5 flex items-center justify-center font-mono text-xs font-black ${
                        isLatest
                          ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37] shadow-[0_0_15px_#D4AF37]"
                          : "bg-[#111111] text-[#666666] border-[#333333]"
                      }`}>
                        {isLatest ? "●" : "○"}
                      </span>

                      <div className="space-y-2 font-mono flex-1 border-b border-[#181818] pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className={`text-base font-extrabold uppercase tracking-wider ${
                            isLatest ? "text-[#FFFFFF]" : "text-[#999999]"
                          }`}>
                            {point.title}
                          </span>
                          <span className="text-xs text-[#8A8A8A] bg-[#161616] px-3 py-1 border border-[#2C2C2C] w-fit">
                            {point.time}
                          </span>
                        </div>
                        
                        <p className="text-xs text-[#BBBBBB] leading-relaxed uppercase tracking-wide">
                          {point.description}
                        </p>

                        <span className={`inline-block text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 mt-2 ${
                          point.status === "COMPLETED" || point.status === "DONE"
                            ? "bg-[#193A24] text-[#66FF99]"
                            : "bg-[#33250A] text-[#FFCC00]"
                        }`}>
                          STATUS // {point.status}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Help Notice */}
            <div className="text-center font-mono text-xs text-[#666666] uppercase tracking-widest pt-6">
              NEED ATELIER ASSISTANCE WITH THIS DELIVERY? CONCIERGE@SECTOR-MADNESS.COM
            </div>
          </motion.div>
        )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
