"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { adminApiLogout } from "@/utils/api";

interface AdminSidebarProps {
  activeTab?: string;
  isDarkMode?: boolean;
}

export default function AdminSidebar({ activeTab, isDarkMode }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; top: number } | null>(null);
  const [internalDarkMode, setInternalDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("sector_madness_sidebar_collapsed");
    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === "true");
    }
    const saved = localStorage.getItem("sector_madness_admin_theme");
    if (saved !== null) {
      setInternalDarkMode(saved === "dark");
    }
  }, []);
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
    if (typeof window !== "undefined") {
      document.title = "Sector Madness - Admin Panel";
      try {
        const savedCollapsed = localStorage.getItem("sector_madness_sidebar_collapsed");
        if (savedCollapsed !== null) {
          setIsCollapsed(savedCollapsed === "true");
        }
        const userData = localStorage.getItem("sector_madness_user");
        if (userData) {
          const parsed = JSON.parse(userData);
          const name =
            parsed.name ||
            [parsed.firstName, parsed.lastName].filter(Boolean).join(" ") ||
            (parsed.email ? parsed.email.split("@")[0] : "Admin SectorMadness");
          const initial = name ? name.charAt(0).toUpperCase() : "A";
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

    const handleThemeEvent = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sector_madness_admin_theme");
        setInternalDarkMode(saved === null ? true : saved === "dark");
      }
    };

    const handleCollapseToggle = () => {
      setIsCollapsed((prev) => {
        const next = !prev;
        if (typeof window !== "undefined") {
          localStorage.setItem("sector_madness_sidebar_collapsed", String(next));
        }
        return next;
      });
    };

    window.addEventListener("sector_theme_change", handleThemeEvent);
    window.addEventListener("sector_sidebar_collapse_toggle", handleCollapseToggle);
    return () => {
      window.removeEventListener("sector_theme_change", handleThemeEvent);
      window.removeEventListener("sector_sidebar_collapse_toggle", handleCollapseToggle);
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
          id: "orders",
          label: "Order",
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
          id: "products",
          label: "Produk",
          href: "/admin/products",
          icon: (
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
          ),
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
      <aside
        className={`w-full ${
          isCollapsed ? "lg:w-20" : "lg:w-72"
        } flex flex-col justify-between h-screen sticky top-0 shrink-0 font-[family-name:var(--font-body)] transition-all duration-300 ease-in-out z-40 ${
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
              <div className="flex flex-col justify-center min-w-0 leading-tight">
                <span
                  className={`text-[13px] font-black tracking-widest uppercase font-[family-name:var(--font-display)] ${
                    activeDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"
                  }`}
                >
                  SECTOR
                </span>
                <span
                  className={`text-[13px] font-black tracking-widest uppercase font-[family-name:var(--font-display)] ${
                    activeDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"
                  }`}
                >
                  MADNESS
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Middle Categorized Navigation List */}
        <div
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
                    const isActive =
                      activeTab === item.id ||
                      (item.href !== "/" &&
                        (pathname === item.href ||
                          (item.href !== "/admin" && pathname?.startsWith(item.href))));

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
                            href={item.href}
                            target={(item as any).target}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
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
                        href={item.href}
                        target={(item as any).target}
                        className={`flex items-center gap-3.5 min-h-[40px] py-6 pr-4 text-[14px] tracking-wide transition-all duration-200 cursor-pointer font-semibold border-l-[3.5px] rounded-r-md ${
                          isActive
                            ? activeDarkMode
                              ? "bg-white/[0.08] text-[#F5F5F5] font-bold border-[#B6A47E] shadow-sm"
                              : "bg-white text-[#0A0A0A] font-bold border-[#B6A47E] shadow-xs"
                            : activeDarkMode
                            ? "border-transparent text-[#8A8A8A] hover:bg-white/[0.05] hover:text-[#D0D0D0] hover:border-white/40 transform hover:translate-x-1.5"
                            : "border-transparent text-[#555555] hover:bg-white/60 hover:text-[#0A0A0A] hover:border-[#CBCED6] transform hover:translate-x-1.5"
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
    </>
  );
}