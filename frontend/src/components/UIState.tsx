"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/* ====================================================
   SKELETON LOADERS
==================================================== */

export const Skeleton: React.FC<{ className?: string }> = ({ className = "h-6 w-full" }) => {
  return (
    <div
      className={`animate-pulse bg-[#1A1A1A]/80 border border-[#2A2A2A]/40 ${className}`}
    />
  );
};

export const BagItemSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 py-8 border-b border-[#222222] animate-pulse">
      <div className="w-28 h-36 bg-[#1A1A1A] border border-[#2A2A2A] shrink-0" />
      <div className="flex-1 space-y-4 w-full">
        <div className="h-4 bg-[#2A2A2A] w-3/5" />
        <div className="h-3 bg-[#1A1A1A] w-2/5" />
        <div className="flex items-center gap-4 pt-2">
          <div className="h-8 w-24 bg-[#1A1A1A] border border-[#2A2A2A]" />
          <div className="h-4 bg-[#2A2A2A] w-16" />
        </div>
      </div>
      <div className="space-y-2 text-right shrink-0 w-full sm:w-auto">
        <div className="h-5 bg-[#2A2A2A] w-32 ml-auto" />
        <div className="h-3 bg-[#1A1A1A] w-20 ml-auto" />
      </div>
    </div>
  );
};

export const AddressSkeleton: React.FC = () => {
  return (
    <div className="p-6 border border-[#2A2A2A] bg-[#0D0D0D] animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-[#2A2A2A] w-24" />
        <div className="h-4 bg-[#1A1A1A] w-16" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-4 bg-[#2A2A2A] w-3/4" />
        <div className="h-3 bg-[#1A1A1A] w-full" />
        <div className="h-3 bg-[#1A1A1A] w-4/5" />
      </div>
      <div className="pt-3 border-t border-[#1F1F1F] flex justify-end gap-3">
        <div className="h-6 w-16 bg-[#1A1A1A]" />
        <div className="h-6 w-16 bg-[#1A1A1A]" />
      </div>
    </div>
  );
};

export const ShippingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 border border-[#2A2A2A] bg-[#0E0E0E] animate-pulse space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="h-4 bg-[#2A2A2A] w-24" />
              <div className="h-3 bg-[#1A1A1A] w-36" />
            </div>
            <div className="h-5 bg-[#2A2A2A] w-20" />
          </div>
          <div className="h-3 bg-[#1A1A1A] w-full pt-2" />
          <div className="h-3 bg-[#2A2A2A] w-1/3" />
        </div>
      ))}
    </div>
  );
};

export const PaymentMethodSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="p-5 border border-[#262626] bg-[#0F0F0F] animate-pulse space-y-3 flex flex-col justify-between h-36">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-[#2A2A2A] w-28" />
            <div className="h-6 w-6 bg-[#1F1F1F] rounded-none" />
          </div>
          <div className="space-y-1">
            <div className="h-3 bg-[#1F1F1F] w-full" />
            <div className="h-3 bg-[#1A1A1A] w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SummarySkeleton: React.FC = () => {
  return (
    <div className="p-8 border border-[#262626] bg-[#0A0A0A] text-white animate-pulse space-y-6">
      <div className="h-6 bg-[#2A2A2A] w-48 border-b border-[#222222] pb-4" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 bg-[#1A1A1A] w-24" />
            <div className="h-3 bg-[#2A2A2A] w-28" />
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-[#222222] flex justify-between items-center">
        <div className="h-5 bg-[#2A2A2A] w-32" />
        <div className="h-6 bg-[#3F3318] w-40" />
      </div>
      <div className="h-14 bg-[#1C1C1C] border border-[#2A2A2A] w-full" />
    </div>
  );
};

export const OrderDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-12 bg-[#1A1A1A] border border-[#2A2A2A] w-full max-w-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-[#0E0E0E] border border-[#222] space-y-3">
            <div className="h-4 bg-[#2A2A2A] w-32" />
            <div className="h-3 bg-[#1A1A1A] w-full" />
            <div className="h-3 bg-[#1A1A1A] w-4/5" />
          </div>
        ))}
      </div>
      <div className="space-y-4 pt-6 border-t border-[#222]">
        <BagItemSkeleton />
        <BagItemSkeleton />
      </div>
    </div>
  );
};

export const TrackingSkeleton: React.FC = () => {
  return (
    <div className="p-8 border border-[#262626] bg-[#0D0D0D] animate-pulse space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#222]">
        <div className="space-y-2">
          <div className="h-3 bg-[#1F1F1F] w-32" />
          <div className="h-6 bg-[#2A2A2A] w-48" />
        </div>
        <div className="h-8 bg-[#1A1A1A] px-6 w-36" />
      </div>
      <div className="space-y-6 relative border-l border-[#262626] ml-4 pl-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 relative">
            <div className="absolute -left-[37px] top-1 w-4 h-4 bg-[#2A2A2A]" />
            <div className="h-4 bg-[#2A2A2A] w-44" />
            <div className="h-3 bg-[#1A1A1A] w-32" />
            <div className="h-3 bg-[#1F1F1F] w-full max-w-md" />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ====================================================
   ERROR STATE WITH RETRY BUTTON
==================================================== */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "SYSTEM ERROR // COMMUNICATION INTERRUPTED",
  message = "Unable to establish stable telemetry with Sector Madness API server or Biteship gateway. Please verify your connection or retry.",
  onRetry,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto p-10 md:p-14 border border-[#331111] bg-[#0E0707] text-white text-center flex flex-col items-center justify-center shadow-2xl"
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
    >
      <span className="inline-block px-3 py-1 bg-[#881111] text-white font-mono text-[10px] tracking-[0.25em] uppercase font-bold mb-6">
        [HTTP EXCEPTION ALERT]
      </span>
      <h3 className="text-lg md:text-xl font-extrabold tracking-[0.1em] uppercase mb-3 text-[#FFFFFF]">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-[#A0A0A0] tracking-wide leading-relaxed max-w-lg mb-8 uppercase font-mono">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-8 py-4 bg-[#FFFFFF] text-[#0A0A0A] font-bold text-[11px] uppercase tracking-[0.25em] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all duration-300 shadow-md border border-white cursor-pointer"
        >
          RETRY REQUEST // EXECUTE
        </button>
      )}
    </motion.div>
  );
};

/* ====================================================
   EMPTY STATE
==================================================== */

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  actionHref?: string;
  iconText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "SHOPPING BAG IS CURRENTLY EMPTY",
  message = "You have not reserved any Sector Madness technical garments in your current session. Explore our curated catalog and archive series to begin.",
  actionText = "DISCOVER THE ATELIER",
  actionHref = "/shop",
  iconText = "[00 // VOID]",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto p-12 md:p-16 border border-[#262626] bg-[#0D0D0D] text-white text-center flex flex-col items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
    >
      <div className="font-mono text-[11px] tracking-[0.3em] text-[#8A8A8A] border border-[#2A2A2A] px-4 py-1.5 mb-6">
        {iconText}
      </div>
      <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.15em] text-white mb-4">
        {title}
      </h2>
      <p className="text-xs md:text-sm text-[#888888] max-w-md mx-auto tracking-widest leading-relaxed uppercase font-mono mb-10">
        {message}
      </p>
      <Link
        href={actionHref}
        className="inline-block px-10 py-5 bg-[#FFFFFF] text-[#0A0A0A] font-black text-[12px] uppercase tracking-[0.25em] hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all duration-300 shadow-lg cursor-pointer"
      >
        {actionText}
      </Link>
    </motion.div>
  );
};
