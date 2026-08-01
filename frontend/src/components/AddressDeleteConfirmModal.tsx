"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";

interface AddressDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

export default function AddressDeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: AddressDeleteConfirmModalProps) {
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
            zIndex: 100000,
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
              maxWidth: "460px",
              backgroundColor: "#0D0D0D",
              border: "1px solid #262626",
              color: "#F5F5F5",
              boxShadow: "0 32px 80px rgba(0,0,0,0.9)",
              padding: "40px 36px 36px 36px",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {/* Top Close Button */}
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
                transition: "color 0.2s",
              }}
              className="hover:text-white"
              aria-label="Close modal"
            >
              <X style={{ width: "18px", height: "18px" }} />
            </button>

            {/* Trash Icon Circle */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#221010",
                border: "1px solid #441A1A",
                color: "#FF4D4D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto",
              }}
            >
              <Trash2 style={{ width: "24px", height: "24px" }} />
            </div>

            {/* Title & Description */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <span
                style={{
                  display: "block",
                  fontFamily: "monospace",
                  fontSize: "10px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#FF4D4D",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                DELETE ADDRESS CONFIRMATION
              </span>

              <h3
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "18px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "#FFFFFF",
                  letterSpacing: "0.06em",
                  marginBottom: "14px",
                }}
              >
                REMOVE THIS ADDRESS?
              </h3>

              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  color: "#A0A0A0",
                  lineHeight: "1.7",
                  textAlign: "center",
                  maxWidth: "380px",
                  margin: "0 auto",
                }}
              >
                Are you sure you want to delete this shipping address from your saved address book? This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                paddingTop: "8px",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  padding: "14px 0",
                  backgroundColor: "transparent",
                  border: "1px solid #333333",
                  color: "#CCCCCC",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                className="hover:border-white hover:text-white"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                style={{
                  padding: "14px 0",
                  backgroundColor: "#881111",
                  border: "1px solid #AA2222",
                  color: "#FFFFFF",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 20px rgba(136,17,17,0.4)",
                }}
                className="hover:bg-[#AA1111] hover:border-[#CC3333]"
              >
                {isLoading ? "DELETING..." : "YES, DELETE"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
