"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersListPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/orders");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#888888] font-mono text-xs tracking-widest uppercase">
      Redirecting to Atelier Orders...
    </div>
  );
}

