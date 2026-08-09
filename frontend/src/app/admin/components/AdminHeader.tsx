"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sun, Moon, Bell, Menu, User } from "lucide-react";
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
  const [currentDate, setCurrentDate] = useState<string>(getFormattedClock);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sector_madness_sidebar_collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = "Sector Madness - Admin Panel";
      setIsCollapsed(localStorage.getItem("sector_madness_sidebar_collapsed") === "true");
      
      const adminToken = localStorage.getItem("sector_madness_admin_token");
      if (adminToken) {
        setTimeout(() => {
          subscribeToWebPush(adminToken);
        }, 2000);
      }
    }

    const updateClock = () => {
      setCurrentDate(getFormattedClock());
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    const handleCollapseToggle = (e: any) => {
      if (e?.detail?.collapsed !== undefined) {
        setIsCollapsed(e.detail.collapsed);
      }
    };
    window.addEventListener("sector_sidebar_collapse_toggle", handleCollapseToggle);

    return () => {
      clearInterval(interval);
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
        <button
          className={`transition-colors p-1.5 cursor-pointer shrink-0 ${
            isDarkMode
              ? "text-[#8A8A8A] hover:text-[#F5F5F5]"
              : "text-[#6B7280] hover:text-[#111827]"
          }`}
          title="Notifikasi"
        >
          <Bell className="w-5 h-5 stroke-[1.75]" />
        </button>

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
