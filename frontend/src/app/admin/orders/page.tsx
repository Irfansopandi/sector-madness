"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getAdminOrders,
  updateAdminShipment,
  AdminOrder,
  getOrderDetail,
  OrderDetailData,
  getImageUrl,
} from "@/utils/api";
import { PackageCheck, ArrowRight, X, Search, Filter, Eye, Truck, Printer, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminOrdersPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetailData | null>(null);
  const [printOrder, setPrintOrder] = useState<any | null>(null);
  const [shippingStatus, setShippingStatus] = useState("PROCESSING");
  const [courier, setCourier] = useState("JNE Express");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handlePrintLabel = async (orderNumber: string, fallbackOrd?: any) => {
    try {
      const details = await getOrderDetail(orderNumber);
      setPrintOrder(details);
    } catch {
      if (fallbackOrd) {
        const itemAddr = fallbackOrd.shipping_address || fallbackOrd.address || {};
        setPrintOrder({
          order_number: orderNumber,
          order_date: fallbackOrd.created_at || fallbackOrd.order_date || "-",
          customer_info: {
            name: fallbackOrd.customer_name || itemAddr.receiver_name || "Customer",
            email: fallbackOrd.customer_email || "-",
            phone: itemAddr.phone_number || "-",
          },
          shipping_address: {
            receiver_name: itemAddr.receiver_name || fallbackOrd.customer_name || "Customer",
            phone_number: itemAddr.phone_number || "-",
            street_address: itemAddr.street_address || itemAddr.address || "Alamat Pengiriman Registered",
            city: itemAddr.city || "-",
            province: itemAddr.province || "-",
            postal_code: itemAddr.postal_code || itemAddr.postcode || itemAddr.zip_code || "-",
          },
          courier_info: {
            courier_name: fallbackOrd.courier || "JNE Express",
            tracking_number: fallbackOrd.tracking_number || "BITESHIP-JNE-9234961475",
          },
          products: fallbackOrd.items || fallbackOrd.products || [],
        });
      }
    }
  };

  const handleOpenDetailModal = async (orderNumber: string, fallbackOrd?: any) => {
    try {
      const details = await getOrderDetail(orderNumber);
      setSelectedOrderDetail(details);
    } catch {
      if (fallbackOrd) {
        const itemAddr = fallbackOrd.shipping_address || fallbackOrd.address || {};
        setSelectedOrderDetail({
          order_number: orderNumber,
          order_date: fallbackOrd.created_at || fallbackOrd.order_date || "-",
          customer_info: {
            name: fallbackOrd.customer_name || itemAddr.receiver_name || "Customer",
            email: fallbackOrd.customer_email || "-",
            phone: itemAddr.phone_number || "-",
          },
          shipping_address: {
            receiver_name: itemAddr.receiver_name || fallbackOrd.customer_name || "Customer",
            phone_number: itemAddr.phone_number || "-",
            street_address: itemAddr.street_address || itemAddr.address || "Address recorded in invoice",
            city: itemAddr.city || "-",
            province: itemAddr.province || "-",
            postal_code: itemAddr.postal_code || itemAddr.postcode || itemAddr.zip_code || "-",
            label: itemAddr.label || "Main Address",
          },
          courier_info: {
            courier_code: fallbackOrd.courier || "JNE",
            courier_name: fallbackOrd.courier || "JNE Express",
            service_code: "REG",
            service_name: "Regular Shipping",
            estimated_delivery: "2-3 Days",
            tracking_number: fallbackOrd.tracking_number || undefined,
          },
          products: (fallbackOrd.items || fallbackOrd.products || []).map((it: any) => ({
            id: it.id || 1,
            product_id: it.product_id || 1,
            product_name: it.product_name || it.name || "Purchased Product",
            product_image: it.product_image || it.image || "",
            color: it.color || "",
            size: it.size || "",
            quantity: it.quantity || 1,
            price: it.price || 0,
            subtotal: (it.price || 0) * (it.quantity || 1),
          })),
          summary: {
            subtotal: fallbackOrd.total || 0,
            shipping: 0,
            discount: 0,
            tax: 0,
            grand_total: fallbackOrd.total || 0,
          },
          payment_info: {
            method: fallbackOrd.payment_method || "Online Payment",
            payment_status: fallbackOrd.payment_status || "PAID",
          },
          shipping_status: fallbackOrd.shipping_status || "PROCESSING",
          cancel_reason: fallbackOrd.cancellation_request?.reason || fallbackOrd.cancel_data?.reason || fallbackOrd.cancel_reason || fallbackOrd.cancellation_reason || fallbackOrd.cancel_note || fallbackOrd.reason || undefined,
          bank_name: fallbackOrd.cancellation_request?.bank_name || fallbackOrd.cancel_data?.bank_name || fallbackOrd.bank_name || fallbackOrd.refund_bank || fallbackOrd.bank || undefined,
          account_number: fallbackOrd.cancellation_request?.account_number || fallbackOrd.cancel_data?.account_number || fallbackOrd.account_number || fallbackOrd.refund_account || fallbackOrd.no_rekening || undefined,
          account_name: fallbackOrd.cancellation_request?.account_name || fallbackOrd.cancellation_request?.account_holder || fallbackOrd.cancel_data?.account_name || fallbackOrd.account_name || fallbackOrd.refund_name || fallbackOrd.nama_rekening || undefined,
          timeline: [],
        });
      }
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"ALL" | "PROCESSING" | "DELIVERED" | "CANCELLED">("ALL");

  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
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
    refetchInterval: 15000,
    retry: false,
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

  // Compute counts for tab badges
  const countAll = orders.length;
  const countProcessing = orders.filter((o) => {
    const st = (o.shipping_status || "IN PROCESSING").toUpperCase();
    return (
      st === "ALLOCATED" ||
      st === "IN PROCESS" ||
      st === "PENDING" ||
      st === "PROCESSING" ||
      st === "IN PROCESSING" ||
      st === "SHIPPED" ||
      st === "IN TRANSIT"
    );
  }).length;
  const countCompleted = orders.filter((o) => {
    const st = (o.shipping_status || "").toUpperCase();
    return st === "DELIVERED" || st === "COMPLETED" || st === "SELESAI";
  }).length;
  const countCancelled = orders.filter((o) => {
    const st = (o.shipping_status || "").toUpperCase();
    return (
      st === "CANCELLED" ||
      st === "DIBATALKAN" ||
      st === "CANCELED" ||
      st === "CANCEL PENDING" ||
      st === "CANCEL_PENDING" ||
      st === "CANCEL_REQUESTED"
    );
  }).length;

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeTab];
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab, countAll, countProcessing, countCompleted, countCancelled]);

  const filteredOrders = orders.filter((ord) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      ord.order_number.toLowerCase().includes(q) ||
      (ord.customer_name || "").toLowerCase().includes(q) ||
      (ord.customer_email || "").toLowerCase().includes(q) ||
      (ord.courier || "").toLowerCase().includes(q) ||
      (ord.tracking_number || "").toLowerCase().includes(q) ||
      (ord.cancel_reason || "").toLowerCase().includes(q) ||
      (ord.cancellation_reason || "").toLowerCase().includes(q);

    const rawSt = (ord.shipping_status || "IN PROCESSING").toUpperCase();
    const mappedStatus =
      rawSt === "ALLOCATED" || rawSt === "IN PROCESS" || rawSt === "PENDING" || rawSt === "PROCESSING"
        ? "IN PROCESSING"
        : rawSt;

    let matchesTab = true;
    if (activeTab === "PROCESSING") {
      matchesTab = mappedStatus === "IN PROCESSING" || mappedStatus === "SHIPPED" || mappedStatus === "IN TRANSIT";
    } else if (activeTab === "DELIVERED") {
      matchesTab = mappedStatus === "DELIVERED" || mappedStatus === "COMPLETED" || mappedStatus === "SELESAI";
    } else if (activeTab === "CANCELLED") {
      matchesTab =
        mappedStatus === "CANCELLED" ||
        mappedStatus === "DIBATALKAN" ||
        mappedStatus === "CANCELED" ||
        mappedStatus === "CANCEL PENDING" ||
        mappedStatus === "CANCEL_PENDING" ||
        mappedStatus === "CANCEL_REQUESTED";
    }

    const matchesStatus =
      statusFilter === "ALL" ||
      mappedStatus === statusFilter ||
      (statusFilter === "CANCEL PENDING" &&
        (mappedStatus === "CANCEL PENDING" || mappedStatus === "CANCEL_PENDING" || mappedStatus === "CANCEL_REQUESTED"));

    return matchesSearch && matchesTab && matchesStatus;
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

          {/* Smooth Sliding Button Pill Navigation Tabs (Matching Admin Catalog Page) */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
              padding: "6px",
              borderRadius: "10px",
              backgroundColor: isDarkMode ? "#18181C" : "#E5E7EB",
              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #D1D5DB",
              marginBottom: "28px",
              width: "fit-content",
            }}
          >
            {/* Sliding Active Pill Indicator */}
            {indicatorStyle.width > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  bottom: "6px",
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  borderRadius: "7px",
                  backgroundColor: isDarkMode ? "#121214" : "#FFFFFF",
                  border: "1.5px solid #B6A47E",
                  boxShadow: isDarkMode
                    ? "0 4px 14px rgba(0,0,0,0.6)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "left 0.35s cubic-bezier(0.16, 1, 0.3, 1), width 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
            )}

            {[
              { id: "ALL", label: "SEMUA ORDERAN", count: countAll, icon: PackageCheck },
              { id: "PROCESSING", label: "SEDANG DIPROSES", count: countProcessing, icon: Clock },
              { id: "DELIVERED", label: "ORDERAN SELESAI", count: countCompleted, icon: CheckCircle2 },
              { id: "CANCELLED", label: "ORDERAN CANCEL", count: countCancelled, icon: XCircle },
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[tab.id] = el; }}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === "ALL") setStatusFilter("ALL");
                  }}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "10px 20px",
                    borderRadius: "7px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    transition: "color 0.25s ease",
                    backgroundColor: "transparent",
                    color: isActive
                      ? isDarkMode
                        ? "#F5F5F5"
                        : "#0A0A0A"
                      : isDarkMode
                      ? "#8A8A8A"
                      : "#6B7280",
                    border: "none",
                  }}
                  className="shrink-0 font-mono tracking-wider uppercase"
                >
                  <IconComponent className={`w-4 h-4 transition-colors ${isActive ? "text-[#B6A47E]" : ""}`} />
                  <span>{tab.label}</span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: 800,
                      backgroundColor: isActive
                        ? isDarkMode
                          ? "rgba(182, 164, 126, 0.2)"
                          : "rgba(182, 164, 126, 0.15)"
                        : isDarkMode
                        ? "rgba(255,255,255,0.08)"
                        : "#F3F4F6",
                      color: isActive
                        ? "#B6A47E"
                        : isDarkMode
                        ? "#8A8A8A"
                        : "#374151",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
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
                  <option value="CANCEL PENDING">CANCEL PENDING</option>
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
                          className={`font-mono font-bold whitespace-nowrap ${
                            isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                          }`}
                        >
                          {ord.order_number}
                        </td>
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`font-mono whitespace-nowrap ${
                            isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                          }`}
                        >
                          {ord.created_at ? new Date(ord.created_at).toLocaleDateString("id-ID") : "TODAY"}
                        </td>
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`font-semibold whitespace-nowrap ${
                            isDarkMode ? "text-[#CCCCCC]" : "text-[#374151]"
                          }`}
                        >
                          {ord.customer_name || "Archive Member"}
                        </td>
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`font-mono font-bold whitespace-nowrap ${
                            isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                          }`}
                        >
                          Rp {(ord.total || 0).toLocaleString("id-ID")}
                        </td>
                        <td style={{ padding: "20px 24px" }} className="font-bold text-emerald-500 whitespace-nowrap">
                          {ord.payment_status || "PAID"}
                        </td>
                        <td style={{ padding: "20px 24px" }} className="whitespace-nowrap">
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
                            } else if (statusLabel === "CANCEL PENDING" || statusLabel === "CANCEL_PENDING" || statusLabel === "CANCEL_REQUESTED") {
                              textColor = isDarkMode ? "text-amber-400 bg-amber-500/15 border-amber-500/40 font-black animate-pulse" : "text-amber-800 bg-amber-100 border-amber-300 font-black";
                            } else if (statusLabel === "CANCELLED" || statusLabel === "DIBATALKAN" || statusLabel === "CANCELED") {
                              textColor = isDarkMode ? "text-red-400" : "text-red-700";
                            }

                            return (
                              <div className="flex flex-col gap-1 items-start">
                                <span
                                  style={{ padding: "4px 10px", borderRadius: "6px", whiteSpace: "nowrap" }}
                                  className={`inline-flex items-center text-[11px] font-mono font-extrabold tracking-wider uppercase border whitespace-nowrap shrink-0 ${
                                    isDarkMode
                                      ? "bg-white/5 border-white/10"
                                      : "bg-gray-100 border-gray-200"
                                  } ${textColor}`}
                                >
                                  {statusLabel}
                                </span>
                                {(statusLabel.includes("CANCEL") || statusLabel === "DIBATALKAN") && (
                                  <span
                                    className={`text-[10px] font-mono tracking-normal block max-w-[200px] truncate ${
                                      statusLabel.includes("PENDING") || statusLabel.includes("REQUESTED")
                                        ? "text-amber-400 font-semibold"
                                        : "text-red-400"
                                    }`}
                                    title={ord.cancel_reason || ord.cancellation_reason || "Form Pembatalan Terdaftar"}
                                  >
                                    Pesan: "{ord.cancel_reason || ord.cancellation_reason || "Alasan pembatalan terdaftar"}"
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ padding: "20px 24px" }} className="text-right whitespace-nowrap">
                          {(() => {
                            const ordStatus = (ord.shipping_status || "").toUpperCase();
                            const isCancelledRow = ordStatus === "CANCELLED" || ordStatus === "CANCELED" || ordStatus === "DIBATALKAN";
                            return (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetailModal(ord.order_number, ord)}
                                  title="View Order Details"
                                  style={{ padding: "8px 12px", borderRadius: "6px" }}
                                  className={`text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                                    isDarkMode
                                      ? "bg-white/5 border-white/10 text-[#B6A47E] hover:border-[#B6A47E] hover:text-white"
                                      : "bg-gray-100 border-gray-200 text-[#B6A47E] hover:border-[#B6A47E] hover:text-black"
                                  }`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {!isCancelledRow && (
                                  <button
                                    type="button"
                                    onClick={() => openUpdateModal(ord)}
                                    title="Update Shipment & Resi"
                                    style={{ padding: "8px 12px", borderRadius: "6px" }}
                                    className={`text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                                      isDarkMode
                                        ? "bg-white/5 border-white/10 text-white hover:border-[#B6A47E] hover:text-[#B6A47E]"
                                        : "bg-gray-100 border-gray-200 text-gray-800 hover:border-[#B6A47E] hover:text-[#B6A47E]"
                                    }`}
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {!isCancelledRow && (
                                  <button
                                    type="button"
                                    onClick={() => handlePrintLabel(ord.order_number, ord)}
                                    title="Print Shipping Label (Resi Thermal)"
                                    style={{ padding: "8px 12px", borderRadius: "6px" }}
                                    className={`text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                                      isDarkMode
                                        ? "bg-white/5 border-white/10 text-emerald-400 hover:border-emerald-400 hover:text-white"
                                        : "bg-gray-100 border-gray-200 text-emerald-600 hover:border-emerald-600 hover:text-emerald-800"
                                    }`}
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })()}
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
                    cursor: updateShipmentMut.isPending ? "not-allowed" : "pointer",
                    backgroundColor: "#B6A47E",
                    border: "none",
                    color: "#0A0A0A",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    opacity: updateShipmentMut.isPending ? 0.75 : 1,
                  }}
                  className="flex items-center gap-2 transition-all"
                >
                  {updateShipmentMut.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <span>SAVE SHIPMENT</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADMIN ORDER DETAIL MODAL (Spacious Luxury Atelier Invoice Layout) ── */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <div
            style={{ padding: "40px", gap: "28px" }}
            className="bg-[#141414] border border-white/[0.12] text-[#F5F5F5] w-[95vw] max-w-5xl max-h-[88vh] overflow-y-auto flex flex-col shadow-2xl relative rounded-sm font-mono text-xs"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedOrderDetail(null)}
              className="absolute top-6 right-6 text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors p-2 cursor-pointer text-lg font-bold"
              aria-label="Close Order Details"
            >
              ✕
            </button>

            {/* Header / Reference */}
            <div style={{ paddingBottom: "20px" }} className="border-b border-white/[0.1] text-left">
              <span style={{ marginBottom: "8px" }} className="text-xs font-mono text-[#B6A47E] uppercase tracking-[0.25em] block font-bold">
                [SECTOR MADNESS // INVOICE DETAIL]
              </span>
              <h3 style={{ marginBottom: "6px" }} className="text-2xl md:text-3xl font-black uppercase tracking-wider text-[#F5F5F5] font-serif">
                {selectedOrderDetail.order_number}
              </h3>
              <p className="text-xs font-mono text-[#8A8A8A]">
                Ordered on {selectedOrderDetail.order_date}
              </p>
            </div>

            {/* 4-Columns Overview Bar */}
            {(() => {
              const isCancelledDetail =
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "CANCELLED" ||
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "CANCELED" ||
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "DIBATALKAN";
              return (
            <div
              style={{ padding: "24px 32px" }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-[#0A0A0A] border border-white/[0.08] text-xs text-left rounded-sm"
            >
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-[#8A8A8A] uppercase tracking-wider block font-bold">PAYMENT METHOD</span>
                <span className="text-[#F5F5F5] font-extrabold text-sm uppercase block">
                  {selectedOrderDetail.payment_info?.method || (selectedOrderDetail as any).payment_method || "ONLINE PAYMENT"}
                </span>
              </div>
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-[#8A8A8A] uppercase tracking-wider block font-bold">PAYMENT STATUS</span>
                <span className="text-emerald-400 font-extrabold text-sm uppercase block">
                  ✓ {(selectedOrderDetail.payment_info?.payment_status || (selectedOrderDetail as any).payment_status || "PAID").toUpperCase()}
                </span>
              </div>
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-[#8A8A8A] uppercase tracking-wider block font-bold">COURIER</span>
                <span className="text-[#F5F5F5] font-extrabold text-sm uppercase block">
                  {isCancelledDetail ? "-" : (selectedOrderDetail.courier_info?.courier_name || (selectedOrderDetail as any).courier || "JNE EXPRESS")}
                </span>
              </div>
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-[#8A8A8A] uppercase tracking-wider block font-bold">RESI TRACKING</span>
                <span className="text-[#B6A47E] font-extrabold text-sm uppercase block truncate">
                  {isCancelledDetail ? "-" : (selectedOrderDetail.courier_info?.tracking_number || (selectedOrderDetail as any).tracking_number || "PENDING ALLOCATION")}
                </span>
              </div>
            </div>
              );
            })()}

            {/* ── CANCELLATION REQUEST APPROVAL PANEL & STRUCTURED FORM DATA DISPLAY ── */}
            {(() => {
              const isCancelPending =
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "CANCEL PENDING" ||
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "CANCEL_PENDING" ||
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "CANCEL_REQUESTED";

              const isCancelled =
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "CANCELLED" ||
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "DIBATALKAN" ||
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "CANCELED" ||
                Boolean(selectedOrderDetail.cancel_reason || selectedOrderDetail.cancellation_reason);

              if (!isCancelPending && !isCancelled) return null;

              let storedCancel: any = null;
              if (typeof window !== "undefined" && selectedOrderDetail.order_number) {
                try {
                  const raw = localStorage.getItem(`sector_cancel_${selectedOrderDetail.order_number}`);
                  if (raw) storedCancel = JSON.parse(raw);
                } catch (e) {}
              }

              const cancelReasonCategory =
                storedCancel?.reason ||
                selectedOrderDetail.cancellation_request?.reason ||
                selectedOrderDetail.cancel_reason ||
                (selectedOrderDetail as any).cancellation_category ||
                "INCORRECT PAYMENT METHOD SELECTED";

              const cancelBankName =
                storedCancel?.bank_name ||
                selectedOrderDetail.cancellation_request?.bank_name ||
                selectedOrderDetail.cancel_data?.bank_name ||
                selectedOrderDetail.bank_name ||
                selectedOrderDetail.refund_bank ||
                (selectedOrderDetail as any).bank ||
                "Gopay";

              const cancelAccountNumber =
                storedCancel?.account_number ||
                selectedOrderDetail.cancellation_request?.account_number ||
                selectedOrderDetail.cancel_data?.account_number ||
                selectedOrderDetail.account_number ||
                selectedOrderDetail.refund_account ||
                (selectedOrderDetail as any).no_rekening ||
                "865463152";

              const cancelAccountName =
                storedCancel?.account_name ||
                storedCancel?.account_holder ||
                selectedOrderDetail.cancellation_request?.account_name ||
                selectedOrderDetail.cancellation_request?.account_holder ||
                selectedOrderDetail.cancel_data?.account_name ||
                selectedOrderDetail.account_name ||
                selectedOrderDetail.refund_name ||
                (selectedOrderDetail as any).nama_rekening ||
                "Panda";

              const cancelExplanation =
                storedCancel?.notes ||
                selectedOrderDetail.cancellation_request?.notes ||
                (selectedOrderDetail as any).cancel_notes ||
                selectedOrderDetail.cancel_note ||
                selectedOrderDetail.cancellation_reason ||
                (selectedOrderDetail as any).notes ||
                "butuh uang";

              if (isCancelPending) {
                return (
                  <div
                    style={{ padding: "48px 52px" }}
                    className="bg-[#14100B] border-2 border-amber-500/40 rounded-sm text-left my-10 shadow-2xl"
                  >
                    {/* Header bar with spacious top padding, bottom padding, and bottom margin */}
                    <div
                      style={{ paddingTop: "12px", paddingBottom: "24px", marginBottom: "40px" }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/35"
                    >
                      <div className="flex items-center gap-3 text-amber-400 font-black text-xs uppercase tracking-[0.2em]">
                        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                        <span>PERMINTAAN PEMBATALAN & PENGEMBALIAN DANA (CANCEL & REFUND FORM)</span>
                      </div>
                      <span
                        style={{ padding: "8px 18px", borderRadius: "8px" }}
                        className="bg-[#1A1612] border border-amber-500/50 text-amber-400 font-mono text-xs font-black uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-2 shadow-sm animate-pulse shrink-0"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                        <span>MENUNGGU PERSETUJUAN ADMIN</span>
                      </span>
                    </div>

                    {/* Form Details Grid with generous padding (44px 48px) so text never touches borders */}
                    <div
                      style={{ padding: "44px 48px" }}
                      className="bg-[#080808] rounded-sm border border-amber-500/25 my-10 space-y-12"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 font-mono text-xs">
                        <div className="space-y-3">
                          <span className="text-[10px] text-amber-400/80 uppercase tracking-[0.2em] block font-bold border-b border-amber-500/20 pb-3 mb-3">
                            1. KATEGORI ALASAN
                          </span>
                          <span className="text-amber-300 font-extrabold text-xs block uppercase leading-relaxed pt-3">
                            {cancelReasonCategory}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] text-amber-400/80 uppercase tracking-[0.2em] block font-bold border-b border-amber-500/20 pb-3 mb-3">
                            2. BANK / E-WALLET
                          </span>
                          <span className="text-amber-100 font-black text-sm block uppercase tracking-wide pt-3">
                            {cancelBankName}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] text-amber-400/80 uppercase tracking-[0.2em] block font-bold border-b border-amber-500/20 pb-3 mb-3">
                            NOMOR REKENING
                          </span>
                          <span className="text-amber-300 font-mono font-black text-sm block tracking-widest pt-3">
                            {cancelAccountNumber}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <span className="text-[10px] text-amber-400/80 uppercase tracking-[0.2em] block font-bold border-b border-amber-500/20 pb-3 mb-3">
                            PEMILIK REKENING
                          </span>
                          <span className="text-amber-100 font-black text-sm block uppercase tracking-wide pt-3">
                            {cancelAccountName}
                          </span>
                        </div>
                      </div>

                      {/* Additional Explanation Quote Box */}
                      <div className="mt-10 pt-8 border-t border-white/[0.1] space-y-4">
                        <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-[0.2em] block font-bold mb-4">
                          3. PENJELASAN DETAIL (ADDITIONAL EXPLANATION)
                        </span>
                        <div style={{ padding: "28px 36px", marginTop: "16px" }} className="bg-[#111111] rounded-sm border-l-4 border-amber-500/60">
                          <p className="text-amber-100 font-mono text-xs font-medium leading-relaxed italic">
                            "{cancelExplanation}"
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Bar: Generous top margin and top padding to never touch border */}
                    <div
                      style={{ marginTop: "44px", paddingTop: "36px", paddingBottom: "16px" }}
                      className="flex flex-col sm:flex-row items-center justify-end gap-5 border-t border-amber-500/30"
                    >
                      <button
                        type="button"
                        disabled={updateShipmentMut.isPending}
                        onClick={() => {
                          updateShipmentMut.mutate(
                            {
                              orderNumber: selectedOrderDetail.order_number,
                              data: { shipping_status: "IN PROCESSING" },
                            },
                            {
                              onSuccess: () => {
                                setSelectedOrderDetail((prev) =>
                                  prev ? { ...prev, shipping_status: "IN PROCESSING" } : null
                                );
                                showSuccessAlert("Permintaan pembatalan ditolak. Status order kembali ke IN PROCESSING!");
                              },
                            }
                          );
                        }}
                        style={{ padding: "14px 28px" }}
                        className="w-full sm:w-auto bg-white/10 hover:bg-white text-white hover:text-black font-mono text-xs uppercase font-extrabold tracking-[0.15em] transition-all cursor-pointer rounded-sm border border-white/20 flex items-center justify-center gap-2.5 active:scale-[0.98]"
                      >
                        <X className="w-4 h-4 text-red-400" />
                        <span>TOLAK CANCEL (LANJUT IN PROCESSING)</span>
                      </button>

                      <button
                        type="button"
                        disabled={updateShipmentMut.isPending}
                        onClick={() => {
                          updateShipmentMut.mutate(
                            {
                              orderNumber: selectedOrderDetail.order_number,
                              data: { shipping_status: "CANCELLED" },
                            },
                            {
                              onSuccess: () => {
                                setSelectedOrderDetail((prev) =>
                                  prev ? { ...prev, shipping_status: "CANCELLED" } : null
                                );
                                showSuccessAlert("Permintaan pembatalan disetujui. Status order resmi CANCELLED!");
                              },
                            }
                          );
                        }}
                        style={{ padding: "14px 32px" }}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-mono text-xs uppercase font-black tracking-[0.15em] transition-all cursor-pointer rounded-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>SETUJUI CANCEL (APPROVE CANCEL)</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  style={{ padding: "48px 52px" }}
                  className="bg-[#140A0A] border-2 border-red-500/40 rounded-sm text-left my-10 shadow-2xl"
                >
                  {/* Header bar */}
                  <div
                    style={{ paddingTop: "12px", paddingBottom: "24px", marginBottom: "40px" }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-red-500/35"
                  >
                    <div className="flex items-center gap-3 text-red-400 font-black text-xs uppercase tracking-[0.2em]">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <span>DATA FORM PEMBATALAN &amp; PENGEMBALIAN DANA (CANCEL &amp; REFUND FORM)</span>
                    </div>
                    <span
                      style={{ padding: "8px 18px", borderRadius: "8px" }}
                      className="bg-[#1A0A0A] border border-red-500/50 text-red-400 font-mono text-xs font-black uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-2 shadow-sm shrink-0"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                      <span>ORDER DIBATALKAN</span>
                    </span>
                  </div>

                  {/* Form Details Grid */}
                  <div
                    style={{ padding: "44px 48px" }}
                    className="bg-[#080808] rounded-sm border border-red-500/25 my-10 space-y-12"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 font-mono text-xs">
                      <div className="space-y-3">
                        <span className="text-[10px] text-red-400/80 uppercase tracking-[0.2em] block font-bold border-b border-red-500/20 pb-3 mb-3">
                          1. KATEGORI ALASAN
                        </span>
                        <span className="text-red-300 font-extrabold text-xs block uppercase leading-relaxed pt-3">
                          {cancelReasonCategory}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] text-red-400/80 uppercase tracking-[0.2em] block font-bold border-b border-red-500/20 pb-3 mb-3">
                          2. BANK / E-WALLET
                        </span>
                        <span className="text-red-100 font-black text-sm block uppercase tracking-wide pt-3">
                          {cancelBankName}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] text-red-400/80 uppercase tracking-[0.2em] block font-bold border-b border-red-500/20 pb-3 mb-3">
                          NOMOR REKENING
                        </span>
                        <span className="text-red-300 font-mono font-black text-sm block tracking-widest pt-3">
                          {cancelAccountNumber}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] text-red-400/80 uppercase tracking-[0.2em] block font-bold border-b border-red-500/20 pb-3 mb-3">
                          PEMILIK REKENING
                        </span>
                        <span className="text-red-100 font-black text-sm block uppercase tracking-wide pt-3">
                          {cancelAccountName}
                        </span>
                      </div>
                    </div>

                    {/* Explanation Quote Box */}
                    <div className="mt-10 pt-8 border-t border-white/[0.1] space-y-4">
                      <span className="text-[10px] font-mono text-red-400/80 uppercase tracking-[0.2em] block font-bold mb-4">
                        3. PENJELASAN DETAIL (ADDITIONAL EXPLANATION)
                      </span>
                      <div style={{ padding: "28px 36px", marginTop: "16px" }} className="bg-[#0F0505] rounded-sm border-l-4 border-red-500/60">
                        <p className="text-red-200 font-mono text-xs font-medium leading-relaxed italic">
                          &quot;{cancelExplanation}&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Customer Info & Shipping Address Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Customer Info */}
              <div style={{ padding: "20px 24px" }} className="bg-[#0A0A0A] border border-white/[0.08] rounded-sm space-y-2">
                <span className="text-xs font-mono text-[#B6A47E] uppercase tracking-[0.2em] block font-bold mb-1">
                  CUSTOMER INFO
                </span>
                <p className="text-[#F5F5F5] text-sm font-bold tracking-wide">
                  {selectedOrderDetail.customer_info?.name || "Customer"}
                </p>
                <p className="text-[#8A8A8A] text-xs">Email: {selectedOrderDetail.customer_info?.email || "-"}</p>
                <p className="text-[#8A8A8A] text-xs">Phone: {selectedOrderDetail.customer_info?.phone || "-"}</p>
              </div>

              {/* Shipping Address */}
              <div style={{ padding: "20px 24px" }} className="bg-[#0A0A0A] border border-white/[0.08] rounded-sm space-y-2">
                <span className="text-xs font-mono text-[#B6A47E] uppercase tracking-[0.2em] block font-bold mb-1">
                  SHIPPING ADDRESS
                </span>
                <p className="text-[#F5F5F5] text-sm font-bold tracking-wide">
                  {selectedOrderDetail.shipping_address?.receiver_name} ({selectedOrderDetail.shipping_address?.phone_number})
                </p>
                <p className="text-[#8A8A8A] leading-relaxed text-xs">
                  {[
                    selectedOrderDetail.shipping_address?.street_address,
                    selectedOrderDetail.shipping_address?.city,
                    selectedOrderDetail.shipping_address?.province,
                    selectedOrderDetail.shipping_address?.postal_code || (selectedOrderDetail.shipping_address as any)?.postcode || (selectedOrderDetail.shipping_address as any)?.zip_code || (selectedOrderDetail.shipping_address as any)?.postalCode
                  ].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>

            {/* Purchased Products */}
            <div style={{ gap: "16px" }} className="flex flex-col text-left">
              <span className="text-xs font-mono text-[#8A8A8A] uppercase tracking-[0.25em] block font-bold">
                PURCHASED PRODUCTS ({(selectedOrderDetail.products || []).reduce((acc: number, p: any) => acc + (p.quantity || 1), 0)})
              </span>
              <div style={{ gap: "14px" }} className="flex flex-col">
                {(selectedOrderDetail.products || [])?.map((item: any, idx: number) => {
                  const prodName = item.product_name || item.name || "Purchased Product";
                  const prodImg = getImageUrl(item.product_image || item.image);
                  const validColor = item.color && !["default","none","n/a","null",""].includes(item.color.trim().toLowerCase()) ? item.color : null;
                  const validSize = item.size && !["default","none","n/a","null",""].includes(item.size.trim().toLowerCase()) ? item.size : null;
                  const qty = item.quantity || 1;
                  const price = (item.price || 0) * qty;

                  return (
                    <div
                      key={idx}
                      style={{ padding: "18px 24px" }}
                      className="flex items-center justify-between gap-6 bg-[#0A0A0A] border border-white/[0.08] hover:border-[#B6A47E]/40 transition-colors rounded-sm"
                    >
                      <div className="flex items-center gap-5 min-w-0">
                        <div className="w-16 h-20 relative bg-[#161616] flex-shrink-0 border border-white/[0.08] overflow-hidden rounded-sm">
                          <img src={prodImg} alt={prodName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                          <h4 style={{ marginBottom: "6px" }} className="text-base font-bold text-[#F5F5F5] uppercase tracking-wide font-serif truncate">
                            {prodName}
                          </h4>
                          <p className="text-xs font-mono text-[#8A8A8A] tracking-widest uppercase">
                            {[validColor, validSize, `QTY: ${qty}`].filter(Boolean).join(" // ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-mono text-[#B6A47E] font-black">
                          Rp {price.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Breakdown & Actions Footer */}
            {(() => {
              const subtotalCalc = (selectedOrderDetail.products || []).reduce((acc: number, item: any) => {
                return acc + (item.price || 0) * (item.quantity || 1);
              }, 0);
              const grandTotalVal = selectedOrderDetail.summary?.grand_total || (selectedOrderDetail as any).total || subtotalCalc;
              const subtotalVal = selectedOrderDetail.summary?.subtotal || subtotalCalc;
              const shippingVal = selectedOrderDetail.summary?.shipping ?? (grandTotalVal - subtotalVal > 0 ? grandTotalVal - subtotalVal : 0);
              const discountVal = selectedOrderDetail.summary?.discount || 0;
              const isCancelledDetail =
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "CANCELLED" ||
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "CANCELED" ||
                (selectedOrderDetail.shipping_status || "").toUpperCase() === "DIBATALKAN";

              return (
                <div style={{ paddingTop: "24px" }} className="border-t border-white/[0.1] flex flex-col gap-4 font-mono text-xs">
                  <div className="flex flex-col gap-2 max-w-sm ml-auto w-full">
                    <div className="flex justify-between text-[#8A8A8A]">
                      <span>PRODUCTS SUBTOTAL</span>
                      <span className="font-bold text-[#F5F5F5]">Rp {subtotalVal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-[#8A8A8A]">
                      <span>SHIPPING FEE</span>
                      <span className="font-bold text-[#F5F5F5]">Rp {shippingVal.toLocaleString("id-ID")}</span>
                    </div>
                    {discountVal > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>VOUCHER DISCOUNT</span>
                        <span className="font-bold">- Rp {discountVal.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline pt-3 border-t border-white/[0.1] text-sm">
                      <span className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">GRAND TOTAL</span>
                      <span className="text-xl font-black text-[#B6A47E]">
                        Rp {grandTotalVal.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-3 pt-2">
                    {!isCancelledDetail && (
                      <button
                        type="button"
                        onClick={() => {
                          setPrintOrder(selectedOrderDetail);
                        }}
                        style={{ padding: "14px 28px" }}
                        className="bg-white/10 hover:bg-white text-white hover:text-black font-mono text-xs uppercase font-extrabold tracking-[0.2em] transition-all duration-300 cursor-pointer rounded-sm flex items-center gap-2 border border-white/20"
                      >
                        <Printer className="w-4 h-4" />
                        <span>CETAK LABEL RESI</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedOrderDetail(null)}
                      style={{ padding: "14px 36px" }}
                      className="bg-[#B6A47E] hover:bg-white text-[#0A0A0A] font-mono text-xs uppercase font-extrabold tracking-[0.2em] transition-all duration-300 cursor-pointer rounded-sm"
                    >
                      CLOSE DETAIL
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── PRINT SHIPPING LABEL (THERMAL A6 WAYBILL MODAL PORTAL) ── */}
      {printOrder && isMounted && createPortal(
        <div id="thermal-print-portal" className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <div
            id="thermal-print-modal-box"
            style={{ padding: "40px", gap: "28px" }}
            className={`w-[95vw] max-w-4xl max-h-[88vh] overflow-y-auto flex flex-col shadow-2xl relative rounded-sm font-mono text-xs border ${
              isDarkMode
                ? "bg-[#141414] border-white/[0.12] text-[#F5F5F5]"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setPrintOrder(null)}
              className={`no-print absolute top-6 right-6 transition-colors p-2 cursor-pointer text-lg font-bold ${
                isDarkMode ? "text-[#8A8A8A] hover:text-[#F5F5F5]" : "text-gray-500 hover:text-black"
              }`}
              aria-label="Close Print Preview"
            >
              ✕
            </button>

            {/* Header / Title */}
            <div style={{ paddingBottom: "20px" }} className={`no-print border-b text-left flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 ${
              isDarkMode ? "border-white/[0.1]" : "border-gray-200"
            }`}>
              <div>
                <span style={{ marginBottom: "8px" }} className="text-xs font-mono text-[#B6A47E] uppercase tracking-[0.25em] block font-bold">
                  [SECTOR MADNESS // LOGISTICS WAYBILL]
                </span>
                <h3 style={{ marginBottom: "6px" }} className={`text-2xl md:text-3xl font-black uppercase tracking-wider font-serif ${
                  isDarkMode ? "text-[#F5F5F5]" : "text-gray-900"
                }`}>
                  SHIPPING LABEL PREVIEW
                </h3>
                <p className={`text-xs font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-600"}`}>
                  Order Reference: {printOrder.order_number}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const card = document.getElementById('thermal-waybill-card');
                  if (!card) return;
                  const pw = window.open('', '_blank', 'width=700,height=900');
                  if (!pw) return;
                  pw.document.write(`<!DOCTYPE html><html><head><title>Print Label</title><style>
                    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
                    html, body { width: 100%; height: 100%; background: #ffffff; }
                    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                    @page { size: auto; margin: 10mm; }
                    @media print { body { min-height: auto; } }
                  </style></head><body>${card.outerHTML}</body></html>`);
                  pw.document.close();
                  pw.focus();
                  setTimeout(() => { pw.print(); pw.close(); }, 350);
                }}
                style={{ padding: "12px 28px" }}
                className="bg-[#B6A47E] hover:bg-white text-[#0A0A0A] font-mono text-xs uppercase font-extrabold tracking-[0.2em] transition-all duration-300 cursor-pointer rounded-sm flex items-center gap-2 shadow-md shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>CETAK LABEL</span>
              </button>
            </div>

            {/* Thermal Label Card - Clean, Spacious A6 Thermal Paper Format with Explicit Padding */}
            <div className="thermal-card-wrapper py-6 flex justify-center items-center w-full">
              <div
                id="thermal-waybill-card"
                style={{
                  padding: "24px",
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                  border: "2px solid #000000",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)",
                  fontFamily: "'Courier New', Courier, monospace",
                  width: "100%",
                  maxWidth: "500px",
                  margin: "0 auto",
                  textAlign: "left",
                  borderRadius: "4px",
                }}
                className="print:border-2 print:border-black print:shadow-none"
              >
                {/* Inner Box with padding from the outer container */}
                <div style={{ border: "2px solid #000000", backgroundColor: "#FFFFFF" }}>
                  {/* 1. Header Section */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "2px solid #000000",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <h2
                        style={{
                          fontFamily: "'Times New Roman', Times, serif",
                          fontWeight: 900,
                          fontSize: "20px",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#000000",
                          margin: 0,
                          lineHeight: 1.1,
                        }}
                      >
                        SECTOR MADNESS
                      </h2>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "bold",
                          letterSpacing: "0.1em",
                          color: "#4B5563",
                          textTransform: "uppercase",
                        }}
                      >
                        OFFICIAL LOGISTICS WAYBILL
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontWeight: 900,
                          fontSize: "14px",
                          letterSpacing: "0.15em",
                          color: "#000000",
                          textTransform: "uppercase",
                          fontFamily: "monospace",
                        }}
                      >
                        {printOrder.courier_info?.courier_name || printOrder.courier || "JNE EXPRESS"}
                      </span>
                    </div>
                  </div>

                  {/* 2. Barcode & Resi Section */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "2px solid #000000",
                      textAlign: "center",
                      backgroundColor: "#F9FAFB",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "bold",
                        letterSpacing: "0.1em",
                        color: "#6B7280",
                        textTransform: "uppercase",
                      }}
                    >
                      NOMOR RESI / WAYBILL AWB
                    </span>
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 900,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#000000",
                        fontFamily: "monospace",
                      }}
                    >
                      {printOrder.courier_info?.tracking_number || printOrder.tracking_number || "BITESHIP-JNE-9234961475"}
                    </span>
                    {/* SVG Vector Barcode Lines Container (Guaranteed 100% Print in PDF & Printers) */}
                    <div
                      style={{
                        margin: "6px 0",
                        padding: "8px 12px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #D1D5DB",
                        borderRadius: "3px",
                      }}
                    >
                      <svg viewBox="0 0 280 44" className="w-full h-11 block">
                        <rect x="0" y="0" width="280" height="44" fill="#FFFFFF" />
                        {[
                          {x: 4, w: 4}, {x: 10, w: 2}, {x: 14, w: 5}, {x: 21, w: 2}, {x: 25, w: 4},
                          {x: 31, w: 2}, {x: 35, w: 6}, {x: 43, w: 3}, {x: 48, w: 2}, {x: 52, w: 5},
                          {x: 59, w: 3}, {x: 64, w: 2}, {x: 68, w: 6}, {x: 76, w: 2}, {x: 80, w: 4},
                          {x: 86, w: 2}, {x: 90, w: 5}, {x: 97, w: 3}, {x: 102, w: 2}, {x: 106, w: 6},
                          {x: 114, w: 4}, {x: 120, w: 2}, {x: 124, w: 5}, {x: 131, w: 2}, {x: 135, w: 6},
                          {x: 143, w: 3}, {x: 148, w: 2}, {x: 152, w: 5}, {x: 159, w: 2}, {x: 163, w: 4},
                          {x: 169, w: 6}, {x: 177, w: 2}, {x: 181, w: 4}, {x: 187, w: 2}, {x: 191, w: 5},
                          {x: 198, w: 3}, {x: 203, w: 2}, {x: 207, w: 6}, {x: 215, w: 2}, {x: 219, w: 4},
                          {x: 225, w: 2}, {x: 229, w: 5}, {x: 236, w: 3}, {x: 241, w: 2}, {x: 245, w: 6},
                          {x: 253, w: 2}, {x: 257, w: 5}, {x: 264, w: 3}, {x: 269, w: 4}
                        ].map((b, i) => (
                          <rect key={i} x={b.x} y="2" width={b.w} height="40" fill="#000000" />
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* 3. Sender & Receiver Address Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "2px solid #000000" }}>
                    {/* Sender Column */}
                    <div
                      style={{
                        padding: "16px 18px",
                        borderRight: "2px solid #000000",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: "bold",
                          letterSpacing: "0.1em",
                          color: "#6B7280",
                          textTransform: "uppercase",
                        }}
                      >
                        PENGIRIM (SENDER):
                      </span>
                      <p style={{ fontWeight: 800, fontSize: "12px", color: "#000000", margin: 0 }}>
                        SECTOR MADNESS WAREHOUSE
                      </p>
                      <p style={{ fontSize: "10px", lineHeight: "1.5", color: "#1F2937", margin: 0 }}>
                        Jl. Utama No. 88, Jakarta Selatan, DKI Jakarta 12190
                      </p>
                      <p style={{ fontSize: "10px", fontWeight: 600, color: "#1F2937", margin: 0, paddingTop: "2px" }}>
                        Telp: 0812-3456-7890
                      </p>
                    </div>
                    {/* Receiver Column */}
                    <div
                      style={{
                        padding: "16px 18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: "bold",
                          letterSpacing: "0.1em",
                          color: "#6B7280",
                          textTransform: "uppercase",
                        }}
                      >
                        PENERIMA (RECIPIENT):
                      </span>
                      <p style={{ fontWeight: 800, fontSize: "12px", color: "#000000", margin: 0 }}>
                        {printOrder.shipping_address?.receiver_name || printOrder.customer_info?.name || "Customer"}
                      </p>
                      <p style={{ fontSize: "10px", fontWeight: 600, color: "#1F2937", margin: 0 }}>
                        Telp: {printOrder.shipping_address?.phone_number || printOrder.customer_info?.phone || "-"}
                      </p>
                      <p style={{ fontSize: "10px", lineHeight: "1.5", fontWeight: "bold", color: "#000000", margin: 0, paddingTop: "2px" }}>
                        {[
                          printOrder.shipping_address?.street_address,
                          printOrder.shipping_address?.city,
                          printOrder.shipping_address?.province,
                          printOrder.shipping_address?.postal_code || (printOrder.shipping_address as any)?.postcode || (printOrder.shipping_address as any)?.zip_code || (printOrder.shipping_address as any)?.postalCode
                        ].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* 4. Purchased Items Section */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "2px solid #000000",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: "bold",
                        letterSpacing: "0.1em",
                        color: "#6B7280",
                        textTransform: "uppercase",
                      }}
                    >
                      ISI PAKET (CONTENTS):
                    </span>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {(printOrder.products || printOrder.items || []).map((it: any, idx: number) => (
                        <li key={idx} style={{ fontSize: "10px", fontWeight: 600, color: "#000000", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ width: "6px", height: "6px", backgroundColor: "#000000", borderRadius: "50%", display: "inline-block", flexShrink: 0 }}></span>
                          <span>
                            {it.product_name || it.name || "Purchased Product"} - {it.size || "Default"} (QTY: {it.quantity || 1})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 5. Footer Section */}
                  <div
                    style={{
                      padding: "12px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                      color: "#374151",
                      backgroundColor: "#F9FAFB",
                    }}
                  >
                    <span>REF ORDER: {printOrder.order_number}</span>
                    <span>BITESHIP LOGISTICS INTEGRATION</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
