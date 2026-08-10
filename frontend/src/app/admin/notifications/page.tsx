"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ArrowLeft } from "lucide-react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} tahun yang lalu`;
  if (months > 0) return `${months} bulan yang lalu`;
  if (days > 0) return `${days} hari yang lalu`;
  if (hours > 0) return `${hours} jam yang lalu`;
  if (minutes > 0) return `${minutes} menit yang lalu`;
  return "Baru saja";
};

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      return savedTheme === null ? true : savedTheme === "dark";
    }
    return true;
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      if (savedTheme) setIsDarkMode(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    const adminToken = typeof window !== "undefined" ? localStorage.getItem("sector_madness_token") : null;
    if (adminToken) {
      fetchNotifications(adminToken);
    } else if (typeof window !== "undefined") {
      router.push("/login");
    }
  }, [router]);

  const fetchNotifications = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch("http://brand.test/api/admin/notifications/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status) {
        setNotifications(data.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch admin notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsReadAndNavigate = async (notif: any) => {
    if (!notif.read_at) {
      const adminToken = localStorage.getItem("sector_madness_token");
      if (adminToken) {
        try {
          await fetch(`http://brand.test/api/admin/notifications/${notif.id}/read`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          setNotifications((prev) =>
            prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n))
          );
        } catch (err) {}
      }
    }
    
    let targetUrl = notif.data?.url;
    
    if (targetUrl) {
      // Handle older notifications that might have saved /admin/orders/SM-ORD-...
      if (targetUrl.startsWith("/admin/orders/") && !targetUrl.includes("?")) {
        const orderId = targetUrl.split("/").pop();
        targetUrl = `/admin/orders?view_order=${orderId}`;
      }
      
      router.push(targetUrl);
    } else if (notif.data?.order_number) {
      router.push(`/admin/orders?view_order=${notif.data.order_number}`);
    }
  };

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("sector_madness_admin_theme", next ? "dark" : "light");
      setTimeout(() => {
        window.dispatchEvent(new Event("sector_theme_change"));
      }, 50);
    }
  };

  if (!isMounted) return null;

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col md:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
      }`}
    >
      {/* Persistent Admin Sidebar Navigation */}
      <AdminSidebar activeTab="" isDarkMode={isDarkMode} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="SEMUA NOTIFIKASI"
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
          {/* Page Title + Back Button */}
          <div
            style={{ marginBottom: "44px" }}
            className={`pb-7 border-b transition-colors flex justify-between items-center ${
              isDarkMode ? "border-white/[0.08]" : "border-[#DCDDE1]"
            }`}
          >
            <div>
              <h2
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.22em",
                  fontWeight: 700,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
                className={isDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"}
              >
                NOTIFIKASI
              </h2>
              <p
                style={{ fontSize: "13px", marginTop: "8px" }}
                className={isDarkMode ? "text-[#888]" : "text-[#888]"}
              >
                Semua notifikasi aktivitas sistem Sector Madness.
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className={`group flex items-center gap-2 text-sm font-medium transition-colors ${
                isDarkMode ? "text-[#999] hover:text-white" : "text-gray-500 hover:text-black"
              }`}
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Kembali
            </button>
          </div>

          {/* Notifications Table */}
          <div
            className={`rounded-sm border overflow-hidden ${
              isDarkMode ? "bg-[#141414] border-white/[0.08]" : "bg-white border-[#DCDDE1] shadow-sm"
            }`}
          >
            {/* Table Header */}
            <div
              style={{ padding: "14px 28px" }}
              className={`border-b flex justify-between items-center ${
                isDarkMode ? "border-white/[0.06]" : "border-[#DCDDE1]"
              }`}
            >
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  fontWeight: 700,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
                className={isDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"}
              >
                SEMUA NOTIFIKASI
              </span>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: "2px",
                }}
                className={isDarkMode ? "bg-white/[0.06] text-[#B6A47E]" : "bg-gray-100 text-gray-600"}
              >
                {notifications.length} NOTIFIKASI
              </span>
            </div>

            {/* Notification Items */}
            <div className={`divide-y ${isDarkMode ? "divide-white/[0.06]" : "divide-[#ECECEC]"}`}>
              {loading ? (
                <div
                  style={{ padding: "48px 28px" }}
                  className={`text-center ${isDarkMode ? "text-[#555]" : "text-gray-400"}`}
                >
                  Memuat...
                </div>
              ) : notifications.length === 0 ? (
                <div
                  style={{ padding: "64px 28px" }}
                  className={`text-center flex flex-col items-center justify-center ${isDarkMode ? "text-[#444]" : "text-gray-400"}`}
                >
                  <Bell className="w-10 h-10 mb-4 opacity-20" />
                  <p style={{ fontSize: "12px", letterSpacing: "0.1em" }}>TIDAK ADA NOTIFIKASI</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsReadAndNavigate(notif)}
                    style={{ padding: "20px 28px" }}
                    className={`flex items-start gap-4 cursor-pointer transition-colors ${
                      !notif.read_at
                        ? isDarkMode
                          ? "bg-white/[0.02] hover:bg-white/[0.05]"
                          : "bg-blue-50/40 hover:bg-blue-50"
                        : isDarkMode
                          ? "hover:bg-white/[0.03]"
                          : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`mt-1 shrink-0 ${isDarkMode ? "text-[#666]" : "text-gray-400"}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        style={{ fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}
                        className={
                          !notif.read_at
                            ? isDarkMode ? "text-[#F5F5F5]" : "text-[#0A0A0A]"
                            : isDarkMode ? "text-[#999]" : "text-gray-500"
                        }
                      >
                        {notif.data?.title || "Notifikasi"}
                      </h4>
                      <p
                        style={{ fontSize: "12px", lineHeight: "1.6" }}
                        className={isDarkMode ? "text-[#666]" : "text-gray-400"}
                      >
                        {notif.data?.message}
                      </p>
                    </div>
                    <div
                      style={{ fontSize: "11px", paddingTop: "2px" }}
                      className={`whitespace-nowrap shrink-0 ${isDarkMode ? "text-[#555]" : "text-gray-400"}`}
                    >
                      {timeAgo(notif.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
