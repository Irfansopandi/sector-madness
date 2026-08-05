"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getAdminCustomers,
  createAdminCustomer,
  updateAdminCustomer,
  toggleAdminCustomerStatus,
  deleteAdminCustomer,
  AdminCustomer,
} from "@/utils/api";
import {
  Users,
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Filter,
  Eye,
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  User,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminCustomersPage() {
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
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Inactive">("ALL");
  const [rowLimit, setRowLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, rowLimit]);

  // Modal States
  const [viewCustomer, setViewCustomer] = useState<AdminCustomer | null>(null);
  const [editCustomer, setEditCustomer] = useState<AdminCustomer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBirthDate, setFormBirthDate] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
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

  // React Query Fetch Customers
  const { data: customers = [], isLoading, isError, error } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => getAdminCustomers(),
    refetchInterval: 15000,
    retry: false,
  });

  // Mutations
  const createMut = useMutation({
    mutationFn: (data: Partial<AdminCustomer> & { password?: string }) => createAdminCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      setIsAddModalOpen(false);
      resetForm();
      showToast("Customer berhasil ditambahkan!");
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
        showToast(respData?.message || "Gagal menambahkan customer", "error");
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AdminCustomer> & { password?: string } }) =>
      updateAdminCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      setEditCustomer(null);
      resetForm();
      showToast("Customer berhasil diperbarui!");
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
        showToast(respData?.message || "Gagal memperbarui customer", "error");
      }
    },
  });

  const toggleStatusMut = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      toggleAdminCustomerStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      showToast("Status customer berhasil diperbarui!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal memperbarui status", "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteAdminCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      showToast("Customer berhasil dihapus!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal menghapus customer", "error");
    },
  });

  const resetForm = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormBirthDate("");
    setFormPassword("");
    setFormIsActive(true);
    setFormErrors({});
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (cust: AdminCustomer) => {
    setFormErrors({});
    setEditCustomer(cust);
    setFormName(cust.name || "");
    setFormEmail(cust.email || "");
    setFormPhone(cust.phone || "");
    setFormBirthDate(cust.birth_date || "");
    setFormPassword("");
    setFormIsActive(cust.is_active !== undefined ? cust.is_active : true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errObj: Record<string, string> = {};
    if (!formName.trim()) errObj.name = "Nama customer wajib diisi.";
    if (!formEmail.trim()) errObj.email = "Email wajib diisi.";
    if (!formPassword) errObj.password = "Password wajib diisi (minimal 8 karakter).";

    if (Object.keys(errObj).length > 0) {
      setFormErrors(errObj);
      return;
    }

    createMut.mutate({
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || undefined,
      birth_date: formBirthDate || undefined,
      password: formPassword,
      is_active: formIsActive,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    setFormErrors({});

    const errObj: Record<string, string> = {};
    if (!formName.trim()) errObj.name = "Nama customer wajib diisi.";
    if (!formEmail.trim()) errObj.email = "Email wajib diisi.";

    if (Object.keys(errObj).length > 0) {
      setFormErrors(errObj);
      return;
    }

    const payload: Partial<AdminCustomer> & { password?: string } = {
      name: formName.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || "",
      birth_date: formBirthDate || "",
      is_active: formIsActive,
    };
    if (formPassword.trim()) {
      payload.password = formPassword;
    }

    updateMut.mutate({
      id: editCustomer.id,
      data: payload,
    });
  };

  const handleToggleStatus = (cust: AdminCustomer) => {
    const nextStatus = !cust.is_active;
    const actionLabel = nextStatus ? "AKTIFKAN" : "NONAKTIFKAN";
    const actionColor = nextStatus ? "#10B981" : "#F59E0B";

    Swal.fire({
      title: `${actionLabel} AKUN CUSTOMER?`,
      text: `Apakah Anda yakin ingin me-${actionLabel.toLowerCase()} ${cust.name || cust.email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `YA, ${actionLabel}`,
      cancelButtonText: "BATAL",
      reverseButtons: true,
      background: isDarkMode ? "#18181C" : "#ffffff",
      color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
      confirmButtonColor: actionColor,
      cancelButtonColor: isDarkMode ? "#27272a" : "#E5E7EB",
      customClass: {
        popup: isDarkMode
          ? "border border-white/10 rounded-[12px] shadow-2xl"
          : "border border-gray-200 rounded-[12px] shadow-2xl",
        confirmButton: "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-white",
        cancelButton: isDarkMode
          ? "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-200"
          : "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-900 border border-gray-300 shadow-xs",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        toggleStatusMut.mutate({ id: cust.id, is_active: nextStatus });
      }
    });
  };

  const handleDelete = (cust: AdminCustomer) => {
    Swal.fire({
      title: "HAPUS AKUN CUSTOMER?",
      text: `Apakah Anda yakin ingin menghapus ${cust.name || cust.email}? Tindakan ini tidak dapat dibatalkan.`,
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
        popup: isDarkMode
          ? "border border-white/10 rounded-[12px] shadow-2xl"
          : "border border-gray-200 rounded-[12px] shadow-2xl",
        confirmButton: "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-white",
        cancelButton: isDarkMode
          ? "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-200"
          : "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-900 border border-gray-300 shadow-xs",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMut.mutate(cust.id);
      }
    });
  };

  // Date Formatter
  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered Customers
  const filteredCustomers = customers.filter((cust) => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (cust.name || "").toLowerCase().includes(q);
    const emailMatch = (cust.email || "").toLowerCase().includes(q);
    const phoneMatch = (cust.phone || "").toLowerCase().includes(q);
    const matchesSearch = !q || nameMatch || emailMatch || phoneMatch;

    let matchesStatus = true;
    if (statusFilter === "Active") {
      matchesStatus = cust.is_active === true;
    } else if (statusFilter === "Inactive") {
      matchesStatus = cust.is_active === false;
    }

    return matchesSearch && matchesStatus;
  });

  const currentTotal = filteredCustomers.length;
  const pageSize = rowLimit > 0 ? rowLimit : currentTotal;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(currentTotal / pageSize)) : 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = rowLimit > 0 ? Math.min(startIndex + pageSize, currentTotal) : currentTotal;

  const displayedCustomers = filteredCustomers.slice(startIndex, endIndex);

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
      <AdminSidebar activeTab="customers" isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="KELOLA CUSTOMER"
          subtitle="Manajemen data pengguna, status akun, dan alamat pengiriman"
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

          {/* PAGE HEADER: TITLE COUNTER & ADD BUTTON (Matching Admin Products Page) */}
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
              {filteredCustomers.length} CUSTOMER DITEMUKAN ({customers.length} TOTAL)
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
              <span>TAMBAH CUSTOMER</span>
            </button>
          </div>

          {/* TABLE CONTROL BAR: SEARCH, FILTER & ROW LIMIT (Matching Admin Products Page) */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderRadius: "6px",
              marginBottom: "24px",
            }}
            className={`border shadow-sm ${
              isDarkMode
                ? "bg-[#18181C] border-white/10"
                : "bg-white border-[#D1D5DB]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-[#8A8A8A]" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Cari Customer / Email / Telepon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: "40px",
                    paddingRight: "14px",
                    paddingTop: "10px",
                    paddingBottom: "10px",
                  }}
                  className={`w-full text-xs font-medium rounded-[4px] border outline-none transition-colors ${
                    isDarkMode
                      ? "bg-[#121214] border-white/10 text-white focus:border-[#B6A47E]"
                      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-[#B6A47E]"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Filter className={`w-3.5 h-3.5 ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-400"}`} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  style={{ padding: "10px 14px" }}
                  className={`text-xs font-bold tracking-wider uppercase rounded-[4px] border outline-none cursor-pointer transition-colors ${
                    isDarkMode
                      ? "bg-[#121214] border-white/10 text-white focus:border-[#B6A47E]"
                      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-[#B6A47E]"
                  }`}
                >
                  <option value="ALL">SEMUA STATUS</option>
                  <option value="Active">ACTIVE</option>
                  <option value="Inactive">INACTIVE</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-bold tracking-wider uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>
                TAMPILKAN:
              </span>
              <select
                value={rowLimit}
                onChange={(e) => setRowLimit(Number(e.target.value))}
                style={{ padding: "10px 14px" }}
                className={`text-xs font-bold tracking-wider uppercase rounded-[4px] border outline-none cursor-pointer transition-colors ${
                  isDarkMode
                    ? "bg-[#121214] border-white/10 text-white focus:border-[#B6A47E]"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-[#B6A47E]"
                }`}
              >
                <option value={10}>10 BARIS</option>
                <option value={20}>20 BARIS</option>
                <option value={50}>50 BARIS</option>
                <option value={0}>SEMUA BARIS</option>
              </select>
            </div>
          </div>

          {/* CUSTOMERS DATA TABLE (Matching Admin Products Page Design & Spacing) */}
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
                  <th style={{ padding: "18px 20px" }} className="font-bold whitespace-nowrap">CUSTOMER NAME</th>
                  <th style={{ padding: "18px 20px" }} className="font-bold whitespace-nowrap">CONTACT</th>
                  <th style={{ padding: "18px 20px" }} className="font-bold whitespace-nowrap">STATUS</th>
                  <th style={{ padding: "18px 20px" }} className="font-bold whitespace-nowrap">LAST LOGIN</th>
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
                    <td colSpan={6} style={{ padding: "48px 24px" }} className="text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-[#B6A47E]" />
                        <span className={`text-xs ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Memuat database customer...</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "48px 24px" }} className="text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-red-400">Gagal memuat data customer</p>
                      <p className="text-[11px] text-gray-500 mt-1">{String(error)}</p>
                    </td>
                  </tr>
                ) : displayedCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ padding: "48px 24px" }}
                      className={`text-center ${
                        isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
                      }`}
                    >
                      Tidak ada customer ditemukan sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  displayedCustomers.map((cust, idx) => {
                    const name = cust.name ? cust.name : "-";
                    const email = cust.email ? cust.email : "-";
                    const phone = cust.phone ? cust.phone : "-";
                    const lastLogin = formatDate(cust.last_login_at);

                    return (
                      <tr
                        key={cust.id}
                        className={`transition-colors ${
                          isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-gray-50/80"
                        }`}
                      >
                        <td style={{ padding: "16px 20px" }} className={`font-mono font-bold ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>
                          {startIndex + idx + 1}
                        </td>
                        {/* 1. CUSTOMER NAME */}
                        <td style={{ padding: "16px 20px" }}>
                          <div className="flex items-center gap-3">
                            <div
                              style={{ width: "40px", height: "40px", borderRadius: "8px" }}
                              className={`font-black text-xs flex items-center justify-center shrink-0 border ${
                                isDarkMode
                                  ? "bg-white/10 border-white/10 text-[#B6A47E]"
                                  : "bg-[#0A0A0A] border-gray-300 text-white"
                              }`}
                            >
                              {name !== "-" ? name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm tracking-wide">{name}</span>
                              {cust.created_at && (
                                <span style={{ fontSize: "10px", marginTop: "2px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>
                                  Terdaftar {formatDate(cust.created_at).split(",")[0]}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. CONTACT */}
                        <td style={{ padding: "16px 20px" }}>
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="flex items-center gap-1.5 font-mono">
                              <Mail className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-400"}`} />
                              <span>{email}</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-mono">
                              <Phone className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? "text-[#666666]" : "text-gray-400"}`} />
                              <span className={`${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>{phone}</span>
                            </span>
                          </div>
                        </td>

                        {/* 3. STATUS */}
                        <td style={{ padding: "16px 20px" }}>
                          <span
                            style={{ padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}
                            className={`inline-flex items-center gap-1.5 uppercase font-mono border ${
                              cust.is_active
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cust.is_active ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                            {cust.is_active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>

                        {/* 4. LAST LOGIN */}
                        <td style={{ padding: "16px 20px" }} className="font-mono text-xs text-[#8A8A8A]">
                          {lastLogin}
                        </td>

                        {/* 5. AKSI (Matching Admin Products Page Action Buttons Style) */}
                        <td style={{ padding: "16px 20px" }} className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Customer Details */}
                            <button
                              onClick={() => setViewCustomer(cust)}
                              style={{ padding: "8px 12px", borderRadius: "6px" }}
                              className={`text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                                isDarkMode
                                  ? "bg-white/5 border-white/10 text-white hover:border-[#B6A47E] hover:text-[#B6A47E]"
                                  : "bg-gray-100 border-gray-200 text-gray-800 hover:border-[#B6A47E] hover:text-[#B6A47E]"
                              }`}
                              title="Lihat Detail Customer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">VIEW</span>
                            </button>

                            {/* Edit Customer */}
                            <button
                              onClick={() => handleOpenEditModal(cust)}
                              style={{ padding: "8px 14px", borderRadius: "6px" }}
                              className={`text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                                isDarkMode
                                  ? "bg-white/5 border-white/10 text-white hover:border-[#B6A47E] hover:text-[#B6A47E]"
                                  : "bg-gray-100 border-gray-200 text-gray-800 hover:border-[#B6A47E] hover:text-[#B6A47E]"
                              }`}
                              title="Edit Customer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>EDIT</span>
                            </button>

                            {/* Toggle Status */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(cust)}
                              style={{ padding: "8px 12px", borderRadius: "6px" }}
                              className={`text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1 border ${
                                cust.is_active
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                              }`}
                              title="Klik untuk ubah Status Akun"
                            >
                              {cust.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>

                            {/* Delete Customer */}
                            <button
                              onClick={() => handleDelete(cust)}
                              style={{ padding: "8px 12px", borderRadius: "6px" }}
                              className="text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                              title="Hapus Customer"
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

      {/* VIEW CUSTOMER MODAL (Matching Products Page Modal Design & Spacing) */}
      {viewCustomer && (
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
                <User style={{ width: "18px", height: "18px" }} />
                <span>DETAIL CUSTOMER (#{viewCustomer.id})</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewCustomer(null)}
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

            {/* Modal Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* BASIC INFORMATION */}
              <div>
                <label style={labelStyle}>BASIC INFORMATION</label>
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "6px",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
                >
                  <div>
                    <span style={{ fontSize: "11px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>Customer Name</span>
                    <span className="font-bold block mt-1 text-sm">{viewCustomer.name || "-"}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: "11px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>Email Address</span>
                    <span className="font-bold block mt-1 font-mono">{viewCustomer.email || "-"}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: "11px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>Phone Number</span>
                    <span className="font-bold block mt-1 font-mono">{viewCustomer.phone || "-"}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: "11px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>Date of Birth</span>
                    <span className="font-bold block mt-1">{viewCustomer.birth_date || "-"}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: "11px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>Account Status</span>
                    <span className="mt-1 block">
                      <span
                        style={{ padding: "3px 10px", borderRadius: "9999px", fontSize: "10px", fontWeight: 700 }}
                        className={`inline-flex items-center gap-1 uppercase font-mono border ${
                          viewCustomer.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {viewCustomer.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: "11px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>Last Login</span>
                    <span className="font-bold block mt-1 font-mono">{formatDate(viewCustomer.last_login_at)}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: "11px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>Registration Date</span>
                    <span className="font-bold block mt-1 font-mono">{formatDate(viewCustomer.created_at)}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: "11px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>Total Orders</span>
                    <span className="font-bold block mt-1 font-mono">{viewCustomer.orders_count !== undefined ? viewCustomer.orders_count : "-"}</span>
                  </div>
                </div>
              </div>

              {/* SHIPPING ADDRESS */}
              <div>
                <label style={labelStyle}>SHIPPING ADDRESS</label>
                {viewCustomer.shipping_addresses && viewCustomer.shipping_addresses.length > 0 ? (
                  <div className="space-y-3">
                    {viewCustomer.shipping_addresses.map((addr) => (
                      <div
                        key={addr.id}
                        style={{
                          padding: "18px 20px",
                          borderRadius: "6px",
                          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
                          backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                        }}
                        className="space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span style={{ padding: "3px 8px", borderRadius: "4px" }} className="font-bold text-[10px] uppercase font-mono bg-white/10 border border-white/10">
                            {addr.label || "-"}
                          </span>
                          {addr.is_default && (
                            <span style={{ fontSize: "10px" }} className="font-bold uppercase tracking-wider text-[#B6A47E]">
                              (DEFAULT)
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-xs pt-1">
                          Penerima: {addr.receiver_name || "-"} ({addr.phone_number || "-"})
                        </p>
                        <p className={`text-xs ${isDarkMode ? "text-[#CCCCCC]" : "text-gray-700"}`}>
                          Alamat Lengkap: {addr.street_address || "-"}
                        </p>
                        <div className={`grid grid-cols-2 gap-2 text-xs pt-1 ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>
                          <span>Kecamatan: {addr.district || "-"}</span>
                          <span>Kota / Kab: {addr.city || "-"}</span>
                          <span>Provinsi: {addr.province || "-"}</span>
                          <span>Kode Pos: {addr.postal_code || "-"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      borderRadius: "6px",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
                      backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                    }}
                    className="text-center font-mono text-xs text-[#8A8A8A]"
                  >
                    -
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer (Matching Products Page Modal Footer) */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingTop: "20px",
                borderTop: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
              }}
            >
              <button
                type="button"
                onClick={() => setViewCustomer(null)}
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
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOMER MODAL (Matching Products Page Modal Design & Spacing) */}
      {(isAddModalOpen || editCustomer) && (
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
                <User style={{ width: "18px", height: "18px" }} />
                <span>{editCustomer ? "EDIT AKUN CUSTOMER" : "TAMBAH CUSTOMER BARU"}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditCustomer(null);
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
            <form onSubmit={editCustomer ? handleSaveEdit : handleSaveAdd} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Customer Name */}
              <div>
                <label style={labelStyle}>
                  NAMA CUSTOMER <span style={{ color: "#E53E3E" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: John Doe"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={getInputStyle(!!formErrors.name)}
                />
                {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>
                  ALAMAT EMAIL <span style={{ color: "#E53E3E" }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  style={getInputStyle(!!formErrors.email)}
                />
                {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>NOMOR TELEPON</label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  style={getInputStyle(false)}
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label style={labelStyle}>TANGGAL LAHIR</label>
                <input
                  type="date"
                  value={formBirthDate}
                  onChange={(e) => setFormBirthDate(e.target.value)}
                  className="cursor-pointer transition-colors"
                  style={getInputStyle(false)}
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>
                  PASSWORD {editCustomer ? "(KOSONGKAN JIKA TIDAK INGIN DIUBAH)" : <span style={{ color: "#E53E3E" }}>*</span>}
                </label>
                <input
                  type="password"
                  placeholder={editCustomer ? "••••••••" : "Minimal 8 karakter"}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  style={getInputStyle(!!formErrors.password)}
                />
                {formErrors.password && <p className="text-xs text-red-400 mt-1">{formErrors.password}</p>}
              </div>

              {/* Active Status Switch */}
              <div className="flex items-center justify-between pt-2">
                <label style={{ ...labelStyle, marginBottom: 0 }}>STATUS AKUN AKTIF</label>
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
                    setEditCustomer(null);
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
                  <span>{editCustomer ? "SIMPAN PERUBAHAN" : "BUAT AKUN"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
