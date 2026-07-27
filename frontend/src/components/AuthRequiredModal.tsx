"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthRequiredModal({ isOpen, onClose }: AuthRequiredModalProps) {
  const router = useRouter();

  const handleNavigate = (mode?: "register") => {
    const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/shop";
    const targetUrl = mode === "register"
      ? `/login?mode=register&redirect=${encodeURIComponent(currentPath)}`
      : `/login?redirect=${encodeURIComponent(currentPath)}`;
    
    onClose();
    router.push(targetUrl);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-[#000000]/90 backdrop-blur-md flex items-center justify-center p-6 sm:p-10"
          style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] bg-[#0A0A0A] border border-[#262626] p-10 md:p-14 text-center text-[#F5F5F5] shadow-2xl overflow-hidden"
          >
            {/* Subtle Champagne Gold Top Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#B6A47E]" />

            <div className="space-y-6">
              <span style={{ fontSize: "11px", letterSpacing: "0.25em" }} className="uppercase text-[#8A8A8A] font-semibold block">
                MEMBERSHIP PROTOCOL
              </span>

              {/* Modal Title */}
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                  lineHeight: "1.15",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
                className="uppercase text-[#FFFFFF] tracking-tight"
              >
                Sign in to continue
              </h2>

              {/* Modal Description */}
              <p style={{ fontSize: "14.5px", lineHeight: "1.75", fontWeight: 300 }} className="text-[#999999] max-w-sm mx-auto">
                Sign in or create an account to add this item to your Shopping Bag and continue your shopping experience.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-10 space-y-4">
              {/* Primary: Sign In */}
              <button
                type="button"
                onClick={() => handleNavigate()}
                style={{ fontSize: "11.5px", letterSpacing: "0.24em", padding: "18px 0" }}
                className="w-full bg-[#FFFFFF] text-[#0A0A0A] uppercase font-bold hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-colors duration-300 rounded-none cursor-pointer block text-center shadow-lg"
              >
                SIGN IN
              </button>

              {/* Secondary: Create Account */}
              <button
                type="button"
                onClick={() => handleNavigate("register")}
                style={{ fontSize: "11.5px", letterSpacing: "0.24em", padding: "18px 0" }}
                className="w-full bg-transparent text-[#F5F5F5] border border-[#2E2E2E] hover:border-[#B6A47E] hover:text-[#B6A47E] uppercase font-semibold transition-colors duration-300 rounded-none cursor-pointer block text-center"
              >
                CREATE ACCOUNT
              </button>
            </div>

            {/* Text Button: Continue Browsing */}
            <div className="mt-8 pt-6 border-t border-[#1C1C1C]">
              <button
                type="button"
                onClick={onClose}
                style={{ fontSize: "11px", letterSpacing: "0.2em" }}
                className="text-[#777777] hover:text-[#FFFFFF] uppercase transition-colors duration-200 cursor-pointer font-medium"
              >
                CONTINUE BROWSING
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
