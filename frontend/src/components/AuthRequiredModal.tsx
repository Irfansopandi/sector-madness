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
      ? `/register?redirect=${encodeURIComponent(currentPath)}`
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
          className="fixed inset-0 z-[100] bg-[#000000]/85 backdrop-blur-sm flex items-center justify-center p-6 sm:p-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] bg-[#0A0A0A] border border-[#1E1E1E] text-[#F5F5F5] shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 z-10 text-[#555555] hover:text-[#F5F5F5] transition-colors duration-200 cursor-pointer"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>

            {/* Top Accent */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#B6A47E]/60 to-transparent" />

            {/* Content */}
            <div className="px-12 pt-16 pb-14 md:px-14 md:pt-20 md:pb-16">
              <div className="mb-12" style={{ textAlign: "center" }}>
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#666666] font-medium block mb-5">
                  ACCOUNT REQUIRED
                </span>

                <h2
                  className="uppercase text-[#FFFFFF] mb-5"
                  style={{
                    fontSize: "clamp(1.3rem, 2.4vw, 1.7rem)",
                    lineHeight: "1.2",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}
                >
                  Sign in to continue
                </h2>

                <p style={{ textAlign: "center", margin: "0 auto" }} className="text-[13px] leading-[1.7] text-[#777777] font-light">
                  Please sign in or create an account<br />to add items to your bag.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleNavigate()}
                  className="w-full py-4 bg-[#F5F5F5] text-[#0A0A0A] text-[11px] tracking-[0.22em] uppercase font-semibold hover:bg-[#B6A47E] transition-colors duration-300 cursor-pointer"
                >
                  SIGN IN
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("register")}
                  className="w-full py-4 bg-transparent text-[#CCCCCC] border border-[#262626] text-[11px] tracking-[0.22em] uppercase font-medium hover:border-[#555555] hover:text-[#F5F5F5] transition-all duration-300 cursor-pointer"
                >
                  CREATE ACCOUNT
                </button>
              </div>

              {/* Continue Browsing */}
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[10px] tracking-[0.2em] text-[#555555] hover:text-[#AAAAAA] uppercase transition-colors duration-200 cursor-pointer font-medium"
                >
                  CONTINUE BROWSING
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
