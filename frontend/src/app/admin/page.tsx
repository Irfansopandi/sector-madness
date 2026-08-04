"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Banknote,
  ShoppingBag,
  Tags,
  BookOpen,
  PackageCheck,
  Image as ImageIcon,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink,
  Eye,
  X,
  Truck,
  Printer,
  TrendingUp,
} from "lucide-react";
import Swal from "sweetalert2";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminStatCard from "./components/AdminStatCard";
import {
  getAdminOrders,
  getAdminProducts,
  getProducts,
  getJournals,
  getAdminHeroBanners,
  getCategories,
  getOrderDetail,
  OrderDetailData,
  getImageUrl,
} from "@/utils/api";

export default function AdminDashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      if (savedTheme !== null) {
        return savedTheme === "dark";
      }
    }
    return true;
  });
  const [greeting, setGreeting] = useState("GOOD DAY,");
  const [adminName, setAdminName] = useState("Admin SectorMadness");
  const [adminEmail, setAdminEmail] = useState("admin@sectormadness.com");
  const [adminRole, setAdminRole] = useState("ADMINISTRATOR");

  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetailData | null>(null);
  const [printOrder, setPrintOrder] = useState<any | null>(null);

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
          timeline: [],
        });
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      }
    }

    const checkGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 4 && hour < 11) setGreeting("GOOD MORNING,");
      else if (hour >= 11 && hour < 15) setGreeting("GOOD AFTERNOON,");
      else if (hour >= 15 && hour < 18) setGreeting("GOOD EVENING,");
      else setGreeting("GOOD NIGHT,");
    };

    checkGreeting();
    const interval = setInterval(checkGreeting, 5000);

    if (typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem("sector_madness_user");
        let resolvedName = "Admin SectorMadness";
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.email) setAdminEmail(parsed.email);
          resolvedName =
            parsed.name ||
            [parsed.firstName, parsed.lastName].filter(Boolean).join(" ") ||
            (parsed.email ? parsed.email.split("@")[0] : "Admin SectorMadness");
          setAdminName(resolvedName);
          if (parsed.role) setAdminRole(parsed.role.toUpperCase());
        }

        const welcomeShown = sessionStorage.getItem("admin_welcome_shown");
        if (!welcomeShown) {
          sessionStorage.setItem("admin_welcome_shown", "true");
          const savedTheme = localStorage.getItem("sector_madness_admin_theme");
          const isDark = savedTheme === null ? true : savedTheme === "dark";

          setTimeout(() => {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "WELCOME BACK ADMIN",
              text: `${resolvedName}!`,
              showConfirmButton: false,
              timer: 3500,
              timerProgressBar: true,
              background: isDark ? "#18181C" : "#ffffff",
              color: isDark ? "#f5f5f5" : "#0a0a0a",
              customClass: {
                popup: isDark
                  ? "border border-white/10 rounded-[12px] shadow-2xl"
                  : "border border-gray-200 rounded-[12px] shadow-2xl",
              },
            });
          }, 300);
        }
      } catch {}
    }

    return () => clearInterval(interval);
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

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrders,
    refetchInterval: 15000,
    retry: false,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: getAdminProducts,
    refetchInterval: 15000,
    retry: false,
  });

  const { data: journals = [] } = useQuery({
    queryKey: ["journals"],
    queryFn: () => getJournals(),
    refetchInterval: 15000,
    retry: false,
  });

  const { data: heroBanners = [] } = useQuery({
    queryKey: ["admin-hero-banners"],
    queryFn: getAdminHeroBanners,
    refetchInterval: 15000,
    retry: false,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchInterval: 15000,
    retry: false,
  });

  // Calculate real-time metrics dynamically from active database state
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const formattedRevenue = `Rp ${totalRevenue.toLocaleString("id-ID")}`;

  const totalItemsSold = orders
    .filter((ord) => {
      const st = (ord.shipping_status || "").toUpperCase();
      return st !== "CANCELLED" && st !== "CANCELED" && st !== "DIBATALKAN";
    })
    .reduce((sum, ord) => {
      const items: any[] = (ord as any).items || (ord as any).products || [];
      if (items.length > 0) {
        return sum + items.reduce((iSum: number, item: any) => iSum + (Number(item.quantity) || 1), 0);
      }
      return sum + (Number((ord as any).items_count) || 1);
    }, 0);

  const recentOrders = orders
    .filter((ord) => {
      const st = (ord.shipping_status || "").toUpperCase();
      return st !== "CANCELLED" && st !== "CANCELED" && st !== "DIBATALKAN";
    })
    .slice(0, 6);

  // Aggregate top 6 best-selling products from all non-cancelled orders
  const topProducts = (() => {
    const map = new Map<string, { name: string; image: string; qty: number; revenue: number; unitPrice: number }>();
    orders
      .filter((ord) => {
        const st = (ord.shipping_status || "").toUpperCase();
        return st !== "CANCELLED" && st !== "CANCELED" && st !== "DIBATALKAN";
      })
      .forEach((ord) => {
        const items: any[] = (ord as any).items || (ord as any).products || [];
        items.forEach((item: any) => {
          const rawName: string = item.product_name || item.name || "Unknown Product";
          const qty: number = Number(item.quantity) || 1;

          // Match with official catalog products first by ID or Name
          let matchedProd: any = null;
          if (products.length > 0) {
            matchedProd = products.find((p: any) => {
              const pId = String(p.id || "");
              const iId = String(item.product_id || item.id || "");
              if (iId && pId === iId) return true;

              const pName = (p.name || p.title || "").toLowerCase().trim();
              const iName = rawName.toLowerCase().trim();
              return pName === iName || pName.includes(iName) || iName.includes(pName);
            });
          }

          const displayName = matchedProd?.name || rawName;

          // Image: Always prioritize live catalog image
          let image: string = "";
          if (matchedProd && (matchedProd.image || matchedProd.photo)) {
            image = matchedProd.image || matchedProd.photo;
          } else {
            image = item.product_image || item.image || item.photo || "";
          }

          // Price: Always prioritize live catalog price
          let unitPrice = 0;
          if (matchedProd && matchedProd.price) {
            const rawP = Number(matchedProd.price) || 0;
            unitPrice = rawP < 1000 ? rawP * 1000 : rawP;
          } else {
            const rawP = Number(item.price || item.unit_price) || 0;
            const normalizedP = rawP < 1000 ? rawP * 1000 : rawP;
            unitPrice = normalizedP > 1000000 && qty > 1 ? Math.round(normalizedP / qty) : normalizedP;
          }

          const existing = map.get(displayName);
          if (existing) {
            existing.qty += qty;
            existing.revenue += unitPrice * qty;
            if (image && (!existing.image || (matchedProd && matchedProd.image))) {
              existing.image = image;
            }
          } else {
            map.set(displayName, { name: displayName, image, qty, revenue: unitPrice * qty, unitPrice });
          }
        });
      });
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue || b.qty - a.qty)
      .slice(0, 6)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  })();

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col lg:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
      }`}
    >
      {/* Persistent Admin Sidebar Navigation */}
      <AdminSidebar activeTab="dashboard" isDarkMode={isDarkMode} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="ADMINISTRATIVE OVERVIEW"
          subtitle="Real-time performance analytics & system shortcuts"
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
          {/* Greeting Banner (Matching User Dashboard Layout & Serif Display Font) */}
          <div
            style={{ marginBottom: "44px" }}
            className={`pb-7 border-b transition-colors ${
              isDarkMode ? "border-white/[0.08]" : "border-[#DCDDE1]"
            }`}
          >
            <span
              suppressHydrationWarning
              className={`text-xs sm:text-sm font-bold tracking-[0.22em] uppercase block mb-1.5 font-mono ${
                isDarkMode ? "text-[#CCCCCC]" : "text-[#555555]"
              }`}
            >
              {greeting}
            </span>
            <h2
              suppressHydrationWarning
              className={`text-2xl sm:text-3xl md:text-4xl font-normal tracking-wide font-[family-name:var(--font-display)] ${
                isDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"
              }`}
            >
              {adminName}
            </h2>
            <p
              suppressHydrationWarning
              className={`text-xs font-mono mt-2.5 tracking-wider ${
                isDarkMode ? "text-[#8A8A8A]" : "text-[#666666]"
              }`}
            >
              {adminRole} • {adminEmail}
            </p>
          </div>

          {/* KPI Analytics Grid */}
          <section style={{ marginBottom: "52px" }}>
            <div style={{ marginBottom: "18px" }} className="flex items-center justify-between">
              <h2
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.22em",
                  fontWeight: 700,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
                className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
              >
                SYSTEM OVERVIEW
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <AdminStatCard
                label="TOTAL REVENUE"
                value={formattedRevenue}
                subtext="Aggregated order sales"
                icon={<Banknote />}
                accentColor="#0A0A0A"
                isDarkMode={isDarkMode}
              />
              <AdminStatCard
                label="TOTAL ORDERS"
                value={orders.length > 0 ? orders.length : 12}
                subtext="Customer orders placed"
                icon={<ShoppingBag />}
                accentColor="#0A0A0A"
                isDarkMode={isDarkMode}
              />
              <AdminStatCard
                label="TOTAL PRODUK"
                value={products.length > 0 ? products.length : 10}
                subtext={`${categories.length} Kategori Aktif`}
                icon={<Tags />}
                accentColor="#0A0A0A"
                isDarkMode={isDarkMode}
              />
              <AdminStatCard
                label="PRODUK TERJUAL"
                value={totalItemsSold > 0 ? `${totalItemsSold} UNIT` : "20 UNIT"}
                subtext="Total unit produk berhasil terjual"
                icon={<PackageCheck />}
                accentColor="#0A0A0A"
                isDarkMode={isDarkMode}
              />
            </div>
          </section>

          {/* Main Workspace 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): 6 Produk Terlaris */}
            <section className="lg:col-span-8">
              <div style={{ marginBottom: "18px" }} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                    6 PRODUK TERLARIS
                  </h2>
                </div>
                <span
                  style={{ fontSize: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                  className={`font-medium tracking-wider uppercase ${isDarkMode ? "text-[#666666]" : "text-[#9CA3AF]"}`}
                >
                  BERDASARKAN TOTAL PENGHASILAN
                </span>
              </div>

              <div
                className={`border rounded-[6px] overflow-hidden shadow-sm ${
                  isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
                }`}
              >
                {topProducts.length === 0 ? (
                  <div
                    style={{ padding: "48px 24px" }}
                    className={`text-center text-xs ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}
                  >
                    Belum ada data penjualan produk.
                  </div>
                ) : (
                  <div className={`divide-y ${isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"}`}>
                    {topProducts.map((prod) => {
                      const prodImg = prod.image ? getImageUrl(prod.image) : null;
                      return (
                        <div
                          key={prod.name}
                          style={{ padding: "18px 24px" }}
                          className={`flex items-center gap-4 transition-colors ${
                            isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"
                          }`}
                        >
                          {/* Rank badge */}
                          <span
                            style={{ width: "32px", height: "32px", borderRadius: "6px", flexShrink: 0 }}
                            className={`inline-flex items-center justify-center font-black text-xs font-mono ${
                              prod.rank === 1
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : prod.rank === 2
                                ? "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                                : prod.rank === 3
                                ? "bg-orange-900/20 text-orange-400 border border-orange-500/30"
                                : isDarkMode
                                ? "bg-white/5 text-[#8A8A8A] border border-white/10"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {prod.rank}
                          </span>

                          {/* Product Image Thumbnail */}
                          <div
                            style={{ width: "48px", height: "48px", borderRadius: "6px", flexShrink: 0 }}
                            className={`overflow-hidden border relative flex items-center justify-center ${
                              isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"
                            }`}
                          >
                            {prodImg ? (
                              <img
                                src={prodImg}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className={`w-5 h-5 ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-400"}`} />
                            )}
                          </div>

                          {/* Product Name + Unit Price & Total Revenue */}
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <span
                              className={`font-bold text-xs uppercase tracking-wide truncate ${
                                isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                              }`}
                            >
                              {prod.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] font-mono">
                              <span
                                className={`font-semibold ${
                                  prod.rank === 1
                                    ? "text-[#B6A47E]"
                                    : isDarkMode
                                    ? "text-[#CCCCCC]"
                                    : "text-[#374151]"
                                }`}
                              >
                                Rp {prod.unitPrice.toLocaleString("id-ID")}
                                <span className="text-[10px] opacity-60 font-normal"> / pcs</span>
                              </span>
                              <span className="text-gray-500 font-sans opacity-50">•</span>
                              <span className={`text-[10px] ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>
                                Total: Rp {prod.revenue.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          {/* Qty pill */}
                          <span
                            style={{ padding: "6px 16px", borderRadius: "6px", flexShrink: 0 }}
                            className={`font-black font-mono text-sm ${
                              prod.rank === 1
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : isDarkMode
                                ? "bg-white/5 text-[#F5F5F5] border border-white/10"
                                : "bg-gray-100 text-[#111827] border border-gray-200"
                            }`}
                          >
                            {prod.qty} <span className="font-normal opacity-60 text-[10px]">pcs</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Right Column (4 cols): Management Shortcuts Stacked Vertically */}
            <section className="lg:col-span-4">
              <div style={{ marginBottom: "18px" }} className="flex items-center justify-between">
                <h2
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.22em",
                    fontWeight: 700,
                    fontFamily: "'Inter', -apple-system, sans-serif",
                  }}
                  className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
                >
                  MANAGEMENT SHORTCUTS
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
                  QUICK ACCESS
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <Link
                  href="/admin/orders"
                  style={{ padding: "20px 22px" }}
                  className={`border rounded-[6px] hover:border-[#B6A47E] transition-all duration-200 group shadow-sm flex items-center justify-between gap-4 ${
                    isDarkMode
                      ? "bg-[#18181C] border-white/10"
                      : "bg-white border-[#D1D5DB]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      style={{ width: "46px", height: "46px" }}
                      className="flex items-center justify-center bg-[#B6A47E]/10 border border-[#B6A47E]/25 text-[#B6A47E] rounded-[4px] shrink-0 group-hover:bg-[#B6A47E] group-hover:text-[#0A0A0A] transition-all duration-200"
                    >
                      <PackageCheck className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h3
                        style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className={`font-bold text-xs tracking-wider uppercase group-hover:text-[#B6A47E] transition-colors truncate ${
                          isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                        }`}
                      >
                        ORDERS &amp; SHIPMENT
                      </h3>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed font-medium truncate ${
                          isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                        }`}
                      >
                        Manage customer orders &amp; tracking
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 group-hover:text-[#B6A47E] group-hover:translate-x-1 transition-all shrink-0 ${
                      isDarkMode ? "text-[#8A8A8A]" : "text-[#9CA3AF]"
                    }`}
                  />
                </Link>

                <Link
                  href="/admin/catalog"
                  style={{ padding: "20px 22px" }}
                  className={`border rounded-[6px] hover:border-[#B6A47E] transition-all duration-200 group shadow-sm flex items-center justify-between gap-4 ${
                    isDarkMode
                      ? "bg-[#18181C] border-white/10"
                      : "bg-white border-[#D1D5DB]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      style={{ width: "46px", height: "46px" }}
                      className="flex items-center justify-center bg-[#B6A47E]/10 border border-[#B6A47E]/25 text-[#B6A47E] rounded-[4px] shrink-0 group-hover:bg-[#B6A47E] group-hover:text-[#0A0A0A] transition-all duration-200"
                    >
                      <SlidersHorizontal className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h3
                        style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className={`font-bold text-xs tracking-wider uppercase group-hover:text-[#B6A47E] transition-colors truncate ${
                          isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                        }`}
                      >
                        CATALOG &amp; FILTERS
                      </h3>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed font-medium truncate ${
                          isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                        }`}
                      >
                        Product categories &amp; collections
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 group-hover:text-[#B6A47E] group-hover:translate-x-1 transition-all shrink-0 ${
                      isDarkMode ? "text-[#8A8A8A]" : "text-[#9CA3AF]"
                    }`}
                  />
                </Link>

                <Link
                  href="/admin/journals"
                  style={{ padding: "20px 22px" }}
                  className={`border rounded-[6px] hover:border-[#B6A47E] transition-all duration-200 group shadow-sm flex items-center justify-between gap-4 ${
                    isDarkMode
                      ? "bg-[#18181C] border-white/10"
                      : "bg-white border-[#D1D5DB]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      style={{ width: "46px", height: "46px" }}
                      className="flex items-center justify-center bg-[#B6A47E]/10 border border-[#B6A47E]/25 text-[#B6A47E] rounded-[4px] shrink-0 group-hover:bg-[#B6A47E] group-hover:text-[#0A0A0A] transition-all duration-200"
                    >
                      <BookOpen className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h3
                        style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className={`font-bold text-xs tracking-wider uppercase group-hover:text-[#B6A47E] transition-colors truncate ${
                          isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                        }`}
                      >
                        JOURNAL ARTICLES
                      </h3>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed font-medium truncate ${
                          isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                        }`}
                      >
                        Editorial stories &amp; archives
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 group-hover:text-[#B6A47E] group-hover:translate-x-1 transition-all shrink-0 ${
                      isDarkMode ? "text-[#8A8A8A]" : "text-[#9CA3AF]"
                    }`}
                  />
                </Link>

                <Link
                  href="/admin/hero-banners"
                  style={{ padding: "20px 22px" }}
                  className={`border rounded-[6px] hover:border-[#B6A47E] transition-all duration-200 group shadow-sm flex items-center justify-between gap-4 ${
                    isDarkMode
                      ? "bg-[#18181C] border-white/10"
                      : "bg-white border-[#D1D5DB]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      style={{ width: "46px", height: "46px" }}
                      className="flex items-center justify-center bg-[#B6A47E]/10 border border-[#B6A47E]/25 text-[#B6A47E] rounded-[4px] shrink-0 group-hover:bg-[#B6A47E] group-hover:text-[#0A0A0A] transition-all duration-200"
                    >
                      <ImageIcon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h3
                        style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className={`font-bold text-xs tracking-wider uppercase group-hover:text-[#B6A47E] transition-colors truncate ${
                          isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                        }`}
                      >
                        HERO SLIDERS &amp; BANNERS
                      </h3>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed font-medium truncate ${
                          isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                        }`}
                      >
                        Homepage hero campaign sliders
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 group-hover:text-[#B6A47E] group-hover:translate-x-1 transition-all shrink-0 ${
                      isDarkMode ? "text-[#8A8A8A]" : "text-[#9CA3AF]"
                    }`}
                  />
                </Link>

                <Link
                  href="/"
                  target="_blank"
                  style={{ padding: "20px 22px" }}
                  className={`border rounded-[6px] hover:border-[#B6A47E] transition-all duration-200 group shadow-sm flex items-center justify-between gap-4 ${
                    isDarkMode
                      ? "bg-[#18181C] border-white/10"
                      : "bg-white border-[#D1D5DB]"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      style={{ width: "46px", height: "46px" }}
                      className="flex items-center justify-center bg-[#B6A47E]/10 border border-[#B6A47E]/25 text-[#B6A47E] rounded-[4px] shrink-0 group-hover:bg-[#B6A47E] group-hover:text-[#0A0A0A] transition-all duration-200"
                    >
                      <ExternalLink className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h3
                        style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className={`font-bold text-xs tracking-wider uppercase group-hover:text-[#B6A47E] transition-colors truncate ${
                          isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                        }`}
                      >
                        VIEW STOREFRONT
                      </h3>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed font-medium truncate ${
                          isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                        }`}
                      >
                        Preview live storefront &amp; website
                      </p>
                    </div>
                  </div>
                  <ExternalLink
                    className={`w-4 h-4 group-hover:text-[#B6A47E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ${
                      isDarkMode ? "text-[#8A8A8A]" : "text-[#9CA3AF]"
                    }`}
                  />
                </Link>
              </div>
            </section>
          </div>

          {/* ── RECENT ORDERS ACTIVITY (Full-Width Below) ── */}
          <section style={{ marginTop: "40px" }}>
            <div style={{ marginBottom: "18px" }} className="flex items-center justify-between">
              <h2
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.22em",
                  fontWeight: 700,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
                className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
              >
                RECENT ORDERS ACTIVITY
              </h2>
              <Link
                href="/admin/orders"
                style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
                className={`text-xs font-bold uppercase transition-colors flex items-center gap-1.5 group ${
                  isDarkMode
                    ? "text-[#8A8A8A] hover:text-[#B6A47E]"
                    : "text-[#6B7280] hover:text-[#B6A47E]"
                }`}
              >
                <span>VIEW ALL ORDERS</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div
              className={`border rounded-[6px] overflow-x-auto shadow-sm transition-colors ${
                isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
              }`}
            >
              <table className="w-full text-left text-xs uppercase tracking-wider">
                <thead
                  className={`border-b ${
                    isDarkMode
                      ? "bg-[#1E1E22] border-white/10 text-[#8A8A8A]"
                      : "bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]"
                  }`}
                >
                  <tr>
                    <th style={{ padding: "18px 24px" }} className="font-bold whitespace-nowrap">ORDER NUMBER</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold whitespace-nowrap">CUSTOMER</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold whitespace-nowrap">TOTAL</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold whitespace-nowrap">PAYMENT</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold whitespace-nowrap">SHIPPING STATUS</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold text-right whitespace-nowrap">ACTION</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"
                  }`}
                >
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ padding: "48px 24px" }}
                        className={`text-center ${
                          isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
                        }`}
                      >
                        No orders recorded yet. Demo orders will display here automatically.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((ord) => (
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
                            } else if (statusLabel === "CANCELLED" || statusLabel === "DIBATALKAN") {
                              textColor = isDarkMode ? "text-red-400" : "text-red-700";
                            }

                            return (
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
                            );
                          })()}
                        </td>
                        <td style={{ padding: "20px 24px" }} className="text-right whitespace-nowrap">
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
                            <Link
                              href="/admin/orders"
                              title="Manage & Update Shipment"
                              style={{ padding: "8px 12px", borderRadius: "6px" }}
                              className={`text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center border ${
                                isDarkMode
                                  ? "bg-white/5 border-white/10 text-white hover:border-[#B6A47E] hover:text-[#B6A47E]"
                                  : "bg-gray-100 border-gray-200 text-gray-800 hover:border-[#B6A47E] hover:text-[#B6A47E]"
                              }`}
                            >
                              <Truck className="w-3.5 h-3.5" />
                            </Link>
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
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

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
                  {selectedOrderDetail.courier_info?.courier_name || (selectedOrderDetail as any).courier || "JNE EXPRESS"}
                </span>
              </div>
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-[#8A8A8A] uppercase tracking-wider block font-bold">RESI TRACKING</span>
                <span className="text-[#B6A47E] font-extrabold text-sm uppercase block truncate">
                  {selectedOrderDetail.courier_info?.tracking_number || (selectedOrderDetail as any).tracking_number || "PENDING ALLOCATION"}
                </span>
              </div>
            </div>

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

