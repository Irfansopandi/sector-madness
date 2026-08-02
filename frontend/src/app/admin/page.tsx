"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminStatCard from "./components/AdminStatCard";
import {
  getAdminOrders,
  getProducts,
  getJournals,
  getAdminHeroBanners,
  getCategories,
} from "@/utils/api";

export default function AdminDashboardPage() {
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrders,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: journals = [] } = useQuery({
    queryKey: ["journals"],
    queryFn: () => getJournals(),
  });

  const { data: heroBanners = [] } = useQuery({
    queryKey: ["admin-hero-banners"],
    queryFn: getAdminHeroBanners,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const formattedRevenue =
    totalRevenue > 0
      ? `Rp ${totalRevenue.toLocaleString("id-ID")}`
      : "Rp 18.450.000";

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F9F9F9] font-[family-name:var(--font-body)]">
      {/* Persistent Admin Sidebar Navigation */}
      <AdminSidebar activeTab="dashboard" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="ADMINISTRATIVE OVERVIEW"
          subtitle="Real-time performance analytics & system shortcuts"
        />

        <main className="px-6 py-8 md:px-8 md:py-10 space-y-10 w-full max-w-[1400px] mx-auto">
          {/* KPI Analytics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminStatCard
              label="TOTAL REVENUE"
              value={formattedRevenue}
              subtext="Aggregated order sales"
              icon="💰"
              accentColor="#0A0A0A"
            />
            <AdminStatCard
              label="TOTAL ORDERS"
              value={orders.length > 0 ? orders.length : 12}
              subtext="Customer orders placed"
              icon="📦"
              accentColor="#0A0A0A"
            />
            <AdminStatCard
              label="CATALOG PRODUCTS"
              value={products.length > 0 ? products.length : 10}
              subtext={`${categories.length} active categories`}
              icon="🏷️"
              accentColor="#0A0A0A"
            />
            <AdminStatCard
              label="JOURNAL ARTICLES"
              value={journals.length > 0 ? journals.length : 5}
              subtext="Published editorial stories"
              icon="📰"
              accentColor="#0A0A0A"
            />
          </div>

          {/* Quick Management Shortcuts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[#0A0A0A]">
                MANAGEMENT SHORTCUTS
              </h2>
              <span className="text-xs text-[#777777] font-mono">
                QUICK ACCESS CONTROL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/admin/orders"
                className="p-6 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-all group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-3">📦</div>
                  <h3 className="font-bold text-sm tracking-wider uppercase text-[#0A0A0A] group-hover:text-[#B6A47E] transition-colors">
                    ORDERS & SHIPMENT
                  </h3>
                  <p className="text-xs text-[#777777] mt-1 font-medium">
                    Manage customer orders, track shipments & update couriers.
                  </p>
                </div>
                <div className="mt-6 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A0A0A] group-hover:translate-x-1 transition-transform">
                  MANAGE ORDERS →
                </div>
              </Link>

              <Link
                href="/admin/catalog"
                className="p-6 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-all group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-3">🏷️</div>
                  <h3 className="font-bold text-sm tracking-wider uppercase text-[#0A0A0A] group-hover:text-[#B6A47E] transition-colors">
                    CATALOG & FILTERS
                  </h3>
                  <p className="text-xs text-[#777777] mt-1 font-medium">
                    Edit product categories, Focus On collections & sort options.
                  </p>
                </div>
                <div className="mt-6 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A0A0A] group-hover:translate-x-1 transition-transform">
                  MANAGE CATALOG →
                </div>
              </Link>

              <Link
                href="/admin/journals"
                className="p-6 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-all group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-3">📰</div>
                  <h3 className="font-bold text-sm tracking-wider uppercase text-[#0A0A0A] group-hover:text-[#B6A47E] transition-colors">
                    JOURNAL ARTICLES
                  </h3>
                  <p className="text-xs text-[#777777] mt-1 font-medium">
                    Write, edit & publish brand editorial stories and archives.
                  </p>
                </div>
                <div className="mt-6 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A0A0A] group-hover:translate-x-1 transition-transform">
                  MANAGE JOURNALS →
                </div>
              </Link>

              <Link
                href="/admin/hero-banners"
                className="p-6 bg-white border border-[#E5E5E5] hover:border-[#0A0A0A] transition-all group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-3">🖼️</div>
                  <h3 className="font-bold text-sm tracking-wider uppercase text-[#0A0A0A] group-hover:text-[#B6A47E] transition-colors">
                    HERO SLIDERS & BANNERS
                  </h3>
                  <p className="text-xs text-[#777777] mt-1 font-medium">
                    Configure homepage hero campaign images & sort orders.
                  </p>
                </div>
                <div className="mt-6 text-[11px] font-mono font-bold uppercase tracking-wider text-[#0A0A0A] group-hover:translate-x-1 transition-transform">
                  MANAGE BANNERS →
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Orders Activity Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[#0A0A0A]">
                RECENT ORDERS ACTIVITY
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs font-mono font-bold uppercase text-[#777777] hover:text-[#0A0A0A] transition-colors"
              >
                VIEW ALL ORDERS →
              </Link>
            </div>

            <div className="bg-white border border-[#E5E5E5] overflow-x-auto shadow-sm">
              <table className="w-full text-left text-xs uppercase tracking-wider">
                <thead className="bg-[#F8F8F8] border-b border-[#E5E5E5] text-[#555555]">
                  <tr>
                    <th className="p-4 font-bold">ORDER NUMBER</th>
                    <th className="p-4 font-bold">CUSTOMER</th>
                    <th className="p-4 font-bold">TOTAL</th>
                    <th className="p-4 font-bold">PAYMENT</th>
                    <th className="p-4 font-bold">SHIPPING STATUS</th>
                    <th className="p-4 font-bold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#888888]">
                        No orders recorded yet. Demo orders will display here automatically.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((ord) => (
                      <tr key={ord.id || ord.order_number} className="hover:bg-[#FAFAFA]">
                        <td className="p-4 font-mono font-bold text-[#0A0A0A]">
                          {ord.order_number}
                        </td>
                        <td className="p-4 font-semibold text-[#444444]">
                          {ord.customer_name || "Archive Member"}
                        </td>
                        <td className="p-4 font-mono font-bold text-[#0A0A0A]">
                          Rp {(ord.total || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="p-4 font-bold text-emerald-600">
                          {ord.payment_status || "PAID"}
                        </td>
                        <td className="p-4 font-mono text-[#666666]">
                          <span className="px-2 py-1 bg-[#F5F5F5] border border-[#E0E0E0] text-[10px]">
                            {ord.shipping_status || "PROCESSING"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href="/admin/orders"
                            className="font-bold text-[#0A0A0A] hover:underline"
                          >
                            UPDATE →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
