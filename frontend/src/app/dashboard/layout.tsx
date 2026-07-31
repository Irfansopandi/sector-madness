"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authApiLogout } from "@/utils/api";

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
    label: "ORDERS & TRACKING",
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
    label: "ADDRESS BOOK",
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

  // Instant synchronous auth state for instant refresh rendering without loading delay
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const userData = localStorage.getItem("sector_madness_user");
        const token = localStorage.getItem("sector_madness_token");
        if (userData && token) {
          const parsed = JSON.parse(userData);
          return !!parsed?.loggedIn;
        }
      } catch {}
      return false;
    }
    return true;
  });

  useEffect(() => {
    try {
      const userData = localStorage.getItem("sector_madness_user");
      const token = localStorage.getItem("sector_madness_token");
      if (userData && token) {
        const parsed = JSON.parse(userData);
        if (parsed?.loggedIn) {
          setIsLoggedIn(true);
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

  const handleLogout = async () => {
    try {
      await authApiLogout();
    } catch {}
    localStorage.removeItem("sector_madness_user");
    localStorage.removeItem("sector_madness_token");
    localStorage.removeItem("sector_madness_wishlist");
    sessionStorage.clear();
    window.dispatchEvent(new Event("sector_auth_change"));
    window.dispatchEvent(new Event("sector_bag_update"));
    window.dispatchEvent(new Event("sector_wishlist_update"));
    router.push("/login");
  };

  if (!isLoggedIn) return null;

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col selection:bg-[#B6A47E] selection:text-[#0A0A0A]"
    >
      <Navbar mode="dark" />

      {/* ── MAIN DASHBOARD CONTAINER (Guaranteed Side Inset Padding from Monitor Edges) ── */}
      <div style={{ paddingTop: "140px", paddingLeft: "7rem", paddingRight: "6.5rem" }} className="pb-32 px-8 md:px-20 lg:px-28 w-full max-w-[1520px] mx-auto flex-1">
        
        {/* 2-Column Grid (Sidebar + Main Content) with clean separation */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12 lg:gap-16 items-start">
          
          {/* ── LEFT SIDEBAR COLUMN (Sticky on scroll) ── */}
          <aside className="w-full lg:sticky lg:top-[140px] self-start z-10">
            {/* Page Title - Sans-Serif Bold directly above sidebar list with clean 36px bottom margin */}
            <h1
              style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", marginBottom: "36px" }}
              className="text-2xl md:text-3xl font-black uppercase tracking-[0.1em] text-[#F5F5F5]"
            >
              DASHBOARD
            </h1>

            {/* Sidebar Menu List */}
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{ paddingLeft: "18px" }}
                    className={`flex items-center gap-3.5 pr-5 py-3.5 text-sm tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer font-semibold whitespace-nowrap text-left border-l-[3.5px] ${
                      isActive
                        ? "bg-white/[0.08] text-[#F5F5F5] font-bold border-[#B6A47E] shadow-sm"
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
                onClick={handleLogout}
                style={{ paddingLeft: "18px" }}
                className="flex items-center gap-3.5 pr-5 py-3.5 text-sm tracking-[0.15em] uppercase text-[#8A8A8A] border-l-[3.5px] border-transparent hover:border-red-500/50 hover:text-[#FF6666] hover:bg-red-950/20 transition-all duration-200 cursor-pointer font-semibold w-full text-left mt-3 border-t border-white/[0.08] pt-6"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>LOGOUT</span>
              </button>
            </nav>
          </aside>

          {/* ── RIGHT MAIN CONTENT COLUMN ── */}
          <section className="w-full min-w-0 pt-1 lg:pt-0">
            {children}
          </section>

        </div>
      </div>

      <Footer />
    </main>
  );
}