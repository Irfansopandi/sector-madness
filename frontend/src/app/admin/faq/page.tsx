"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getAdminFaqs,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
  AdminFaqItem,
} from "@/utils/api";
import {
  HelpCircle,
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminFaqPage() {
  const queryClient = useQueryClient();

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

  // Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [rowLimit, setRowLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, rowLimit]);

  // Modal States
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<AdminFaqItem | null>(null);

  // Form Fields
  const [formCategory, setFormCategory] = useState("GENERAL");
  const [customCategory, setCustomCategory] = useState("");
  const [formQuestion, setFormQuestion] = useState("");
  const [formAnswer, setFormAnswer] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch FAQs from API
  const { data: faqList = [], isLoading } = useQuery<AdminFaqItem[]>({
    queryKey: ["admin-faqs"],
    queryFn: getAdminFaqs,
  });

  // Real-time sort order validation
  const selectedFaqId = selectedFaq?.id;
  useEffect(() => {
    if (!modalMode) return;
    const finalCat = (
      formCategory === "CUSTOM" ? customCategory : formCategory
    ).toUpperCase().trim();

    if (!finalCat) return;

    const isDuplicate = faqList.some((f) => {
      if (String(f.id) === String(selectedFaqId || "")) return false;
      const sameCat = f.category.trim().toUpperCase() === finalCat;
      return sameCat && Number(f.sort_order) === Number(formSortOrder);
    });

    if (isDuplicate) {
      setFormErrors((prev) => ({
        ...prev,
        sort_order: `Nomor urutan #${formSortOrder} sudah digunakan oleh FAQ lain pada kategori "${finalCat}"! Silakan gunakan nomor urut lain.`,
      }));
    } else {
      setFormErrors((prev) => {
        if (!prev.sort_order) return prev;
        const next = { ...prev };
        delete next.sort_order;
        return next;
      });
    }
  }, [formSortOrder, formCategory, customCategory, modalMode, selectedFaqId, faqList]);

  // Mutations
  const createMut = useMutation({
    mutationFn: createAdminFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      closeModal();
      showToast("Pertanyaan FAQ berhasil ditambahkan!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal menambahkan FAQ", "error");
    },
  });

  const updateMut = useMutation({
    mutationFn: updateAdminFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      closeModal();
      showToast("FAQ berhasil diperbarui!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal memperbarui FAQ", "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteAdminFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      showToast("FAQ berhasil dihapus!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal menghapus FAQ", "error");
    },
  });

  const showToast = (msg: string, icon: "success" | "error" = "success") => {
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
        popup: isDarkMode
          ? "border border-white/10 rounded-[8px] shadow-xl"
          : "border border-gray-200 rounded-[8px] shadow-xl",
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

  const openAddModal = () => {
    setFormErrors({});
    setSelectedFaq(null);
    setFormCategory("GENERAL");
    setCustomCategory("");
    setFormQuestion("");
    setFormAnswer("");

    // Calculate next default sort order for GENERAL category
    const catFaqs = faqList.filter((f) => f.category.toUpperCase() === "GENERAL");
    const maxOrder = catFaqs.reduce((max, f) => Math.max(max, Number(f.sort_order) || 0), 0);
    setFormSortOrder(maxOrder + 1);

    setFormIsActive(true);
    setModalMode("add");
  };

  const openEditModal = (faq: AdminFaqItem) => {
    setFormErrors({});
    setSelectedFaq(faq);
    const predefinedCats = ["GENERAL", "ORDERS", "SHIPPING", "PAYMENTS"];
    if (predefinedCats.includes(faq.category.toUpperCase())) {
      setFormCategory(faq.category.toUpperCase());
      setCustomCategory("");
    } else {
      setFormCategory("CUSTOM");
      setCustomCategory(faq.category);
    }
    setFormQuestion(faq.question || "");
    setFormAnswer(faq.answer || "");
    setFormSortOrder(faq.sort_order ?? 1);
    setFormIsActive(faq.is_active ?? true);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedFaq(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    const finalCat = (
      formCategory === "CUSTOM" ? customCategory : formCategory
    ).toUpperCase().trim();

    if (formCategory === "CUSTOM" && !customCategory.trim()) {
      errors.category = "Kategori kustom wajib diisi!";
    }
    if (!formQuestion.trim()) {
      errors.question = "Pertanyaan wajib diisi!";
    }
    if (!formAnswer.trim()) {
      errors.answer = "Jawaban wajib diisi!";
    }

    // Sort order validation per category
    if (formSortOrder <= 0) {
      errors.sort_order = "Nomor urutan minimal harus 1!";
    } else {
      const isDuplicateOrder = faqList.some(
        (f) =>
          f.category.trim().toUpperCase() === finalCat &&
          Number(f.sort_order) === Number(formSortOrder) &&
          String(f.id) !== String(selectedFaq?.id || "")
      );
      if (isDuplicateOrder) {
        errors.sort_order = `Nomor urutan #${formSortOrder} sudah digunakan oleh FAQ lain pada kategori "${finalCat}"! Silakan gunakan nomor urut lain.`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const finalCategory = (
      formCategory === "CUSTOM" ? customCategory : formCategory
    ).toUpperCase().trim();

    const categoryCodes: Record<string, string> = {
      GENERAL: "01",
      ORDERS: "02",
      SHIPPING: "03",
      PAYMENTS: "04",
    };

    const payload = {
      category: finalCategory,
      category_code: categoryCodes[finalCategory] || "01",
      question: formQuestion.trim(),
      answer: formAnswer.trim(),
      sort_order: formSortOrder,
      is_active: formIsActive,
    };

    if (modalMode === "add") {
      createMut.mutate(payload);
    } else if (modalMode === "edit" && selectedFaq) {
      updateMut.mutate({ id: selectedFaq.id, data: payload });
    }
  };

  // Categories for filter
  const existingCategories = Array.from(
    new Set(faqList.map((item) => item.category.toUpperCase()))
  );
  if (!existingCategories.includes("GENERAL")) existingCategories.push("GENERAL");
  if (!existingCategories.includes("ORDERS")) existingCategories.push("ORDERS");
  if (!existingCategories.includes("SHIPPING")) existingCategories.push("SHIPPING");
  if (!existingCategories.includes("PAYMENTS")) existingCategories.push("PAYMENTS");

  // Filtering Logic
  const filteredFaqs = faqList.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" ||
      faq.category.toUpperCase() === categoryFilter.toUpperCase();

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && faq.is_active) ||
      (statusFilter === "INACTIVE" && !faq.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Logic
  const currentTotal = filteredFaqs.length;
  const pageSize = rowLimit > 0 ? rowLimit : currentTotal;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(currentTotal / pageSize)) : 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = rowLimit > 0 ? Math.min(startIndex + pageSize, currentTotal) : currentTotal;
  const displayedFaqs = filteredFaqs.slice(startIndex, endIndex);

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col md:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
      }`}
    >
      <AdminSidebar activeTab="faq" isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="MANAJEMEN FAQ"
          subtitle="Kelola pertanyaan & jawaban FAQ pelanggan untuk storefront"
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
          {/* Top Description & Add Button Bar */}
          <div style={{ marginTop: "0px", marginBottom: "24px" }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className={`uppercase font-bold ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
            >
              Kelola daftar pertanyaan umum (FAQ), jawaban penjelasan, dan status tampil pada storefront.
            </p>
            <button
              onClick={openAddModal}
              style={{ padding: "12px 28px" }}
              className={`group inline-flex items-center justify-center font-bold text-xs tracking-[0.15em] uppercase rounded-[6px] transition-all duration-200 cursor-pointer shrink-0 gap-2.5 shadow-sm whitespace-nowrap ${
                isDarkMode
                  ? "bg-[#B6A47E] text-[#0A0A0A] hover:bg-[#a3926d]"
                  : "bg-[#0A0A0A] text-white hover:bg-[#222222]"
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5] shrink-0 transition-transform duration-300 group-hover:rotate-90" />
              <span>FAQ BARU</span>
            </button>
          </div>

          {/* TABLE CONTROL BAR: SEARCH, FILTER & ROW LIMIT */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
            className={`border shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 ${
              isDarkMode
                ? "bg-[#18181C] border-white/10"
                : "bg-white border-[#E5E7EB]"
            }`}
          >
            {/* ROW 1 (Tablet/Mobile): Full Width Search | LEFT GROUP (Desktop): Search + Category + Status */}
            <div className="flex flex-col sm:flex-row lg:flex-row items-stretch sm:items-center gap-3 lg:gap-3 flex-1 min-w-0 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[140px] sm:w-64 lg:w-72 shrink">
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
                  placeholder="Cari pertanyaan atau jawaban FAQ..."
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

              {/* Category Filter Dropdown on Desktop (lg:) */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <Filter style={{ width: "14px", height: "14px", color: "#B6A47E" }} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: "9px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    outline: "none",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                  }}
                >
                  <option value="ALL">SEMUA KATEGORI</option>
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter Dropdown on Desktop (lg:) */}
              <div className="hidden lg:block shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  style={{
                    padding: "9px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    borderRadius: "6px",
                    outline: "none",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                  }}
                >
                  <option value="ALL">SEMUA STATUS</option>
                  <option value="ACTIVE">AKTIF</option>
                  <option value="INACTIVE">NON-AKTIF</option>
                </select>
              </div>
            </div>

            {/* ROW 2 (Tablet/Mobile): Filters & Row Limit Select (Stacked on Left under Kategori) */}
            <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center justify-between lg:justify-end gap-3 shrink-0 w-full lg:w-auto">
              <div className="flex lg:hidden items-center gap-2.5 flex-wrap shrink-0 min-w-0">
                {/* Category Filter on Tablet/Mobile */}
                <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                  <Filter style={{ width: "14px", height: "14px", color: "#B6A47E" }} className="shrink-0" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{
                      padding: "9px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      borderRadius: "6px",
                      outline: "none",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                      color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                    }}
                    className="max-w-[150px] sm:max-w-[200px] truncate"
                  >
                    <option value="ALL">SEMUA KATEGORI</option>
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter on Tablet/Mobile */}
                <div className="shrink-0">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    style={{
                      padding: "9px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      borderRadius: "6px",
                      outline: "none",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                      color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                    }}
                    className="max-w-[130px] sm:max-w-[160px] truncate"
                  >
                    <option value="ALL">SEMUA STATUS</option>
                    <option value="ACTIVE">AKTIF</option>
                    <option value="INACTIVE">NON-AKTIF</option>
                  </select>
                </div>
              </div>

              {/* Row Limit Select */}
              <div className="flex items-center gap-2.5 shrink-0">
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
          </div>

          {/* FAQ TABLE */}
          <div
            className={`border rounded-[6px] overflow-hidden shadow-sm transition-colors ${
              isDarkMode
                ? "bg-[#18181C] border-white/10"
                : "bg-white border-[#D1D5DB]"
            }`}
          >
            <div
              className={`overflow-x-auto [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent ${
                isDarkMode
                  ? "[&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/35"
                  : "[&::-webkit-scrollbar-thumb]:bg-black/20 hover:[&::-webkit-scrollbar-thumb]:bg-black/35"
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
                    <th style={{ padding: "18px 24px" }} className="font-bold w-16 text-center">SORT</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold w-36">KATEGORI</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">PERTANYAAN (QUESTION)</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">JAWABAN (ANSWER)</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold w-32">STATUS</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold w-44 text-right">AKSI</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"}`}>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "48px 24px" }} className={`text-center ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Loading FAQs...</td>
                    </tr>
                  ) : displayedFaqs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "48px 24px" }} className={`text-center ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Tidak ada data FAQ yang sesuai dengan pencarian.</td>
                    </tr>
                  ) : (
                    displayedFaqs.map((faq) => (
                      <tr key={faq.id} className={`transition-colors ${isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"}`}>
                        <td style={{ padding: "20px 24px" }} className="font-mono font-bold text-center text-[#B6A47E]">
                          #{faq.sort_order ?? 0}
                        </td>
                        <td style={{ padding: "20px 24px" }} className="font-mono font-bold">
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              backgroundColor: isDarkMode ? "rgba(182, 164, 126, 0.15)" : "#F3F0E6",
                              color: "#B6A47E",
                            }}
                            className="text-[10px] tracking-wider inline-block"
                          >
                            {faq.category}
                          </span>
                        </td>
                        <td style={{ padding: "20px 24px" }} className={`font-bold text-sm max-w-xs ${isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"}`}>
                          {faq.question}
                        </td>
                        <td style={{ padding: "20px 24px" }} className={`max-w-md line-clamp-2 text-xs normal-case font-normal ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>
                          {faq.answer}
                        </td>
                        {/* STATUS BADGE EXACTLY MATCHING CONTACT SETTINGS PAGE */}
                        <td style={{ padding: "20px 24px" }}>
                          <span
                            style={{ padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}
                            className={`inline-flex items-center gap-1.5 uppercase font-mono border ${
                              faq.is_active !== false
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${faq.is_active !== false ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                            {faq.is_active !== false ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                        <td style={{ padding: "20px 24px" }} className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => openEditModal(faq)}
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
                                confirmDelete(faq.question, () => deleteMut.mutate(faq.id));
                              }}
                              style={{ padding: "8px 16px" }}
                              className={`inline-flex items-center gap-2 rounded-[5px] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                                isDarkMode
                                  ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                                  : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>HAPUS</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {currentTotal > 0 && (
              <div
                style={{ padding: "20px 24px" }}
                className={`flex flex-col sm:flex-row items-center justify-between gap-4 border-t uppercase text-xs ${
                  isDarkMode
                    ? "bg-[#18181C] border-white/10 text-[#8A8A8A]"
                    : "bg-white border-[#E5E7EB] text-[#4B5563]"
                }`}
              >
                <span className="font-semibold tracking-wider">
                  Menampilkan {startIndex + 1} - {endIndex} dari {currentTotal} data FAQ
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
          </div>
        </main>
      </div>

      {/* MODAL FORM */}
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
                <HelpCircle style={{ width: "18px", height: "18px" }} />
                <span>{modalMode === "add" ? "ADD NEW" : "EDIT"} FAQ</span>
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
              {/* Category */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: formErrors.category ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                  }}
                >
                  KATEGORI FAQ *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    outline: "none",
                    textTransform: "uppercase",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="ORDERS">ORDERS</option>
                  <option value="SHIPPING">SHIPPING</option>
                  <option value="PAYMENTS">PAYMENTS</option>
                  <option value="CUSTOM">+ KATEGORI BARU (KUSTOM)...</option>
                </select>

                {formCategory === "CUSTOM" && (
                  <input
                    type="text"
                    placeholder="Masukkan nama kategori kustom (contoh: WARRANTY)..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      marginTop: "4px",
                      fontSize: "13px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      outline: "none",
                      textTransform: "uppercase",
                      backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                      border: formErrors.category ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                      color: isDarkMode ? "#ffffff" : "#0A0A0A",
                    }}
                  />
                )}
                {formErrors.category && (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {formErrors.category}
                  </p>
                )}
              </div>

              {/* Question */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: formErrors.question ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                  }}
                >
                  PERTANYAAN (QUESTION) *
                </label>
                <input
                  type="text"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Contoh: Bagaimana cara melakukan pengembalian barang?"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    outline: "none",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: formErrors.question ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                />
                {formErrors.question && (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {formErrors.question}
                  </p>
                )}
              </div>

              {/* Answer */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: formErrors.answer ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                  }}
                >
                  JAWABAN (ANSWER) *
                </label>
                <textarea
                  rows={4}
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Tuliskan jawaban penjelasan secara rinci..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderRadius: "6px",
                    outline: "none",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: formErrors.answer ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                />
                {formErrors.answer && (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {formErrors.answer}
                  </p>
                )}
              </div>

              {/* Sort Order (- / + Input) & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: formErrors.sort_order ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                    }}
                  >
                    URUTAN (SORT ORDER) *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormSortOrder((p) => Math.max(1, p - 1))}
                      style={{
                        backgroundColor: isDarkMode ? "#27272A" : "#E5E7EB",
                        color: isDarkMode ? "#FFFFFF" : "#111827",
                      }}
                      className="w-10 h-10 rounded-md font-bold text-base flex items-center justify-center cursor-pointer hover:bg-[#B6A47E] hover:text-black transition-colors shrink-0"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={formSortOrder}
                      onChange={(e) => {
                        setFormSortOrder(Math.max(1, parseInt(e.target.value) || 1));
                        if (formErrors.sort_order) setFormErrors((prev) => ({ ...prev, sort_order: "" }));
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        fontSize: "13px",
                        fontWeight: 700,
                        borderRadius: "6px",
                        outline: "none",
                        textAlign: "center",
                        backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                        border: formErrors.sort_order ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                        color: isDarkMode ? "#ffffff" : "#0A0A0A",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormSortOrder((p) => p + 1)}
                      style={{
                        backgroundColor: isDarkMode ? "#27272A" : "#E5E7EB",
                        color: isDarkMode ? "#FFFFFF" : "#111827",
                      }}
                      className="w-10 h-10 rounded-md font-bold text-base flex items-center justify-center cursor-pointer hover:bg-[#B6A47E] hover:text-black transition-colors shrink-0"
                    >
                      +
                    </button>
                  </div>
                  {formErrors.sort_order && (
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                      * {formErrors.sort_order}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: "8px" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: isDarkMode ? "#CCCCCC" : "#374151",
                    }}
                  >
                    STATUS TAMPIL
                  </label>
                  <label className="inline-flex items-center gap-2.5 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 accent-[#B6A47E] rounded cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold uppercase">
                      {formIsActive ? "AKTIF (TAMPIL)" : "NON-AKTIF"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
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
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: isDarkMode ? "#27272A" : "#E5E7EB",
                    color: isDarkMode ? "#ffffff" : "#111827",
                  }}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending || updateMut.isPending || !!formErrors.sort_order}
                  style={{
                    padding: "12px 32px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: "#B6A47E",
                    color: "#0A0A0A",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  className="hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {(createMut.isPending || updateMut.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>{modalMode === "add" ? "SIMPAN FAQ" : "UPDATE FAQ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
