"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";

interface CustomPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: () => void;
  orderNumber: string;
  paymentMethod?: string;
  grossAmount: number;
  receiverName?: string;
  snapToken?: string;
  paymentUrl?: string;
  clientKey?: string;
  isProduction?: boolean;
  vaNumber?: string;
  qrString?: string;
}

export default function CustomPaymentModal({
  isOpen,
  onClose,
  onPaymentConfirmed,
  orderNumber,
  grossAmount,
  receiverName = "Customer",
  snapToken,
  paymentUrl,
  clientKey,
  isProduction = true,
}: CustomPaymentModalProps) {
  const { showToast, error } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSnapLoading, setIsSnapLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 45 });

  // Sanitize effective payment url
  const effectivePaymentUrl = paymentUrl || (snapToken ? `https://app.midtrans.com/snap/v4/redirection/${snapToken}` : undefined);

  // Format currency
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Dynamically load Midtrans Snap JS Script
  useEffect(() => {
    if (!isOpen) return;

    const scriptId = "midtrans-snap-script";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    const snapJsUrl = isProduction 
      ? "https://app.midtrans.com/snap/snap.js" 
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    const cKey = clientKey || (isProduction ? "Mid-client-IuGSj1Tf8bngO780" : "Mid-client-sBSqTk7RhzcH4GEK");

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = snapJsUrl;
      script.setAttribute("data-client-key", cKey);
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isOpen, isProduction, clientKey]);

  // Countdown timer simulation for payment validity (24 hours)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Open Midtrans Snap Popup
  const handleOpenSnap = useCallback(() => {
    if (!snapToken && !effectivePaymentUrl) {
      error("Sesi transaksi Midtrans belum siap. Mohon tunggu beberapa saat...");
      return;
    }

    setIsSnapLoading(true);

    if (typeof window !== "undefined" && (window as any).snap && snapToken) {
      setIsSnapLoading(false);
      (window as any).snap.pay(snapToken, {
        onSuccess: (result: any) => {
          showToast("Pembayaran Anda berhasil dikonfirmasi!", "success", "TRANSACTION SUCCESS");
          onPaymentConfirmed();
        },
        onPending: (result: any) => {
          showToast("Menunggu penyelesaian transfer bank atau scan QRIS Anda...", "info", "AWAITING SETTLEMENT");
        },
        onError: (result: any) => {
          error("Pembayaran gagal atau dibatalkan oleh pengguna.");
        },
        onClose: () => {
          showToast("Jendela pembayaran ditutup. Anda dapat membukanya kembali kapan saja.", "info", "PAYMENT POPUP CLOSED");
        },
      });
    } else if (effectivePaymentUrl) {
      setIsSnapLoading(false);
      window.open(effectivePaymentUrl, "_blank");
    } else {
      setIsSnapLoading(false);
      error("Gagal memuat portal Snap Midtrans. Silakan coba kembali.");
    }
  }, [snapToken, effectivePaymentUrl, error, showToast, onPaymentConfirmed]);

  // Auto-launch Snap popup once loaded when modal opens
  useEffect(() => {
    if (!isOpen || !snapToken) return;
    const timeout = setTimeout(() => {
      handleOpenSnap();
    }, 600);
    return () => clearTimeout(timeout);
  }, [isOpen, snapToken, handleOpenSnap]);

  // Check real-time payment verification directly with server
  const handleCheckPaymentStatus = async () => {
    setIsVerifying(true);
    showToast("Menghubungkan ke sistem penyelesaian perbankan Midtrans...", "info", "VERIFIKASI REALTIME");
    
    try {
      const { checkPaymentStatus } = await import("@/utils/api");
      const res = await checkPaymentStatus(orderNumber);
      
      if (res.status && res.is_paid) {
        showToast("Pembayaran lunas terverifikasi! Pesanan Anda segera diproses.", "success", "TRANSACTION SUCCESS");
        onPaymentConfirmed();
      } else {
        setIsVerifying(false);
        error(`Pembayaran belum diterima (Status: ${res.transaction_status || "pending"}). Silakan selesaikan pembayaran Anda.`);
      }
    } catch (err: any) {
      setIsVerifying(false);
      error("Gagal memeriksa status. Silakan coba beberapa saat lagi.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto animate-fadeIn">
      {/* Main Luxury Modal Container */}
      <div style={{ fontFamily: "'Roboto', sans-serif" }} className="w-full max-w-3xl bg-[#0A0A0A] border border-[#252525] text-white shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Top Protocol Bar */}
        <div className="bg-[#111111] border-b border-[#222222] px-6 sm:px-10 py-5 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)] shrink-0" />
            <span className="text-[10px] sm:text-xs text-white font-bold tracking-wider sm:tracking-[0.25em] uppercase truncate">
              SECTOR MADNESS <span className="hidden sm:inline">// MIDTRANS OFFICIAL GATEWAY</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[9px] sm:text-[11px] text-[#888] hover:text-white transition-colors font-extrabold tracking-wider sm:tracking-[0.2em] uppercase px-4 py-2 sm:px-3 sm:py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] shrink-0"
          >
            [ X ] <span className="hidden sm:inline">TUTUP</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1" style={{ padding: "clamp(24px, 4vw, 40px)" }}>
          <div className="space-y-8">

            {/* SECTION 1: Order Identity & Timer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 w-full pb-6 border-b border-[#1E1E1E]">
              <div className="space-y-2 w-full sm:w-auto">
                <span className="text-[10px] sm:text-[11px] text-[#777] uppercase tracking-[0.25em] block font-bold">
                  NOMOR TRANSAKSI / ORDER
                </span>
                <div className="text-sm min-[375px]:text-base sm:text-xl font-black text-white tracking-[0.12em] uppercase whitespace-nowrap overflow-x-auto">
                  {orderNumber}
                </div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.15em] block">
                  STATUS: MENUNGGU PEMBAYARAN VIA SNAP
                </span>
              </div>

              <div className="flex items-center justify-between sm:block sm:text-right shrink-0 w-full sm:w-auto">
                <span className="text-[10px] text-[#777] uppercase tracking-[0.2em] block font-bold sm:mb-1.5">
                  BATAS WAKTU PEMBAYARAN
                </span>
                <div className="text-sm sm:text-lg font-black text-white tracking-[0.12em] font-mono">
                  {String(timeLeft.hours).padStart(2, "0")} : {String(timeLeft.minutes).padStart(2, "0")} : {String(timeLeft.seconds).padStart(2, "0")}
                </div>
              </div>
            </div>

            {/* SECTION 2: Total Amount Payable */}
            <div className="bg-[#111111] border border-[#252525] flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-8 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs text-[#888] uppercase tracking-[0.25em] block font-bold">
                  TOTAL TAGIHAN PEMBAYARAN
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider font-mono">
                  {formatIDR(grossAmount)}
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#888] uppercase tracking-wider bg-[#1A1A1A] border border-[#333] px-3 py-1.5">
                OTOMATIS 24/7 TANPA KONFIRMASI MANUAL
              </span>
            </div>

            {/* SECTION 3: 4 Verified Payment Methods Display Card */}
            <div className="bg-[#111111] border border-[#252525] p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#222]">
                <div>
                  <span className="text-[10px] text-[#777] uppercase tracking-[0.25em] block font-bold">
                    METODE PEMBAYARAN TERVERIFIKASI
                  </span>
                  <div className="text-sm sm:text-base font-extrabold text-white uppercase tracking-[0.15em] mt-1">
                    4 JALUR PEMBAYARAN RESMI AKTIF
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-3 py-1 uppercase tracking-widest hidden sm:inline-block">
                  TERVERIFIKASI RESMI
                </span>
              </div>

              {/* Grid of the 4 Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-mono">
                
                {/* 1. BNI VA */}
                <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 flex items-center justify-between hover:border-[#444] transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block uppercase tracking-wider">
                      BNI VIRTUAL ACCOUNT
                    </span>
                    <span className="text-[10px] text-[#777] block">
                      Transfer via BNI Mobile / ATM / I-Banking
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase shrink-0">
                    AKTIF
                  </span>
                </div>

                {/* 2. Mandiri VA */}
                <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 flex items-center justify-between hover:border-[#444] transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block uppercase tracking-wider">
                      MANDIRI BILL / VA
                    </span>
                    <span className="text-[10px] text-[#777] block">
                      Livin by Mandiri / ATM / E-Channel
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase shrink-0">
                    AKTIF
                  </span>
                </div>

                {/* 3. BRI VA */}
                <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 flex items-center justify-between hover:border-[#444] transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block uppercase tracking-wider">
                      BRI VIRTUAL ACCOUNT (BRIVA)
                    </span>
                    <span className="text-[10px] text-[#777] block">
                      BRImo / ATM BRI / Agen BRILink
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase shrink-0">
                    AKTIF
                  </span>
                </div>

                {/* 4. QRIS */}
                <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 flex items-center justify-between hover:border-[#444] transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block uppercase tracking-wider">
                      QRIS UNIVERSAL
                    </span>
                    <span className="text-[10px] text-[#777] block">
                      DANA, GoPay, OVO, ShopeePay & M-Banking
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase shrink-0">
                    AKTIF
                  </span>
                </div>

              </div>

              {/* Explanatory banner */}
              <div className="bg-[#0E0E0E] border border-[#222] p-4 text-[12px] text-[#AAA] leading-relaxed flex items-start gap-3">
                <span className="text-emerald-400 font-mono font-bold shrink-0">[INFO]</span>
                <p>
                  Klik tombol <strong className="text-white">BAYAR SEKARANG VIA MIDTRANS SNAP</strong> di bawah. Anda dapat langsung memilih salah satu dari 4 metode di atas dan sistem akan langsung menghasilkan nomor Virtual Account resmi atau kode QRIS Bank Indonesia asli.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-[#111111] border-t border-[#222222] p-6 sm:p-8 shrink-0 flex flex-col gap-3">
          
          {/* Main Button: Pay Now via Midtrans Snap */}
          <button
            onClick={handleOpenSnap}
            disabled={isSnapLoading}
            className="w-full text-[13px] sm:text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center bg-white text-black hover:bg-[#EAEAEA] active:scale-[0.99] border border-white py-4 px-6 shadow-2xl"
          >
            {isSnapLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>MEMBUKA JENDELA MIDTRANS...</span>
              </div>
            ) : (
              <span>[ BAYAR SEKARANG VIA MIDTRANS SNAP ]</span>
            )}
          </button>

          {/* Secondary Button: Check Payment Status */}
          <button
            onClick={handleCheckPaymentStatus}
            disabled={isVerifying}
            className="w-full text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] transition-all flex items-center justify-center bg-[#181818] text-[#CCCCCC] hover:text-white hover:bg-[#222222] border border-[#333] py-3.5 px-6"
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>MEMERIKSA JARINGAN PERBANKAN...</span>
              </div>
            ) : (
              <span>[ SUDAH TRANSFER? CEK STATUS PEMBAYARAN ]</span>
            )}
          </button>

          {/* Fallback Direct Link */}
          {effectivePaymentUrl && (
            <div className="text-center pt-2">
              <a
                href={effectivePaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#777] hover:text-white underline underline-offset-4 tracking-wider transition-colors inline-block font-mono"
              >
                Jika jendela pembayaran tidak terbuka otomatis, klik di sini untuk membuka halaman pembayaran.
              </a>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
