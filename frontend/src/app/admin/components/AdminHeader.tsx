"use client";

import { useEffect, useState } from "react";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const [currentDate, setCurrentDate] = useState("Minggu, 02 Agustus 2026");
  const [userInitial, setUserInitial] = useState("A");

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = "Sector Madness - Admin Panel";
      try {
        const userData = localStorage.getItem("sector_madness_user");
        if (userData) {
          const parsed = JSON.parse(userData);
          const name =
            parsed.name ||
            [parsed.firstName, parsed.lastName].filter(Boolean).join(" ") ||
            (parsed.email ? parsed.email.split("@")[0] : "A");
          if (name) setUserInitial(name.charAt(0).toUpperCase());
        }
      } catch {}
    }

    const dateStr = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (dateStr) setCurrentDate(dateStr);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-[#E5E5E5] h-[80px] flex items-center justify-between shadow-xs text-slate-800" style={{ paddingLeft: '44px', paddingRight: '44px' }}>
      {/* Left side: Title */}
      <div className="flex items-center">
        <h1 className="text-base md:text-lg font-bold text-[#0B1E36] tracking-tight">
          {title || "Dashboard Admin"}
        </h1>
      </div>

      {/* Right side: Notification + Date + Profile Circle */}
      <div className="flex items-center gap-5">
        {/* Notification Bell (No Badge) */}
        <button className="text-slate-600 hover:text-slate-900 transition-colors p-1.5 cursor-pointer">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* Date string */}
        <span className="hidden sm:inline-block text-xs font-medium text-slate-600">
          {currentDate}
        </span>

        {/* Profile Avatar Circle */}
        <div className="w-9 h-9 rounded-full bg-[#0B1E36] text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
