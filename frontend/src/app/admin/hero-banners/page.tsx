"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getAdminHeroBanners,
  createAdminHeroBanner,
  updateAdminHeroBanner,
  deleteAdminHeroBanner,
  uploadAdminImage,
  AdminHeroBanner,
} from "@/utils/api";
import { Image as ImageIcon, Plus, X, Pencil, Trash2, Upload, Loader2, Info } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminHeroBannersPage() {
  const queryClient = useQueryClient();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      if (savedTheme !== null) {
        return savedTheme === "dark";
      }
    }
    return true;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [rowLimit, setRowLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, rowLimit]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, setImageState: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "FILE TERLALU BESAR",
        text: "Maksimal ukuran file foto adalah 5 MB. Silakan pilih foto lain.",
        background: isDarkMode ? "#18181C" : "#ffffff",
        color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
        confirmButtonColor: "#B6A47E",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageState(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const showSuccessAlert = (msg: string) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: msg,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: isDarkMode ? "#18181C" : "#ffffff",
      color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
      customClass: {
        popup: isDarkMode ? "border border-white/10 rounded-[8px] shadow-xl" : "border border-gray-200 rounded-[8px] shadow-xl",
      },
    });
  };

  const confirmDelete = (itemName: string, onConfirm: () => void) => {
    Swal.fire({
      title: "DELETE CONFIRMATION",
      text: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: isDarkMode ? "#27272a" : "#6b7280",
      confirmButtonText: "YES, DELETE",
      cancelButtonText: "CANCEL",
      background: isDarkMode ? "#18181C" : "#ffffff",
      color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
      customClass: {
        popup: isDarkMode ? "border border-white/10 rounded-[8px]" : "border border-gray-200 rounded-[8px]",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  };

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<AdminHeroBanner | null>(null);

  const [formImagePath, setFormImagePath] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formImagePath.trim() && !formImageFile) {
      newErrors.image = "Foto hero banner wajib diunggah!";
    }

    if (formSortOrder < 1 || formSortOrder > 5) {
      newErrors.sort_order = "Sort order harus di antara 1 dan 5!";
    }

    const isSortOrderTaken = banners.some((b) => {
      if (modalMode === "edit" && selectedBanner) {
        return Number(b.id) !== Number(selectedBanner.id) && Number(b.sort_order) === Number(formSortOrder);
      }
      return Number(b.sort_order) === Number(formSortOrder);
    });

    if (isSortOrderTaken) {
      newErrors.sort_order = `Nomor Sort Order ${formSortOrder} sudah digunakan oleh banner lain.`;
      Swal.fire({
        icon: "warning",
        title: "SORT ORDER SUDAH DIGUNAKAN",
        text: `Nomor urutan (Sort Order) ${formSortOrder} sudah dipakai oleh banner lain. Silakan pilih nomor urutan 1-5 yang belum digunakan.`,
        background: isDarkMode ? "#18181C" : "#ffffff",
        color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
        confirmButtonColor: "#B6A47E",
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      if (savedTheme) {
        setIsDarkMode(savedTheme === "dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("sector_madness_admin_theme", next ? "dark" : "light");
      setTimeout(() => {
        window.dispatchEvent(new Event("sector_theme_change"));
      }, 0);
    }
  };

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-hero-banners"],
    queryFn: getAdminHeroBanners,
    refetchInterval: 5000,
  });

  const addBannerMut = useMutation({
    mutationFn: createAdminHeroBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-banners"] });
      closeModal();
      showStatus("Hero banner added successfully!");
    },
  });

  const updateBannerMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AdminHeroBanner> }) =>
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
    showSuccessAlert(msg);
  };

  const openAddModal = () => {
    if (banners.length >= 5) {
      Swal.fire({
        icon: "warning",
        title: "BATAS MAKSIMAL BANNER",
        text: "Maksimal banner hero slider adalah 5 gambar. Silakan edit atau hapus banner yang ada terlebih dahulu jika ingin menambah yang baru.",
        background: isDarkMode ? "#18181C" : "#ffffff",
        color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
        confirmButtonColor: "#B6A47E",
      });
      return;
    }
    const usedOrders = banners.map((b) => Number(b.sort_order));
    let nextAvailable = 1;
    for (let i = 1; i <= 5; i++) {
      if (!usedOrders.includes(i)) {
        nextAvailable = i;
        break;
      }
    }

    setErrors({});
    setModalMode("add");
    setSelectedBanner(null);
    setFormImagePath("");
    setFormImageFile(null);
    setFormImagePreview("");
    setFormSortOrder(nextAvailable);
    setFormIsActive(true);
  };

  const openEditModal = (banner: AdminHeroBanner) => {
    setErrors({});
    setModalMode("edit");
    setSelectedBanner(banner);
    setFormImagePath(banner.image_path || "");
    setFormImageFile(null);
    setFormImagePreview(banner.image_path ? `http://brand.test${banner.image_path}` : "");
    setFormSortOrder(banner.sort_order ?? 1);
    setFormIsActive(banner.is_active ?? true);
  };

  const closeModal = () => {
    setErrors({});
    setModalMode(null);
    setSelectedBanner(null);
    setFormImageFile(null);
    setFormImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUploading(true);
    try {
      let finalImagePath = formImagePath;

      // If user selected a new file, upload it first
      if (formImageFile) {
        finalImagePath = await uploadAdminImage(formImageFile, "hero-banners");
      }

      const payload = {
        image_path: finalImagePath,
        sort_order: formSortOrder,
        is_active: formIsActive,
      };

      if (modalMode === "add") {
        addBannerMut.mutate(payload);
      } else if (modalMode === "edit" && selectedBanner) {
        updateBannerMut.mutate({ id: Number(selectedBanner.id), data: payload });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "UPLOAD GAGAL",
        text: "Gagal mengunggah foto. Periksa koneksi dan coba lagi.",
        background: isDarkMode ? "#18181C" : "#ffffff",
        color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
        confirmButtonColor: "#B6A47E",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredBanners = banners.filter((banner) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q || (banner.image_path || "").toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && banner.is_active) ||
      (statusFilter === "INACTIVE" && !banner.is_active);

    return matchesSearch && matchesStatus;
  });

  const currentTotal = filteredBanners.length;
  const pageSize = rowLimit > 0 ? rowLimit : currentTotal;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(currentTotal / pageSize)) : 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = rowLimit > 0 ? Math.min(startIndex + pageSize, currentTotal) : currentTotal;

  const displayedBanners = filteredBanners.slice(startIndex, endIndex);

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col md:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
      }`}
    >
      <AdminSidebar activeTab="hero-banners" isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="KELOLA HERO SLIDER & BANNER"
          subtitle="Manajemen banner promosi dan gambar slider halaman utama"
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        <main
          style={{
            paddingTop: "48px",
            paddingBottom: "96px",
            paddingLeft: "48px",
            paddingRight: "48px",
            maxWidth: "1440px",
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
          }}
          className="flex-1 min-w-0"
        >
          {statusMessage && (
            <div
              className={`mb-6 p-4 border rounded-[6px] text-xs tracking-wider uppercase font-semibold flex items-center justify-between shadow-sm ${
                isDarkMode
                  ? "bg-[#18181C] border-[#B6A47E]/40 text-[#B6A47E]"
                  : "bg-white border-[#B6A47E] text-[#0A0A0A]"
              }`}
            >
              <span>{statusMessage}</span>
              <button
                onClick={() => setStatusMessage("")}
                className="opacity-70 hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div style={{ marginBottom: "36px" }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.22em",
                  fontWeight: 700,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                }}
                className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
              >
                {filteredBanners.length} HERO BANNER DITEMUKAN ({banners.length}/5 TOTAL BANNER)
              </h2>
              <p className={`text-xs mt-2.5 flex items-center gap-1.5 font-mono font-medium ${banners.length >= 5 ? "text-amber-400 font-bold" : isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                <Info className="w-4 h-4 text-[#B6A47E] shrink-0" />
                <span>Maksimal 5 banner hero slider yang dapat diunggah / diaktifkan untuk halaman utama.</span>
              </p>
            </div>
            <button
              onClick={openAddModal}
              disabled={banners.length >= 5}
              style={{ padding: "12px 28px" }}
              className={`group rounded-[6px] text-xs font-bold tracking-widest uppercase transition-all duration-200 flex items-center gap-2 shadow-sm whitespace-nowrap shrink-0 ${
                banners.length >= 5
                  ? "opacity-50 cursor-not-allowed bg-gray-600 text-gray-300 border border-gray-500"
                  : isDarkMode
                  ? "bg-[#B6A47E] text-[#0A0A0A] hover:bg-[#a3926d] cursor-pointer"
                  : "bg-[#0A0A0A] text-white hover:bg-[#222222] cursor-pointer"
              }`}
            >
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              <span>HERO BANNER BARU</span>
            </button>
          </div>

          {/* HERO BANNERS TABLE */}
          <div
            className={`border rounded-[6px] overflow-hidden shadow-sm transition-colors ${
              isDarkMode
                ? "bg-[#18181C] border-white/10"
                : "bg-white border-[#D1D5DB]"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs uppercase tracking-wider">
                <thead
                  className={`border-b ${
                    isDarkMode
                      ? "bg-[#1E1E22] border-white/10 text-[#8A8A8A]"
                      : "bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]"
                  }`}
                >
                  <tr>
                    <th style={{ padding: "18px 24px" }} className="font-bold">SORT ORDER</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">IMAGE PATH</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">STATUS</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"
                  }`}
                >
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ padding: "48px 24px" }}
                        className={`text-center ${
                          isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
                        }`}
                      >
                        Loading hero banners...
                      </td>
                    </tr>
                  ) : displayedBanners.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ padding: "48px 24px" }}
                        className={`text-center ${
                          isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
                        }`}
                      >
                        Tidak ada banner hero yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    displayedBanners.map((banner) => (
                      <tr
                        key={banner.id}
                        className={`transition-colors ${
                          isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"
                        }`}
                      >
                        <td style={{ padding: "20px 24px" }} className="font-mono font-bold">
                          {banner.sort_order ?? 1}
                        </td>
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`font-mono ${
                            isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                          }`}
                        >
                          {banner.image_path}
                        </td>
                        <td style={{ padding: "20px 24px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              backgroundColor: banner.is_active
                                ? "rgba(16, 185, 129, 0.12)"
                                : isDarkMode ? "rgba(255, 255, 255, 0.06)" : "rgba(0,0,0,0.06)",
                              border: `1px solid ${banner.is_active ? "rgba(16, 185, 129, 0.35)" : isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.15)"}`,
                              color: banner.is_active
                                ? "#10B981"
                                : isDarkMode ? "#8A8A8A" : "#6B7280",
                            }}
                          >
                            {banner.is_active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td style={{ padding: "20px 24px" }} className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => openEditModal(banner)}
                              style={{ padding: "8px 16px" }}
                              className={`inline-flex items-center gap-2 rounded-[5px] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                isDarkMode
                                  ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-[#B6A47E] hover:text-[#B6A47E]"
                                  : "bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200 hover:border-black"
                              }`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>EDIT</span>
                            </button>
                            <button
                              onClick={() => {
                                confirmDelete(`Banner #${banner.id}`, () => deleteBannerMut.mutate(banner.id));
                              }}
                              style={{ padding: "8px 16px" }}
                              className={`inline-flex items-center gap-2 rounded-[5px] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                isDarkMode
                                  ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>DELETE</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PAGINATION FOOTER CONTROL BAR */}
          {rowLimit > 0 && currentTotal > rowLimit && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                marginTop: "24px",
                padding: "16px 20px",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
              }}
            >
              <span className={`text-xs font-bold font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-600"}`}>
                Menampilkan <span className="text-[#B6A47E] font-extrabold">{currentTotal > 0 ? startIndex + 1 : 0}</span> –{" "}
                <span className="text-[#B6A47E] font-extrabold">{endIndex}</span> dari{" "}
                <span className="text-[#B6A47E] font-extrabold">{currentTotal}</span> data (Halaman {validPage} dari {totalPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={validPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  style={{ padding: "8px 16px" }}
                  className={`rounded-[5px] text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    validPage <= 1
                      ? "opacity-40 cursor-not-allowed border-transparent text-gray-500"
                      : isDarkMode
                      ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-[#B6A47E] cursor-pointer"
                      : "bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200 cursor-pointer"
                  }`}
                >
                  Sebelumnya
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    style={{ width: "32px", height: "32px" }}
                    className={`rounded-[5px] text-[11px] font-bold font-mono transition-all border cursor-pointer flex items-center justify-center ${
                      pg === validPage
                        ? "bg-[#B6A47E] border-[#B6A47E] text-black font-extrabold"
                        : isDarkMode
                        ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
                        : "bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={validPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  style={{ padding: "8px 16px" }}
                  className={`rounded-[5px] text-[11px] font-bold uppercase tracking-wider transition-all border ${
                    validPage >= totalPages
                      ? "opacity-40 cursor-not-allowed border-transparent text-gray-500"
                      : isDarkMode
                      ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-[#B6A47E] cursor-pointer"
                      : "bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200 cursor-pointer"
                  }`}
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Form */}
      {modalMode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            padding: "24px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              padding: "36px",
              borderRadius: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              backgroundColor: isDarkMode ? "#18181C" : "#ffffff",
              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
              color: isDarkMode ? "#ffffff" : "#0A0A0A",
              margin: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "16px",
                borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
              }}
            >
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#B6A47E",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <ImageIcon style={{ width: "18px", height: "18px" }} />
                <span>{modalMode === "add" ? "ADD NEW HERO BANNER" : "EDIT HERO BANNER"}</span>
              </h3>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: "6px",
                  borderRadius: "4px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: isDarkMode ? "#8A8A8A" : "#6B7280",
                }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: errors.image ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                  }}
                >
                  UPLOAD HERO BANNER PHOTO *
                </label>
                <div
                  id="field-image"
                  tabIndex={-1}
                  style={{
                    border: errors?.image ? "2px dashed #EF4444" : (isDarkMode ? "2px dashed rgba(255, 255, 255, 0.2)" : "2px dashed #D1D5DB"),
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                    cursor: "pointer",
                    position: "relative",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => document.getElementById("heroImageInput")?.click()}
                >
                  <input
                    type="file"
                    id="heroImageInput"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Reset input value so same file can be re-selected
                      e.target.value = "";
                      if (file.size > 5 * 1024 * 1024) {
                        setErrors((prev) => ({ ...prev, image: `Ukuran file terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 5 MB.` }));
                        return;
                      }
                      setFormImageFile(file);
                      setFormImagePreview(URL.createObjectURL(file));
                      setFormImagePath("pending-upload");
                      setErrors((prev) => ({ ...prev, image: "" }));
                    }}
                  />
                  {formImagePreview ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <img
                        src={formImagePreview}
                        alt="Preview"
                        style={{ maxHeight: "140px", borderRadius: "6px", objectFit: "cover", border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E5E7EB" }}
                      />
                      <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#B6A47E", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Upload style={{ width: "14px", height: "14px" }} />
                        CLICK TO CHANGE PHOTO
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <Upload style={{ width: "24px", height: "24px", color: errors?.image ? "#EF4444" : "#B6A47E" }} />
                      <span style={{ fontSize: "12px", fontWeight: 600, color: errors?.image ? "#EF4444" : (isDarkMode ? "#EEEEEE" : "#374151") }}>
                        CLICK OR DRAG PHOTO TO UPLOAD
                      </span>
                    </div>
                  )}
                </div>
                {errors?.image ? (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {errors.image}
                  </p>
                ) : (
                  <p style={{ fontSize: "10px", fontWeight: 600, color: isDarkMode ? "#8A8A8A" : "#6B7280", marginTop: "2px" }}>
                    * Maksimal ukuran file: 5 MB (Format: JPG, PNG, WEBP)
                  </p>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: errors.sort_order ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                  }}
                >
                  SORT ORDER (URUTAN TAMPIL: 1 – 5) *
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                  <button
                    type="button"
                    disabled={formSortOrder <= 1}
                    onClick={() => setFormSortOrder(Math.max(1, formSortOrder - 1))}
                    style={{
                      width: "42px",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: 700,
                      borderRadius: "6px 0 0 6px",
                      cursor: formSortOrder <= 1 ? "not-allowed" : "pointer",
                      opacity: formSortOrder <= 1 ? 0.4 : 1,
                      backgroundColor: isDarkMode ? "#1E1E22" : "#F3F4F6",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                      color: isDarkMode ? "#CCCCCC" : "#374151",
                      transition: "all 0.15s ease",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => { if (formSortOrder > 1) { e.currentTarget.style.backgroundColor = "#B6A47E"; e.currentTarget.style.color = "#0A0A0A"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? "#1E1E22" : "#F3F4F6"; e.currentTarget.style.color = isDarkMode ? "#CCCCCC" : "#374151"; }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    id="field-sort_order"
                    value={formSortOrder}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 1 && val <= 5) {
                        setFormSortOrder(val);
                        setErrors((prev) => ({ ...prev, sort_order: "" }));
                      } else if (e.target.value === "") {
                        setFormSortOrder(1);
                      }
                    }}
                    style={{
                      flex: 1,
                      height: "44px",
                      padding: "0 12px",
                      fontSize: "15px",
                      fontWeight: 800,
                      textAlign: "center",
                      outline: "none",
                      backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                      borderTop: errors.sort_order ? "1px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                      borderBottom: errors.sort_order ? "1px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                      borderLeft: "none",
                      borderRight: "none",
                      color: "#B6A47E",
                      MozAppearance: "textfield",
                    }}
                  />
                  <button
                    type="button"
                    disabled={formSortOrder >= 5}
                    onClick={() => setFormSortOrder(Math.min(5, formSortOrder + 1))}
                    style={{
                      width: "42px",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: 700,
                      borderRadius: "0 6px 6px 0",
                      cursor: formSortOrder >= 5 ? "not-allowed" : "pointer",
                      opacity: formSortOrder >= 5 ? 0.4 : 1,
                      backgroundColor: isDarkMode ? "#1E1E22" : "#F3F4F6",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                      color: isDarkMode ? "#CCCCCC" : "#374151",
                      transition: "all 0.15s ease",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => { if (formSortOrder < 5) { e.currentTarget.style.backgroundColor = "#B6A47E"; e.currentTarget.style.color = "#0A0A0A"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? "#1E1E22" : "#F3F4F6"; e.currentTarget.style.color = isDarkMode ? "#CCCCCC" : "#374151"; }}
                  >
                    +
                  </button>
                </div>
                {errors?.sort_order ? (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {errors.sort_order}
                  </p>
                ) : (
                  <p style={{ fontSize: "10px", fontWeight: 600, color: isDarkMode ? "#8A8A8A" : "#6B7280", marginTop: "2px" }}>
                    * Pilih nomor urutan 1 sampai 5 (setiap nomor hanya bisa dipakai 1 banner).
                  </p>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "8px" }}>
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#B6A47E", cursor: "pointer" }}
                />
                <label
                  htmlFor="isActiveCheck"
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    cursor: "pointer",
                    color: isDarkMode ? "#CCCCCC" : "#374151",
                  }}
                >
                  ACTIVE BANNER (DISPLAY ON HOMEPAGE)
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "14px",
                  paddingTop: "24px",
                  marginTop: "12px",
                  borderTop: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    backgroundColor: isDarkMode ? "rgba(255,255,255,0.06)" : "#F3F4F6",
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid #E5E7EB",
                    color: isDarkMode ? "#CCCCCC" : "#4B5563",
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isUploading || addBannerMut.isPending || updateBannerMut.isPending}
                  style={{
                    padding: "10px 28px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: isUploading || addBannerMut.isPending || updateBannerMut.isPending ? "not-allowed" : "pointer",
                    backgroundColor: "#B6A47E",
                    border: "none",
                    color: "#0A0A0A",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    opacity: isUploading || addBannerMut.isPending || updateBannerMut.isPending ? 0.75 : 1,
                  }}
                  className="flex items-center gap-2 transition-all"
                >
                  {isUploading || addBannerMut.isPending || updateBannerMut.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>{isUploading ? "UPLOADING..." : "SAVING..."}</span>
                    </>
                  ) : (
                    <span>SAVE BANNER</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
