"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

interface BagToastProps {
  show: boolean;
  onClose: () => void;
  message?: string;
}

export default function BagToast({ show, onClose, message = "Item successfully reserved in your bag." }: BagToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[100000] bg-[#0A0A0A] border-l-4 border-l-[#FFFFFF] border border-[#262626] p-6 shadow-2xl pointer-events-auto bottom-6 left-4 right-4 sm:left-auto sm:right-8 sm:bottom-8 sm:w-[340px]"
          style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C] mb-4">
            <span style={{ fontSize: "10px", letterSpacing: "0.22em" }} className="uppercase font-mono text-[#8A8A8A] font-semibold">
              SECTOR // ATELIER
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notification"
              className="text-[#666666] hover:text-[#FFFFFF] transition-colors cursor-pointer font-mono text-base leading-none"
            >
              ×
            </button>
          </div>
          
          {/* Body Message */}
          <p style={{ fontSize: "13px", letterSpacing: "0.04em", fontWeight: 600 }} className="text-[#FFFFFF] uppercase tracking-wide mb-6">
            {message === "Added to your Shopping Bag." ? "ITEM RESERVED IN SHOPPING BAG" : message}
          </p>

          {/* Action */}
          <Link
            href="/bag"
            onClick={onClose}
            style={{ fontSize: "11px", letterSpacing: "0.22em", padding: "14px 0" }}
            className="block w-full bg-[#FFFFFF] text-[#0A0A0A] text-center font-bold uppercase hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 shadow-md cursor-pointer"
          >
            VIEW SHOPPING BAG
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
