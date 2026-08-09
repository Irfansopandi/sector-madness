"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import { authApiLogout } from "@/utils/api";
import { clearAllLocalBags } from "@/utils/bag";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToWebPush } from "@/utils/pushManager";

const navItems = [
  {
    label: "DASHBOARD",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "PROFILE",
    href: "/dashboard/profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "ORDERS",
    href: "/dashboard/orders",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    label: "ORDER HISTORY",
    href: "/dashboard/order-history",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "ADDRESS",
    href: "/dashboard/addresses",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    label: "WISHLIST",
    href: "/dashboard/wishlist",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsMounted(true);
    try {
      const userData = localStorage.getItem("sector_madness_user");
      const token = localStorage.getItem("sector_madness_token");
      if (userData && token) {
        const parsed = JSON.parse(userData);
        if (parsed?.loggedIn) {
          setIsLoggedIn(true);
          // Seamless Web Push Subscription Check for users
          setTimeout(() => {
            subscribeToWebPush(token);
          }, 2000);
        } else {
          setIsLoggedIn(false);
          router.replace("/login?redirect=/dashboard");
        }
      } else {
        setIsLoggedIn(false);
        router.replace("/login?redirect=/dashboard");
      }
    } catch {
      setIsLoggedIn(false);
      router.replace("/login?redirect=/dashboard");
    }
  }, [router]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApiLogout();
    } catch {}
    clearAllLocalBags();
    localStorage.removeItem("sector_madness_user");
    localStorage.removeItem("sector_madness_token");
    localStorage.removeItem("sector_madness_wishlist");
    sessionStorage.clear();
    try {
      queryClient.clear();
    } catch {}
    window.dispatchEvent(new Event("sector_auth_change"));
    window.dispatchEvent(new Event("sector_bag_update"));
    window.dispatchEvent(new Event("sector_wishlist_update"));
    setShowLogoutModal(false);
    setIsLoggingOut(false);
    router.push("/login");
  };

  if (!isMounted || !isLoggedIn) return null;

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col selection:bg-[#B6A47E] selection:text-[#0A0A0A]"
    >
      <Navbar mode="dark" />

      {/* CSS overrides for mobile/tablet to ensure desktop layout remains exactly as original */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1023px) {
          .dashboard-container {
            padding-top: 110px !important;
            padding-left: 1.25rem !important;
            padding-right: 1.25rem !important;
          }
          .dashboard-grid {
            gap: 1.5rem !important;
          }
          .dashboard-title {
            margin-bottom: 1rem !important;
          }
          .dashboard-nav {
            flex-direction: row !important;
            overflow-x: auto !important;
            padding-bottom: 0.25rem !important;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .dashboard-nav::-webkit-scrollbar {
            display: none;
          }
          .dashboard-link, .dashboard-logout {
            padding-left: 12px !important;
            padding-right: 12px !important;
            border-left: none !important;
            border-bottom: 3px solid transparent !important;
            gap: 8px !important;
            width: auto !important;
          }
          .dashboard-link.active {
            border-bottom-color: #B6A47E !important;
            background-color: rgba(255,255,255,0.08) !important;
          }
          .dashboard-logout {
            margin-top: 0 !important;
            border-top: none !important;
            margin-left: 8px !important;
          }
          .dashboard-logout:hover {
            border-bottom-color: rgba(239, 68, 68, 0.5) !important;
          }

          /* MODAL OVERRIDES FOR MOBILE/TABLET */
          /* Main Modal Containers */
          .fixed.inset-0 .bg-\\[\\#141414\\] {
            padding: 24px !important;
            gap: 24px !important;
            width: 95vw !important;
            max-height: 90vh !important;
          }
          
          /* Order Summary Grid */
          .fixed.inset-0 .grid.grid-cols-2 {
            padding: 20px !important;
            gap: 16px !important;
          }
          
          /* Order Products List Items */
          .fixed.inset-0 .flex.items-center.bg-\\[\\#0A0A0A\\] {
            padding: 16px !important;
            gap: 16px !important;
          }
          
          /* Cancel Form Grid and Containers */
          .fixed.inset-0 div[style*="gap: 40px"] {
            padding: 0 8px !important;
            gap: 24px !important;
          }
          
          /* Cancel Form Inputs */
          .fixed.inset-0 select,
          .fixed.inset-0 input,
          .fixed.inset-0 textarea {
            padding: 14px 16px !important;
          }
          
          /* Estimated Refund Note */
          .fixed.inset-0 .bg-\\[\\#1C1C1C\\] {
            padding: 12px 14px !important;
          }
          .fixed.inset-0 .bg-\\[\\#1C1C1C\\] .text-\\[\\#F5F5F5\\] {
            white-space: nowrap !important;
            font-size: 9px !important;
            letter-spacing: 0.02em !important;
          }
          .fixed.inset-0 .bg-\\[\\#1C1C1C\\] .bg-amber-400 {
            flex-shrink: 0 !important;
          }
          .fixed.inset-0 .bg-\\[\\#1C1C1C\\] p {
            font-size: 10px !important;
            line-height: 1.5 !important;
          }
          
          /* Submit & Back Buttons (Stacked on mobile for more space) */
          .fixed.inset-0 .flex.gap-4.pt-2 {
            flex-direction: column-reverse !important;
            gap: 12px !important;
          }
          .fixed.inset-0 .bg-\\[\\#B6A47E\\] {
            white-space: nowrap !important;
            font-size: 11px !important;
            letter-spacing: 0.1em !important;
            padding: 16px 0 !important;
            width: 100% !important;
          }
          .fixed.inset-0 .border-white\\/10 {
            white-space: nowrap !important;
            padding: 16px 0 !important;
            width: 100% !important;
          }
        }
      `}} />

      {/* ── MAIN DASHBOARD CONTAINER (Guaranteed Side Inset Padding from Monitor Edges) ── */}
      <div style={{ paddingTop: "140px", paddingLeft: "7rem", paddingRight: "6.5rem" }} className="dashboard-container pb-32 px-8 md:px-20 lg:px-28 w-full max-w-[1520px] mx-auto flex-1">
        
        {/* 2-Column Grid (Sidebar + Main Content) with clean separation */}
        <div className="dashboard-grid grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12 lg:gap-16 items-start">
          
          {/* ── LEFT SIDEBAR COLUMN (Sticky on scroll) ── */}
          <aside className="w-full h-full">
            <div className="lg:sticky lg:top-[120px] z-10">
              {/* Page Title - Sans-Serif Bold directly above sidebar list with clean 36px bottom margin */}
              <h1
                style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", marginBottom: "30px" }}
                className="dashboard-title text-2xl md:text-3xl font-black uppercase tracking-[0.1em] text-[#F5F5F5]"
              >
                DASHBOARD
              </h1>

              {/* Sidebar Menu List */}
              <nav className="dashboard-nav flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      paddingLeft: "20px",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                      minHeight: "15px",
                    }}
                    className={`dashboard-link flex items-center gap-3.5 pr-5 text-sm tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer font-semibold whitespace-nowrap text-left border-l-[3.5px] ${
                      isActive
                        ? "active bg-white/[0.08] text-[#F5F5F5] font-bold border-[#B6A47E] shadow-sm"
                        : "border-transparent text-[#8A8A8A] hover:bg-white/[0.05] hover:text-[#F5F5F5] hover:border-white/40"
                    }`}
                  >
                    <span className={isActive ? "text-[#B6A47E]" : "text-[#8A8A8A]"}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                style={{
                  paddingLeft: "20px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  minHeight: "15px",
                }}
                className="dashboard-logout flex items-center gap-3.5 pr-5 text-sm tracking-[0.15em] uppercase text-[#8A8A8A] border-l-[3.5px] border-transparent hover:border-red-500/50 hover:text-[#FF6666] hover:bg-red-950/20 transition-all duration-200 cursor-pointer font-semibold w-full text-left mt-3 border-t border-white/[0.08]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>LOGOUT</span>
              </button>
            </nav>
          </div>
        </aside>

          {/* ── RIGHT MAIN CONTENT COLUMN ── */}
          <section className="w-full min-w-0 pt-1 lg:pt-0">
            {children}
          </section>

        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        isLoading={isLoggingOut}
      />

      <Footer />
    </main>
  );
}