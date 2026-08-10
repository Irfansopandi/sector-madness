"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sun, Moon, Bell, BellOff, Menu, User } from "lucide-react";
import { setSidebarCollapsedCache } from "@/utils/sidebarCache";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onToggleSidebar?: () => void;
}

const getFormattedClock = () => {
  if (typeof window === "undefined") return "";
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${dateStr} • ${timeStr}`;
};

import { subscribeToWebPush } from "@/utils/pushManager";

export default function AdminHeader({
  title,
  isDarkMode = true,
  onToggleTheme,
  onToggleSidebar,
}: AdminHeaderProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<string>(getFormattedClock);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sector_madness_sidebar_collapsed") === "true";
    }
    return false;
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    const fetchNotifications = async (token: string) => {
      try {
        const res = await fetch("http://brand.test/api/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status) {
          setNotifications(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin notifications", err);
      }
    };

    if (typeof window !== "undefined") {
      document.title = "Sector Madness - Admin Panel";
      setIsCollapsed(localStorage.getItem("sector_madness_sidebar_collapsed") === "true");
      const adminToken = localStorage.getItem("sector_madness_token");
      if (adminToken) {
        setTimeout(() => {
          subscribeToWebPush(adminToken);
        }, 2000);
        fetchNotifications(adminToken);
      }
    }


    const updateClock = () => {
      setCurrentDate(getFormattedClock());
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    let notifInterval: NodeJS.Timeout;
    if (typeof window !== "undefined") {
      const adminToken = localStorage.getItem("sector_madness_token");
      if (adminToken) {
        notifInterval = setInterval(() => fetchNotifications(adminToken), 30000);
      }
    }

    const handleCollapseToggle = (e: any) => {
      if (e?.detail?.collapsed !== undefined) {
        setIsCollapsed(e.detail.collapsed);
      }
    };
    window.addEventListener("sector_sidebar_collapse_toggle", handleCollapseToggle);

    return () => {
      clearInterval(interval);
      if (notifInterval) clearInterval(notifInterval);
      window.removeEventListener("sector_sidebar_collapse_toggle", handleCollapseToggle);
    };
  }, []);

  return (
    <>
      <header
        style={{ paddingLeft: "24px", paddingRight: "24px" }}
        className={`fixed top-0 right-0 z-30 h-[80px] flex items-center justify-between transition-all duration-300 ${
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-72"
        } ${
          isDarkMode
            ? "bg-[#121214] border-b border-[#242428] text-[#F5F5F5]"
            : "bg-white border-b border-[#E5E5E5] text-[#0A0A0A] shadow-xs"
        }`}
      >
      {/* Left side: Hamburger Button + Title */}
      <div className="flex items-center gap-3.5 min-w-0 pr-4">
        <button
          onClick={() => {
            if (onToggleSidebar) {
              onToggleSidebar();
            } else if (typeof window !== "undefined") {
              const saved = localStorage.getItem("sector_madness_sidebar_collapsed");
              const next = saved === "true" ? false : true;
              setSidebarCollapsedCache(next);
              window.dispatchEvent(
                new CustomEvent("sector_sidebar_collapse_toggle", { detail: { collapsed: next } })
              );
            }
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
            isDarkMode
              ? "bg-white/[0.08] hover:bg-white/[0.15] border-white/10 text-white/80 hover:text-white"
              : "bg-[#E2E4E9] hover:bg-[#D5D8E0] border-[#CBCED6] text-[#374151]"
          }`}
          title="Toggle Sidebar"
        >
          <Menu className="w-4.5 h-4.5 stroke-[2]" />
        </button>

        <h1
          className={`text-base md:text-lg font-bold tracking-tight truncate ${
            isDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"
          }`}
        >
          {title || "Dashboard Admin"}
        </h1>
      </div>

      {/* Right side: Theme Toggle + Date + Notification Bell + User Icon Circle */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0 ml-auto">
        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{ paddingLeft: "12px", paddingRight: "14px", height: "36px" }}
          className={`flex items-center justify-center gap-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer shrink-0 ${
            isDarkMode
              ? "bg-[#161616] border-white/20 text-[#F5F5F5] hover:border-[#B6A47E]"
              : "bg-[#F3F4F6] border-[#CBD5E1] text-[#0A0A0A] hover:border-[#B6A47E]"
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-[#B6A47E]/15 border border-[#B6A47E]/30 flex items-center justify-center text-[#B6A47E] shrink-0">
            {isDarkMode ? <Sun className="w-3.5 h-3.5 stroke-[2]" /> : <Moon className="w-3.5 h-3.5 stroke-[2]" />}
          </div>
          <span className="leading-none pt-0.5 whitespace-nowrap">
            {isDarkMode ? "LIGHT MODE" : "DARK MODE"}
          </span>
        </button>

        {/* Date string */}
        <span
          suppressHydrationWarning
          className={`hidden md:inline-block text-xs font-mono font-medium text-center tabular-nums shrink-0 ${
            isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
          }`}
        >
          {currentDate}
        </span>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`transition-all p-1.5 cursor-pointer shrink-0 relative group ${
              isDarkMode
                ? "text-[#F5F5F5]"
                : "text-[#111827]"
            }`}
            title="Notifikasi"
          >
            <Bell className="w-5 h-5 stroke-[2] transition-transform duration-300 group-hover:rotate-12 origin-top" />
            {notifications.length > 0 && (
              <span 
                style={{ top: '-8px', right: '-8px', padding: '0 4px', minWidth: '18px', height: '18px' }}
                className="absolute bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-[1.5px] border-[#0A0A0A]"
              >
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className={`absolute right-[-10px] top-[50px] w-80 md:w-96 rounded-xl shadow-2xl border overflow-hidden z-50 ${
              isDarkMode ? "bg-[#121214] border-white/10" : "bg-white border-[#E5E5E5]"
            }`}>
              <div style={{ padding: '12px 24px' }} className={`border-b flex justify-between items-center ${isDarkMode ? "border-white/10" : "border-[#E5E5E5]"}`}>
                <h3 className={`font-bold text-sm tracking-wide ${isDarkMode ? "text-white" : "text-black"}`}>Notifikasi</h3>
                <Link 
                  href="/admin/notifications"
                  onClick={async () => {
                    const adminToken = localStorage.getItem("sector_madness_token");
                    if (adminToken) {
                      try {
                        await fetch(`http://brand.test/api/admin/notifications/read-all`, {
                          method: "PUT",
                          headers: { Authorization: `Bearer ${adminToken}` }
                        });
                        setNotifications([]);
                      } catch (err) {}
                    }
                    setShowDropdown(false);
                  }}
                  style={{ padding: '6px 16px' }}
                  className={`inline-block text-xs rounded-full border transition-colors font-medium ${
                    isDarkMode 
                      ? "border-white/20 text-[#F5F5F5] hover:border-[#B6A47E] hover:text-[#B6A47E]" 
                      : "border-gray-300 text-gray-700 hover:border-[#B6A47E] hover:text-[#B6A47E]"
                  }`}
                >
                  Lihat semua
                </Link>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className={`h-[140px] flex flex-col items-center justify-center text-center text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <BellOff className="w-8 h-8 mb-4 opacity-20 mx-auto block" strokeWidth={1.5} />
                    Tidak ada notifikasi baru
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div 
                      key={notif.id}
                      onClick={async () => {
                        const adminToken = localStorage.getItem("sector_madness_token");
                        if (adminToken) {
                          try {
                            await fetch(`http://brand.test/api/admin/notifications/${notif.id}/read`, {
                              method: "PUT",
                              headers: { Authorization: `Bearer ${adminToken}` }
                            });
                            setNotifications(prev => prev.filter(n => n.id !== notif.id));
                          } catch (err) {}
                        }
                        if (notif.data?.url) {
                          let targetUrl = notif.data.url;
                          if (targetUrl.startsWith("/admin/orders/") && !targetUrl.includes("?")) {
                            const orderId = targetUrl.split("/").pop();
                            targetUrl = `/admin/orders?view_order=${orderId}`;
                          }
                          router.push(targetUrl);
                          setShowDropdown(false);
                        } else if (notif.data?.order_number) {
                          router.push(`/admin/orders?view_order=${notif.data.order_number}`);
                          setShowDropdown(false);
                        }
                      }}
                      style={{ padding: '16px 24px' }}
                      className={`border-b flex gap-3 cursor-pointer transition-colors ${
                        isDarkMode 
                          ? "border-white/10 hover:bg-white/5" 
                          : "border-[#f0f0f0] hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <div className={`text-sm font-semibold mb-0.5 ${isDarkMode ? "text-white" : "text-black"}`}>
                          {notif.data?.title || "Notifikasi"}
                        </div>
                        <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {notif.data?.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Circle with User Icon */}
        <Link
          href="/admin/profile"
          suppressHydrationWarning
          title="Profil Admin"
          className="w-9 h-9 rounded-full bg-[#B6A47E] text-[#0A0A0A] flex items-center justify-center shadow-xs shrink-0 cursor-pointer hover:bg-[#a3926d] hover:scale-105 transition-all"
        >
          <User className="w-4.5 h-4.5 stroke-[2.2]" />
        </Link>
      </div>
      </header>
      {/* Header Placeholder div to reserve 80px space in normal document flow */}
      <div className="w-full h-[80px] shrink-0" aria-hidden="true" />
    </>
  );
}
