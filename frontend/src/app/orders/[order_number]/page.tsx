"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = String(params?.order_number || "");

  useEffect(() => {
    if (orderNumber) {
      router.replace(`/dashboard/orders?view_order=${orderNumber}`);
    } else {
      router.replace("/dashboard/orders");
    }
  }, [orderNumber, router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-[#888888] font-mono text-xs tracking-widest uppercase">
      Redirecting to Order Details...
    </div>
  );
}
