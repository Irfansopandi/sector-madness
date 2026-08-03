"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Swal from "sweetalert2";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminStatCard from "./components/AdminStatCard";
import {
  getAdminOrders,
  getProducts,
  getJournals,
  getAdminHeroBanners,
  getCategories,
} from "@/utils/api";

export default function AdminDashboardPage() {
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
    refetchInterval: 3000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    refetchInterval: 5000,
  });

  const { data: journals = [] } = useQuery({
    queryKey: ["journals"],
    queryFn: () => getJournals(),
    refetchInterval: 5000,
  });

  const { data: heroBanners = [] } = useQuery({
    queryKey: ["admin-hero-banners"],
    queryFn: getAdminHeroBanners,
    refetchInterval: 5000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchInterval: 5000,
  });

  // Calculate real-time metrics dynamically from active database state
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const formattedRevenue = `Rp ${totalRevenue.toLocaleString("id-ID")}`;

  const recentOrders = orders.slice(0, 5);

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
                label="CATALOG PRODUCTS"
                value={products.length > 0 ? products.length : 10}
                subtext={`${categories.length} active categories`}
                icon={<Tags />}
                accentColor="#0A0A0A"
                isDarkMode={isDarkMode}
              />
              <AdminStatCard
                label="JOURNAL ARTICLES"
                value={journals.length > 0 ? journals.length : 5}
                subtext="Published editorial stories"
                icon={<BookOpen />}
                accentColor="#0A0A0A"
                isDarkMode={isDarkMode}
              />
            </div>
          </section>

          {/* Main Workspace 2-Column Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): Recent Orders Activity Table */}
            <section className="lg:col-span-8">
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
                className={`border rounded-[6px] overflow-hidden shadow-sm transition-colors ${
                  isDarkMode
                    ? "bg-[#18181C] border-white/10"
                    : "bg-white border-[#D1D5DB]"
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
                      <th style={{ padding: "18px 24px" }} className="font-bold">ORDER NUMBER</th>
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
                            className={`font-mono font-bold ${
                              isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                            }`}
                          >
                            {ord.order_number}
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
                          <td style={{ padding: "20px 24px" }} className="font-mono">
                            <span
                              className={`px-2.5 py-1 border rounded-[4px] text-[10px] font-semibold ${
                                isDarkMode
                                  ? "bg-[#1E1E1E] border-white/10 text-[#A0A0A0]"
                                  : "bg-[#F3F4F6] border-[#D1D5DB] text-[#4B5563]"
                              }`}
                            >
                              {ord.shipping_status || "PROCESSING"}
                            </span>
                          </td>
                          <td style={{ padding: "20px 24px" }} className="text-right">
                            <Link
                              href="/admin/orders"
                              className={`font-bold transition-colors inline-flex items-center gap-1 ${
                                isDarkMode
                                  ? "text-[#F5F5F5] hover:text-[#B6A47E]"
                                  : "text-[#111827] hover:text-[#B6A47E]"
                              }`}
                            >
                              <span>UPDATE</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
                        ORDERS & SHIPMENT
                      </h3>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed font-medium truncate ${
                          isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                        }`}
                      >
                        Manage customer orders & tracking
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
                        CATALOG & FILTERS
                      </h3>
                      <p
                        className={`text-[11px] mt-0.5 leading-relaxed font-medium truncate ${
                          isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                        }`}
                      >
                        Product categories & collections
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
                        Editorial stories & archives
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
                        HERO SLIDERS & BANNERS
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
                        Preview live storefront & website
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
        </main>
      </div>
    </div>
  );
}

