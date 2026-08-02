"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getAdminOrders,
  updateAdminShipment,
  AdminOrder,
} from "@/utils/api";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [shippingStatus, setShippingStatus] = useState("PROCESSING");
  const [courier, setCourier] = useState("JNE Express");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrders,
  });

  const updateShipmentMut = useMutation({
    mutationFn: ({
      orderNumber,
      data,
    }: {
      orderNumber: string;
      data: { shipping_status?: string; courier?: string; tracking_number?: string };
    }) => updateAdminShipment(orderNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrder(null);
      showStatus("Order shipment updated successfully!");
    },
  });

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const openUpdateModal = (ord: AdminOrder) => {
    setSelectedOrder(ord);
    setShippingStatus(ord.shipping_status || "PROCESSING");
    setCourier(ord.courier || "JNE Express");
    setTrackingNumber(ord.tracking_number || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateShipmentMut.mutate({
      orderNumber: selectedOrder.order_number,
      data: {
        shipping_status: shippingStatus,
        courier,
        tracking_number: trackingNumber,
      },
    });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F9F9F9] font-[family-name:var(--font-body)]">
      <AdminSidebar activeTab="orders" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="ORDERS & SHIPMENT CONTROL"
          subtitle="Track customer orders, manage shipping status, & assign courier tracking numbers"
        />

        <main className="px-6 py-8 md:px-8 md:py-10 w-full max-w-[1400px] mx-auto">
          {statusMessage && (
            <div className="mb-6 p-4 bg-[#0A0A0A] text-white text-xs tracking-wider uppercase font-semibold flex items-center justify-between">
              <span>{statusMessage}</span>
              <button
                onClick={() => setStatusMessage("")}
                className="text-white opacity-70 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <p className="text-xs tracking-wider uppercase text-[#666666]">
              {orders.length} CUSTOMER ORDERS REGISTERED
            </p>
          </div>

          <div className="bg-white border border-[#E5E5E5] overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs uppercase tracking-wider">
              <thead className="bg-[#F8F8F8] border-b border-[#E5E5E5] text-[#555555]">
                <tr>
                  <th className="p-4 font-bold">ORDER NO</th>
                  <th className="p-4 font-bold">DATE</th>
                  <th className="p-4 font-bold">CUSTOMER</th>
                  <th className="p-4 font-bold">TOTAL</th>
                  <th className="p-4 font-bold">PAYMENT</th>
                  <th className="p-4 font-bold">SHIPPING STATUS</th>
                  <th className="p-4 font-bold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEEEE]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#888888]">
                      Loading admin orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#888888]">
                      No orders found in database. Customer orders will appear here automatically.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id || ord.order_number} className="hover:bg-[#FAFAFA]">
                      <td className="p-4 font-mono font-bold text-[#0A0A0A]">
                        {ord.order_number}
                      </td>
                      <td className="p-4 font-mono text-[#666666]">
                        {ord.created_at ? new Date(ord.created_at).toLocaleDateString("id-ID") : "TODAY"}
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
                        <button
                          onClick={() => openUpdateModal(ord)}
                          className="font-bold text-[#0A0A0A] hover:underline cursor-pointer"
                        >
                          UPDATE SHIPMENT →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Shipment Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md p-6 border border-[#E5E5E5] shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#EEEEEE]">
              <h3 className="text-sm font-bold tracking-wider uppercase text-[#0A0A0A]">
                UPDATE SHIPMENT #{selectedOrder.order_number}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-xs font-bold uppercase text-[#777777] hover:text-[#0A0A0A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                  SHIPPING STATUS
                </label>
                <select
                  value={shippingStatus}
                  onChange={(e) => setShippingStatus(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-semibold uppercase bg-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED (IN TRANSIT)</option>
                  <option value="DELIVERED">DELIVERED</option>                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                  COURIER SERVICE
                </label>
                <input
                  type="text"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="e.g. JNE Express / J&T / SiCepat"
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none uppercase font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                  TRACKING NUMBER (RESI)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. JNE8890214829"
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-bold tracking-wider uppercase text-[#666666] hover:bg-[#F5F5F5]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold tracking-wider uppercase bg-[#0A0A0A] text-white hover:bg-[#222222]"
                >
                  SAVE SHIPMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
