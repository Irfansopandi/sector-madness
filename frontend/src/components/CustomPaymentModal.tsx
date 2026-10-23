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
  const [activeTab, setActiveTab] = useState<"mbanking" | "atm" | "ibanking">("mbanking");
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
      error("Payment session is being initialized. Please wait a moment...");
      return;
    }

    setIsSnapLoading(true);

    if (typeof window !== "undefined" && (window as any).snap && snapToken) {
      setIsSnapLoading(false);
      (window as any).snap.pay(snapToken, {
        onSuccess: (result: any) => {
          showToast("Payment confirmed! Processing your shipment.", "success", "TRANSACTION SUCCESS");
          onPaymentConfirmed();
        },
        onPending: (result: any) => {
          showToast("Awaiting settlement. Please complete your bank transfer or scan.", "info", "AWAITING SETTLEMENT");
        },
        onError: (result: any) => {
          error("Payment authorization failed or was declined.");
        },
        onClose: () => {
          showToast("Payment window closed. Click [ I HAVE COMPLETED PAYMENT ] once transferred.", "info", "WINDOW CLOSED");
        },
      });
    } else if (effectivePaymentUrl) {
      setIsSnapLoading(false);
      window.open(effectivePaymentUrl, "_blank");
    } else {
      setIsSnapLoading(false);
      error("Failed to load Midtrans portal. Please try again.");
    }
  }, [snapToken, effectivePaymentUrl, error, showToast, onPaymentConfirmed]);

  // Auto open Midtrans Snap when modal opens
  useEffect(() => {
    if (!isOpen || !snapToken) return;
    const timer = setTimeout(() => {
      handleOpenSnap();
    }, 600);
    return () => clearTimeout(timer);
  }, [isOpen, snapToken, handleOpenSnap]);

  // Check real-time payment verification directly with server
  const handleConfirmPayment = async () => {
    setIsVerifying(true);
    showToast("Connecting to banking settlement system...", "info", "VERIFYING PAYMENT");
    
    try {
      const { checkPaymentStatus } = await import("@/utils/api");
      const res = await checkPaymentStatus(orderNumber);
      
      if (res.status && res.is_paid) {
        showToast("Payment confirmed! Processing your shipment.", "success", "TRANSACTION SUCCESS");
        onPaymentConfirmed();
      } else {
        setIsVerifying(false);
        error(`Payment not yet completed (Status: ${res.transaction_status || "pending"}). Reopening payment gateway...`);
        setTimeout(() => {
          handleOpenSnap();
        }, 800);
      }
    } catch (err: any) {
      setIsVerifying(false);
      error("Verification failed. Please try again or wait a moment.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto animate-fadeIn">
      {/* Main Luxury Modal Container */}
      <div style={{ fontFamily: "'Roboto', sans-serif" }} className="w-full max-w-4xl bg-[#0A0A0A] border border-[#252525] text-white shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[98vh] sm:max-h-[94vh]">
        
        {/* Top Protocol Bar */}
        <div className="bg-[#111111] border-b border-[#222222] px-6 sm:px-10 py-5 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.8)] shrink-0" />
            <span className="text-[9px] sm:text-xs text-white font-bold tracking-wider sm:tracking-[0.25em] uppercase truncate">
              SECTOR MADNESS <span className="hidden sm:inline">// CORE PAY GATEWAY</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[9px] sm:text-[11px] text-[#888] hover:text-white transition-colors font-extrabold tracking-wider sm:tracking-[0.2em] uppercase px-4 py-2 sm:px-3 sm:py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] shrink-0"
          >
            [ X ] <span className="hidden sm:inline">CLOSE</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1" style={{ padding: "clamp(32px, 5vw, 56px)" }}>
          <div className="space-y-14">

            {/* ─── SECTION 1: Order Identity & Timer ─── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8 w-full" style={{ paddingBottom: "32px", borderBottom: "1px solid #1E1E1E" }}>
              <div className="space-y-3 w-full sm:w-auto overflow-hidden">
                <span className="text-[11px] sm:text-xs text-[#666] uppercase tracking-[0.25em] block font-bold">
                  TRANSACTION REFERENCE
                </span>
                <div className="text-[13px] min-[375px]:text-sm sm:text-2xl font-black text-white tracking-[0.15em] uppercase whitespace-nowrap overflow-x-auto">
                  {orderNumber}
                </div>
                <span className="text-[10px] sm:text-[11px] text-[#FFFFFF] font-bold uppercase tracking-[0.2em] block truncate">
                  STATUS: AWAITING CUSTOMER SETTLEMENT
                </span>
              </div>

              <div className="flex items-center justify-between sm:block sm:text-right shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <span className="text-[10px] sm:text-[11px] text-[#777] uppercase tracking-[0.2em] block font-bold sm:mb-2">
                  PAYMENT EXPIRES IN
                </span>
                <div className="text-base sm:text-xl font-black text-white tracking-[0.12em]">
                  {String(timeLeft.hours).padStart(2, "0")} : {String(timeLeft.minutes).padStart(2, "0")} : {String(timeLeft.seconds).padStart(2, "0")}
                </div>
              </div>
            </div>

            {/* ─── SECTION 2: Total Amount Payable ─── */}
            <div className="bg-[#111111] border border-[#252525] flex flex-col sm:flex-row items-start sm:items-center justify-between" style={{ padding: "32px", gap: "24px" }}>
              <div className="space-y-2">
                <span className="text-[11px] sm:text-xs text-[#888] uppercase tracking-[0.25em] block font-bold">
                  TOTAL AMOUNT PAYABLE
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider">
                  {formatIDR(grossAmount)}
                </div>
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-[#1A1A1A] border border-[#333] px-3 py-1.5">
                AUTOMATED 24/7 SETTLEMENT
              </span>
            </div>

            {/* ─── SECTION 3: Verified Channels & Instructions ─── */}
            <div className="space-y-10">

              {/* Payment Channel Details Card */}
              <div className="bg-[#111111] border border-[#252525]" style={{ padding: "clamp(24px, 4vw, 40px)" }}>
                <div className="space-y-10">

                  {/* Partner Header */}
                  <div className="flex items-center justify-between" style={{ paddingBottom: "24px", borderBottom: "1px solid #222" }}>
                    <div className="space-y-2">
                      <span className="text-[11px] text-[#777] uppercase tracking-[0.25em] block font-bold">
                        PAYMENT GATEWAY PARTNER
                      </span>
                      <div className="text-base sm:text-lg font-extrabold text-white uppercase tracking-[0.15em]">
                        MIDTRANS VERIFIED PROTOCOL
                      </div>
                    </div>
                    <span className="text-[11px] font-black bg-white/10 border border-white/20 text-white tracking-[0.15em] uppercase hidden sm:block" style={{ padding: "8px 16px" }}>
                      AUTOMATED 24/7
                    </span>
                  </div>

                  {/* Channel Options Display (Clean single bar) */}
                  <div className="space-y-4">
                    <span className="text-xs text-[#999] uppercase tracking-[0.25em] block font-bold">
                      AVAILABLE PAYMENT METHODS :
                    </span>
                    <div 
                      className="w-full bg-[#050505] border border-[#333] font-bold text-white tracking-[0.15em] sm:tracking-[0.2em] select-all text-center shadow-inner text-xs sm:text-base py-5 px-6"
                    >
                      BNI • MANDIRI • BRI • QRIS
                    </div>
                  </div>

                </div>
              </div>

              {/* Instructions Tabbed System */}
              <div className="bg-[#0E0E0E] border border-[#222222] overflow-hidden">
                {/* Tabs */}
                <div className="grid grid-cols-3 border-b border-[#222222] bg-[#0A0A0A]">
                  <button
                    onClick={() => setActiveTab("mbanking")}
                    className={`text-center text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.2em] border-r border-[#222] transition-colors ${
                      activeTab === "mbanking" ? "bg-[#161616] text-white border-b-2 border-b-white" : "text-[#666] hover:text-[#AAA]"
                    }`}
                    style={{ padding: "18px 12px" }}
                  >
                    M-BANKING
                  </button>
                  <button
                    onClick={() => setActiveTab("atm")}
                    className={`text-center text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.2em] border-r border-[#222] transition-colors ${
                      activeTab === "atm" ? "bg-[#161616] text-white border-b-2 border-b-white" : "text-[#666] hover:text-[#AAA]"
                    }`}
                    style={{ padding: "18px 12px" }}
                  >
                    ATM TRANSFER
                  </button>
                  <button
                    onClick={() => setActiveTab("ibanking")}
                    className={`text-center text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.2em] transition-colors ${
                      activeTab === "ibanking" ? "bg-[#161616] text-white border-b-2 border-b-white" : "text-[#666] hover:text-[#AAA]"
                    }`}
                    style={{ padding: "18px 12px" }}
                  >
                    I-BANKING
                  </button>
                </div>

                {/* Tab Content */}
                <div className="text-[13px] sm:text-sm text-[#BBBBBB] tracking-wide text-justify" style={{ padding: "clamp(28px, 4vw, 48px)" }}>
                  {activeTab === "mbanking" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>01</span>
                        <p style={{ lineHeight: "2" }}>Select <span className="text-white font-bold">BNI, Mandiri, BRI, or QRIS</span> in the payment window to generate your official payment code.</p>
                      </div>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>02</span>
                        <p style={{ lineHeight: "2" }}>Open your Mobile Banking application (BNI Mobile, Livin, BRImo) or E-Wallet (GoPay, DANA, OVO).</p>
                      </div>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>03</span>
                        <p style={{ lineHeight: "2" }}>Navigate to <span className="text-white font-bold">Transfer &gt; Virtual Account</span> (or scan QRIS code) for <span className="text-white font-black">{formatIDR(grossAmount)}</span>.</p>
                      </div>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>04</span>
                        <p style={{ lineHeight: "2" }}>Once transfer is authorized, return here and click <span className="text-white font-bold">I HAVE COMPLETED PAYMENT</span> below.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "atm" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>01</span>
                        <p style={{ lineHeight: "2" }}>Select your destination bank <span className="text-white font-bold">(BNI, Mandiri, or BRI)</span> in the payment gateway window.</p>
                      </div>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>02</span>
                        <p style={{ lineHeight: "2" }}>Insert your ATM Card and enter your PIN at any ATM terminal.</p>
                      </div>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>03</span>
                        <p style={{ lineHeight: "2" }}>Choose <span className="text-white font-bold">Other Transactions</span> &gt; <span className="text-white font-bold">Transfer</span> &gt; <span className="text-white font-bold">To Virtual Account</span>.</p>
                      </div>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>04</span>
                        <p style={{ lineHeight: "2" }}>Input destination Virtual Account number displayed on screen and confirm transaction.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === "ibanking" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>01</span>
                        <p style={{ lineHeight: "2" }}>Obtain your bank Virtual Account number from the payment gateway portal.</p>
                      </div>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>02</span>
                        <p style={{ lineHeight: "2" }}>Sign in to your Internet Banking portal with your credentials.</p>
                      </div>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>03</span>
                        <p style={{ lineHeight: "2" }}>Navigate to <span className="text-white font-bold">Funds Transfer</span> &gt; <span className="text-white font-bold">Virtual Account Transfer</span>.</p>
                      </div>
                      <div className="flex items-start" style={{ gap: "20px" }}>
                        <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>04</span>
                        <p style={{ lineHeight: "2" }}>Insert the destination Virtual Account number and confirm authorization using token or MFA.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Action Footer - Single Tall Monochrome Button */}
        <div className="bg-[#111111] border-t border-[#222222] p-6 sm:p-8 shrink-0 flex flex-col gap-3">
          <button
            onClick={handleConfirmPayment}
            disabled={isVerifying}
            className={`w-full text-sm sm:text-base font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center shadow-2xl py-6 sm:py-7 px-8 min-h-[68px] sm:min-h-[74px] ${
              isVerifying
                ? "bg-[#1A1A1A] text-[#666666] cursor-not-allowed border border-[#333333]"
                : "bg-white text-black hover:bg-[#EAEAEA] active:scale-[0.99] border border-white"
            }`}
          >
            {isVerifying ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-[#666666] border-t-black rounded-full animate-spin" />
                <span>VERIFYING NETWORK SETTLEMENT...</span>
              </div>
            ) : (
              <span>[ ✓ I HAVE COMPLETED PAYMENT ]</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
