"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { adminApiLogout } from "@/utils/api";
import { getInitialSidebarCollapsed, setSidebarCollapsedCache } from "@/utils/sidebarCache";

interface AdminSidebarProps {
  activeTab?: string;
  isDarkMode?: boolean;
}

export default function AdminSidebar({ activeTab, isDarkMode }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; top: number } | null>(null);
  const [hoveredFlyout, setHoveredFlyout] = useState<{
    id: string;
    label: string;
    top: number;
    children: { id: string; label: string; href: string }[];
  } | null>(null);
  const flyoutTimeoutRef = useRef<any>(null);
  const [userToggledLaporan, setUserToggledLaporan] = useState<boolean | null>(null);
  const isLaporanRoute =
    (pathname ? pathname.startsWith("/admin/laporan") : false) ||
    (pendingHref ? pendingHref.startsWith("/admin/laporan") : false) ||
    (activeTab ? activeTab.startsWith("laporan") : false);
  const isLaporanOpen = userToggledLaporan !== null ? userToggledLaporan : isLaporanRoute;
  const [internalDarkMode, setInternalDarkMode] = useState<boolean>(true);

  useEffect(() => {
    setIsCollapsed(getInitialSidebarCollapsed());
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sector_madness_admin_theme");
      if (saved !== null) {
        setInternalDarkMode(saved === "dark");
      }
    }
  }, []);

  // Reset pending state & close mobile drawer when pathname changes
  useEffect(() => {
    setPendingHref(null);
    setIsOpenMobile(false);
  }, [pathname]);

  // Synchronous ref callback for 0-frame scroll restoration
  const setNavRef = (el: HTMLDivElement | null) => {
    (navContainerRef as any).current = el;
    if (el && typeof window !== "undefined") {
      const savedScroll = sessionStorage.getItem("sector_madness_sidebar_scroll");
      if (savedScroll !== null) {
        el.scrollTop = parseInt(savedScroll, 10);
      }
    }
  };

  useEffect(() => {
    if (activeItemRef.current && navContainerRef.current) {
      const container = navContainerRef.current;
      const activeEl = activeItemRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      if (activeRect.top < containerRect.top || activeRect.bottom > containerRect.bottom) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "instant" as ScrollBehavior });
      }
    }
  }, [pathname, activeTab, pendingHref]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sector_madness_sidebar_scroll", String(e.currentTarget.scrollTop));
    }
  };
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [adminUser, setAdminUser] = useState({
    name: "Admin SectorMadness",
    role: "Administrator",
    initial: "A",
  });

  const handleAdminLogout = () => {
    Swal.fire({
      title: "LOG OUT OF YOUR ACCOUNT?",
      text: "Are you sure you want to sign out? You will need to log in again to access the admin panel.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "YES, LOG OUT",
      cancelButtonText: "CANCEL",
      reverseButtons: true,
      background: activeDarkMode ? "#18181C" : "#ffffff",
      color: activeDarkMode ? "#f5f5f5" : "#0a0a0a",
      confirmButtonColor: "#E53E3E",
      cancelButtonColor: activeDarkMode ? "#27272a" : "#E5E7EB",
      customClass: {
        popup: activeDarkMode
          ? "border border-white/10 rounded-[12px] shadow-2xl"
          : "border border-gray-200 rounded-[12px] shadow-2xl",
        confirmButton: "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-white",
        cancelButton: activeDarkMode
          ? "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-200"
          : "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-900 border border-gray-300 shadow-xs",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoggingOut(true);
        try {
          await adminApiLogout();
        } catch {
          // ignore
        } finally {
          localStorage.removeItem("sector_madness_token");
          localStorage.removeItem("sector_madness_user");
          localStorage.removeItem("sector_madness_admin_theme");
          // Clear all local bag data to prevent cart leakage between accounts
          try {
            localStorage.removeItem("sector_madness_bag");
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const key = localStorage.key(i);
              if (key && key.startsWith("sector_madness_bag")) {
                localStorage.removeItem(key);
              }
            }
          } catch {}
          sessionStorage.clear();
          window.dispatchEvent(new Event("sector_auth_change"));
          window.dispatchEvent(new Event("sector_bag_update"));
          router.push("/login");
        }
      }
    });
  };

  useEffect(() => {
    const loadUserData = () => {
      if (typeof window !== "undefined") {
        try {
          const userData = localStorage.getItem("sector_madness_user");
          if (userData) {
            const parsed = JSON.parse(userData);
            const name =
              parsed.name ||
              [parsed.firstName, parsed.lastName].filter(Boolean).join(" ") ||
              (parsed.email ? parsed.email.split("@")[0] : "Admin SectorMadness");
            const initial = name ? name.trim().charAt(0).toUpperCase() : "A";
            const role =
              parsed.role === "admin" || parsed.isAdmin
                ? "Administrator"
                : parsed.role || "Administrator";
            setAdminUser({ name, role, initial });
          }
        } catch {
          // ignore
        }
      }
    };

    if (typeof window !== "undefined") {
      document.title = "Sector Madness - Admin Panel";
      try {
        const savedCollapsed = localStorage.getItem("sector_madness_sidebar_collapsed");
        if (savedCollapsed !== null) {
          setIsCollapsed(savedCollapsed === "true");
        }
      } catch {
        // ignore
      }
      loadUserData();
      window.addEventListener("sector_auth_change", loadUserData);
    }

    const handleThemeEvent = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sector_madness_admin_theme");
        setInternalDarkMode(saved === null ? true : saved === "dark");
      }
    };

    const handleCollapseToggle = (e?: Event) => {
      const customEv = e as CustomEvent<{ collapsed?: boolean }> | undefined;
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsOpenMobile((prev) => !prev);
        return;
      }
      if (customEv && customEv.detail && typeof customEv.detail.collapsed === "boolean") {
        setSidebarCollapsedCache(customEv.detail.collapsed);
        setIsCollapsed(customEv.detail.collapsed);
      } else if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sector_madness_sidebar_collapsed");
        const val = saved === "true";
        setSidebarCollapsedCache(val);
        setIsCollapsed(val);
      }
    };

    window.addEventListener("sector_theme_change", handleThemeEvent);
    window.addEventListener("sector_sidebar_collapse_toggle", handleCollapseToggle);
    return () => {
      window.removeEventListener("sector_theme_change", handleThemeEvent);
      window.removeEventListener("sector_sidebar_collapse_toggle", handleCollapseToggle);
      window.removeEventListener("sector_auth_change", loadUserData);
    };
  }, []);

  const activeDarkMode = isDarkMode !== undefined ? isDarkMode : internalDarkMode;

  const navGroups = [
    {
      category: "OVERVIEW",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "/admin",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 12l3.5-3.5" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "MANAGEMENT",  
      items: [
        {
          id: "products",
          label: "Products",
          href: "/admin/products",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          ),
        },
        {
          id: "orders",
          label: "Orders",
          href: "/admin/orders",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="7" y1="8" x2="17" y2="8" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="7" y1="16" x2="13" y2="16" />
            </svg>
          ),
        },
        {
          id: "customers",
          label: "Customers",
          href: "/admin/customers",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          ),
        },
        {
          id: "vouchers",
          label: "Kode Voucher",
          href: "/admin/vouchers",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Z" />
              <path d="M9 12h.01" />
              <path d="M15 12h.01" />
            </svg>
          ),
        },
        {
          id: "laporan",
          label: "Laporan",
          href: "/admin/laporan/penjualan",
          isDropdown: true,
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          ),
          children: [
            {
              id: "laporan-penjualan",
              label: "Penjualan",
              href: "/admin/laporan/penjualan",
            },
            {
              id: "laporan-customer",
              label: "Customer",
              href: "/admin/laporan/customer",
            },
          ],
        },
      ],
    },
    {
      category: "KATALOG & KONTEN",
      items: [
        {
          id: "catalog",
          label: "Daftar Katalog",
          href: "/admin/catalog",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          ),
        },
        {
          id: "journals",
          label: "Artikel Jurnal",
          href: "/admin/journals",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          ),
        },
        {
          id: "hero-banners",
          label: "Hero Sliders",
          href: "/admin/hero-banners",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "SETTINGS",
      items: [
        {
          id: "contact-settings",
          label: "Contact Settings",
          href: "/admin/contact-settings",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          ),
        },
        {
          id: "faq",
          label: "FAQ",
          href: "/admin/faq",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        },
        {
          id: "size-guide",
          label: "Size Guide",
          href: "/admin/size-guide",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z" />
              <path d="m14.5 12.5 2-2" />
              <path d="m11.5 9.5 2-2" />
              <path d="m8.5 6.5 2-2" />
              <path d="m17.5 15.5 2-2" />
            </svg>
          ),
        },
        {
          id: "profile",
          label: "Profile Admin",
          href: "/admin/profile",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ),
        },
      ],
    },
    {
      category: "STOREFRONT",
      items: [
        {
          id: "view-website",
          label: "View Store",
          href: "/",
          target: "_blank",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:z-40 h-screen shrink-0 font-[family-name:var(--font-body)] transition-all duration-300 ease-in-out flex flex-col justify-between ${
          isOpenMobile ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full md:translate-x-0"
        } ${
          isCollapsed ? "md:w-20" : "md:w-72"
        } ${
          activeDarkMode
            ? "bg-[#0F0F11] text-white border-r border-[#242428]"
            : "bg-[#F0F1F4] text-[#0A0A0A] border-r border-[#DCDDE1]"
        }`}
      >
        {/* Top Brand Header */}
        <div
          className={`flex items-center w-full h-[80px] shrink-0 border-b transition-all duration-300 ${
            activeDarkMode ? "border-[#242428]" : "border-[#DCDDE1]"
          } ${isCollapsed ? "justify-center" : ""}`}
          style={!isCollapsed ? { paddingLeft: "24px", paddingRight: "20px" } : {}}
        >
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3.5"} min-w-0`}>
            <div
              className={`${
                isCollapsed ? "w-[44px] h-[44px] p-1" : "w-[54px] h-[54px] p-1.5"
              } rounded-lg overflow-hidden flex items-center justify-center shrink-0 transition-all ${
                activeDarkMode ? "bg-transparent" : "bg-[#0A0A0A] shadow-xs"
              }`}
            >
              <img src="/images/logo.png" alt="Sector Madness Logo" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col justify-center min-w-0 leading-snug">
                <span
                  className={`text-sm font-black tracking-wider uppercase font-[family-name:var(--font-display)] whitespace-nowrap ${
                    activeDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"
                  }`}
                >
                  SECTOR MADNESS
                </span>
                <span
                  className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase ${
                    activeDarkMode ? "text-[#B6A47E]" : "text-[#666666]"
                  }`}
                >
                  ADMIN PANEL
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Middle Categorized Navigation List */}
        <div
          ref={setNavRef}
          onScroll={handleScroll}
          className={`flex-1 min-h-0 overflow-y-auto w-full pb-2 [&::-webkit-scrollbar]:w-1.5 ${
            activeDarkMode
              ? "[&::-webkit-scrollbar-thumb]:bg-white/10"
              : "[&::-webkit-scrollbar-thumb]:bg-black/10"
          } [&::-webkit-scrollbar-thumb]:rounded`}
          style={{ paddingLeft: "0px" }}
        >
          <nav style={{ paddingTop: isCollapsed ? "16px" : "25px" }}>
            {navGroups.map((group, index) => (
              <div key={group.category} style={{ marginTop: !isCollapsed && index !== 0 ? "16px" : isCollapsed ? "8px" : "0px" }}>
                {!isCollapsed && (
                  <div
                    className={`text-[13px] font-mono tracking-[0.18em] uppercase font-bold mb-3 ${
                      activeDarkMode ? "text-[#888888]" : "text-[#555555]"
                    }`}
                    style={{ paddingLeft: "28px" }}
                  >
                    {group.category}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  {group.items.map((item) => {
                    if ((item as any).isDropdown) {
                      const isChildActive = (href: string) =>
                        pendingHref === href || (!pendingHref && (pathname === href || pathname?.startsWith(href)));
                      const isParentActive = ((item as any).children || []).some((child: any) => isChildActive(child.href));

                      if (isCollapsed) {
                        return (
                          <div
                            key={item.id}
                            className="flex justify-center w-full my-1.5"
                            onMouseEnter={(e) => {
                              if (!isParentActive) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredTooltip({
                                  label: item.label,
                                  top: rect.top + rect.height / 2,
                                });
                              }
                            }}
                            onMouseLeave={() => setHoveredTooltip(null)}
                          >
                            <Link
                              ref={isParentActive ? activeItemRef : undefined}
                              href={item.href}
                              prefetch={true}
                              onClick={() => setPendingHref(item.href)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-150 cursor-pointer shrink-0 ${
                                isParentActive
                                  ? activeDarkMode
                                    ? "bg-white/[0.12] text-[#B6A47E] font-bold shadow-sm"
                                    : "bg-white text-[#0A0A0A] font-bold shadow-sm border border-[#DCDDE1]"
                                  : activeDarkMode
                                  ? "text-[#8A8A8A] hover:bg-white/[0.08] hover:text-[#F5F5F5]"
                                  : "text-[#555555] hover:bg-white/80 hover:text-[#0A0A0A]"
                              }`}
                            >
                              <span
                                className={`shrink-0 ${
                                  isParentActive
                                    ? "text-[#B6A47E]"
                                    : activeDarkMode
                                    ? "text-[#777777]"
                                    : "text-[#666666]"
                                }`}
                              >
                                {item.icon}
                              </span>
                            </Link>
                          </div>
                        );
                      }

                      return (
                        <div key={item.id} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => setUserToggledLaporan((prev) => (prev !== null ? !prev : !isLaporanOpen))}
                            className={`flex items-center justify-between min-h-[40px] py-6 pr-6 text-[14px] tracking-wide transition-colors duration-150 cursor-pointer font-semibold border-l-[3.5px] rounded-r-md ${
                              isParentActive
                                ? activeDarkMode
                                  ? "border-transparent text-[#F5F5F5] hover:bg-white/[0.05]"
                                  : "border-transparent text-[#0A0A0A] hover:bg-white/60"
                                : activeDarkMode
                                ? "border-transparent text-[#8A8A8A] hover:bg-white/[0.05] hover:text-[#D0D0D0]"
                                : "border-transparent text-[#555555] hover:bg-white/60 hover:text-[#0A0A0A]"
                            }`}
                            style={{
                              paddingLeft: "22px",
                              marginRight: "12px",
                            }}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span
                                className={`shrink-0 ${
                                  isParentActive
                                    ? "text-[#B6A47E]"
                                    : activeDarkMode
                                    ? "text-[#666666]"
                                    : "text-[#777777]"
                                }`}
                              >
                                {item.icon}
                              </span>
                              <span className="truncate">{item.label}</span>
                            </div>
                            <svg
                              className={`w-4 h-4 transition-transform duration-200 shrink-0 ml-2 mr-6 ${
                                isLaporanOpen ? "rotate-180 text-[#B6A47E]" : activeDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isLaporanOpen && (
                            <div className="flex flex-col gap-2.5 mt-3 mb-2">
                              {((item as any).children || []).map((child: any) => {
                                const isSubActive = isChildActive(child.href);
                                return (
                                  <Link
                                    key={child.id}
                                    ref={isSubActive ? activeItemRef : undefined}
                                    href={child.href}
                                    prefetch={true}
                                    onClick={() => {
                                      setPendingHref(child.href);
                                      setUserToggledLaporan(true);
                                    }}
                                    className={`flex items-center gap-3.5 py-2.5 pr-4 text-[13.5px] tracking-wide transition-colors duration-150 cursor-pointer font-medium border-l-[3.5px] rounded-r-md ${
                                      isSubActive
                                        ? activeDarkMode
                                          ? "bg-white/[0.08] text-[#B6A47E] font-bold border-[#B6A47E] shadow-sm"
                                          : "bg-white text-[#0A0A0A] font-bold border-[#B6A47E] shadow-xs"
                                        : activeDarkMode
                                        ? "border-transparent text-[#8A8A8A] hover:bg-white/[0.05] hover:text-[#D0D0D0] hover:border-white/40"
                                        : "border-transparent text-[#555555] hover:bg-white/60 hover:text-[#0A0A0A] hover:border-[#CBCED6]"
                                    }`}
                                    style={{
                                      paddingLeft: "22px",
                                      marginRight: "12px",
                                    }}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubActive ? "bg-[#B6A47E]" : activeDarkMode ? "bg-gray-500" : "bg-gray-400"}`} />
                                    <span className="truncate">{child.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }

                    const isActive =
                      pendingHref === item.href ||
                      (!pendingHref &&
                        (activeTab === item.id ||
                          (item.href !== "/" &&
                            (pathname === item.href ||
                              (item.href !== "/admin" && pathname?.startsWith(item.href))))));

                    if (isCollapsed) {
                      return (
                        <div
                          key={item.id}
                          className="flex justify-center w-full my-1.5"
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredTooltip({
                                label: item.label,
                                top: rect.top + rect.height / 2,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredTooltip(null)}
                        >
                          <Link
                            ref={isActive ? activeItemRef : undefined}
                            href={item.href}
                            prefetch={true}
                            onClick={() => setPendingHref(item.href)}
                            target={(item as any).target}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-150 cursor-pointer shrink-0 ${
                              isActive
                                ? activeDarkMode
                                  ? "bg-white/[0.12] text-[#B6A47E] font-bold shadow-sm"
                                  : "bg-white text-[#0A0A0A] font-bold shadow-sm border border-[#DCDDE1]"
                                : activeDarkMode
                                ? "text-[#8A8A8A] hover:bg-white/[0.08] hover:text-[#F5F5F5]"
                                : "text-[#555555] hover:bg-white/80 hover:text-[#0A0A0A]"
                            }`}
                          >
                            <span
                              className={`shrink-0 ${
                                isActive
                                  ? "text-[#B6A47E]"
                                  : activeDarkMode
                                  ? "text-[#777777]"
                                  : "text-[#666666]"
                              }`}
                            >
                              {item.icon}
                            </span>
                          </Link>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        ref={isActive ? activeItemRef : undefined}
                        href={item.href}
                        prefetch={true}
                        onClick={() => setPendingHref(item.href)}
                        target={(item as any).target}
                        className={`flex items-center gap-3.5 min-h-[40px] py-6 pr-4 text-[14px] tracking-wide transition-colors duration-150 cursor-pointer font-semibold border-l-[3.5px] rounded-r-md ${
                          isActive
                            ? activeDarkMode
                              ? "bg-white/[0.08] text-[#F5F5F5] font-bold border-[#B6A47E] shadow-sm"
                              : "bg-white text-[#0A0A0A] font-bold border-[#B6A47E] shadow-xs"
                            : activeDarkMode
                            ? "border-transparent text-[#8A8A8A] hover:bg-white/[0.05] hover:text-[#D0D0D0] hover:border-white/40"
                            : "border-transparent text-[#555555] hover:bg-white/60 hover:text-[#0A0A0A] hover:border-[#CBCED6]"
                        }`}
                        style={{
                          paddingLeft: "22px",
                          marginRight: "12px",
                        }}
                      >
                        <span
                          className={`shrink-0 ${
                            isActive
                              ? "text-[#B6A47E]"
                              : activeDarkMode
                              ? "text-[#666666]"
                              : "text-[#777777]"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Area: Admin Profile Card with Logout Icon */}
        <div
          className={`relative z-10 border-t w-full shrink-0 transition-colors ${
            activeDarkMode
              ? "border-[#222222] bg-[#121212]"
              : "border-[#DCDDE1] bg-[#E4E6EC]"
          }`}
          style={{ paddingTop: "16px", paddingBottom: "20px" }}
        >
          <div
            className={`flex items-center ${
              isCollapsed ? "flex-col justify-center gap-3 px-2" : "justify-between w-full gap-3"
            }`}
            style={!isCollapsed ? { paddingLeft: "24px", paddingRight: "20px" } : {}}
          >
            <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "justify-center" : "flex-1 pr-2"}`}>
              <div
                className={`w-10 h-10 rounded-md font-black text-xs flex items-center justify-center shrink-0 border ${
                  activeDarkMode
                    ? "bg-white/[0.08] border-white/15 text-[#F5F5F5]"
                    : "bg-white border-[#CBCED6] text-[#0A0A0A] shadow-xs"
                }`}
                title={isCollapsed ? `${adminUser.name} (${adminUser.role})` : undefined}
              >
                {adminUser.initial}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col justify-center min-w-0 flex-1 pr-1">
                  <span
                    className={`text-[12px] font-bold truncate tracking-wide leading-tight block ${
                      activeDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"
                    }`}
                  >
                    {adminUser.name}
                  </span>
                  <span
                    className={`text-[10px] font-medium tracking-wider mt-1 truncate block ${
                      activeDarkMode ? "text-[#8A8A8A]" : "text-[#555555]"
                    }`}
                  >
                    {adminUser.role}
                  </span>
                </div>
              )}
            </div>

            {/* Logout / Exit Button */}
            <button
              onClick={handleAdminLogout}
              className={`p-2 transition-colors cursor-pointer shrink-0 rounded-lg ${
                activeDarkMode
                  ? "text-[#8A8A8A] hover:text-red-400"
                  : "text-[#555555] hover:text-red-600"
              }`}
              title="Logout / Exit"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
      {/* Global Fixed Floating Text Label with Arrow for Collapsed Sidebar */}
      {isCollapsed && hoveredTooltip && (
        <div
          style={{
            position: "fixed",
            left: "74px",
            top: `${hoveredTooltip.top}px`,
            transform: "translateY(-50%)",
            zIndex: 99999,
          }}
          className={`flex items-center gap-1.5 px-1 py-1 text-[13px] font-bold tracking-wide whitespace-nowrap pointer-events-none drop-shadow-sm transition-all duration-150 ${
            activeDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"
          }`}
        >
          {/* Arrow Icon pointing left */}
          <svg
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M5 1L1 5L5 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{hoveredTooltip.label}</span>
        </div>
      )}



      {/* Fullscreen Loading Overlay on Logout */}
      {isLoggingOut &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 border-3 border-[#B6A47E]/20 border-t-[#B6A47E] rounded-full animate-spin mb-6" />
              <div className="space-y-2">
                <span className="block font-mono text-xs font-bold text-[#B6A47E] uppercase tracking-[0.25em] animate-pulse">
                  LOGGING OUT...
                </span>
                <span className="block text-xs font-mono text-[#8A8A8A] tracking-wide">
                  Sedang keluar dari akun admin...
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}