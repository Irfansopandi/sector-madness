"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  getOrders,
  getOrderDetail,
  getShipmentTracking,
  type OrderListItem,
  type OrderDetailData,
  type TrackingData,
} from "@/utils/api";

export default function OrdersPage() {
  const [ordersList, setOrdersList] = useState<OrderListItem[]>([]);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetailData | null>(null);

  // Shipment Tracking Modal State (Biteship UI Preview)
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingResi, setTrackingResi] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  // Cancellation & Refund Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [cancelSuccessModalOpen, setCancelSuccessModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("Change shipping address");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [cancelNotes, setCancelNotes] = useState("");
  const [cancelErrorMsg, setCancelErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then((data) => setOrdersList(data || []))
      .catch(() => setOrdersList([]));
  }, []);

  const handleViewOrderDetails = async (orderNumber: string) => {
    try {
      const details = await getOrderDetail(orderNumber);
      setSelectedOrderDetail(details);
    } catch {
      const fallbackItem = ordersList.find((o) => o.order_number === orderNumber);
      if (fallbackItem) {
        setSelectedOrderDetail({
          order_number: orderNumber,
          order_date: fallbackItem.order_date || "-",
          customer_info: {
            name: "Customer",
            email: "-",
            phone: "-",
          },
          shipping_address: {
            receiver_name: "Customer",
            phone_number: "-",
            street_address: "Address recorded in invoice",
            city: "-",
            province: "-",
            postal_code: "-",
            label: "Main",
          },
          courier_info: {
            courier_code: "-",
            courier_name: fallbackItem.shipping_status ? `Status: ${fallbackItem.shipping_status}` : "Standard Shipping",
            service_code: "-",
            service_name: "-",
            estimated_delivery: "-",
            tracking_number: fallbackItem.tracking_number || undefined,
          },
          products: (fallbackItem as any).items || (fallbackItem as any).products || [],
          summary: {
            subtotal: fallbackItem.total || 0,
            shipping: 0,
            discount: 0,
            tax: 0,
            grand_total: fallbackItem.total || 0,
          },
          payment_info: {
            method: fallbackItem.payment_method || "Online Payment",
            payment_status: fallbackItem.payment_status || "pending",
          },
          shipping_status: fallbackItem.shipping_status || fallbackItem.status || "processing",
          timeline: [],
        });
      }
    }
  };

  const handleOpenTrackShipment = async (resiNumber?: string) => {
    const trackingNo = resiNumber || selectedOrderDetail?.courier_info?.tracking_number || selectedOrderDetail?.order_number || "BITESHIP-JNT-1725126548";
    setTrackingResi(trackingNo);
    setTrackingModalOpen(true);
    try {
      if (trackingNo && trackingNo !== "PENDING") {
        const data = await getShipmentTracking(trackingNo);
        setTrackingData(data);
      } else {
        setTrackingData(null);
      }
    } catch {
      setTrackingData(null);
    }
  };

  const handleConfirmReceived = (orderNumber: string) => {
    if (selectedOrderDetail && selectedOrderDetail.order_number === orderNumber) {
      setSelectedOrderDetail({ ...selectedOrderDetail, shipping_status: "DELIVERED" });
    }
    setOrdersList((prev) =>
      prev.map((ord) => (ord.order_number === orderNumber ? { ...ord, shipping_status: "DELIVERED", status: "DELIVERED" } : ord))
    );
  };

  const handleCancelOrder = (orderNumber: string) => {
    if (selectedOrderDetail && selectedOrderDetail.order_number === orderNumber) {
      setSelectedOrderDetail({ ...selectedOrderDetail, shipping_status: "CANCELLED" });
    }
    setOrdersList((prev) =>
      prev.map((ord) => (ord.order_number === orderNumber ? { ...ord, shipping_status: "CANCELLED", status: "CANCELLED" } : ord))
    );
  };

  const handleSubmitCancellation = () => {
    if (!selectedOrderDetail) return;
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setCancelErrorMsg("Please provide Bank/E-Wallet Name, Account Number, and Account Holder Name for refund verification.");
      setTimeout(() => setCancelErrorMsg(null), 5000);
      const el = document.getElementById("cancel-modal-container");
      if (el) el.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!cancelNotes.trim()) {
      setCancelErrorMsg("Please provide detailed reasons for your order cancellation.");
      setTimeout(() => setCancelErrorMsg(null), 5000);
      const el = document.getElementById("cancel-modal-container");
      if (el) el.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setCancelErrorMsg(null);
    setShowConfirmCancel(true);
  };

  const executeCancellation = () => {
    if (!selectedOrderDetail) return;
    if (selectedOrderDetail.order_number) {
      setSelectedOrderDetail({ ...selectedOrderDetail, shipping_status: "PENDING" });
    }
    setOrdersList((prev) =>
      prev.map((ord) => (ord.order_number === selectedOrderDetail.order_number ? { ...ord, shipping_status: "PENDING", status: "PENDING" } : ord))
    );
    
    setShowConfirmCancel(false);
    setCancelModalOpen(false);
    setCancelSuccessModalOpen(true);
    setTimeout(() => setCancelSuccessModalOpen(false), 5000);
  };

  return (
    <div className="bg-[#141414] border border-white/[0.08] p-8 md:p-10 lg:p-12 space-y-8 shadow-2xl">
      <div className="border-b border-white/[0.08] pb-6">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#F5F5F5]">ORDER HISTORY</h2>
        <p className="text-xs text-[#8A8A8A] mt-1 font-mono">Complete archive of all your fashion orders</p>
      </div>

      {ordersList.length === 0 ? (
        <div className="py-24 text-center space-y-6">
          <p className="text-sm text-[#8A8A8A] font-mono uppercase tracking-widest">No orders placed yet</p>
          <Link
            href="/shop"
            className="inline-block px-10 py-4 bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs uppercase font-bold tracking-[0.25em] hover:bg-white transition-colors shadow-lg"
          >
            START SHOPPING
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {ordersList.map((order) => (
            <div
              key={order.order_number}
              className="bg-[#0A0A0A] border border-white/[0.08] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/20 transition-colors"
            >
              <div className="space-y-3 font-mono text-xs flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-[#B6A47E] text-sm">{order.order_number}</span>
                  <span className="text-[#8A8A8A]">//</span>
                  <span className="text-[#8A8A8A]">{order.order_date}</span>
                </div>
                <div className="text-base font-extrabold text-[#F5F5F5] pt-1">
                  Rp {(order.total || 0).toLocaleString("id-ID")}
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/[0.08] pt-4 md:pt-0 flex-wrap">
                {(() => {
                  const payStatus = (order.payment_status || "").toUpperCase();
                  const isUnpaid = payStatus === "UNPAID" || payStatus === "PENDING" || payStatus === "AWAITING_PAYMENT";
                  const st = (order.shipping_status || order.status || "IN PROCESS").toUpperCase();
                  const isCancelled = st === "CANCELLED" || st === "DIBATALKAN";
                  const isDelivered = st === "DELIVERED" || st === "COMPLETED" || st === "RECEIVED" || st === "SELESAI";
                  const isReady = st === "READY TO SHIP" || st === "READY_TO_SHIP" || st === "PACKED" || st === "SIAP KIRIM";
                  const isInProcess = st === "ALLOCATED" || st === "PROCESSING" || st === "IN PROCESS";
                  const displayStatus = isCancelled ? "CANCELLED" : isDelivered ? "DELIVERED" : isReady ? "READY TO SHIP" : isInProcess ? "IN PROCESS" : st;
                  return (
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider border ${isCancelled ? "bg-red-500/10 text-red-400 border-red-500/20" : isDelivered ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : isReady ? "bg-sky-500/10 text-sky-400 border-sky-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                        {displayStatus}
                      </span>
                    </div>
                  );
                })()}
                <button
                  onClick={() => handleViewOrderDetails(order.order_number)}
                  className="px-7 py-3 bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs uppercase font-bold tracking-widest hover:bg-white transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL 1: ORDER DETAIL MODAL (Spacious Luxury Invoice Layout) ── */}
      <AnimatePresence>
        {selectedOrderDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ padding: "48px", gap: "36px" }}
              className="bg-[#141414] border border-white/[0.12] text-[#F5F5F5] w-[95vw] max-w-6xl max-h-[88vh] overflow-y-auto flex flex-col shadow-2xl relative rounded-sm"
            >
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="absolute top-6 right-6 text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors p-2 cursor-pointer"
                aria-label="Close Order Details"
              >
                ✕
              </button>

              <div style={{ paddingBottom: "24px" }} className="border-b border-white/[0.1] text-left">
                <span style={{ marginBottom: "10px" }} className="text-xs font-mono text-[#B6A47E] uppercase tracking-[0.25em] block font-bold">
                  [SECTOR MADNESS // INVOICE]
                </span>
                <h3 style={{ marginBottom: "8px" }} className="text-2xl md:text-3xl font-black uppercase tracking-wider text-[#F5F5F5] font-serif">
                  {selectedOrderDetail.order_number}
                </h3>
                <p className="text-xs font-mono text-[#8A8A8A]">
                  Ordered on {selectedOrderDetail.order_date || (selectedOrderDetail.created_at ? new Date(selectedOrderDetail.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "")}
                </p>
              </div>

              <div
                style={{ padding: "32px 48px" }}
                className="grid grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 bg-[#0A0A0A] border border-white/[0.08] font-mono text-xs text-left rounded-sm"
              >
                <div className="space-y-2 text-left">
                  <span className="text-[10px] md:text-[11px] text-[#8A8A8A] uppercase tracking-wider block font-bold">TOTAL</span>
                  <span className="text-[#B6A47E] font-black text-sm md:text-base block">Rp {(selectedOrderDetail.summary?.grand_total || (selectedOrderDetail as any).total || 0).toLocaleString("id-ID")}</span>
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-[10px] md:text-[11px] text-[#8A8A8A] uppercase tracking-wider block font-bold">PAYMENT METHOD</span>
                  <span className="text-[#F5F5F5] font-extrabold text-sm uppercase block">{selectedOrderDetail.payment_info?.method || (selectedOrderDetail as any).payment_method || "ONLINE PAYMENT"}</span>
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-[10px] md:text-[11px] text-[#8A8A8A] uppercase tracking-wider block font-bold">SHIPPING STATUS</span>
                  <span className="text-[#F5F5F5] font-extrabold text-sm uppercase block">
                    {(() => {
                      const st = (selectedOrderDetail.shipping_status || "PROCESSING").toUpperCase();
                      if (st === "ALLOCATED" || st === "PROCESSING" || st === "IN PROCESS") return "IN PROCESS";
                      if (st === "PACKED" || st === "READY_TO_SHIP" || st === "READY TO SHIP" || st === "READY FOR DISPATCH" || st === "SIAP KIRIM") return "READY TO SHIP";
                      if (st === "DELIVERED" || st === "SHIPPED" || st === "COMPLETED" || st === "IN TRANSIT") return "DELIVERED";
                      if (st === "PENDING" || st === "UNPAID") return "PENDING PAYMENT";
                      return st;
                    })()}
                  </span>
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-[10px] md:text-[11px] text-[#8A8A8A] uppercase tracking-wider block font-bold">COURIER</span>
                  <span className="text-[#F5F5F5] font-extrabold text-sm uppercase block">{selectedOrderDetail.courier_info?.courier_name || "J&T EXPRESS"}</span>
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-[10px] md:text-[11px] text-[#8A8A8A] uppercase tracking-wider block font-bold">TRACKING NO.</span>
                  <span className="text-[#B6A47E] font-extrabold text-sm uppercase block">{selectedOrderDetail.courier_info?.tracking_number || "BITESHIP-JNT-1725126548"}</span>
                </div>
              </div>

              {/* ITEM LIST */}
              <div style={{ gap: "20px" }} className="flex flex-col text-left">
                <span className="text-xs font-mono text-[#8A8A8A] uppercase tracking-[0.25em] block font-bold">
                  ORDERED PRODUCTS
                </span>
                <div style={{ gap: "20px" }} className="flex flex-col">
                  {(selectedOrderDetail.products || (selectedOrderDetail as any).items || [])?.map((item: any, idx: number) => {
                    const prodName = item.product_name || item.name || "SECTOR 002 OVERSIZED TRENCH";
                    const prodImg = item.product_image || (idx % 2 === 0 ? "/images/hero/hero-1.png" : "/images/campaign/campaign-1.png");
                    const color = item.color || "Midnight Navy";
                    const size = item.size || "S";
                    const qty = item.quantity || 1;
                    const price = (item.price || 0) * qty;

                    return (
                      <div
                        key={idx}
                        style={{ padding: "24px" }}
                        className="flex items-center gap-8 bg-[#0A0A0A] border border-white/[0.08] hover:border-[#B6A47E]/40 transition-colors rounded-sm"
                      >
                        <div className="w-24 h-32 relative bg-[#161616] flex-shrink-0 border border-white/[0.08] overflow-hidden">
                          <Image src={prodImg} alt={prodName} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                          <h4 style={{ marginBottom: "10px" }} className="text-lg md:text-xl font-black text-[#F5F5F5] uppercase tracking-wide font-serif truncate">
                            {prodName}
                          </h4>
                          <p style={{ marginBottom: "14px" }} className="text-xs font-mono text-[#8A8A8A] tracking-widest uppercase">
                            {color} // {size} // QTY: {qty}
                          </p>
                          <p className="text-base font-mono text-[#B6A47E] font-black">
                            Rp {price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SHIPPING ADDRESS */}
              {selectedOrderDetail.shipping_address && (
                <div style={{ paddingTop: "28px", gap: "12px" }} className="flex flex-col border-t border-white/[0.1] font-mono text-xs text-left">
                  <span className="text-xs text-[#8A8A8A] uppercase tracking-[0.2em] block font-bold">SHIPPING ADDRESS</span>
                  <p className="text-[#F5F5F5] text-sm font-bold tracking-wide">{selectedOrderDetail.shipping_address.receiver_name} ({selectedOrderDetail.shipping_address.phone_number})</p>
                  <p className="text-[#8A8A8A] leading-relaxed text-xs">{selectedOrderDetail.shipping_address.street_address}, {selectedOrderDetail.shipping_address.city}, {selectedOrderDetail.shipping_address.province} {selectedOrderDetail.shipping_address.postal_code}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {(() => {
                  const payStatus = (selectedOrderDetail.payment_info?.payment_status || (selectedOrderDetail as any).payment_status || "").toUpperCase();
                  const isUnpaid = payStatus === "UNPAID" || payStatus === "PENDING" || payStatus === "AWAITING_PAYMENT";
                  const st = (selectedOrderDetail.shipping_status || "PROCESSING").toUpperCase();
                  const isCancelled = st === "CANCELLED" || st === "DIBATALKAN";
                  const isInProcessOrPending =
                    st === "IN PROCESS" || st === "PROCESSING" || st === "ALLOCATED" ||
                    st === "PENDING" || st === "PENDING PAYMENT" || st === "UNPAID";
                  const isReadyToShip =
                    st === "READY TO SHIP" || st === "READY_TO_SHIP" || st === "PACKED" || st === "READY FOR DISPATCH" || st === "SIAP KIRIM";
                  const isDelivered =
                    st === "DELIVERED" || st === "COMPLETED" || st === "RECEIVED" || st === "SELESAI";
                  const isShippedOrDelivered = !isInProcessOrPending && !isReadyToShip && !isCancelled;

                  return (
                    <>
                      {isUnpaid && !isCancelled && (
                        <Link
                          href={`/checkout?order_number=${selectedOrderDetail.order_number}`}
                          style={{ padding: "20px 0" }}
                          className="flex-1 bg-white hover:bg-[#E0E0E0] text-[#0A0A0A] font-mono text-xs uppercase font-extrabold tracking-[0.25em] transition-all duration-300 cursor-pointer rounded-sm block text-center"
                        >
                          PAY NOW
                        </Link>
                      )}

                      {!isUnpaid && (
                        <button
                          onClick={() => handleOpenTrackShipment(selectedOrderDetail.courier_info?.tracking_number)}
                          style={{ padding: "20px 0" }}
                          className="flex-1 bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs uppercase font-extrabold tracking-[0.25em] hover:bg-white transition-all duration-300 cursor-pointer shadow-xl rounded-sm block text-center"
                        >
                          TRACK SHIPMENT
                        </button>
                      )}

                      {isInProcessOrPending && (
                        <button
                          onClick={() => setCancelModalOpen(true)}
                          style={{ padding: "20px 0" }}
                          className="flex-1 border border-white/[0.2] hover:border-red-500/80 text-[#8A8A8A] hover:text-red-400 font-mono text-xs uppercase font-extrabold tracking-[0.25em] transition-all duration-300 cursor-pointer rounded-sm block text-center"
                        >
                          CANCEL ORDER
                        </button>
                      )}

                      {isShippedOrDelivered && !isDelivered && (
                        <button
                          onClick={() => handleConfirmReceived(selectedOrderDetail.order_number)}
                          style={{ padding: "20px 0" }}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0A] font-mono text-xs uppercase font-extrabold tracking-[0.25em] transition-all duration-300 cursor-pointer shadow-xl rounded-sm block text-center"
                        >
                          ✓ CONFIRM RECEIVED
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 2: SHIPMENT TRACKING PREVIEW MODAL (REALTIME & NO WRAP) ── */}
      <AnimatePresence>
        {trackingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              style={{ padding: "48px", gap: "32px" }}
              className="bg-[#141414] border border-white/[0.12] text-[#F5F5F5] w-full max-w-2xl flex flex-col shadow-2xl relative text-left rounded-sm"
            >
              <button
                onClick={() => setTrackingModalOpen(false)}
                className="absolute top-6 right-6 text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors p-2 cursor-pointer"
                aria-label="Close Tracking"
              >
                ✕
              </button>

              <div style={{ paddingBottom: "20px" }} className="border-b border-white/[0.08] text-left">
                <span style={{ marginBottom: "8px" }} className="text-[10px] font-mono text-[#B6A47E] uppercase tracking-widest block font-bold">[BITESHIP LOGISTICS INTEGRATION]</span>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#F5F5F5] font-serif mt-1">SHIPMENT TRACKING</h3>
                <p className="text-xs font-mono text-[#8A8A8A] mt-2">TRACKING NO: {trackingResi}</p>
              </div>

              <div style={{ padding: "28px", gap: "20px" }} className="bg-[#0A0A0A] border border-white/[0.08] font-mono text-xs flex flex-col rounded-sm">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[#8A8A8A]">Courier Partner:</span>
                  <span className="text-[#F5F5F5] font-extrabold uppercase text-right">
                    {trackingData?.courier || selectedOrderDetail?.courier_info?.courier_name || "BITESHIP // J&T EXPRESS"}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[#8A8A8A]">Current Status:</span>
                  <span className="text-[#B6A47E] font-extrabold uppercase text-right">
                    {trackingData?.current_status || (() => {
                      const st = (selectedOrderDetail?.shipping_status || "IN PROCESS").toUpperCase();
                      if (st === "ALLOCATED" || st === "PROCESSING" || st === "IN PROCESS") return "IN PROCESS";
                      if (st === "PACKED" || st === "READY_TO_SHIP" || st === "READY TO SHIP" || st === "READY FOR DISPATCH" || st === "SIAP KIRIM") return "READY TO SHIP";
                      return st;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[#8A8A8A]">Estimated Delivery:</span>
                  <span className="text-[#F5F5F5] font-extrabold text-right">
                    {trackingData?.estimated_delivery || selectedOrderDetail?.courier_info?.estimated_delivery || "1 - 3 Business Days"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setTrackingModalOpen(false)}
                style={{ padding: "18px 0" }}
                className="w-full border border-white/[0.12] text-[#8A8A8A] hover:text-[#F5F5F5] hover:border-white/30 font-mono text-xs uppercase font-bold tracking-widest transition-colors cursor-pointer block text-center rounded-sm"
              >
                Close Tracking
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* ── MODAL 4: ORDER CANCELLATION & REFUND FORM MODAL ── */}
      <AnimatePresence>
        {cancelModalOpen && selectedOrderDetail && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            <motion.div
              id="cancel-modal-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ padding: "60px", gap: "32px" }}
              className="bg-[#141414] border border-white/[0.15] text-[#F5F5F5] w-full max-w-3xl flex flex-col shadow-2xl relative text-left rounded-sm max-h-[90vh] overflow-y-auto font-sans"
            >
              <button
                onClick={() => { setCancelModalOpen(false); setCancelErrorMsg(null); }}
                className="absolute top-6 right-6 text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors p-2 cursor-pointer font-mono text-xl"
                aria-label="Close Cancel Form"
              >
                ✕
              </button>

              <div className="border-b border-white/[0.1] pb-4">
                <span className="text-xs font-mono text-red-500 uppercase tracking-[0.25em] block font-bold">
                  [ATELIER ORDER CANCELLATION]
                </span>
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-wide text-[#F5F5F5] mt-1.5 font-serif">
                  CANCELLATION & REFUND FORM
                </h3>
                <p className="text-xs text-[#8A8A8A] font-mono mt-1">
                  Invoice Ref: <span className="text-[#F5F5F5] font-bold">{selectedOrderDetail.order_number}</span>
                </p>
              </div>

              {cancelErrorMsg && (
                <div style={{ margin: "0 24px -16px 24px", padding: "16px 20px" }} className="bg-[#0A0A0A] border border-red-500/50 text-red-400 text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-3.5 rounded-none shadow-xl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-500">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{cancelErrorMsg}</span>
                </div>
              )}

              <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: "40px" }}>
                {/* CANCELLATION REASON */}
                <div className="space-y-4">
                  <label className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest block font-bold">
                    1. CANCELLATION REASON:
                  </label>
                  <div className="relative" style={{ marginTop: "16px" }}>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      style={{ padding: "18px 24px" }}
                      className="w-full bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] font-mono text-sm uppercase focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 rounded-sm cursor-pointer appearance-none transition-all"
                    >
                    <option value="Change shipping address">Change shipping address</option>
                    <option value="Change or add order items">Change or add order items</option>
                    <option value="Incorrect payment method selected">Incorrect payment method selected</option>
                    <option value="Financial constraint / Cancel purchase">Financial constraint / Cancel purchase</option>
                    <option value="Other reasons (explain below)">Other reasons (explain below)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#8A8A8A]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

                {/* REFUND ACCOUNT DETAILS */}
                <div className="space-y-8 pt-6 border-t border-white/[0.08]">
                  <label className="text-xs font-mono text-[#B6A47E] uppercase tracking-widest block font-bold">
                    2. REFUND ACCOUNT DETAILS:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8" style={{ marginTop: "24px" }}>
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-[#8A8A8A] block uppercase tracking-wider">BANK NAME / E-WALLET *</span>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g., BCA / Mandiri / OVO / PayPal"
                        style={{ padding: "18px 24px" }}
                        className="w-full bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] font-mono text-sm focus:outline-none focus:border-[#B6A47E] focus:ring-1 focus:ring-[#B6A47E]/50 rounded-sm placeholder:text-[#444444] transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-[#8A8A8A] block uppercase tracking-wider">ACCOUNT NUMBER / PHONE *</span>
                      <input
                        type="number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g., 1234567890"
                        style={{ padding: "18px 24px" }}
                        className="w-full bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] font-mono text-sm focus:outline-none focus:border-[#B6A47E] focus:ring-1 focus:ring-[#B6A47E]/50 rounded-sm placeholder:text-[#444444] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2" style={{ marginTop: "32px" }}>
                    <span className="text-[11px] font-mono text-[#8A8A8A] block uppercase tracking-wider">ACCOUNT HOLDER NAME *</span>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Full name as shown on bank / e-wallet account"
                      style={{ padding: "18px 24px" }}
                      className="w-full bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] font-mono text-sm focus:outline-none focus:border-[#B6A47E] focus:ring-1 focus:ring-[#B6A47E]/50 rounded-sm placeholder:text-[#444444] transition-all"
                    />
                  </div>
                </div>

                {/* ADDITIONAL NOTES */}
                <div className="space-y-3 pt-4">
                  <label className="text-xs font-mono text-red-400 uppercase tracking-widest block font-bold">
                    3. ADDITIONAL EXPLANATION (REQUIRED):
                  </label>
                  <textarea
                    rows={3}
                    value={cancelNotes}
                    onChange={(e) => setCancelNotes(e.target.value)}
                    placeholder="Please explain your detailed cancellation reasons here..."
                    style={{ padding: "18px 24px", marginTop: "16px" }}
                    className="w-full bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] font-mono text-sm focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/50 rounded-sm placeholder:text-[#444444] transition-all"
                  />
                </div>
              </div>

              {/* IMPORTANT NOTE: PROCESS 1-3 DAYS */}
              <div style={{ padding: "16px 20px" }} className="bg-[#1C1C1C] border border-white/[0.12] rounded-sm text-xs font-mono leading-relaxed space-y-1.5">
                <div className="font-bold text-[#F5F5F5] tracking-wider uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>ESTIMATED REFUND PROCESS (1 - 3 BUSINESS DAYS)</span>
                </div>
                <p className="text-[#8A8A8A] text-[11px] leading-relaxed">
                  Your cancellation request will be submitted directly to the Atelier administration team. Once verified and approved by the system, funds will be refunded to the designated account above within an estimated <strong>1 - 3 business days</strong>.
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => { setCancelModalOpen(false); setCancelErrorMsg(null); }}
                  style={{ padding: "18px 0" }}
                  className="flex-1 border border-white/10 text-[#8A8A8A] hover:text-white font-mono text-xs uppercase font-bold tracking-widest transition-colors rounded-sm cursor-pointer block text-center"
                >
                  BACK
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCancellation}
                  style={{ padding: "18px 0" }}
                  className="flex-[2] bg-[#B6A47E] hover:bg-white text-[#0A0A0A] font-mono text-xs uppercase font-extrabold tracking-[0.2em] transition-colors shadow-lg rounded-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>SUBMIT CANCELLATION & REFUND</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 5: CUSTOM CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showConfirmCancel && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, translateY: 10 }}
              style={{ padding: "48px 40px" }}
              className="bg-[#141414] border border-[#B6A47E]/40 text-[#F5F5F5] w-full max-w-lg flex flex-col items-center text-center shadow-2xl rounded-sm font-sans relative"
            >
              <div className="mb-8">
                <svg className="w-10 h-10 text-red-500/90 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold uppercase tracking-widest text-[#F5F5F5] font-serif mb-6">
                CONFIRM CANCELLATION
              </h3>

              <p className="text-xs sm:text-sm text-[#8A8A8A] font-mono leading-loose mb-8 max-w-sm">
                Are you sure you want to submit a cancellation request for this order? Your request will be forwarded to our administrative team and your order status will be updated to <span className="text-[#B6A47E] font-bold">PENDING</span>.
              </p>

              <div className="flex items-center gap-4 w-full pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmCancel(false)}
                  style={{ padding: "16px 0" }}
                  className="flex-1 border border-white/15 hover:border-white/40 text-[#8A8A8A] hover:text-white font-mono text-xs uppercase font-bold tracking-widest rounded-sm transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={executeCancellation}
                  style={{ padding: "16px 0" }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-mono text-xs uppercase font-extrabold tracking-widest rounded-sm transition-all shadow-lg cursor-pointer"
                >
                  YES, PROCEED
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL 6: CUSTOM SUCCESS NOTIFICATION MODAL ── */}
      <AnimatePresence>
        {cancelSuccessModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, translateY: 10 }}
              style={{ padding: "48px 40px" }}
              className="bg-[#141414] border border-[#B6A47E]/40 text-[#F5F5F5] w-full max-w-lg flex flex-col items-center text-center shadow-2xl rounded-sm font-sans relative"
            >
              <div className="mb-6">
                <svg className="w-12 h-12 text-[#B6A47E] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold uppercase tracking-widest text-[#F5F5F5] font-serif mb-4">
                REQUEST SUBMITTED
              </h3>

              <p className="text-xs sm:text-sm text-[#8A8A8A] font-mono leading-loose mb-8 max-w-sm">
                Your cancellation and refund request has been successfully submitted to our administrative team. Your order status is currently <span className="text-[#B6A47E] font-bold">PENDING</span> and will be verified within 1 - 3 business days.
              </p>

              <button
                type="button"
                onClick={() => setCancelSuccessModalOpen(false)}
                style={{ padding: "16px 0" }}
                className="w-full bg-[#B6A47E] hover:bg-white text-[#0A0A0A] font-mono text-xs uppercase font-extrabold tracking-widest rounded-sm transition-all shadow-lg cursor-pointer"
              >
                GOT IT & CLOSE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
