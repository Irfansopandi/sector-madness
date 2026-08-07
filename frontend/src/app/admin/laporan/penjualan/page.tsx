"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import AdminClientGuard from "../../components/AdminClientGuard";
import AdminStatCard from "../../components/AdminStatCard";
import { getAdminSalesReport, SalesReportData } from "@/utils/api";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  Calendar,
  Printer,
  RotateCcw,
  DollarSign,
  ShoppingBag,
  PackageCheck,
  AlertCircle,
  Loader2,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import Swal from "sweetalert2";
import { getInitialSidebarCollapsed, setSidebarCollapsedCache } from "@/utils/sidebarCache";

export default function AdminSalesReportPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    setIsSidebarCollapsed(getInitialSidebarCollapsed());
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === "dark");
      }
    }

    const handleThemeEvent = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sector_madness_admin_theme");
        setIsDarkMode(saved === null ? true : saved === "dark");
      }
    };
    const handleSidebarToggle = (e?: Event) => {
      const customEv = e as CustomEvent<{ collapsed?: boolean }> | undefined;
      if (customEv && customEv.detail && typeof customEv.detail.collapsed === "boolean") {
        setSidebarCollapsedCache(customEv.detail.collapsed);
        setIsSidebarCollapsed(customEv.detail.collapsed);
      } else if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sector_madness_sidebar_collapsed");
        const val = saved === "true";
        setSidebarCollapsedCache(val);
        setIsSidebarCollapsed(val);
      }
    };

    window.addEventListener("sector_theme_change", handleThemeEvent);
    window.addEventListener("sector_sidebar_collapse_toggle", handleSidebarToggle);
    window.addEventListener("storage", handleSidebarToggle);
    return () => {
      window.removeEventListener("sector_theme_change", handleThemeEvent);
      window.removeEventListener("sector_sidebar_collapse_toggle", handleSidebarToggle);
      window.removeEventListener("storage", handleSidebarToggle);
    };
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

  // Helper date generators
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getFirstDayOfMonthStr = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  };

  const [startDateInput, setStartDateInput] = useState<string>(getFirstDayOfMonthStr());
  const [endDateInput, setEndDateInput] = useState<string>(getTodayStr());
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [activeParams, setActiveParams] = useState<{ start_date: string; end_date: string; status?: string }>({
    start_date: getFirstDayOfMonthStr(),
    end_date: getTodayStr(),
    status: "ALL",
  });

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["adminSalesReport", activeParams.start_date, activeParams.end_date, activeParams.status],
    queryFn: () => getAdminSalesReport(activeParams),
    enabled: !!activeParams.start_date && !!activeParams.end_date,
    staleTime: 60000,
    placeholderData: (prev) => prev,
  });

  const reportData: SalesReportData | undefined = data?.data;

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDateInput) {
      Swal.fire({
        icon: "warning",
        title: "TANGGAL MULAI WAJIB DIISI",
        text: "Silakan pilih tanggal mulai laporan.",
        confirmButtonColor: "#B6A47E",
      });
      return;
    }

    if (!endDateInput) {
      Swal.fire({
        icon: "warning",
        title: "TANGGAL AKHIR WAJIB DIISI",
        text: "Silakan pilih tanggal akhir laporan.",
        confirmButtonColor: "#B6A47E",
      });
      return;
    }

    if (new Date(startDateInput) > new Date(endDateInput)) {
      Swal.fire({
        icon: "error",
        title: "RENTANG TANGGAL TIDAK VALID",
        text: "Tanggal mulai tidak boleh lebih besar daripada tanggal akhir.",
        confirmButtonColor: "#E53E3E",
      });
      return;
    }

    setActiveParams({
      start_date: startDateInput,
      end_date: endDateInput,
      status: selectedStatus,
    });
  };

  const setQuickRange = (range: "this_month" | "last_month" | "last_30" | "this_year") => {
    const today = new Date();
    let start = "";
    let end = today.toISOString().split("T")[0];

    if (range === "this_month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
    } else if (range === "last_month") {
      const firstLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      start = firstLastMonth.toISOString().split("T")[0];
      end = lastLastMonth.toISOString().split("T")[0];
    } else if (range === "last_30") {
      const prior30 = new Date();
      prior30.setDate(prior30.getDate() - 30);
      start = prior30.toISOString().split("T")[0];
    } else if (range === "this_year") {
      start = new Date(today.getFullYear(), 0, 1).toISOString().split("T")[0];
    }

    setStartDateInput(start);
    setEndDateInput(end);
    setActiveParams({ start_date: start, end_date: end, status: selectedStatus });
  };

  const handleResetFilter = () => {
    const start = getFirstDayOfMonthStr();
    const end = getTodayStr();
    setStartDateInput(start);
    setEndDateInput(end);
    setSelectedStatus("ALL");
    setActiveParams({ start_date: start, end_date: end, status: "ALL" });
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = "";
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const formatIDR = (val: number) => {
    return "Rp " + (val || 0).toLocaleString("id-ID");
  };

  return (
    <AdminClientGuard>
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: ${isDarkMode ? "invert(1) brightness(100)" : "brightness(0)"} !important;
          cursor: pointer !important;
          opacity: 0.9;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        @media print {
          @page {
            margin: 0 !important;
            size: auto;
          }
          * {
            background-color: #FFFFFF !important;
            background: #FFFFFF !important;
            color: #000000 !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          html, body, div, main, section, header, footer, article, table, thead, tbody, tfoot, tr, th, td, h1, h2, h3, h4, h5, h6, p, span, strong, a, label {
            background-color: #FFFFFF !important;
            background: #FFFFFF !important;
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }
          body {
            margin: 0 !important;
            padding: 12mm 15mm !important;
            min-height: auto !important;
            height: auto !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
            min-height: auto !important;
            height: auto !important;
          }
          .grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 16px !important;
            margin-top: 24px !important;
            margin-bottom: 24px !important;
          }
          .grid > div {
            border: 1.5px solid #000000 !important;
            background-color: #FFFFFF !important;
            background: #FFFFFF !important;
            box-shadow: none !important;
            padding: 16px 14px !important;
          }
          .grid > div span, .grid > div div, .grid > div p {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }
          .grid > div svg {
            color: #000000 !important;
            stroke: #000000 !important;
          }
          .border, .rounded-\[6px\], .shadow-sm {
            border-radius: 0 !important;
            box-shadow: none !important;
            background-color: #FFFFFF !important;
            background: #FFFFFF !important;
          }
          table {
            display: table !important;
            table-layout: fixed !important;
            width: 100% !important;
            border-collapse: collapse !important;
            background-color: #FFFFFF !important;
            background: #FFFFFF !important;
            border: 1.5px solid #000000 !important;
            margin-top: 16px !important;
            font-size: 10.5px !important;
          }
          thead {
            display: table-header-group !important;
            background-color: #F3F4F6 !important;
            background: #F3F4F6 !important;
          }
          tbody {
            display: table-row-group !important;
            background-color: #FFFFFF !important;
            background: #FFFFFF !important;
          }
          tfoot {
            display: table-footer-group !important;
            background-color: #FFFFFF !important;
            background: #FFFFFF !important;
          }
          tr {
            display: table-row !important;
            background-color: #FFFFFF !important;
            background: #FFFFFF !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          th, td {
            display: table-cell !important;
            border: 1px solid #000000 !important;
            padding: 7px 9px !important;
            font-size: 10.5px !important;
            word-break: break-word !important;
          }
          th {
            background-color: #F3F4F6 !important;
            background: #F3F4F6 !important;
            color: #000000 !important;
            border: 1.5px solid #000000 !important;
            font-weight: 800 !important;
            font-size: 10px !important;
          }
          td {
            background-color: #FFFFFF !important;
            background: #FFFFFF !important;
            color: #000000 !important;
          }
          table div, table p, table td, table th, table tfoot td {
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
          }
          table span {
            display: inline-block !important;
            padding: 3px 8px !important;
            font-size: 9.5px !important;
            font-weight: 800 !important;
            border-radius: 12px !important;
            white-space: nowrap !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }
          table span.bg-emerald-500\/15 {
            background-color: #ECFDF5 !important;
            background: #ECFDF5 !important;
            color: #047857 !important;
            -webkit-text-fill-color: #047857 !important;
            border: none !important;
          }
          table span.bg-blue-500\/15 {
            background-color: #EFF6FF !important;
            background: #EFF6FF !important;
            color: #1D4ED8 !important;
            -webkit-text-fill-color: #1D4ED8 !important;
            border: none !important;
          }
          table span.bg-amber-500\/15 {
            background-color: #FFFBEB !important;
            background: #FFFBEB !important;
            color: #B45309 !important;
            -webkit-text-fill-color: #B45309 !important;
            border: none !important;
          }
        }
      `}</style>
      <div
        suppressHydrationWarning
        className={`flex flex-col md:flex-row min-h-screen font-[family-name:var(--font-body)] ${
          isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
        }`}
      >
        {/* Sidebar */}
        <div className="print:hidden">
          <AdminSidebar activeTab="laporan-penjualan" isDarkMode={isDarkMode} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="sticky top-0 z-30 shrink-0 print:hidden">
            <AdminHeader
              title="LAPORAN PENJUALAN"
              subtitle="Statistik & Rekapitulasi Penjualan Berdasarkan Database Aktual"
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
            />
          </div>

          {/* Printable Header Section (Only visible in Print) */}
          <div className="hidden print:block pb-4 mb-6 border-b-2 border-black">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black tracking-wider uppercase text-black">SECTOR MADNESS</h1>
                <p className="text-sm font-bold text-gray-800 tracking-wide mt-1">LAPORAN PENJUALAN</p>
              </div>
              <div className="text-right text-xs text-gray-800 font-mono leading-relaxed">
                <p><strong>Periode:</strong> {reportData?.period.start_fmt} - {reportData?.period.end_fmt}</p>
                <p><strong>Filter Status:</strong> {activeParams.status && activeParams.status !== "ALL" ? activeParams.status.toUpperCase() : "SEMUA STATUS"}</p>
                <p><strong>Dicetak Pada:</strong> {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          </div>

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
            {/* Submenu Dropdown for Collapsed Sidebar Mode */}
            {isSidebarCollapsed && (
              <div style={{ marginBottom: "20px" }} className="flex items-center gap-3 print:hidden">
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em" }} className={`uppercase font-mono ${isDarkMode ? "text-[#B6A47E]" : "text-[#856D3B]"}`}>
                  SUB MENU LAPORAN:
                </span>
                <div className="relative">
                  <select
                    value="/admin/laporan/penjualan"
                    onChange={(e) => router.push(e.target.value)}
                    style={{
                      paddingLeft: "14px",
                      paddingRight: "36px",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      borderRadius: "6px",
                      outline: "none",
                      cursor: "pointer",
                      backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF",
                      borderColor: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "#CBD5E1",
                      color: isDarkMode ? "#F5F5F5" : "#0A0A0A",
                    }}
                    className="font-mono border appearance-none focus:border-[#B6A47E] shadow-sm transition-all"
                  >
                    <option value="/admin/laporan/penjualan">LAPORAN PENJUALAN</option>
                    <option value="/admin/laporan/customer">LAPORAN CUSTOMER</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#B6A47E] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Top Control Header Bar */}
            <div style={{ marginBottom: "24px" }} className="print:hidden flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.22em",
                    fontWeight: 700,
                    fontFamily: "'Inter', -apple-system, sans-serif",
                  }}
                  className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
                >
                  REKAPITULASI PENJUALAN PERIODE
                </h2>
                <p style={{ fontSize: "12px" }} className={`font-mono mt-1 ${isDarkMode ? "text-[#666666]" : "text-[#9CA3AF]"}`}>
                  Filter dan cetak rekap data transaksi dari database
                </p>
              </div>

              {/* Action Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={!reportData || reportData.summary.total_orders === 0}
                style={{
                  padding: "10px 20px",
                  borderRadius: "7px",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  backgroundColor: isDarkMode ? "#18181C" : "#0A0A0A",
                  color: "#FFFFFF",
                  border: isDarkMode ? "1.5px solid #B6A47E" : "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: (!reportData || reportData.summary.total_orders === 0) ? 0.4 : 1,
                }}
                className="transition-all hover:opacity-90 disabled:cursor-not-allowed"
              >
                <Printer style={{ width: "16px", height: "16px" }} />
                CETAK LAPORAN
              </button>
            </div>

            {/* Filter Periode Control Box */}
            <div
              style={{
                marginBottom: "28px",
                padding: "20px 24px",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
              }}
              className="print:hidden shadow-sm"
            >
              <form onSubmit={handleFilterSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-widest text-[#B6A47E]">
                  <Calendar style={{ width: "16px", height: "16px" }} />
                  FILTER PERIODE LAPORAN
                </div>

                <div className="flex flex-wrap items-end gap-4">
                  {/* Start Date */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }} className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}>
                      TANGGAL MULAI
                    </label>
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type="date"
                        value={startDateInput}
                        onChange={(e) => setStartDateInput(e.target.value)}
                        onClick={(e) => {
                          try { (e.target as any).showPicker?.(); } catch {}
                        }}
                        style={{
                          width: "100%",
                          paddingLeft: "14px",
                          paddingRight: "38px",
                          paddingTop: "9px",
                          paddingBottom: "9px",
                          fontSize: "12px",
                          fontWeight: 600,
                          borderRadius: "6px",
                          outline: "none",
                          backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                          color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                          colorScheme: isDarkMode ? "dark" : "light",
                          cursor: "pointer",
                        }}
                        className="font-mono custom-date-input"
                      />
                      <Calendar
                        onClick={(e) => {
                          const inputEl = e.currentTarget.previousElementSibling as HTMLInputElement;
                          try { inputEl?.showPicker?.(); inputEl?.focus(); } catch {}
                        }}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "16px",
                          height: "16px",
                          color: "#B6A47E",
                          pointerEvents: "auto",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }} className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}>
                      TANGGAL AKHIR
                    </label>
                    <div style={{ position: "relative", width: "100%" }}>
                      <input
                        type="date"
                        value={endDateInput}
                        onChange={(e) => setEndDateInput(e.target.value)}
                        onClick={(e) => {
                          try { (e.target as any).showPicker?.(); } catch {}
                        }}
                        style={{
                          width: "100%",
                          paddingLeft: "14px",
                          paddingRight: "38px",
                          paddingTop: "9px",
                          paddingBottom: "9px",
                          fontSize: "12px",
                          fontWeight: 600,
                          borderRadius: "6px",
                          outline: "none",
                          backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                          color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                          colorScheme: isDarkMode ? "dark" : "light",
                          cursor: "pointer",
                        }}
                        className="font-mono custom-date-input"
                      />
                      <Calendar
                        onClick={(e) => {
                          const inputEl = e.currentTarget.previousElementSibling as HTMLInputElement;
                          try { inputEl?.showPicker?.(); inputEl?.focus(); } catch {}
                        }}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "16px",
                          height: "16px",
                          color: "#B6A47E",
                          pointerEvents: "auto",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </div>

                  {/* Status Pesanan Filter */}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }} className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}>
                      STATUS PESANAN
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      style={{
                        width: "100%",
                        paddingLeft: "14px",
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
                        cursor: "pointer",
                      }}
                      className="font-mono focus:border-[#B6A47E]"
                    >
                      <option value="ALL">SEMUA STATUS (ALL)</option>
                      <option value="COMPLETED">COMPLETED / DELIVERED</option>
                      <option value="SHIPPED">SHIPPED / DELIVERING</option>
                      <option value="PROCESSING">PROCESSING / PENDING</option>
                      <option value="PAID">PAID</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      style={{
                        padding: "10px 24px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        backgroundColor: "#B6A47E",
                        color: "#0A0A0A",
                        border: "none",
                        cursor: "pointer",
                      }}
                      className="hover:bg-[#a3926c] transition-all shadow-xs"
                    >
                      TAMPILKAN LAPORAN
                    </button>

                    <button
                      type="button"
                      onClick={handleResetFilter}
                      title="RESET FILTER"
                      style={{
                        padding: "10px 14px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        backgroundColor: isDarkMode ? "#121214" : "#F3F4F6",
                        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                        color: isDarkMode ? "#CCCCCC" : "#374151",
                        cursor: "pointer",
                      }}
                      className="hover:opacity-80 transition-all"
                    >
                      <RotateCcw style={{ width: "14px", height: "14px" }} />
                    </button>
                  </div>
                </div>

                {/* Quick Range Presets */}
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
                  }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }} className={`uppercase mr-1 ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>
                    PRESET CEPAT:
                  </span>
                  {[
                    { id: "this_month", label: "BULAN INI" },
                    { id: "last_month", label: "BULAN LALU" },
                    { id: "last_30", label: "30 HARI TERAKHIR" },
                    { id: "this_year", label: "TAHUN INI" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setQuickRange(preset.id as any)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#F3F4F6",
                        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #D1D5DB",
                        color: isDarkMode ? "#CCCCCC" : "#374151",
                        cursor: "pointer",
                      }}
                      className="hover:border-[#B6A47E] hover:text-[#B6A47E] transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Active Period Label */}
            {reportData && (
              <div
                style={{
                  marginBottom: "28px",
                  padding: "14px 20px",
                  borderRadius: "8px",
                  backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
                }}
                className="print:hidden flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <Calendar style={{ width: "15px", height: "15px", color: "#B6A47E" }} />
                  <span className="font-bold text-[#B6A47E]">PERIODE LAPORAN:</span>
                  <span className="font-semibold">{reportData.period.start_fmt} S/D {reportData.period.end_fmt}</span>
                  {activeParams.status && activeParams.status !== "ALL" && (
                    <span style={{ padding: "3px 8px", borderRadius: "4px" }} className="bg-[#B6A47E]/20 text-[#B6A47E] font-bold text-[10px]">
                      STATUS: {activeParams.status.toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "11px" }} className="font-mono text-[#8A8A8A] print:hidden">
                  * PESANAN BERSTATUS <span className="text-red-400 font-bold">CANCELLED</span> DIKECUALIKAN.
                </div>
              </div>
            )}

            {/* Loading & Error States */}
            {isLoading && !reportData && (
              <>
                <div style={{ marginBottom: "28px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{ padding: "20px 24px", borderRadius: "8px" }}
                      className={`border animate-pulse ${
                        isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#E5E7EB]"
                      }`}
                    >
                      <div className="h-3 w-32 bg-gray-300 dark:bg-white/10 rounded mb-4" />
                      <div className="h-7 w-48 bg-gray-300 dark:bg-white/10 rounded mb-2" />
                      <div className="h-3 w-28 bg-gray-200 dark:bg-white/5 rounded" />
                    </div>
                  ))}
                </div>

                <div
                  className={`border rounded-[6px] overflow-hidden shadow-sm ${
                    isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
                  }`}
                >
                  <div style={{ padding: "18px 24px" }} className="border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                    <div className="h-4 w-44 bg-gray-300 dark:bg-white/10 rounded" />
                    <div className="h-4 w-28 bg-gray-300 dark:bg-white/10 rounded" />
                  </div>
                  <div style={{ padding: "24px" }} className="space-y-3">
                    {[1, 2, 3, 4, 5].map((row) => (
                      <div key={row} className="h-10 w-full bg-gray-200 dark:bg-white/5 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              </>
            )}

            {isError && (
              <div
                style={{ padding: "24px", borderRadius: "8px", marginBottom: "28px" }}
                className={`border flex items-center gap-4 ${
                  isDarkMode ? "bg-red-500/10 border-red-500/20 text-red-300" : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <AlertCircle style={{ width: "24px", height: "24px" }} className="shrink-0 text-red-400" />
                <div style={{ fontSize: "12px" }}>
                  <p className="font-bold uppercase tracking-wider mb-1">GAGAL MEMUAT LAPORAN</p>
                  <p>{(error as any)?.response?.data?.message || (error as Error).message || "Terjadi kesalahan sistem saat mengambil data laporan."}</p>
                </div>
              </div>
            )}

            {/* Main Report Content */}
            {!isError && reportData && (
              <>
                {/* Standard Summary Cards Matching Admin Dashboard */}
                <div style={{ marginBottom: "28px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AdminStatCard
                    label="TOTAL PENJUALAN (REVENUE)"
                    value={formatIDR(reportData.summary.total_revenue)}
                    subtext="Total pendataan transaksi valid"
                    icon={DollarSign}
                    accentColor="#B6A47E"
                    isDarkMode={isDarkMode}
                  />
                  <AdminStatCard
                    label="TOTAL PESANAN VALID"
                    value={`${reportData.summary.total_orders} PESANAN`}
                    subtext="Order diproses / selesai"
                    icon={ShoppingBag}
                    accentColor={isDarkMode ? "#F5F5F5" : "#0A0A0A"}
                    isDarkMode={isDarkMode}
                  />
                  <AdminStatCard
                    label="TOTAL PRODUK TERJUAL"
                    value={`${reportData.summary.total_items_sold} ITEM`}
                    subtext="Kuantitas fisik produk terjual"
                    icon={PackageCheck}
                    accentColor={isDarkMode ? "#F5F5F5" : "#0A0A0A"}
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* Table or Empty State */}
                {reportData.summary.total_orders === 0 ? (
                  <div
                    style={{ padding: "64px 24px", borderRadius: "8px" }}
                    className={`border text-center flex flex-col items-center justify-center gap-3 ${
                      isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
                    }`}
                  >
                    <div style={{ width: "56px", height: "56px" }} className="rounded-xl bg-[#B6A47E]/10 flex items-center justify-center text-[#B6A47E] mb-2">
                      <FileText style={{ width: "28px", height: "28px" }} />
                    </div>
                    <h4 style={{ fontSize: "14px", fontWeight: 700 }} className="uppercase tracking-wider">BELUM ADA DATA PENJUALAN</h4>
                    <p style={{ fontSize: "12px" }} className="text-[#8A8A8A] max-w-md font-mono">
                      Belum ada data penjualan pada periode yang dipilih ({reportData.period.start_fmt} - {reportData.period.end_fmt}). Silakan pilih rentang tanggal lain.
                    </p>
                  </div>
                ) : (
                  /* Standard Order Table Layout Matching Orders Control Page */
                  <div
                    className={`relative border rounded-[6px] overflow-hidden shadow-sm transition-colors ${
                      isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
                    }`}
                  >
                    {/* Table-only loading overlay when filtering/searching date period */}
                    {isFetching && !isLoading && (
                      <div className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-3 print:hidden transition-all">
                        <Loader2 className="w-7 h-7 animate-spin text-[#B6A47E]" />
                        <span className="text-[11px] font-mono font-bold tracking-widest text-[#B6A47E] drop-shadow-sm uppercase">
                          MEMUAT DATA TANGGAL PERIODE...
                        </span>
                      </div>
                    )}
                    <div style={{ padding: "16px 20px" }} className="border-b flex items-center justify-between border-inherit print:hidden">
                      <div>
                        <h4 style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em" }} className="uppercase font-mono">
                          RINCIAN TRANSAKSI PENJUALAN
                        </h4>
                        <p style={{ fontSize: "11px" }} className="text-[#8A8A8A] font-mono mt-0.5">
                          Menampilkan {reportData.orders.length} transaksi valid
                        </p>
                      </div>
                    </div>

                    <div
                      className={`overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent ${
                        isDarkMode
                          ? "[&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/35"
                          : "[&::-webkit-scrollbar-thumb]:bg-black/20 hover:[&::-webkit-scrollbar-thumb]:bg-black/35"
                      } [&::-webkit-scrollbar-thumb]:rounded-full`}
                    >
                      <table className="w-full min-w-[750px] text-left text-xs uppercase tracking-wider">
                        <thead
                          className={`border-b ${
                            isDarkMode
                              ? "bg-[#1E1E22] border-white/10 text-[#8A8A8A]"
                              : "bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]"
                          }`}
                        >
                          <tr>
                            <th style={{ width: "25%", padding: "14px 16px" }} className="font-bold whitespace-nowrap">ORDER NO</th>
                            <th style={{ width: "18%", padding: "14px 16px" }} className="font-bold whitespace-nowrap">DATE</th>
                            <th style={{ width: "22%", padding: "14px 16px" }} className="font-bold whitespace-nowrap">CUSTOMER</th>
                            <th style={{ width: "9%", padding: "14px 16px" }} className="font-bold text-center whitespace-nowrap">ITEMS</th>
                            <th style={{ width: "12%", padding: "14px 16px" }} className="font-bold text-center whitespace-nowrap">STATUS</th>
                            <th style={{ width: "14%", padding: "14px 16px" }} className="font-bold text-right whitespace-nowrap">TOTAL BELANJA</th>
                          </tr>
                        </thead>
                        <tbody
                          className={`divide-y ${
                            isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"
                          }`}
                        >
                          {reportData.orders.map((ord) => (
                            <tr
                              key={ord.id}
                              className={`transition-colors ${
                                isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"
                              }`}
                            >
                              <td
                                style={{ padding: "14px 16px" }}
                                className={`font-mono font-bold whitespace-nowrap ${
                                  isDarkMode ? "text-[#B6A47E]" : "text-[#8E7948]"
                                }`}
                              >
                                #{ord.order_number}
                              </td>
                              <td
                                style={{ padding: "14px 16px" }}
                                className={`font-mono whitespace-nowrap ${
                                  isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                                }`}
                              >
                                {ord.created_at_fmt}
                              </td>
                              <td style={{ padding: "14px 16px" }} className="whitespace-nowrap">
                                <div className={`font-semibold ${isDarkMode ? "text-[#CCCCCC]" : "text-[#374151]"}`}>
                                  {ord.customer_name}
                                </div>
                                <div style={{ fontSize: "11px" }} className="text-[#8A8A8A] font-mono lowercase">
                                  {ord.customer_email}
                                </div>
                              </td>
                              <td style={{ padding: "14px 16px" }} className="text-center font-mono font-bold whitespace-nowrap">
                                {ord.items_count} ITEM
                              </td>
                              <td style={{ padding: "14px 16px" }} className="text-center whitespace-nowrap">
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "12px",
                                    fontSize: "10px",
                                    fontWeight: 800,
                                  }}
                                  className={`inline-block font-mono uppercase tracking-wider ${
                                    ord.status === "completed" || ord.status === "delivered"
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                      : ord.status === "shipped" || ord.status === "delivering"
                                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {ord.status}
                                </span>
                              </td>
                              <td
                                style={{ padding: "14px 16px" }}
                                className={`text-right font-mono font-bold whitespace-nowrap text-sm ${
                                  isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                                }`}
                              >
                                {formatIDR(ord.total_amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr
                            className={`font-mono font-bold border-t ${
                              isDarkMode ? "bg-[#1E1E22] border-white/10 text-[#F5F5F5]" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#111827]"
                            }`}
                          >
                            <td colSpan={5} style={{ padding: "16px" }} className="text-right uppercase tracking-wider text-xs whitespace-nowrap">
                              TOTAL KESELURUHAN REVENUE:
                            </td>
                            <td style={{ padding: "16px" }} className="text-right text-base text-[#B6A47E] whitespace-nowrap">
                              {formatIDR(reportData.summary.total_revenue)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </AdminClientGuard>
  );
}
