"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getAdminHeroBanners,
  createAdminHeroBanner,
  updateAdminHeroBanner,
  deleteAdminHeroBanner,
  AdminHeroBanner,
} from "@/utils/api";

export default function AdminHeroBannersPage() {
  const queryClient = useQueryClient();

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<AdminHeroBanner | null>(null);

  const [formImagePath, setFormImagePath] = useState("/images/hero/hero-1.png");
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState("");

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-hero-banners"],
    queryFn: getAdminHeroBanners,
  });

  const addBannerMut = useMutation({
    mutationFn: createAdminHeroBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-banners"] });
      closeModal();
      showStatus("Hero banner created successfully!");
    },
  });

  const updateBannerMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateAdminHeroBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-banners"] });
      closeModal();
      showStatus("Hero banner updated successfully!");
    },
  });

  const deleteBannerMut = useMutation({
    mutationFn: deleteAdminHeroBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-banners"] });
      showStatus("Hero banner deleted successfully!");
    },
  });

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedBanner(null);
    setFormImagePath("/images/hero/hero-1.png");
    setFormSortOrder(banners.length + 1);
    setFormIsActive(true);
  };

  const openEditModal = (banner: AdminHeroBanner) => {
    setModalMode("edit");
    setSelectedBanner(banner);
    setFormImagePath(banner.image_path || "/images/hero/hero-1.png");
    setFormSortOrder(banner.sort_order ?? 1);
    setFormIsActive(banner.is_active ?? true);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedBanner(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImagePath.trim()) return;

    const payload = {
      image_path: formImagePath,
      sort_order: formSortOrder,
      is_active: formIsActive,
    };

    if (modalMode === "add") {
      addBannerMut.mutate(payload);
    } else if (modalMode === "edit" && selectedBanner) {
      updateBannerMut.mutate({ id: selectedBanner.id, data: payload });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F9F9F9] font-[family-name:var(--font-body)]">
      <AdminSidebar activeTab="hero-banners" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="HERO SLIDERS & BANNERS"
          subtitle="Manage homepage campaign banners and slider images"
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
              {banners.length} HERO BANNERS REGISTERED IN SYSTEM
            </p>
            <button
              onClick={openAddModal}
              className="bg-[#0A0A0A] text-white px-5 py-2.5 text-xs tracking-[0.15em] font-bold uppercase hover:bg-[#222222] transition-colors cursor-pointer"
            >
              + ADD NEW HERO BANNER
            </button>
          </div>

          <div className="bg-white border border-[#E5E5E5] overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs uppercase tracking-wider">
              <thead className="bg-[#F8F8F8] border-b border-[#E5E5E5] text-[#555555]">
                <tr>
                  <th className="p-4 font-bold">SORT ORDER</th>
                  <th className="p-4 font-bold">IMAGE PATH</th>
                  <th className="p-4 font-bold">STATUS</th>
                  <th className="p-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEEEE]">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[#888888]">
                      Loading hero banners...
                    </td>
                  </tr>
                ) : banners.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-[#888888]">
                      No hero banners found. Click "+ ADD NEW HERO BANNER" to create one.
                    </td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-[#FAFAFA]">
                      <td className="p-4 font-mono font-bold">
                        {banner.sort_order ?? 1}
                      </td>
                      <td className="p-4 font-mono text-[#0A0A0A]">
                        {banner.image_path}
                      </td>
                      <td className="p-4 font-mono font-bold">
                        <span
                          className={`px-2 py-1 text-[10px] ${
                            banner.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {banner.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="font-bold text-[#0A0A0A] hover:underline cursor-pointer"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete banner #${banner.id}?`
                              )
                            ) {
                              deleteBannerMut.mutate(banner.id);
                            }
                          }}
                          className="font-bold text-red-600 hover:underline cursor-pointer"
                        >
                          DELETE
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

      {/* Modal Form */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md p-6 border border-[#E5E5E5] shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#EEEEEE]">
              <h3 className="text-sm font-bold tracking-wider uppercase text-[#0A0A0A]">
                {modalMode === "add" ? "ADD NEW HERO BANNER" : "EDIT HERO BANNER"}
              </h3>
              <button
                onClick={closeModal}
                className="text-xs font-bold uppercase text-[#777777] hover:text-[#0A0A0A]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                  IMAGE PATH / URL *
                </label>
                <input
                  type="text"
                  required
                  value={formImagePath}
                  onChange={(e) => setFormImagePath(e.target.value)}
                  placeholder="/images/hero/hero-1.png"
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                  SORT ORDER
                </label>
                <input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-semibold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="isActiveCheck"
                  className="text-xs font-bold uppercase text-[#333] cursor-pointer"
                >
                  ACTIVE BANNER (DISPLAY ON HOMEPAGE)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#EEEEEE]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-bold tracking-wider uppercase text-[#666666] hover:bg-[#F5F5F5]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold tracking-wider uppercase bg-[#0A0A0A] text-white hover:bg-[#222222]"
                >
                  SAVE BANNER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
