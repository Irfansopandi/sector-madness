"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminClientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Helper to check admin status from localStorage synchronously
  const checkAdminSync = (): "authorized" | "unauthorized" => {
    if (typeof window === "undefined") return "authorized";
    try {
      const token = localStorage.getItem("sector_madness_token");
      const userDataStr = localStorage.getItem("sector_madness_user");
      if (token && userDataStr) {
        const user = JSON.parse(userDataStr);
        const isAdmin =
          user &&
          (user.is_admin === true ||
            user.isAdmin === true ||
            user.role === "admin" ||
            user.role === "ADMINISTRATOR");
        if (isAdmin) return "authorized";
      }
      return "unauthorized";
    } catch {
      return "unauthorized";
    }
  };

  const [authState, setAuthState] = useState<"authorized" | "unauthorized">(checkAdminSync);
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window === "undefined") return;

    const savedTheme = localStorage.getItem("sector_madness_admin_theme");
    setIsDarkMode(savedTheme === null ? true : savedTheme === "dark");

    const handleThemeEvent = () => {
      const s = localStorage.getItem("sector_madness_admin_theme");
      setIsDarkMode(s === null ? true : s === "dark");
    };
    window.addEventListener("sector_theme_change", handleThemeEvent);

    // Continuously enforce admin browser tab title
    document.title = "Sector Madness - Admin Panel";

    const currentStatus = checkAdminSync();
    setAuthState(currentStatus);

    if (currentStatus === "unauthorized") {
      const token = localStorage.getItem("sector_madness_token");
      if (!token) {
        router.replace("/login");
      } else {
        router.replace("/");
      }
    }

    return () => window.removeEventListener("sector_theme_change", handleThemeEvent);
  }, [router, pathname]);

  // Non-admins, guests, or unauthorized users: DO NOT RENDER ADMIN CHILDREN AT ALL!
  if (isMounted && authState === "unauthorized") {
    return (
      <div
        suppressHydrationWarning
        className={`min-h-screen flex flex-col items-center justify-center font-mono p-6 text-center transition-colors duration-150 ${
          isDarkMode ? "bg-[#121214] text-white" : "bg-[#F4F4F6] text-[#0A0A0A]"
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 font-bold">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-rose-400 mb-2">
          ACCESS DENIED // ADMIN ONLY
        </h1>
        <p className="text-xs text-[#AAAAAA] max-w-md mb-8 leading-relaxed">
          Your active account does not have administrator privileges to access the Sector Madness Control Panel.
        </p>
        <Link
          href="/"
          className="bg-white text-black px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#E0E0E0] transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> RETURN TO STOREFRONT
        </Link>
      </div>
    );
  }

  // ONLY verified admin users get to see the actual admin children UI!
  return <>{children}</>;
}
