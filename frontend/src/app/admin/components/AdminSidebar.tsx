"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  activeTab?: string;
}

export default function AdminSidebar({ activeTab }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [adminUser, setAdminUser] = useState({
    name: "Admin SectorMadness",
    role: "Administrator",
    initial: "A",
  });

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
  }, []);

  const navGroups = [
    {
      category: "DASHBOARD",
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
      category: "PESANAN",  
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
      <aside className="w-full lg:w-72 bg-[#0A0A0A] text-white border-r border-[#222222] flex flex-col justify-between h-screen sticky top-0 shrink-0 font-[family-name:var(--font-body)] overflow-hidden">
        {/* Top Brand Header (Fixed 80px height, vertically centered with AdminHeader) */}
        <div className="flex items-center justify-between w-full h-[80px] shrink-0 border-b border-[#222222]" style={{ paddingLeft: '24px' }}>
          <div className="flex items-center justify-between w-full" style={{ paddingRight: '20px' }}>
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-[58px] h-[58px] rounded-md overflow-hidden flex items-center justify-center shrink-0">
                <img src="/images/logo.png" alt="Sector Madness Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col justify-center min-w-0 leading-tight">
                <span className="text-[13px] font-black tracking-widest text-[#F5F5F5] uppercase font-[family-name:var(--font-display)]">
                  SECTOR
                </span>
                <span className="text-[13px] font-black tracking-widest text-[#F5F5F5] uppercase font-[family-name:var(--font-display)]">
                  MADNESS
                </span>
              </div>
            </div>

            {/* Hamburger menu button */}
            <button
              onClick={() => setIsOpenMobile(!isOpenMobile)}
              className="w-9 h-9 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              title="Toggle Menu"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Middle Categorized Navigation List */}
        <div className="flex-1 overflow-y-auto w-full pb-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded" style={{ paddingLeft: '24px' }}>
          <nav style={{ paddingTop: '25px' }}>
            {navGroups.map((group, index) => (
              <div key={group.category} style={{ marginTop: index !== 0 ? '16px' : '0px' }}>
                <div className="text-[13px] font-mono tracking-[0.18em] text-[#888888] uppercase font-bold mb-3" style={{ paddingLeft: '14px' }}>
                  {group.category}
                </div>

                <div className="flex flex-col gap-1.5">
                  {group.items.map((item) => {
                    const isActive =
                      activeTab === item.id ||
                      (item.href !== "/" &&
                        (pathname === item.href ||
                          (item.href !== "/admin" && pathname?.startsWith(item.href))));

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        target={(item as any).target}
                        className={`flex items-center gap-3.5 py-2.5 pr-4 text-[14px] tracking-wide transition-all duration-200 cursor-pointer font-semibold border-l-[3.5px] ${
                          isActive
                            ? "bg-white/[0.08] text-[#F5F5F5] font-bold border-[#B6A47E] shadow-sm"
                            : "border-transparent text-[#8A8A8A] hover:bg-white/[0.05] hover:text-[#D0D0D0] hover:border-white/40 transform hover:translate-x-1.5"
                        }`}
                        style={{ paddingLeft: '14px', marginRight: '26px' }}
                      >
                        <span
                          className={`shrink-0 ${
                            isActive ? "text-[#B6A47E]" : "text-[#666666]"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Area: Admin Profile Card with Logout Icon (Fixed bottom) */}
        <div
          className="border-t border-[#222222] bg-[#121212] w-full shrink-0"
          style={{ paddingTop: '16px', paddingBottom: '20px' }}
        >
          <div
            className="flex items-center justify-between w-full gap-3"
            style={{ paddingLeft: '24px', paddingRight: '20px' }}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
              <div className="w-10 h-10 rounded-md bg-white/[0.08] border border-white/15 text-[#F5F5F5] font-black text-xs flex items-center justify-center shrink-0">
                {adminUser.initial}
              </div>
              <div className="flex flex-col justify-center min-w-0 flex-1 pr-1">
                <span className="text-[12px] font-bold text-[#F5F5F5] truncate tracking-wide leading-tight block">
                  {adminUser.name}
                </span>
                <span className="text-[10px] text-[#8A8A8A] font-medium tracking-wider mt-1 truncate block">
                  {adminUser.role}
                </span>
              </div>
            </div>

            {/* Logout / Exit Button */}
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/";
                }
              }}
              className="text-[#8A8A8A] hover:text-red-400 p-2 transition-colors cursor-pointer shrink-0 rounded-lg hover:bg-white/5"
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
    </>
  );
}