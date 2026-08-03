"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getAdminOrders,
  updateAdminShipment,
  AdminOrder,
} from "@/utils/api";
import { PackageCheck, ArrowRight, X, Search, Filter } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      if (savedTheme !== null) {
        return savedTheme === "dark";
      }
    }
    return true;
  });

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [shippingStatus, setShippingStatus] = useState("PROCESSING");
  const [courier, setCourier] = useState("JNE Express");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rowLimit, setRowLimit] = useState<number>(10);

  const showSuccessAlert = (msg: string) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: msg,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: isDarkMode ? "#18181C" : "#ffffff",
      color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
      customClass: {
        popup: isDarkMode ? "border border-white/10 rounded-[8px] shadow-xl" : "border border-gray-200 rounded-[8px] shadow-xl",
      },
    });
  };

  const showStatus = (msg: string) => {
    showSuccessAlert(msg);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("sector_madness_admin_theme", next ? "dark" : "light");
      setTimeout(() => {
        window.dispatchEvent(new Event("sector_theme_change"));
      }, 0);
    }
  };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrders,
    refetchInterval: 3000,
  });

  const updateShipmentMut = useMutation({
    mutationFn: ({
      orderNumber,
      data,
    }: {
      orderNumber: string;
      data: { shipping_status?: string; courier?: string; tracking_number?: string };
    }) => updateAdminShipment(orderNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrder(null);
      showStatus("Order shipment updated successfully!");
    },
  });



  const openUpdateModal = (ord: AdminOrder) => {
    setSelectedOrder(ord);
    const rawSt = (ord.shipping_status || "IN PROCESSING").toUpperCase();
    const mappedStatus =
      rawSt === "ALLOCATED" || rawSt === "IN PROCESS" || rawSt === "PENDING" || rawSt === "PROCESSING"
        ? "IN PROCESSING"
        : rawSt;
    setShippingStatus(mappedStatus);
    setCourier(ord.courier || "JNE Express");
    setTrackingNumber(ord.tracking_number || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateShipmentMut.mutate({
      orderNumber: selectedOrder.order_number,
      data: {
        shipping_status: shippingStatus,
        courier,
        tracking_number: trackingNumber,
      },
    });
  };

  const filteredOrders = orders.filter((ord) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ord.order_number.toLowerCase().includes(q) ||
      (ord.customer_name || "").toLowerCase().includes(q) ||
      (ord.customer_email || "").toLowerCase().includes(q) ||
      (ord.courier || "").toLowerCase().includes(q) ||
      (ord.tracking_number || "").toLowerCase().includes(q);

    const rawSt = (ord.shipping_status || "IN PROCESSING").toUpperCase();
    const mappedStatus =
      rawSt === "ALLOCATED" || rawSt === "IN PROCESS" || rawSt === "PENDING" || rawSt === "PROCESSING"
        ? "IN PROCESSING"
        : rawSt;

    const matchesStatus =
      statusFilter === "ALL" || mappedStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const displayedOrders = rowLimit === 0 ? filteredOrders : filteredOrders.slice(0, rowLimit);

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col lg:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
      }`}
    >
      <AdminSidebar activeTab="orders" isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="ORDERS & SHIPMENT CONTROL"
          subtitle="Track customer orders, manage shipping status, & assign courier tracking numbers"
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        <main
          style={{
            paddingTop: "48px",
            paddingBottom: "96px",
            paddingLeft: "48px",
            paddingRight: "48px",
            maxWidth: "1440px",
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
          }}
          className="flex-1 min-w-0"
        >
          <div style={{ marginBottom: "20px" }} className="flex justify-between items-center">
            <h2
              style={{
                fontSize: "11px",
                letterSpacing: "0.22em",
                fontWeight: 700,
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
            >
              {filteredOrders.length} CUSTOMER ORDERS FOUND ({orders.length} TOTAL)
            </h2>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className={`font-medium tracking-wider uppercase ${
                isDarkMode ? "text-[#666666]" : "text-[#9CA3AF]"
              }`}
            >
              REAL-TIME FEED
            </span>
          </div>

          {/* TABLE CONTROL BAR: SEARCH, FILTER & ROW LIMIT */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
              padding: "16px 20px",
              borderRadius: "8px",
              backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF",
              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", flex: 1, minWidth: "280px" }}>
              {/* Search Bar */}
              <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
                <Search
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "16px",
                    height: "16px",
                    color: isDarkMode ? "#8A8A8A" : "#9CA3AF",
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari No. Order, Nama Customer, Email..."
                  style={{
                    width: "100%",
                    paddingLeft: "38px",
                    paddingRight: "14px",
                    paddingTop: "9px",
                    paddingBottom: "9px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    outline: "none",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                  }}
                />
              </div>

              {/* Status Filter Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Filter style={{ width: "14px", height: "14px", color: "#B6A47E" }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "9px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    outline: "none",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                  }}
                >
                  <option value="ALL">SEMUA STATUS</option>
                  <option value="IN PROCESSING">IN PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>

            {/* Row Limit Select */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: isDarkMode ? "#8A8A8A" : "#6B7280" }}>
                TAMPILKAN:
              </span>
              <select
                value={rowLimit}
                onChange={(e) => setRowLimit(Number(e.target.value))}
                style={{
                  padding: "9px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  outline: "none",
                  cursor: "pointer",
                  backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                  color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                }}
              >
                <option value={5}>5 BARIS</option>
                <option value={10}>10 BARIS</option>
                <option value={25}>25 BARIS</option>
                <option value={50}>50 BARIS</option>
                <option value={0}>SEMUA ({filteredOrders.length})</option>
              </select>
            </div>
          </div>

          <div
            className={`border rounded-[6px] overflow-hidden shadow-sm transition-colors ${
              isDarkMode
                ? "bg-[#18181C] border-white/10"
                : "bg-white border-[#D1D5DB]"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs uppercase tracking-wider">
                <thead
                  className={`border-b ${
                    isDarkMode
                      ? "bg-[#1E1E22] border-white/10 text-[#8A8A8A]"
                      : "bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]"
                  }`}
                >
                  <tr>
                    <th style={{ padding: "18px 24px" }} className="font-bold">ORDER NO</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">DATE</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">CUSTOMER</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">TOTAL</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">PAYMENT</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">SHIPPING STATUS</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"
                  }`}
                >
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{ padding: "48px 24px" }}
                        className={`text-center ${
                          isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
                        }`}
                      >
                        Loading admin orders...
                      </td>
                    </tr>
                  ) : displayedOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{ padding: "48px 24px" }}
                        className={`text-center ${
                          isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
                        }`}
                      >
                        Tidak ada pesanan yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    displayedOrders.map((ord) => (
                      <tr
                        key={ord.id || ord.order_number}
                        className={`transition-colors ${
                          isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"
                        }`}
                      >
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`font-mono font-bold ${
                            isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                          }`}
                        >
                          {ord.order_number}
                        </td>
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`font-mono ${
                            isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                          }`}
                        >
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString("id-ID") : "TODAY"}
                        </td>
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`font-semibold ${
                            isDarkMode ? "text-[#CCCCCC]" : "text-[#374151]"
                          }`}
                        >
                          {ord.customer_name || "Archive Member"}
                        </td>
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`font-mono font-bold ${
                            isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                          }`}
                        >
                          Rp {(ord.total || 0).toLocaleString("id-ID")}
                        </td>
                        <td style={{ padding: "20px 24px" }} className="font-bold text-emerald-500">
                          {ord.payment_status || "PAID"}
                        </td>
                        <td style={{ padding: "20px 24px" }}>
                          {(() => {
                            const rawSt = (ord.shipping_status || "IN PROCESSING").toUpperCase();
                            const statusLabel =
                              rawSt === "ALLOCATED" || rawSt === "IN PROCESS" || rawSt === "PENDING"
                                ? "IN PROCESSING"
                                : rawSt;

                            let textColor = isDarkMode ? "text-amber-300" : "text-amber-800";

                            if (statusLabel === "SHIPPED" || statusLabel === "IN TRANSIT") {
                              textColor = isDarkMode ? "text-blue-400" : "text-blue-700";
                            } else if (statusLabel === "DELIVERED" || statusLabel === "COMPLETED") {
                              textColor = isDarkMode ? "text-emerald-400" : "text-emerald-700";
                            } else if (statusLabel === "CANCELLED" || statusLabel === "DIBATALKAN") {
                              textColor = isDarkMode ? "text-red-400" : "text-red-700";
                            }

                            return (
                              <span
                                style={{ padding: "4px 10px", borderRadius: "6px" }}
                                className={`inline-flex items-center text-[11px] font-mono font-extrabold tracking-wider uppercase border ${
                                  isDarkMode
                                    ? "bg-white/5 border-white/10"
                                    : "bg-gray-100 border-gray-200"
                                } ${textColor}`}
                              >
                                {statusLabel}
                              </span>
                            );
                          })()}
                        </td>
                        <td style={{ padding: "20px 24px" }} className="text-right">
                          <button
                            onClick={() => openUpdateModal(ord)}
                            className={`font-bold transition-colors inline-flex items-center gap-1 cursor-pointer ${
                              isDarkMode
                                ? "text-[#F5F5F5] hover:text-[#B6A47E]"
                                : "text-[#111827] hover:text-[#B6A47E]"
                            }`}
                          >
                            <span>UPDATE SHIPMENT</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Shipment Update Modal */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            padding: "24px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              padding: "36px",
              borderRadius: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              backgroundColor: isDarkMode ? "#18181C" : "#ffffff",
              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
              color: isDarkMode ? "#ffffff" : "#0A0A0A",
              margin: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "16px",
                borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
              }}
            >
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#B6A47E",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <PackageCheck style={{ width: "18px", height: "18px" }} />
                <span>UPDATE SHIPMENT #{selectedOrder.order_number}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  padding: "6px",
                  borderRadius: "4px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: isDarkMode ? "#8A8A8A" : "#6B7280",
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: isDarkMode ? "#CCCCCC" : "#374151",
                  }}
                >
                  SHIPPING STATUS
                </label>
                <select
                  value={shippingStatus}
                  onChange={(e) => setShippingStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    outline: "none",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                >
                  <option value="IN PROCESSING">IN PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: isDarkMode ? "#CCCCCC" : "#374151",
                  }}
                >
                  COURIER SERVICE
                </label>
                <input
                  type="text"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="e.g. JNE Express / J&T / SiCepat"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    outline: "none",
                    textTransform: "uppercase",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: isDarkMode ? "#CCCCCC" : "#374151",
                  }}
                >
                  TRACKING NUMBER (RESI)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. JNE8890214829"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontFamily: "monospace",
                    borderRadius: "6px",
                    outline: "none",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "14px",
                  paddingTop: "24px",
                  marginTop: "12px",
                  borderTop: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "#F3F4F6",
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid #E5E7EB",
                    color: isDarkMode ? "#CCCCCC" : "#4B5563",
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={updateShipmentMut.isPending}
                  style={{
                    padding: "10px 28px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    backgroundColor: "#B6A47E",
                    border: "none",
                    color: "#0A0A0A",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    opacity: updateShipmentMut.isPending ? 0.5 : 1,
                  }}
                >
                  {updateShipmentMut.isPending ? "SAVING..." : "SAVE SHIPMENT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
