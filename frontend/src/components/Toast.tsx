"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info", title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((message: string, title?: string) => showToast(message, "success", title), [showToast]);
  const error = useCallback((message: string, title?: string) => showToast(message, "error", title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200000] flex flex-col gap-3 pointer-events-none w-full max-w-[380px] px-4 md:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const borderColors: Record<ToastType, string> = {
              success: "border-l-[#D4AF37] border-[#333333]", // Luxury Gold border
              error: "border-l-[#E53E3E] border-[#333333]",   // Crimson Alert
              warning: "border-l-[#DD6B20] border-[#333333]", // Amber
              info: "border-l-[#FFFFFF] border-[#333333]",    // Obsidian White
            };

            const typeLabel: Record<ToastType, string> = {
              success: "PROTOCOL // SUCCESS",
              error: "PROTOCOL // ERROR",
              warning: "PROTOCOL // NOTICE",
              info: "SECTOR // ATELIER",
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.96 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto w-full bg-[#0A0A0A] text-[#FFFFFF] p-5 shadow-2xl border-l-4 border ${borderColors[toast.type]} backdrop-blur-md`}
                style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1C1C1C]">
                  <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#8A8A8A] font-bold">
                    {toast.title || typeLabel[toast.type]}
                  </span>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className="text-[#666666] hover:text-[#FFFFFF] transition-colors font-mono text-base leading-none pl-4"
                  >
                    ×
                  </button>
                </div>
                <p className="text-[12px] font-medium tracking-[0.05em] uppercase leading-relaxed text-[#EDEDED]">
                  {toast.message}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
