"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

interface CustomPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: () => void;
  orderNumber: string;
  paymentMethod: string;
  grossAmount: number;
  receiverName?: string;
  vaNumber?: string;
  qrString?: string;
}

export default function CustomPaymentModal({
  isOpen,
  onClose,
  onPaymentConfirmed,
  orderNumber,
  paymentMethod,
  grossAmount,
  receiverName = "Customer",
  vaNumber,
  qrString,
}: CustomPaymentModalProps) {
  const { showToast, error } = useToast();
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"mbanking" | "atm" | "ibanking">("mbanking");
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 45 });

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

  if (!isOpen) return null;

  // Format currency
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine VA prefix & bank info
  const getPaymentDetails = () => {
    const code = paymentMethod.toLowerCase();
    const cleanOrderDigits = orderNumber.replace(/\D/g, "").padEnd(6, "0").slice(0, 8);

    switch (code) {
      case "bca_va":
        return {
          type: "va",
          title: "BCA VIRTUAL ACCOUNT",
          bankName: "BANK CENTRAL ASIA (BCA)",
          vaNumber: vaNumber || `807770${cleanOrderDigits}`,
          color: "#0066AE",
        };
      case "mandiri_va":
      case "echannel":
        return {
          type: "va",
          title: "MANDIRI VIRTUAL ACCOUNT",
          bankName: "BANK MANDIRI (BILL / VA)",
          vaNumber: vaNumber || `891180${cleanOrderDigits}`,
          color: "#003A70",
        };
      case "bri_va":
        return {
          type: "va",
          title: "BRI VIRTUAL ACCOUNT (BRIVA)",
          bankName: "BANK RAKYAT INDONESIA",
          vaNumber: vaNumber || `230000${cleanOrderDigits}`,
          color: "#00529C",
        };
      case "bni_va":
        return {
          type: "va",
          title: "BNI VIRTUAL ACCOUNT",
          bankName: "BANK NEGARA INDONESIA",
          vaNumber: vaNumber || `827720${cleanOrderDigits}`,
          color: "#F15A22",
        };
      case "permata_va":
        return {
          type: "va",
          title: "PERMATA VIRTUAL ACCOUNT",
          bankName: "BANK PERMATA",
          vaNumber: vaNumber || `850010${cleanOrderDigits}`,
          color: "#009B4D",
        };
      case "cimb_va":
        return {
          type: "va",
          title: "CIMB VIRTUAL ACCOUNT",
          bankName: "BANK CIMB NIAGA",
          vaNumber: vaNumber || `273000${cleanOrderDigits}`,
          color: "#009B4D",
        };
      case "qris":
      case "other_qris":
      case "gopay":
      case "ovo":
      case "dana":
      case "shopeepay":
      default:
        return {
          type: "ewallet",
          title: code === "qris" ? "QRIS UNIVERSAL INSTANT SCAN" : `${code.toUpperCase()} INSTANT SCAN`,
          bankName: "QRIS NATIONAL PAYMENT PROTOCOL",
          vaNumber: null,
          color: "#202020",
        };
    }
  };

  const paymentInfo = getPaymentDetails();

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(label);
    showToast(`${label} copied to clipboard!`, "success", "CLIPBOARD COPIED");
    setTimeout(() => setCopiedType(null), 3000);
  };

  // Check real-time payment verification
  const handleConfirmPayment = async () => {
    setIsVerifying(true);
    showToast("Connecting to banking settlement system...", "info", "VERIFYING PAYMENT");
    
    try {
      // Lazy load api.ts to avoid cyclical imports or SSR issues
      const { checkPaymentStatus } = await import("@/utils/api");
      const res = await checkPaymentStatus(orderNumber);
      
      if (res.status && res.is_paid) {
        showToast("Payment confirmed! Processing your shipment.", "success", "TRANSACTION SUCCESS");
        onPaymentConfirmed();
      } else {
        setIsVerifying(false);
        error(`Payment not yet received (Status: ${res.transaction_status}). Please complete your transfer and try again.`);
      }
    } catch (err: any) {
      setIsVerifying(false);
      error("Verification failed. Please try again or wait a moment.");
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto animate-fadeIn">
      {/* Main Luxury Modal Container */}
      <div className="w-full max-w-4xl bg-[#0A0A0A] border border-[#252525] text-white font-mono shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Protocol Bar */}
        <div className="bg-[#111111] border-b border-[#222222] px-8 sm:px-10 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            <span className="text-[11px] sm:text-xs text-white font-bold tracking-[0.25em] uppercase">
              SECTOR MADNESS // CORE PAY GATEWAY
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[11px] text-[#888] hover:text-white transition-colors font-extrabold tracking-[0.2em] uppercase px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333]"
          >
            [ X ] CLOSE
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1" style={{ padding: "clamp(32px, 5vw, 56px)" }}>
          <div className="space-y-14">

            {/* ─── SECTION 1: Order Identity & Timer ─── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8" style={{ paddingBottom: "32px", borderBottom: "1px solid #1E1E1E" }}>
              <div className="space-y-3">
                <span className="text-[11px] sm:text-xs text-[#666] uppercase tracking-[0.25em] block font-bold">
                  TRANSACTION REFERENCE
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-[0.15em] uppercase">
                  {orderNumber}
                </h2>
                <span className="text-[11px] text-[#A67C00] font-bold uppercase tracking-[0.2em] block">
                  STATUS: AWAITING CUSTOMER SETTLEMENT
                </span>
              </div>

              <div className="bg-[#131313] border border-[#252525] text-right shrink-0" style={{ padding: "20px 28px" }}>
                <span className="text-[10px] sm:text-[11px] text-[#777] uppercase tracking-[0.2em] block font-bold" style={{ marginBottom: "8px" }}>
                  PAYMENT TIMELINE EXPIRES IN
                </span>
                <div className="text-lg sm:text-xl font-black text-white tracking-[0.12em]">
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
              <button
                onClick={() => handleCopy(grossAmount.toString(), "Amount")}
                className={`border font-extrabold text-[11px] uppercase tracking-[0.2em] transition-all duration-200 shrink-0 ${
                  copiedType === "Amount"
                    ? "bg-white text-black border-white"
                    : "bg-[#1A1A1A] text-[#CCC] border-[#383838] hover:border-white hover:text-white"
                }`}
                style={{ padding: "16px 28px" }}
              >
                {copiedType === "Amount" ? "✓ COPIED AMOUNT" : "COPY AMOUNT"}
              </button>
            </div>

            {/* ─── SECTION 3: VA or QRIS ─── */}
            {paymentInfo.type === "va" ? (
              <div className="space-y-10">

                {/* VA Number Card */}
                <div className="bg-[#111111] border border-[#252525]" style={{ padding: "clamp(24px, 4vw, 40px)" }}>
                  <div className="space-y-10">

                    {/* Bank Header */}
                    <div className="flex items-center justify-between" style={{ paddingBottom: "24px", borderBottom: "1px solid #222" }}>
                      <div className="space-y-2">
                        <span className="text-[11px] text-[#777] uppercase tracking-[0.25em] block font-bold">
                          VIRTUAL ACCOUNT PARTNER
                        </span>
                        <h3 className="text-base sm:text-lg font-extrabold text-white uppercase tracking-[0.15em]">
                          {paymentInfo.title}
                        </h3>
                      </div>
                      <span className="text-[11px] font-black bg-white/10 border border-white/20 text-white tracking-[0.15em] uppercase hidden sm:block" style={{ padding: "8px 16px" }}>
                        AUTOMATED 24/7
                      </span>
                    </div>

                    {/* VA Number Display */}
                    <div className="space-y-5">
                      <span className="text-xs text-[#999] uppercase tracking-[0.25em] block font-bold">
                        VIRTUAL ACCOUNT NUMBER :
                      </span>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center" style={{ gap: "16px" }}>
                        <div className="flex-1 bg-[#050505] border border-[#333] font-black text-white tracking-[0.2em] select-all text-center sm:text-left shadow-inner text-lg sm:text-2xl" style={{ padding: "20px 28px" }}>
                          {paymentInfo.vaNumber}
                        </div>
                        <button
                          onClick={() => handleCopy(paymentInfo.vaNumber || "", "VA Number")}
                          className={`font-extrabold text-[11px] sm:text-xs uppercase tracking-[0.2em] transition-all shrink-0 border ${
                            copiedType === "VA Number"
                              ? "bg-transparent text-white border-white font-black"
                              : "bg-white text-black hover:bg-[#E0E0E0] border-white"
                          }`}
                          style={{ padding: "20px 32px" }}
                        >
                          {copiedType === "VA Number" ? "✓ VA COPIED" : "COPY VA NUMBER"}
                        </button>
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
                          <p style={{ lineHeight: "2" }}>Open your Mobile Banking Application (e.g. BCA Mobile / Livin by Mandiri / BRImo / myBCA) and login to your account.</p>
                        </div>
                        <div className="flex items-start" style={{ gap: "20px" }}>
                          <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>02</span>
                          <p style={{ lineHeight: "2" }}>Select menu <span className="text-white font-bold">Transfer</span> &gt; <span className="text-white font-bold">Virtual Account / Bill Payment</span>.</p>
                        </div>
                        <div className="flex items-start" style={{ gap: "20px" }}>
                          <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>03</span>
                          <p style={{ lineHeight: "2" }}>Input Virtual Account Number <span className="text-white font-black underline underline-offset-4 select-all">{paymentInfo.vaNumber}</span> and select Continue.</p>
                        </div>
                        <div className="flex items-start" style={{ gap: "20px" }}>
                          <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>04</span>
                          <p style={{ lineHeight: "2" }}>Verify that merchant name displays <span className="text-white font-black">SECTOR MADNESS</span> and total corresponds to <span className="text-white font-bold">{formatIDR(grossAmount)}</span>. Enter PIN to complete.</p>
                        </div>
                      </div>
                    )}

                    {activeTab === "atm" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                        <div className="flex items-start" style={{ gap: "20px" }}>
                          <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>01</span>
                          <p style={{ lineHeight: "2" }}>Insert ATM Card and enter your PIN at any bank ATM terminal.</p>
                        </div>
                        <div className="flex items-start" style={{ gap: "20px" }}>
                          <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>02</span>
                          <p style={{ lineHeight: "2" }}>Choose <span className="text-white font-bold">Other Transactions</span> &gt; <span className="text-white font-bold">Transfer</span> &gt; <span className="text-white font-bold">To Virtual Account</span>.</p>
                        </div>
                        <div className="flex items-start" style={{ gap: "20px" }}>
                          <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>03</span>
                          <p style={{ lineHeight: "2" }}>Enter number <span className="text-white font-black underline underline-offset-4">{paymentInfo.vaNumber}</span> and press Correct.</p>
                        </div>
                        <div className="flex items-start" style={{ gap: "20px" }}>
                          <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>04</span>
                          <p style={{ lineHeight: "2" }}>Inspect payment receipt upon completion. Our server will receive an automated callback instantly.</p>
                        </div>
                      </div>
                    )}

                    {activeTab === "ibanking" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                        <div className="flex items-start" style={{ gap: "20px" }}>
                          <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>01</span>
                          <p style={{ lineHeight: "2" }}>Access Internet Banking web browser portal and sign in with your credentials.</p>
                        </div>
                        <div className="flex items-start" style={{ gap: "20px" }}>
                          <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>02</span>
                          <p style={{ lineHeight: "2" }}>Navigate to <span className="text-white font-bold">Funds Transfer</span> &gt; <span className="text-white font-bold">Virtual Account Transfer</span>.</p>
                        </div>
                        <div className="flex items-start" style={{ gap: "20px" }}>
                          <span className="font-extrabold text-white bg-[#1A1A1A] border border-[#333] text-[11px] sm:text-xs shrink-0" style={{ padding: "8px 14px", marginTop: "2px" }}>03</span>
                          <p style={{ lineHeight: "2" }}>Insert destination VA <span className="text-white font-black underline underline-offset-4">{paymentInfo.vaNumber}</span> and confirm authorization using hardware token or MFA.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* ─── E-WALLET / QRIS SCAN DISPLAY ─── */
              <div className="bg-[#111111] border border-[#252525] flex flex-col items-center text-center" style={{ padding: "clamp(32px, 5vw, 56px)" }}>
                <div className="space-y-3" style={{ marginBottom: "32px" }}>
                  <span className="text-[11px] sm:text-xs text-[#777] uppercase tracking-[0.3em] block font-bold">
                    UNIVERSAL SCAN PROTOCOL
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white uppercase tracking-[0.2em]">
                    {paymentInfo.title}
                  </h3>
                </div>
                
                {/* QR Code Box */}
                <div className="bg-white border-[6px] border-[#1A1A1A] shadow-2xl flex flex-col items-center" style={{ padding: "clamp(24px, 4vw, 40px)", gap: "24px", marginBottom: "32px" }}>
                  <div className="bg-[#1A1A1A] text-white font-black tracking-[0.25em] text-[11px] w-full uppercase text-center" style={{ padding: "10px 20px", borderBottom: "3px solid black" }}>
                    SCAN TO PAY IN IDR
                  </div>
                  {qrString ? (
                    <img 
                      src={qrString.startsWith("http") ? qrString : `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrString)}&margin=12`} 
                      alt="QRIS Code" 
                      width={280} 
                      height={280}
                      className="w-full max-w-[280px] aspect-square block border-4 border-black" 
                    />
                  ) : (
                    <svg width="280" height="280" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px] aspect-square block">
                      <rect width="200" height="200" fill="white"/>
                      <rect x="20" y="20" width="45" height="45" stroke="black" strokeWidth="8"/>
                      <rect x="30" y="30" width="25" height="25" fill="black"/>
                      <rect x="135" y="20" width="45" height="45" stroke="black" strokeWidth="8"/>
                      <rect x="145" y="30" width="25" height="25" fill="black"/>
                      <rect x="20" y="135" width="45" height="45" stroke="black" strokeWidth="8"/>
                      <rect x="30" y="145" width="25" height="25" fill="black"/>
                      <path d="M85 20H115V35H85V20Z" fill="black"/>
                      <path d="M95 45H105V75H95V45Z" fill="black"/>
                      <path d="M135 85H180V100H135V85Z" fill="black"/>
                      <path d="M20 85H65V100H20V85Z" fill="black"/>
                      <path d="M85 165H115V180H85V165Z" fill="black"/>
                      <path d="M85 115H180V130H85V115Z" fill="black"/>
                      <path d="M85 135H105V150H85V135Z" fill="black"/>
                      <path d="M135 150H180V180H135V150ZM150 165H165V150H150V165Z" fill="black"/>
                    </svg>
                  )}
                </div>

                <div className="bg-[#0A0A0A] border border-[#222] w-full text-left max-w-lg" style={{ padding: "24px 28px" }}>
                  <div className="flex items-center text-[11px] text-[#A78BFA] font-bold tracking-[0.2em] uppercase" style={{ gap: "8px", marginBottom: "12px" }}>
                    <span>ℹ INSTANT AUTOMATIC RECOGNITION</span>
                  </div>
                  <p className="text-[13px] text-[#AAA] text-justify" style={{ lineHeight: "1.9" }}>
                    Once scanned and verified in your application, this window will automatically synchronize with our dispatch server within seconds. No manual screenshot verification required.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-[#111111] border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between shrink-0" style={{ padding: "24px clamp(24px, 4vw, 40px)", gap: "16px" }}>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-transparent border border-[#333333] hover:border-white text-[#999] hover:text-white text-[11px] font-bold uppercase tracking-[0.25em] transition-colors text-center"
            style={{ padding: "16px 28px" }}
          >
            PAY LATER / CHANGE METHOD
          </button>

          <button
            onClick={handleConfirmPayment}
            disabled={isVerifying}
            className={`w-full sm:flex-1 text-[13px] sm:text-sm font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center shadow-2xl ${
              isVerifying
                ? "bg-[#1A1A1A] text-[#666666] cursor-not-allowed border border-[#333333]"
                : "bg-white text-black hover:bg-[#EAEAEA] active:scale-[0.99] border border-white"
            }`}
            style={{ padding: "18px 28px", gap: "12px" }}
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-[#666] border-t-white rounded-full animate-spin" />
                <span>VERIFYING NETWORK SETTLEMENT...</span>
              </>
            ) : (
              <span>[ ✓ I HAVE COMPLETED PAYMENT ]</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
