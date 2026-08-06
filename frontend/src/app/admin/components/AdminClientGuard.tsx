"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminClientGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Continuously enforce admin browser tab title
    document.title = "Sector Madness - Admin Panel";

    try {
      const token = localStorage.getItem("sector_madness_token");
      const userDataStr = localStorage.getItem("sector_madness_user");

      if (!token || !userDataStr) {
        setStatus("unauthorized");
        router.replace("/login");
        return;
      }

      const user = JSON.parse(userDataStr);
      const isAdmin = user && (user.is_admin === true || user.isAdmin === true || user.role === "admin" || user.role === "ADMINISTRATOR");

      if (!isAdmin) {
        setStatus("unauthorized");
        router.replace("/");
        return;
      }

      setStatus("authorized");
    } catch {
      setStatus("unauthorized");
      router.replace("/login");
    }
  }, [router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center font-mono">
        <div className="w-8 h-8 border-2 border-[#B6A47E] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest text-[#888888]">VERIFYING ADMIN CREDENTIALS...</p>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center font-mono p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 font-bold">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-rose-400 mb-2">ACCESS DENIED // ADMIN ONLY</h1>
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

  return <>{children}</>;
}
