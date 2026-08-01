"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#0D0D0D",
              border: "1px solid #222222",
              color: "#F5F5F5",
              boxShadow: "0 32px 80px rgba(0,0,0,0.9)",
              padding: "40px 36px 36px 36px",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {/* Top Close Icon */}
            <button
              type="button"
              onClick={onClose}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "none",
                color: "#777777",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close modal"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Warning Icon in Center */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#221810",
                border: "1px solid #442C1A",
                color: "#B6A47E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Header & Description */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <span
                style={{
                  display: "block",
                  fontFamily: "monospace",
                  fontSize: "10px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#B6A47E",
                  fontWeight: 600,
                  marginBottom: "10px",
                }}
              >
                LOGOUT CONFIRMATION
              </span>

              <h3
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "18px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  letterSpacing: "0.08em",
                  marginBottom: "14px",
                }}
              >
                LOG OUT OF YOUR ACCOUNT?
              </h3>

              {/* Centered Description */}
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  color: "#A0A0A0",
                  fontWeight: 300,
                  lineHeight: "1.8",
                  textAlign: "center",
                  maxWidth: "380px",
                  margin: "0 auto",
                  padding: "0 10px",
                }}
              >
                Are you sure you want to sign out? You will need to log in again to access your account dashboard and wishlist.
              </p>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  backgroundColor: "transparent",
                  border: "1px solid #333333",
                  color: "#CCCCCC",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  backgroundColor: "#E53E3E",
                  border: "1px solid #E53E3E",
                  color: "#FFFFFF",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {isLoading ? "LOGGING OUT..." : "YES, LOG OUT"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
