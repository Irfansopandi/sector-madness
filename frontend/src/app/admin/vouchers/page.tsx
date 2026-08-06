"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getAdminVouchers,
  createAdminVoucher,
  updateAdminVoucher,
  toggleAdminVoucherStatus,
  deleteAdminVoucher,
  AdminVoucher,
} from "@/utils/api";
import {
  Ticket,
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Tag,
  Calendar,
  DollarSign,
  Percent,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminVouchersPage() {
  const queryClient = useQueryClient();

  // Lazy initialize isDarkMode to prevent initial dark flash when navigating in Light Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sector_madness_admin_theme");
      return saved === null ? true : saved === "dark";
    }
    return true;
  });

  useEffect(() => {
    const handleThemeEvent = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sector_madness_admin_theme");
        setIsDarkMode(saved === null ? true : saved === "dark");
      }
    };
    window.addEventListener("sector_theme_change", handleThemeEvent);
    return () => window.removeEventListener("sector_theme_change", handleThemeEvent);
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

  // State controls
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "EXPIRED">("ALL");
  const [rowLimit, setRowLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, rowLimit]);

  // Modal States
  const [editVoucher, setEditVoucher] = useState<AdminVoucher | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form Fields
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<string>("");
  const [formMinimumPurchase, setFormMinimumPurchase] = useState<string>("");
  const [formExpiresAt, setFormExpiresAt] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string, icon: "success" | "error" | "warning" = "success") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
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

  // React Query Fetch Vouchers
  const { data: vouchers = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-vouchers"],
    queryFn: () => getAdminVouchers(),
    refetchInterval: 15000,
    retry: false,
  });

  // Mutations
  const createMut = useMutation({
    mutationFn: (data: Partial<AdminVoucher>) => createAdminVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      setIsAddModalOpen(false);
      resetForm();
      showToast("Kode voucher berhasil dibuat!");
    },
    onError: (err: any) => {
      const respData = err?.response?.data;
      if (respData?.errors) {
        const errObj: Record<string, string> = {};
        Object.keys(respData.errors).forEach((key) => {
          errObj[key] = Array.isArray(respData.errors[key]) ? respData.errors[key][0] : respData.errors[key];
        });
        setFormErrors(errObj);
      } else {
        showToast(respData?.message || "Gagal membuat kode voucher", "error");
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AdminVoucher> }) =>
      updateAdminVoucher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      setEditVoucher(null);
      resetForm();
      showToast("Kode voucher berhasil diperbarui!");
    },
    onError: (err: any) => {
      const respData = err?.response?.data;
      if (respData?.errors) {
        const errObj: Record<string, string> = {};
        Object.keys(respData.errors).forEach((key) => {
          errObj[key] = Array.isArray(respData.errors[key]) ? respData.errors[key][0] : respData.errors[key];
        });
        setFormErrors(errObj);
      } else {
        showToast(respData?.message || "Gagal memperbarui voucher", "error");
      }
    },
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      toggleAdminVoucherStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      showToast("Status voucher berhasil diperbarui!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal memperbarui status", "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteAdminVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
      showToast("Voucher berhasil dihapus!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal menghapus voucher", "error");
    },
  });

  const resetForm = () => {
    setFormCode("");
    setFormName("");
    setFormDiscountType("percentage");
    setFormDiscountValue("");
    setFormMinimumPurchase("");
    setFormExpiresAt("");
    setFormIsActive(true);
    setFormErrors({});
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (v: AdminVoucher) => {
    setFormErrors({});
    setEditVoucher(v);
    setFormCode(v.code || "");
    setFormName(v.name || "");
    setFormDiscountType(v.discount_type || "percentage");
    setFormDiscountValue(v.discount_value !== undefined ? String(v.discount_value) : "");
    setFormMinimumPurchase(v.minimum_purchase !== undefined ? String(v.minimum_purchase) : "");
    setFormExpiresAt(v.expires_at ? v.expires_at.split("T")[0] : "");
    setFormIsActive(v.is_active !== undefined ? v.is_active : true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errObj: Record<string, string> = {};
    if (!formCode.trim()) errObj.code = "Kode voucher wajib diisi.";
    if (!formName.trim()) errObj.name = "Nama voucher / campaign wajib diisi.";
    if (!formDiscountValue.trim() || isNaN(Number(formDiscountValue))) {
      errObj.discount_value = "Nilai diskon wajib diisi dalam bentuk angka.";
    } else if (formDiscountType === "percentage" && Number(formDiscountValue) > 100) {
      errObj.discount_value = "Nilai persentase diskon tidak boleh melebihi 100%.";
    }

    if (Object.keys(errObj).length > 0) {
      setFormErrors(errObj);
      return;
    }

    createMut.mutate({
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      discount_type: formDiscountType,
      discount_value: Number(formDiscountValue),
      minimum_purchase: formMinimumPurchase.trim() ? Number(formMinimumPurchase) : 0,
      expires_at: formExpiresAt ? formExpiresAt : null,
      is_active: formIsActive,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVoucher) return;
    setFormErrors({});

    const errObj: Record<string, string> = {};
    if (!formCode.trim()) errObj.code = "Kode voucher wajib diisi.";
    if (!formName.trim()) errObj.name = "Nama voucher wajib diisi.";
    if (!formDiscountValue.trim() || isNaN(Number(formDiscountValue))) {
      errObj.discount_value = "Nilai diskon wajib diisi dalam bentuk angka.";
    } else if (formDiscountType === "percentage" && Number(formDiscountValue) > 100) {
      errObj.discount_value = "Nilai persentase diskon tidak boleh melebihi 100%.";
    }

    if (Object.keys(errObj).length > 0) {
      setFormErrors(errObj);
      return;
    }

    updateMut.mutate({
      id: editVoucher.id,
      data: {
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        discount_type: formDiscountType,
        discount_value: Number(formDiscountValue),
        minimum_purchase: formMinimumPurchase.trim() ? Number(formMinimumPurchase) : 0,
        expires_at: formExpiresAt ? formExpiresAt : null,
        is_active: formIsActive,
      },
    });
  };

  const handleToggleStatus = (v: AdminVoucher) => {
    const nextStatus = !v.is_active;
    Swal.fire({
      title: nextStatus ? "AKTIFKAN VOUCHER?" : "NONAKTIFKAN VOUCHER?",
      text: `Apakah Anda yakin ingin mengubah status voucher ${v.code}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: nextStatus ? "YA, AKTIFKAN" : "YA, NONAKTIFKAN",
      cancelButtonText: "BATAL",
      reverseButtons: true,
      background: isDarkMode ? "#18181C" : "#ffffff",
      color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
      confirmButtonColor: "#B6A47E",
      cancelButtonColor: isDarkMode ? "#27272a" : "#E5E7EB",
      customClass: {
        popup: isDarkMode ? "border border-white/10 rounded-[12px] shadow-2xl" : "border border-gray-200 rounded-[12px] shadow-2xl",
        confirmButton: "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-white",
        cancelButton: isDarkMode ? "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-200" : "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-900 border border-gray-300 shadow-xs",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        toggleStatusMut.mutate({ id: v.id, is_active: nextStatus });
      }
    });
  };

  const handleDelete = (v: AdminVoucher) => {
    Swal.fire({
      title: "HAPUS KODE VOUCHER?",
      text: `Apakah Anda yakin ingin menghapus ${v.code}? Tindakan ini tidak dapat dibatalkan.`,
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "YA, HAPUS",
      cancelButtonText: "BATAL",
      reverseButtons: true,
      background: isDarkMode ? "#18181C" : "#ffffff",
      color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: isDarkMode ? "#27272a" : "#E5E7EB",
      customClass: {
        popup: isDarkMode ? "border border-white/10 rounded-[12px] shadow-2xl" : "border border-gray-200 rounded-[12px] shadow-2xl",
        confirmButton: "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-white",
        cancelButton: isDarkMode ? "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-200" : "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-900 border border-gray-300 shadow-xs",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMut.mutate(v.id);
      }
    });
  };

  // Helper check if expired
  const isVoucherExpired = (expiresAt?: string | null): boolean => {
    if (!expiresAt) return false;
    const exp = new Date(expiresAt);
    return !isNaN(exp.getTime()) && exp < new Date();
  };

  // Date Formatter
  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return "Tanpa Batas";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered Vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    const codeMatch = (v.code || "").toLowerCase().includes(q);
    const nameMatch = (v.name || "").toLowerCase().includes(q);
    const matchesSearch = !q || codeMatch || nameMatch;

    let matchesStatus = true;
    const expired = isVoucherExpired(v.expires_at);

    if (statusFilter === "ACTIVE") {
      matchesStatus = v.is_active && !expired;
    } else if (statusFilter === "INACTIVE") {
      matchesStatus = !v.is_active;
    } else if (statusFilter === "EXPIRED") {
      matchesStatus = expired;
    }

    return matchesSearch && matchesStatus;
  });

  const currentTotal = filteredVouchers.length;
  const pageSize = rowLimit > 0 ? rowLimit : currentTotal;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(currentTotal / pageSize)) : 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = rowLimit > 0 ? Math.min(startIndex + pageSize, currentTotal) : currentTotal;

  const displayedVouchers = filteredVouchers.slice(startIndex, endIndex);

  // Common Modal Styles matching Products page modal
  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
    color: isDarkMode ? "#8A8A8A" : "#4B5563",
  };

  const getInputStyle = (hasError: boolean) => ({
    width: "100%",
    padding: "11px 14px",
    fontSize: "12px",
    fontWeight: 600,
    borderRadius: "6px",
    outline: "none",
    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
    border: hasError
      ? "1px solid #E53E3E"
      : isDarkMode
      ? "1px solid rgba(255, 255, 255, 0.12)"
      : "1px solid #D1D5DB",
    color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
    transition: "border 0.2s",
  });

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col lg:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
      }`}
    >
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: ${isDarkMode ? "invert(1) brightness(100)" : "brightness(0)"} !important;
          cursor: pointer !important;
          opacity: 0.9;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>
      <AdminSidebar activeTab="vouchers" isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="KELOLA KODE VOUCHER"
          subtitle="Manajemen kode promo diskon, minimal belanja, status aktif, dan tanggal berlaku"
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        <main
          style={{
            flex: 1,
            paddingTop: "48px",
            paddingBottom: "96px",
            paddingLeft: "48px",
            paddingRight: "48px",
            maxWidth: "1440px",
            width: "100%",
          }}
          className="mx-auto"
        >
          {/* PAGE HEADER: TITLE COUNTER & ADD BUTTON (Matching Admin Customers Page) */}
          <div style={{ marginBottom: "36px" }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2
              style={{
                fontSize: "11px",
                letterSpacing: "0.22em",
                fontWeight: 700,
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
            >
              {filteredVouchers.length} KODE VOUCHER DITEMUKAN ({vouchers.length} TOTAL)
            </h2>

            <button
              onClick={handleOpenAddModal}
              style={{ padding: "12px 28px" }}
              className={`group rounded-[6px] text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm ${
                isDarkMode
                  ? "bg-[#B6A47E] text-[#0A0A0A] hover:bg-[#a3926d]"
                  : "bg-[#0A0A0A] text-white hover:bg-[#222222]"
              }`}
            >
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              <span>TAMBAH VOUCHER</span>
            </button>
          </div>

          {/* TABLE CONTROL BAR: SEARCH, FILTER & ROW LIMIT */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
              padding: "16px 20px",
              borderRadius: "8px",
              backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF",
              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", flex: 1, minWidth: "280px" }}>
              {/* Search Bar */}
              <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
                <Search
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "16px",
                    height: "16px",
                    color: isDarkMode ? "#8A8A8A" : "#9CA3AF",
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Kode / Nama Voucher..."
                  style={{
                    width: "100%",
                    paddingLeft: "38px",
                    paddingRight: "14px",
                    paddingTop: "9px",
                    paddingBottom: "9px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    outline: "none",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                  }}
                />
              </div>

              {/* Status Filter Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Filter style={{ width: "14px", height: "14px", color: "#B6A47E" }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  style={{
                    padding: "9px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    outline: "none",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                  }}
                >
                  <option value="ALL">SEMUA STATUS</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>
            </div>

            {/* Row Limit Select */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: isDarkMode ? "#8A8A8A" : "#6B7280" }}>
                TAMPILKAN:
              </span>
              <select
                value={rowLimit}
                onChange={(e) => setRowLimit(Number(e.target.value))}
                style={{
                  padding: "9px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  outline: "none",
                  cursor: "pointer",
                  backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                  color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                }}
              >
                <option value={10}>10 BARIS</option>
                <option value={20}>20 BARIS</option>
                <option value={50}>50 BARIS</option>
                <option value={0}>SEMUA BARIS</option>
              </select>
            </div>
          </div>

          {/* VOUCHERS DATA TABLE */}
          <div
            className={`border rounded-[6px] overflow-x-auto shadow-sm transition-colors [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent ${
              isDarkMode
                ? "bg-[#18181C] border-white/10 [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/35"
                : "bg-white border-[#D1D5DB] [&::-webkit-scrollbar-thumb]:bg-black/20 hover:[&::-webkit-scrollbar-thumb]:bg-black/35"
            } [&::-webkit-scrollbar-thumb]:rounded-full`}
          >
            <table className="w-full text-left text-xs uppercase tracking-wider">
              <thead
                className={`border-b ${
                  isDarkMode
                    ? "bg-[#1E1E22] border-white/10 text-[#8A8A8A]"
                    : "bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]"
                }`}
              >
                <tr>
                  <th style={{ padding: "18px 20px" }} className="font-bold whitespace-nowrap">NO.</th>
                  <th style={{ padding: "18px 20px" }} className="font-bold whitespace-nowrap">KODE VOUCHER & CAMPAIGN</th>
                  <th style={{ padding: "18px 20px" }} className="font-bold whitespace-nowrap">NILAI DISKON</th>
                  <th style={{ padding: "18px 20px" }} className="font-bold whitespace-nowrap">MINIMAL BELANJA</th>
                  <th style={{ padding: "18px 20px" }} className="font-bold whitespace-nowrap">BERLAKU SAMPAI</th>
                  <th style={{ padding: "18px 20px" }} className="font-bold whitespace-nowrap">STATUS</th>
                  <th style={{ padding: "18px 20px" }} className="font-bold text-right whitespace-nowrap">AKSI</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"
                }`}
              >
                {isLoading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "48px 24px" }} className="text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-[#B6A47E]" />
                        <span className={`text-xs ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Memuat database voucher...</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "48px 24px" }} className="text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-red-400">Gagal memuat data voucher</p>
                      <p className="text-[11px] text-gray-500 mt-1">{String(error)}</p>
                    </td>
                  </tr>
                ) : displayedVouchers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ padding: "48px 24px" }}
                      className={`text-center ${
                        isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
                      }`}
                    >
                      Tidak ada kode voucher ditemukan.
                    </td>
                  </tr>
                ) : (
                  displayedVouchers.map((v, idx) => {
                    const expired = isVoucherExpired(v.expires_at);

                    return (
                      <tr
                        key={v.id}
                        className={`transition-colors ${
                          isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-gray-50/80"
                        }`}
                      >
                        <td style={{ padding: "16px 20px" }} className={`font-mono font-bold ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>
                          {startIndex + idx + 1}
                        </td>
                        {/* 1. KODE & NAMA */}
                        <td style={{ padding: "16px 20px" }}>
                          <div className="flex items-center gap-3">
                            <div
                              style={{ width: "38px", height: "38px", borderRadius: "8px" }}
                              className={`font-black text-xs flex items-center justify-center shrink-0 border ${
                                isDarkMode
                                  ? "bg-white/10 border-white/10 text-[#B6A47E]"
                                  : "bg-[#0A0A0A] border-gray-300 text-[#B6A47E]"
                              }`}
                            >
                              <Ticket className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-extrabold text-sm tracking-wider text-[#B6A47E] font-mono">{v.code}</span>
                              <span style={{ fontSize: "11px", marginTop: "2px" }} className={`font-medium ${isDarkMode ? "text-[#CCCCCC]" : "text-gray-700"}`}>
                                {v.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. NILAI DISKON */}
                        <td style={{ padding: "16px 20px" }} className="font-mono text-xs font-bold">
                          <span className="inline-flex items-center gap-1.5">
                            {v.discount_type === "percentage" ? (
                              <span className="text-indigo-400 font-extrabold">{v.discount_value}% OFF</span>
                            ) : (
                              <span className="text-emerald-400 font-extrabold">
                                Rp {Number(v.discount_value).toLocaleString("id-ID")}
                              </span>
                            )}
                          </span>
                        </td>

                        {/* 3. MINIMAL BELANJA */}
                        <td style={{ padding: "16px 20px" }} className="font-mono text-xs text-[#8A8A8A]">
                          {v.minimum_purchase > 0 ? (
                            `Rp ${Number(v.minimum_purchase).toLocaleString("id-ID")}`
                          ) : (
                            <span className="text-gray-500 font-bold">TANPA MIN. BELANJA</span>
                          )}
                        </td>

                        {/* 4. BERLAKU SAMPAI */}
                        <td style={{ padding: "16px 20px" }} className="font-mono text-xs text-[#8A8A8A]">
                          {formatDate(v.expires_at)}
                        </td>

                        {/* 5. STATUS */}
                        <td style={{ padding: "16px 20px" }}>
                          {expired ? (
                            <span
                              style={{ padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}
                              className="inline-flex items-center gap-1.5 uppercase font-mono border bg-red-500/10 text-red-400 border-red-500/20"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              EXPIRED
                            </span>
                          ) : v.is_active ? (
                            <span
                              style={{ padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}
                              className="inline-flex items-center gap-1.5 uppercase font-mono border bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              ACTIVE
                            </span>
                          ) : (
                            <span
                              style={{ padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}
                              className="inline-flex items-center gap-1.5 uppercase font-mono border bg-amber-500/10 text-amber-400 border-amber-500/20"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              INACTIVE
                            </span>
                          )}
                        </td>

                        {/* 6. AKSI */}
                        <td style={{ padding: "16px 20px" }} className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Voucher */}
                            <button
                              onClick={() => handleOpenEditModal(v)}
                              style={{ padding: "8px 14px", borderRadius: "6px" }}
                              className={`text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                                isDarkMode
                                  ? "bg-white/5 border-white/10 text-white hover:border-[#B6A47E] hover:text-[#B6A47E]"
                                  : "bg-gray-100 border-gray-200 text-gray-800 hover:border-[#B6A47E] hover:text-[#B6A47E]"
                              }`}
                              title="Edit Voucher"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>EDIT</span>
                            </button>

                            {/* Toggle Status */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(v)}
                              style={{ padding: "8px 12px", borderRadius: "6px" }}
                              className={`text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1 border ${
                                v.is_active
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                              }`}
                              title="Klik untuk ubah Status Active/Inactive"
                            >
                              {v.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>

                            {/* Delete Voucher */}
                            <button
                              onClick={() => handleDelete(v)}
                              style={{ padding: "8px 12px", borderRadius: "6px" }}
                              className="text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                              title="Hapus Voucher"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
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

      {/* ADD / EDIT VOUCHER MODAL */}
      {(isAddModalOpen || editVoucher) && (
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
              width: "95%",
              maxWidth: "800px",
              padding: "40px",
              borderRadius: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              backgroundColor: isDarkMode ? "#18181C" : "#ffffff",
              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
              color: isDarkMode ? "#ffffff" : "#0A0A0A",
              margin: "auto",
              maxHeight: "90vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Modal Header */}
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
                <Ticket style={{ width: "18px", height: "18px" }} />
                <span>{editVoucher ? "EDIT KODE VOUCHER" : "BUAT KODE VOUCHER BARU"}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditVoucher(null);
                }}
                style={{
                  padding: "6px",
                  borderRadius: "4px",
                  border: "none",
                  background: "transparent",
                  color: isDarkMode ? "#8A8A8A" : "#6B7280",
                  cursor: "pointer",
                }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={editVoucher ? handleSaveEdit : handleSaveAdd} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Voucher Code */}
                <div>
                  <label style={labelStyle}>
                    KODE VOUCHER <span style={{ color: "#E53E3E" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SECTOR20"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    style={getInputStyle(!!formErrors.code)}
                    className="uppercase font-mono font-bold tracking-widest"
                  />
                  {formErrors.code && <p className="text-xs text-red-400 mt-1">{formErrors.code}</p>}
                </div>

                {/* Campaign Name */}
                <div>
                  <label style={labelStyle}>
                    NAMA KAMPANYE / DESKRIPSI <span style={{ color: "#E53E3E" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Diskon 20% Promo Agustus"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={getInputStyle(!!formErrors.name)}
                  />
                  {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Discount Type */}
                <div>
                  <label style={labelStyle}>
                    TIPE DISKON <span style={{ color: "#E53E3E" }}>*</span>
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    style={getInputStyle(false)}
                    className="cursor-pointer"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Potongan Tetap (Rp)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label style={labelStyle}>
                    NILAI DISKON {formDiscountType === "percentage" ? "(%)" : "(Rp)"}{" "}
                    <span style={{ color: "#E53E3E" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formDiscountType === "percentage" ? "100" : undefined}
                    step="any"
                    placeholder={formDiscountType === "percentage" ? "Contoh: 20" : "Contoh: 50000"}
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(e.target.value)}
                    style={getInputStyle(!!formErrors.discount_value)}
                  />
                  {formErrors.discount_value && (
                    <p className="text-xs text-red-400 mt-1">{formErrors.discount_value}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Minimum Purchase */}
                <div>
                  <label style={labelStyle}>MINIMAL BELANJA (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Contoh: 200000 (Isi 0 jika tanpa minimal)"
                    value={formMinimumPurchase}
                    onChange={(e) => setFormMinimumPurchase(e.target.value)}
                    style={getInputStyle(false)}
                  />
                </div>

                {/* Expires At Date */}
                <div>
                  <label style={labelStyle}>BERLAKU SAMPAI (VALID UNTIL)</label>
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="cursor-pointer transition-colors"
                    style={getInputStyle(false)}
                  />
                  <span className={`text-[10px] block mt-1 ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>
                    Biarkan kosong jika berlaku selamanya tanpa batas waktu.
                  </span>
                </div>
              </div>

              {/* Active Status Switch */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>STATUS VOUCHER AKTIF</label>
                  <span className={`text-[11px] block ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>
                    Voucher nonaktif tidak dapat digunakan pada checkout.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Buttons (Matching Products Page Modal Footer Buttons) */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  paddingTop: "20px",
                  borderTop: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditVoucher(null);
                  }}
                  style={{
                    padding: "11px 24px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                    backgroundColor: "transparent",
                    color: isDarkMode ? "#A1A1AA" : "#4B5563",
                  }}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending || updateMut.isPending}
                  style={{
                    padding: "11px 28px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: isDarkMode ? "#B6A47E" : "#0A0A0A",
                    color: isDarkMode ? "#0A0A0A" : "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  }}
                  className="flex items-center gap-2"
                >
                  {(createMut.isPending || updateMut.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{editVoucher ? "SIMPAN PERUBAHAN" : "SIMPAN VOUCHER"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
