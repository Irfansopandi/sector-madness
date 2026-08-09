"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  getOrders,
  getOrderDetail,
  isOrderFinished,
  getImageUrl,
  type OrderListItem,
  type OrderDetailData,
} from "@/utils/api";

export default function OrderHistoryPage() {
  const [ordersList, setOrdersList] = useState<OrderListItem[]>([]);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetailData | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    getOrders()
      .then((data) => {
        if (!data) return;
        const finishedOnly = data.filter(isOrderFinished);
        setOrdersList(finishedOnly);
        try {
          localStorage.setItem("sector_madness_history_orders", JSON.stringify(finishedOnly));
        } catch {}
      })
      .catch(() => {});
  }, []);

  const handleViewOrderDetails = async (orderNumber: string) => {
    try {
      const details = await getOrderDetail(orderNumber);
      setSelectedOrderDetail(details);
    } catch {
      const fallbackItem = ordersList.find((o) => o.order_number === orderNumber);
      if (fallbackItem) {
        const itemAddr = (fallbackItem as any).shipping_address || (fallbackItem as any).address || {};
        setSelectedOrderDetail({
          order_number: orderNumber,
          order_date: fallbackItem.order_date || "-",
          customer_info: {
            name: itemAddr.receiver_name || (fallbackItem as any).customer_name || "Customer",
            email: (fallbackItem as any).email || "-",
            phone: itemAddr.phone_number || (fallbackItem as any).phone || "-",
          },
          shipping_address: {
            receiver_name: itemAddr.receiver_name || (fallbackItem as any).receiver_name || "Customer",
            phone_number: itemAddr.phone_number || (fallbackItem as any).phone_number || "-",
            street_address: itemAddr.street_address || (fallbackItem as any).street_address || (fallbackItem as any).address || "Address recorded in invoice",
            district: itemAddr.district || (fallbackItem as any).district || "",
            city: itemAddr.city || (fallbackItem as any).city || "-",
            province: itemAddr.province || (fallbackItem as any).province || "-",
            postal_code: itemAddr.postal_code || itemAddr.postcode || itemAddr.zip_code || (fallbackItem as any).postal_code || (fallbackItem as any).postcode || (fallbackItem as any).zip_code || "-",
            label: itemAddr.label || "Main Address",
          },
          courier_info: {
            courier_code: (fallbackItem as any).courier || "-",
            courier_name: (fallbackItem as any).courier_name || (fallbackItem.shipping_status ? `Status: ${fallbackItem.shipping_status}` : "Standard Shipping"),
            service_code: "-",
            service_name: "-",
            estimated_delivery: "-",
            tracking_number: fallbackItem.tracking_number || undefined,
          },
          products: (fallbackItem as any).items || (fallbackItem as any).products || (fallbackItem as any).order_items || [],
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



  const cellStyle = {
    paddingTop: "20px",
    paddingBottom: "20px",
    paddingLeft: "16px",
    paddingRight: "16px",
  };

  const headerStyle = {
    paddingTop: "16px",
    paddingBottom: "16px",
    paddingLeft: "16px",
    paddingRight: "16px",
  };

  return (
    <div className="bg-[#141414] border border-white/[0.08] p-6 sm:p-8 space-y-6 shadow-2xl">
      {/* Header with SHOW dropdown */}
      <div style={{ paddingTop: "20px", paddingBottom: "20px", paddingLeft: "16px", paddingRight: "16px" }} className="border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#F5F5F5]">ORDER HISTORY</h2>
          <p className="text-xs text-[#8A8A8A] mt-1 font-mono">Archive of your completed and received fashion orders</p>
        </div>

        {ordersList.length > 0 && (
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8A8A8A" }}>
              SHOW:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "9px 14px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "6px",
                outline: "none",
                cursor: "pointer",
                backgroundColor: "#121214",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
              }}
            >
              <option value={5} className="bg-[#121214]">5 ROWS</option>
              <option value={10} className="bg-[#121214]">10 ROWS</option>
              <option value={20} className="bg-[#121214]">20 ROWS</option>
              <option value={50} className="bg-[#121214]">50 ROWS</option>
            </select>
          </div>
        )}
      </div>

      {ordersList.length === 0 ? (
        <div style={{ padding: "72px 24px 88px 24px" }} className="w-full flex flex-col items-center justify-center text-center">
          <div style={{ marginBottom: "28px" }} className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#B6A47E] shadow-sm">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p style={{ marginBottom: "18px" }} className="text-sm font-mono uppercase tracking-[0.2em] text-[#8A8A8A] font-bold">No completed order history yet</p>
          <Link
            href="/shop"
            style={{ padding: "16px 36px" }}
            className="inline-block bg-white text-[#0A0A0A] font-mono text-xs uppercase font-black tracking-[0.25em] hover:bg-[#B6A47E] transition-all shadow-xl rounded-sm"
          >
            START SHOPPING
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-white/[0.1] text-[#8A8A8A] uppercase tracking-widest text-[11px] whitespace-nowrap">
                <th style={headerStyle} className="font-bold whitespace-nowrap">ORDER NO. & DATE</th>
                <th style={headerStyle} className="font-bold whitespace-nowrap">ITEMS</th>
                <th style={headerStyle} className="font-bold whitespace-nowrap">TOTAL</th>
                <th style={headerStyle} className="font-bold whitespace-nowrap">PAYMENT</th>
                <th style={headerStyle} className="font-bold whitespace-nowrap">STATUS</th>
                <th style={headerStyle} className="font-bold text-right whitespace-nowrap">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {ordersList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => {
                const rawItems = (order as any).items || (order as any).products || (order as any).order_items;
                const count = order.items_count || (rawItems ? rawItems.length : 1);
                const itemName = `${count} Item(s) in order`;

                const payStatus = (order.payment_status || "PENDING").toUpperCase();
                const isPaid = payStatus === "PAID" || payStatus === "SETTLED" || payStatus === "SUCCESS";

                const shipStatus = (order.shipping_status || order.status || "PROCESSING").toUpperCase();
                const isCancelled = shipStatus === "CANCELLED" || shipStatus === "DIBATALKAN";
                const isCompleted = shipStatus === "COMPLETED" || shipStatus === "RECEIVED" || shipStatus === "SELESAI" || shipStatus === "DITERIMA";
                const isDelivered = shipStatus === "DELIVERED";
                const isShipped = shipStatus === "SHIPPED" || shipStatus === "IN TRANSIT" || shipStatus === "IN_TRANSIT" || shipStatus === "PACKED" || shipStatus === "READY_TO_SHIP" || shipStatus === "READY TO SHIP" || shipStatus === "READY FOR DISPATCH" || shipStatus === "SIAP KIRIM";
                const isReady = isShipped;
                const isInProcess = shipStatus === "ALLOCATED" || shipStatus === "PROCESSING" || shipStatus === "IN PROCESS";
                const displayStatus = isCancelled ? "CANCELLED" : isCompleted ? "COMPLETED" : isDelivered ? "DELIVERED" : isShipped ? "READY TO SHIP" : isInProcess ? "IN PROCESS" : shipStatus;

                return (
                  <tr key={order.order_number} className="hover:bg-white/[0.02] transition-colors">
                    {/* Order Number & Date - Strictly No Wrap */}
                    <td style={cellStyle} className="align-middle whitespace-nowrap">
                      <div className="font-bold text-[#B6A47E] text-sm tracking-wide whitespace-nowrap">{order.order_number}</div>
                      <div className="text-[#8A8A8A] text-[11px] mt-1.5 whitespace-nowrap">{order.order_date}</div>
                    </td>

                    {/* Product Name */}
                    <td style={cellStyle} className="align-middle font-sans text-sm font-semibold text-[#F5F5F5] whitespace-nowrap">
                      {itemName}
                    </td>

                    {/* Total Price */}
                    <td style={cellStyle} className="align-middle font-extrabold text-[#F5F5F5] text-sm whitespace-nowrap">
                      Rp {(order.total || 0).toLocaleString("id-ID")}
                    </td>

                    {/* Payment Tag */}
                    <td style={cellStyle} className="align-middle whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase whitespace-nowrap ${isPaid ? "text-[#B6A47E]" : "text-amber-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-[#B6A47E]" : "bg-amber-400"}`} />
                        {payStatus}
                      </span>
                    </td>

                    {/* Shipping Status Tag */}
                    <td style={cellStyle} className="align-middle whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase whitespace-nowrap ${isCancelled ? "text-red-500" : isDelivered ? "text-emerald-400" : isReady ? "text-sky-400" : isInProcess ? "text-[#B6A47E]" : "text-amber-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isCancelled ? "bg-red-500" : isDelivered ? "bg-emerald-400" : isReady ? "bg-sky-400" : isInProcess ? "bg-[#B6A47E]" : "bg-amber-400"} ${isInProcess || isReady ? "animate-pulse" : ""}`} />
                        {displayStatus}
                      </span>
                    </td>

                    {/* Action Arrow Link */}
                    <td style={cellStyle} className="align-middle text-right whitespace-nowrap">
                      <button
                        onClick={() => handleViewOrderDetails(order.order_number)}
                        className="group inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#F5F5F5] hover:text-[#B6A47E] transition-colors cursor-pointer uppercase py-1 whitespace-nowrap"
                      >
                        <span>DETAILS</span>
                        <span className="group-hover:translate-x-1.5 transition-transform duration-200 text-[#B6A47E]">→</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Bar */}
          {ordersList.length > itemsPerPage && (
            <div
              style={{ padding: "16px 24px" }}
              className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-white/[0.08] bg-[#0F0F0F] mt-4 font-mono text-xs"
            >
              <span className="text-[#8A8A8A]">
                Showing{" "}
                <span className="font-bold text-[#B6A47E]">{Math.min(currentPage * itemsPerPage, ordersList.length)}</span>
                {" "}of{" "}
                <span className="text-[#B6A47E] font-extrabold">{ordersList.length}</span>
                {" "}data (Page {currentPage} of {Math.ceil(ordersList.length / itemsPerPage)})
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* PREVIOUS */}
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  style={{ padding: "8px 16px" }}
                  className={`rounded-[5px] text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    currentPage <= 1
                      ? "opacity-40 cursor-not-allowed border-transparent text-[#8A8A8A]"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-[#B6A47E] cursor-pointer"
                  }`}
                >
                  PREVIOUS
                </button>

                {/* Page number boxes */}
                {Array.from({ length: Math.ceil(ordersList.length / itemsPerPage) }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    style={{ width: "32px", height: "32px" }}
                    className={`rounded-[5px] text-[11px] font-bold font-mono transition-all border cursor-pointer flex items-center justify-center ${
                      pg === currentPage
                        ? "bg-[#B6A47E] border-[#B6A47E] text-black font-extrabold"
                        : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                {/* NEXT */}
                <button
                  type="button"
                  disabled={currentPage >= Math.ceil(ordersList.length / itemsPerPage)}
                  onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(ordersList.length / itemsPerPage), prev + 1))}
                  style={{ padding: "8px 16px" }}
                  className={`rounded-[5px] text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    currentPage >= Math.ceil(ordersList.length / itemsPerPage)
                      ? "opacity-40 cursor-not-allowed border-transparent text-[#8A8A8A]"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-[#B6A47E] cursor-pointer"
                  }`}
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
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
                className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 bg-[#0A0A0A] border border-white/[0.08] font-mono text-xs text-left rounded-sm"
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
                  <span className="text-[10px] md:text-[11px] text-[#8A8A8A] uppercase tracking-wider block font-bold">ORDER STATUS</span>
                  <span className="font-extrabold text-sm uppercase block">
                    {(() => {
                      const st = (selectedOrderDetail.shipping_status || (selectedOrderDetail as any).status || "").toUpperCase();
                      if (st === "CANCELLED" || st === "DIBATALKAN") return <span className="text-red-500 font-bold">CANCELLED</span>;
                      return <span className="text-emerald-400 font-bold">COMPLETED</span>;
                    })()}
                  </span>
                </div>
                <div className="space-y-2 text-left">
                  <span className="text-[10px] md:text-[11px] text-[#8A8A8A] uppercase tracking-wider block font-bold">COURIER</span>
                  <span className="text-[#F5F5F5] font-extrabold text-sm uppercase block">
                    {(() => {
                      const st = (selectedOrderDetail.shipping_status || (selectedOrderDetail as any).status || "").toUpperCase();
                      if (st === "CANCELLED" || st === "DIBATALKAN") return "-";
                      return selectedOrderDetail.courier_info?.courier_name || "J&T EXPRESS";
                    })()}
                  </span>
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
                    const prodImg = getImageUrl(item.product_image) || (idx % 2 === 0 ? "/images/hero/hero-1.png" : "/images/campaign/campaign-1.png");
                    const validColor = item.color && !["default","none","n/a","null",""].includes(item.color.trim().toLowerCase()) ? item.color : null;
                    const validSize = item.size && !["default","none","n/a","null",""].includes(item.size.trim().toLowerCase()) ? item.size : null;
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
                            {[validColor, validSize, `QTY: ${qty}`].filter(Boolean).join(" // ")}
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
                  <p className="text-[#CCCCCC] leading-relaxed text-xs">{selectedOrderDetail.shipping_address.street_address}</p>
                  <p className="text-[#8A8A8A] text-xs pt-0.5">
                    {[
                      selectedOrderDetail.shipping_address.district,
                      selectedOrderDetail.shipping_address.city,
                      selectedOrderDetail.shipping_address.province,
                      selectedOrderDetail.shipping_address.postal_code || (selectedOrderDetail.shipping_address as any)?.postcode || (selectedOrderDetail.shipping_address as any)?.zip_code || (selectedOrderDetail.shipping_address as any)?.postalCode
                    ].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}

              <div className="flex flex-col pt-4">
                <Link
                  href="/shop"
                  style={{ padding: "20px 0" }}
                  className="w-full bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs uppercase font-extrabold tracking-[0.25em] hover:bg-white transition-all duration-300 cursor-pointer shadow-xl rounded-sm block text-center"
                >
                  BUY AGAIN
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
