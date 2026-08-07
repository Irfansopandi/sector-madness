"use client";

import React, { useId } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Calendar, TrendingUp, ShoppingBag, RefreshCw } from "lucide-react";
import { AdminDashboardChartData } from "@/utils/api";

interface AdminDashboardChartsProps {
  data?: AdminDashboardChartData;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  period: string;
  onPeriodChange: (period: string) => void;
  isDarkMode: boolean;
}

export default function AdminDashboardCharts({
  data,
  isLoading,
  isError,
  refetch,
  period,
  onPeriodChange,
  isDarkMode,
}: AdminDashboardChartsProps) {
  const lineGradientId = useId();

  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const salesData = data?.sales || [];
  const topProductsData = data?.top_products || [];

  const hasSalesData = salesData.some((s) => s.revenue > 0 || s.orders_count > 0);
  const hasTopProductsData = topProductsData.some((p) => p.quantity_sold > 0);

  // Custom Tooltip for Line Chart (Penjualan)
  const SalesTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const itemData = payload[0].payload;
      return (
        <div
          style={{ padding: "16px 28px", minWidth: "270px" }}
          className={`rounded-[12px] shadow-2xl border text-xs font-mono space-y-2.5 ${
            isDarkMode
              ? "bg-[#1C1C20] border-white/15 text-[#F5F5F5]"
              : "bg-white border-[#E2E8F0] text-[#0A0A0A]"
          }`}
        >
          <p className="font-bold text-[13px] text-[#B6A47E] pb-2 border-b border-white/10 uppercase tracking-wider">
            {label}
          </p>
          <div className="pt-1 space-y-2">
            <p className="flex justify-between items-center gap-8">
              <span className={isDarkMode ? "text-[#A0A0A0]" : "text-[#64748B]"}>
                Pendapatan:
              </span>
              <span className="font-bold text-[#B6A47E]">
                {formatRupiah(itemData.revenue || 0)}
              </span>
            </p>
            <p className="flex justify-between items-center gap-8">
              <span className={isDarkMode ? "text-[#A0A0A0]" : "text-[#64748B]"}>
                Pesanan:
              </span>
              <span className="font-bold">
                {itemData.orders_count || 0} pesanan
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Horizontal Bar Chart (Produk Terlaris)
  const ProductsTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const itemData = payload[0].payload;
      return (
        <div
          style={{ padding: "16px 28px", minWidth: "280px" }}
          className={`rounded-[12px] shadow-2xl border text-xs font-mono space-y-2.5 ${
            isDarkMode
              ? "bg-[#1C1C20] border-white/15 text-[#F5F5F5]"
              : "bg-white border-[#E2E8F0] text-[#0A0A0A]"
          }`}
        >
          <p className="font-bold text-[12px] text-[#B6A47E] pb-2 border-b border-white/10 truncate max-w-[280px]">
            Nama Produk: {itemData.product_name}
          </p>
          <div className="pt-1 space-y-2">
            <p className="flex justify-between items-center gap-8">
              <span className={isDarkMode ? "text-[#A0A0A0]" : "text-[#64748B]"}>
                Jumlah Terjual:
              </span>
              <span className="font-bold text-[#B6A47E]">
                {itemData.quantity_sold || 0} pcs
              </span>
            </p>
            {itemData.revenue > 0 && (
              <p className="flex justify-between items-center gap-8">
                <span className={isDarkMode ? "text-[#A0A0A0]" : "text-[#64748B]"}>
                  Total Omset:
                </span>
                <span className="font-bold">
                  {formatRupiah(itemData.revenue)}
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section style={{ marginBottom: "52px" }} className="w-full">
      {/* Chart Section Header with Single Unified Global Period Filter */}
      <div style={{ marginBottom: "24px" }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-4 h-4" style={{ color: "#B6A47E" }} />
          <h2
            style={{
              fontSize: "11px",
              letterSpacing: "0.22em",
              fontWeight: 700,
              fontFamily: "'Inter', -apple-system, sans-serif",
            }}
            className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
          >
            PERFORMA ANALITIK
          </h2>
        </div>

        {/* Global Indonesian Period Filter Selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            style={{ fontSize: "11px", letterSpacing: "0.2em" }}
            className={`font-mono font-bold uppercase ${
              isDarkMode ? "text-[#8A8A8A]" : "text-[#555555]"
            }`}
          >
            PERIODE:
          </span>
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            style={{
              padding: "5px 20px 5px 10px",
              fontSize: "12px",
              fontWeight: 700,
              borderRadius: "20px",
              outline: "none",
              cursor: "pointer",
              backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.16)" : "1px solid #D1D5DB",
              color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
            }}
            className="transition-all hover:border-[#B6A47E] focus:border-[#B6A47E] font-mono shadow-xs cursor-pointer"
          >
            <option value="week" style={{ backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}>Minggu</option>
            <option value="month" style={{ backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}>Bulan</option>
            <option value="3months" style={{ backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}>3 Bulan</option>
            <option value="year" style={{ backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}>1 Tahun</option>
          </select>
        </div>
      </div>

      {/* 2-Column Balanced Charts Grid (Side-by-side on Desktop, Stacked on Mobile & Tablet) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* ── CARD 1: LINE CHART — PENJUALAN ── */}
        <div
          className={`border rounded-[12px] flex flex-col justify-between transition-colors shadow-sm overflow-hidden ${
            isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
          }`}
          style={{ minHeight: "480px" }}
        >
          {/* Card Header with Explicit Inline Padding (24px Top, 32px Left/Right, 20px Bottom) */}
          <div
            style={{
              padding: "24px 32px 20px 32px",
              borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "15px",
                  letterSpacing: "0.15em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: isDarkMode ? "#F5F5F5" : "#0A0A0A",
                  margin: 0,
                }}
              >
                Penjualan
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  marginTop: "6px",
                  marginBottom: 0,
                  color: isDarkMode ? "#8A8A8A" : "#6B7280",
                }}
              >
                Grafik tren pendapatan &amp; total pesanan valid
              </p>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#B6A47E",
                padding: "6px 16px",
                backgroundColor: "rgba(182, 164, 126, 0.1)",
                borderRadius: "9999px",
                border: "1px solid rgba(182, 164, 126, 0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                flexShrink: 0,
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#B6A47E] animate-pulse shrink-0" />
              <span>
                {period === "week"
                  ? "7 Hari"
                  : period === "3months"
                  ? "90 Hari"
                  : period === "year"
                  ? "12 Bulan"
                  : "30 Hari"}
              </span>
            </span>
          </div>

          {/* Card Body Container */}
          <div style={{ padding: "24px 32px 32px 32px" }} className="flex-1 w-full flex items-center justify-center min-h-[320px]">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center py-16 space-y-5">
                <div className="w-9 h-9 border-3 border-[#B6A47E]/20 border-t-[#B6A47E] rounded-full animate-spin" />
                <span className="text-xs font-mono font-medium text-[#8A8A8A] uppercase tracking-[0.18em]">
                  Memuat data penjualan...
                </span>
              </div>
            ) : isError ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-xs text-rose-400 font-mono">Gagal memuat data grafik penjualan.</p>
                <button
                  onClick={refetch}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold px-4 py-2 bg-[#B6A47E] text-[#0A0A0A] rounded-full hover:bg-[#a3926d] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Coba Lagi
                </button>
              </div>
            ) : !hasSalesData ? (
              <div className="text-center py-16 space-y-2">
                <TrendingUp className={`w-8 h-8 mx-auto ${isDarkMode ? "text-[#444444]" : "text-[#9CA3AF]"}`} />
                <p className={`text-xs font-mono ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>
                  Belum ada data penjualan pada periode ini.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={salesData} margin={{ top: 12, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id={lineGradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B6A47E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#B6A47E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
                  <XAxis
                    dataKey="label"
                    stroke={isDarkMode ? "#666666" : "#94A3B8"}
                    tick={{ fontSize: 11, fill: isDarkMode ? "#8A8A8A" : "#64748B" }}
                    tickLine={false}
                    interval={period === "month" ? 4 : 0}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#666666" : "#94A3B8"}
                    tick={{ fontSize: 11, fill: isDarkMode ? "#8A8A8A" : "#64748B" }}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  />
                  <Tooltip content={<SalesTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#B6A47E"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "#B6A47E", strokeWidth: 1.5, stroke: isDarkMode ? "#18181C" : "#FFFFFF" }}
                    activeDot={{ r: 6, fill: "#B6A47E", stroke: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── CARD 2: HORIZONTAL BAR CHART — PRODUK TERLARIS ── */}
        <div
          className={`border rounded-[12px] flex flex-col justify-between transition-colors shadow-sm overflow-hidden ${
            isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
          }`}
          style={{ minHeight: "480px" }}
        >
          {/* Card Header with Explicit Inline Padding (24px Top, 32px Left/Right, 20px Bottom) */}
          <div
            style={{
              padding: "24px 32px 20px 32px",
              borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "15px",
                  letterSpacing: "0.15em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: isDarkMode ? "#F5F5F5" : "#0A0A0A",
                  margin: 0,
                }}
              >
                Produk Terlaris
              </h3>
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  marginTop: "6px",
                  marginBottom: 0,
                  color: isDarkMode ? "#8A8A8A" : "#6B7280",
                }}
              >
                Top 6 produk berdasarkan jumlah unit terjual
              </p>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#B6A47E",
                padding: "6px 16px",
                backgroundColor: "rgba(182, 164, 126, 0.1)",
                borderRadius: "9999px",
                border: "1px solid rgba(182, 164, 126, 0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                flexShrink: 0,
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#B6A47E] animate-pulse shrink-0" />
              <span>Max 6 Produk</span>
            </span>
          </div>

          {/* Card Body Container */}
          <div style={{ padding: "24px 32px 32px 32px" }} className="flex-1 w-full flex items-center justify-center min-h-[320px]">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center py-16 space-y-5">
                <div className="w-9 h-9 border-3 border-[#B6A47E]/20 border-t-[#B6A47E] rounded-full animate-spin" />
                <span className="text-xs font-mono font-medium text-[#8A8A8A] uppercase tracking-[0.18em]">
                  Memuat data produk...
                </span>
              </div>
            ) : isError ? (
              <div className="text-center py-16 space-y-3">
                <p className="text-xs text-rose-400 font-mono">Gagal memuat data grafik produk terlaris.</p>
                <button
                  onClick={refetch}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold px-4 py-2 bg-[#B6A47E] text-[#0A0A0A] rounded-full hover:bg-[#a3926d] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Coba Lagi
                </button>
              </div>
            ) : !hasTopProductsData ? (
              <div className="text-center py-16 space-y-2">
                <ShoppingBag className={`w-8 h-8 mx-auto ${isDarkMode ? "text-[#444444]" : "text-[#9CA3AF]"}`} />
                <p className={`text-xs font-mono ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>
                  Belum ada produk terjual pada periode ini.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  layout="vertical"
                  data={topProductsData}
                  margin={{ top: 12, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
                  <XAxis
                    type="number"
                    stroke={isDarkMode ? "#666666" : "#94A3B8"}
                    tick={{ fontSize: 11, fill: isDarkMode ? "#8A8A8A" : "#64748B" }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="product_name"
                    stroke={isDarkMode ? "#666666" : "#94A3B8"}
                    tick={{ fontSize: 10, fill: isDarkMode ? "#CCCCCC" : "#334155" }}
                    tickLine={false}
                    width={110}
                    tickFormatter={(v) => (v.length > 16 ? `${v.substring(0, 15)}…` : v)}
                  />
                  <Tooltip content={<ProductsTooltip />} />
                  <Bar dataKey="quantity_sold" fill="#B6A47E" radius={[0, 5, 5, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
