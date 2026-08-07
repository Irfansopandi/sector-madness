"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getAdminSizeGuides,
  createAdminSizeGuide,
  updateAdminSizeGuide,
  deleteAdminSizeGuide,
  getCategories,
  SizeGuideItem,
  CategoryItem,
} from "@/utils/api";
import {
  Ruler,
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Filter,
  Loader2,
  Table as TableIcon,
  Tag,
} from "lucide-react";
import Swal from "sweetalert2";

// Category match helper with synonym normalization
const normalizeCategory = (name: string): string => {
  if (!name) return "";
  const upper = name.trim().toUpperCase();
  if (upper === "T-SHIRTS & TOPS" || upper === "T-SHIRTS" || upper === "T-SHIRT") return "TSHIRT";
  if (upper === "PANTS & BOTTOMS" || upper === "BOTTOMS" || upper === "TROUSERS") return "BOTTOMS";
  if (upper === "JACKETS" || upper === "OUTERWEAR") return "OUTERWEAR";
  return upper.replace(/[^A-Z0-9]/g, "");
};

const isSameCategory = (catA?: string, catB?: string) => {
  if (!catA || !catB) return false;
  return normalizeCategory(catA) === normalizeCategory(catB);
};

export default function AdminSizeGuidePage() {
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
  const [selectedGuide, setSelectedGuide] = useState<SizeGuideItem | null>(null);

  // Form Fields
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [formFitDescription, setFormFitDescription] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColumns, setFormColumns] = useState<string[]>([
    "SIZE",
    "CHEST (WIDTH)",
    "LENGTH",
    "SHOULDER",
    "SLEEVE",
  ]);
  const [formRows, setFormRows] = useState<Record<string, string>[]>([]);
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch Size Guides from API
  const { data: sizeGuideList = [], isLoading: isLoadingGuides } = useQuery<SizeGuideItem[]>({
    queryKey: ["admin-size-guides"],
    queryFn: getAdminSizeGuides,
  });

  // Fetch Existing Product Categories dynamically from Database API
  const { data: dbCategories = [], isLoading: isLoadingCategories } = useQuery<CategoryItem[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Live validation for sort order
  const selectedGuideId = selectedGuide?.id;
  useEffect(() => {
    if (!modalMode || !selectedCategoryName) return;

    const isDuplicate = sizeGuideList.some((g) => {
      if (String(g.id) === String(selectedGuideId || "")) return false;
      const sameCat = isSameCategory(g.category, selectedCategoryName);
      return sameCat && Number(g.sort_order) === Number(formSortOrder);
    });

    if (isDuplicate) {
      setFormErrors((prev) => ({
        ...prev,
        sort_order: `Nomor urutan #${formSortOrder} sudah digunakan oleh Size Guide lain pada kategori "${selectedCategoryName}"! Silakan gunakan nomor urut lain.`,
      }));
    } else {
      setFormErrors((prev) => {
        if (!prev.sort_order) return prev;
        const next = { ...prev };
        delete next.sort_order;
        return next;
      });
    }
  }, [formSortOrder, selectedCategoryName, modalMode, selectedGuideId, sizeGuideList]);

  // Handle Category selection change in Modal -> recalculate default sort order in ADD mode
  const handleCategoryChange = (newCat: string) => {
    setSelectedCategoryName(newCat);
    if (modalMode === "add") {
      const catGuides = sizeGuideList.filter((g) => isSameCategory(g.category, newCat));
      const maxOrder = catGuides.reduce((max, g) => Math.max(max, Number(g.sort_order) || 0), 0);
      setFormSortOrder(maxOrder + 1);
    }
  };

  // Mutations
  const createMut = useMutation({
    mutationFn: createAdminSizeGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-size-guides"] });
      closeModal();
      showToast("Size Guide berhasil ditambahkan!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal menambahkan Size Guide", "error");
    },
  });

  const updateMut = useMutation({
    mutationFn: updateAdminSizeGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-size-guides"] });
      closeModal();
      showToast("Size Guide berhasil diperbarui!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal memperbarui Size Guide", "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteAdminSizeGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-size-guides"] });
      showToast("Size Guide berhasil dihapus!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal menghapus Size Guide", "error");
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
      text: `Are you sure you want to delete Size Guide for "${itemName}"? This action cannot be undone.`,
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
    setSelectedGuide(null);
    const firstCatName = dbCategories.length > 0 ? dbCategories[0].name.toUpperCase() : "T-SHIRT";
    setSelectedCategoryName(firstCatName);
    setFormFitDescription("BOXY OVERSIZED FIT");
    setFormDescription("All measurements are taken flat in centimeters.");
    const defaultCols = ["SIZE", "CHEST (WIDTH)", "LENGTH", "SHOULDER", "SLEEVE"];
    setFormColumns(defaultCols);
    setFormRows([
      { SIZE: "S", "CHEST (WIDTH)": "56 cm", LENGTH: "70 cm", SHOULDER: "52 cm", SLEEVE: "22 cm" },
      { SIZE: "M", "CHEST (WIDTH)": "59 cm", LENGTH: "73 cm", SHOULDER: "54 cm", SLEEVE: "23 cm" },
      { SIZE: "L", "CHEST (WIDTH)": "62 cm", LENGTH: "76 cm", SHOULDER: "56 cm", SLEEVE: "24 cm" },
      { SIZE: "XL", "CHEST (WIDTH)": "65 cm", LENGTH: "79 cm", SHOULDER: "58 cm", SLEEVE: "25 cm" },
    ]);

    // Calculate default next sort order for this category
    const catGuides = sizeGuideList.filter((g) => isSameCategory(g.category, firstCatName));
    const maxOrder = catGuides.reduce((max, g) => Math.max(max, Number(g.sort_order) || 0), 0);
    setFormSortOrder(maxOrder + 1);

    setFormIsActive(true);
    setModalMode("add");
  };

  const openEditModal = (guide: SizeGuideItem) => {
    setFormErrors({});
    setSelectedGuide(guide);
    setSelectedCategoryName(guide.category.toUpperCase());
    setFormFitDescription(guide.fit_description || "");
    setFormDescription(guide.description || "");
    setFormColumns(guide.columns && guide.columns.length > 0 ? [...guide.columns] : ["SIZE", "CHEST (WIDTH)", "LENGTH"]);
    setFormRows(guide.rows ? JSON.parse(JSON.stringify(guide.rows)) : []);
    setFormSortOrder(guide.sort_order ?? 1);
    setFormIsActive(guide.is_active ?? true);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedGuide(null);
    setFormErrors({});
  };

  const handleAddRow = () => {
    const newRow: Record<string, string> = {};
    formColumns.forEach((col) => {
      newRow[col] = col === "SIZE" ? "NEW" : "";
    });
    setFormRows((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = (index: number) => {
    setFormRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowCellChange = (rowIndex: number, colName: string, value: string) => {
    setFormRows((prev) => {
      const next = [...prev];
      next[rowIndex] = { ...next[rowIndex], [colName]: value };
      return next;
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedCategoryName.trim()) {
      errors.category = "Kategori produk wajib dipilih!";
    }
    if (formRows.length === 0) {
      errors.rows = "Minimal harus memasukkan 1 baris ukuran!";
    }

    // Sort order validation per category
    if (formSortOrder <= 0) {
      errors.sort_order = "Nomor urutan minimal harus 1!";
    } else {
      const isDuplicateOrder = sizeGuideList.some(
        (g) =>
          String(g.id) !== String(selectedGuide?.id || "") &&
          isSameCategory(g.category, selectedCategoryName) &&
          Number(g.sort_order) === Number(formSortOrder)
      );
      if (isDuplicateOrder) {
        errors.sort_order = `Nomor urutan #${formSortOrder} sudah digunakan oleh Size Guide lain pada kategori "${selectedCategoryName}"! Silakan gunakan nomor urut lain.`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const matchedCat = dbCategories.find(
      (c) => c.name.toUpperCase() === selectedCategoryName.toUpperCase()
    );
    const catCode = matchedCat ? String(matchedCat.id).padStart(2, "0") : "01";

    const payload = {
      category: selectedCategoryName.toUpperCase(),
      category_code: catCode,
      fit_description: formFitDescription.trim(),
      description: formDescription.trim(),
      columns: formColumns,
      rows: formRows,
      sort_order: formSortOrder,
      is_active: formIsActive,
    };

    if (modalMode === "add") {
      createMut.mutate(payload);
    } else if (modalMode === "edit" && selectedGuide) {
      updateMut.mutate({ id: selectedGuide.id, data: payload });
    }
  };

  // Filtering Logic
  const filteredGuides = sizeGuideList.filter((guide) => {
    const matchesSearch =
      guide.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guide.fit_description && guide.fit_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (guide.description && guide.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === "ALL" ||
      isSameCategory(guide.category, categoryFilter);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && guide.is_active) ||
      (statusFilter === "INACTIVE" && !guide.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Logic
  const currentTotal = filteredGuides.length;
  const pageSize = rowLimit > 0 ? rowLimit : currentTotal;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(currentTotal / pageSize)) : 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = rowLimit > 0 ? Math.min(startIndex + pageSize, currentTotal) : currentTotal;
  const displayedGuides = filteredGuides.slice(startIndex, endIndex);

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col md:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
      }`}
    >
      <AdminSidebar activeTab="size-guide" isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="MANAJEMEN SIZE GUIDE"
          subtitle="Kelola panduan tabel ukuran (size chart) per kategori produk"
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
              Kelola panduan ukuran pakaian, siluet fit, dan tabel dimensi ukuran per kategori.
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
              <span>SIZE GUIDE BARU</span>
            </button>
          </div>

          {/* TABLE CONTROL BAR: SEARCH, FILTER & ROW LIMIT (2-Row on Tablet/Mobile, Side-by-side on Desktop) */}
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
                  placeholder="Cari kategori atau deskripsi fit..."
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
                  {dbCategories.map((cat) => (
                    <option key={cat.id} value={cat.name.toUpperCase()}>
                      {cat.name.toUpperCase()}
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
                    {dbCategories.map((cat) => (
                      <option key={cat.id} value={cat.name.toUpperCase()}>
                        {cat.name.toUpperCase()}
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

          {/* SIZE GUIDE CARDS LIST WITH SPACED OUT MARGINS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {isLoadingGuides ? (
              <div
                className={`border rounded-[6px] p-12 text-center flex flex-col items-center justify-center gap-3 ${
                  isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
                }`}
              >
                <Loader2 className="w-6 h-6 animate-spin text-[#B6A47E]" />
                <span className="text-xs font-mono tracking-widest text-[#8A8A8A] uppercase">
                  Memuat data Size Guide...
                </span>
              </div>
            ) : displayedGuides.length === 0 ? (
              <div
                className={`border rounded-[6px] p-12 text-center flex flex-col items-center justify-center gap-3 ${
                  isDarkMode ? "bg-[#18181C] border-white/10 text-[#8A8A8A]" : "bg-white border-[#D1D5DB] text-[#6B7280]"
                }`}
              >
                <Ruler className="w-10 h-10 opacity-40" />
                <span className="text-sm font-bold uppercase tracking-wider">TIDAK ADA DATA SIZE GUIDE</span>
                <p className="text-xs">Tidak ada Size Guide yang sesuai dengan pencarian Anda.</p>
              </div>
            ) : (
              displayedGuides.map((guide) => (
                <div
                  key={guide.id}
                  style={{ padding: "28px" }}
                  className={`border rounded-[8px] space-y-5 shadow-sm transition-all duration-200 ${
                    isDarkMode
                      ? "bg-[#18181C] border-white/10 hover:border-[#B6A47E]/40"
                      : "bg-white border-[#D1D5DB] hover:border-black/30"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-md bg-[#B6A47E]/15 text-[#B6A47E] flex items-center justify-center shrink-0">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-mono font-bold tracking-widest text-[#B6A47E] uppercase whitespace-nowrap">
                            {guide.category}
                          </span>
                          <span className="text-xs font-mono text-[#8A8A8A] whitespace-nowrap">
                            (Code: {guide.category_code} | Sort: #{guide.sort_order})
                          </span>
                        </div>
                        {guide.fit_description && (
                          <h3 className="text-sm font-black tracking-wider mt-1 uppercase font-[family-name:var(--font-display)] truncate">
                            {guide.fit_description}
                          </h3>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3.5 self-start lg:self-auto flex-wrap shrink-0">
                      {/* STATUS BADGE MATCHING CONTACT SETTINGS */}
                      <span
                        style={{ padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}
                        className={`inline-flex items-center gap-1.5 uppercase font-mono border shrink-0 ${
                          guide.is_active !== false
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${guide.is_active !== false ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                        {guide.is_active !== false ? "ACTIVE" : "INACTIVE"}
                      </span>

                      <button
                        onClick={() => openEditModal(guide)}
                        style={{ padding: "8px 16px" }}
                        className={`inline-flex items-center gap-2 rounded-[5px] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border shrink-0 ${
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
                          confirmDelete(guide.category, () => deleteMut.mutate(guide.id));
                        }}
                        style={{ padding: "8px 16px" }}
                        className={`inline-flex items-center gap-2 rounded-[5px] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border shrink-0 ${
                          isDarkMode
                            ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
                            : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>HAPUS</span>
                      </button>
                    </div>
                  </div>

                  {guide.description && (
                    <p className={`text-xs leading-relaxed ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}>
                      {guide.description}
                    </p>
                  )}

                  {/* Measurement Table Preview with Generous Cell Padding & Spacing */}
                  {guide.columns && guide.rows && guide.rows.length > 0 && (
                    <div
                      style={{ marginTop: "16px", marginBottom: "8px" }}
                      className={`border rounded-[6px] overflow-hidden ${isDarkMode ? "border-white/10 bg-[#121214]" : "border-[#E5E7EB] bg-gray-50"}`}
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs uppercase tracking-wider font-mono">
                          <thead className={`border-b ${isDarkMode ? "bg-[#1E1E22] border-white/10 text-[#8A8A8A]" : "bg-[#F3F4F6] border-[#E5E7EB] text-[#4B5563]"}`}>
                            <tr>
                              {guide.columns.map((col, idx) => (
                                <th key={idx} style={{ padding: "14px 20px" }} className="font-bold">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"}`}>
                            {guide.rows.map((rowObj, rIdx) => (
                              <tr key={rIdx} className={isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-white"}>
                                {guide.columns.map((col, cIdx) => (
                                  <td
                                    key={cIdx}
                                    style={{ padding: "14px 20px" }}
                                    className={cIdx === 0 ? "font-bold text-[#B6A47E]" : isDarkMode ? "text-[#D4D4D8]" : "text-gray-700"}
                                  >
                                    {rowObj[col] || "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Pagination Controls */}
            {currentTotal > 0 && (
              <div
                style={{ padding: "20px 24px", marginTop: "12px" }}
                className={`flex flex-col sm:flex-row items-center justify-between gap-4 border rounded-[6px] uppercase text-xs ${
                  isDarkMode
                    ? "bg-[#18181C] border-white/10 text-[#8A8A8A]"
                    : "bg-white border-[#D1D5DB] text-[#4B5563]"
                }`}
              >
                <span className="font-semibold tracking-wider">
                  Menampilkan {startIndex + 1} - {endIndex} dari {currentTotal} data Size Guide
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

      {/* MODAL FORM MATCHING CATALOG PAGE EXACT SPACING & ANIMATION */}
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
              maxWidth: "680px",
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
                <Ruler style={{ width: "18px", height: "18px" }} />
                <span>{modalMode === "add" ? "ADD NEW" : "EDIT"} SIZE GUIDE</span>
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
              {/* Category Dropdown (DYNAMICALLY CONNECTED TO DATABASE PRODUCT CATEGORIES) */}
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
                  KATEGORI PRODUK (DARI DATABASE CATEGORIES) *
                </label>
                {isLoadingCategories ? (
                  <div className="text-xs text-[#8A8A8A] font-mono animate-pulse">
                    Memuat kategori dari database...
                  </div>
                ) : (
                  <select
                    value={selectedCategoryName}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "13px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      outline: "none",
                      textTransform: "uppercase",
                      backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                      border: formErrors.category ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                      color: isDarkMode ? "#ffffff" : "#0A0A0A",
                    }}
                  >
                    {dbCategories.map((cat) => (
                      <option key={cat.id} value={cat.name.toUpperCase()}>
                        {cat.name.toUpperCase()} (ID: {cat.id})
                      </option>
                    ))}
                  </select>
                )}
                {formErrors.category && (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {formErrors.category}
                  </p>
                )}
              </div>

              {/* Fit Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: isDarkMode ? "#CCCCCC" : "#374151",
                  }}
                >
                  FIT SILHOUETTE DESCRIPTION
                </label>
                <input
                  type="text"
                  value={formFitDescription}
                  onChange={(e) => setFormFitDescription(e.target.value)}
                  placeholder="Contoh: BOXY OVERSIZED FIT, RELAXED TAILORED FIT"
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
                />
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: isDarkMode ? "#CCCCCC" : "#374151",
                  }}
                >
                  CATATAN PENGUKURAN (DESCRIPTION NOTES)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Contoh: All measurements are taken flat in centimeters..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderRadius: "6px",
                    outline: "none",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                />
              </div>

              {/* MEASUREMENT ROWS EDITOR */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className="flex items-center justify-between">
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#B6A47E",
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>BARIS UKURAN (SIZE CHART ROWS) *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRow}
                    style={{ padding: "6px 14px" }}
                    className="rounded-[5px] text-[11px] font-bold uppercase tracking-wider bg-[#B6A47E]/20 text-[#B6A47E] hover:bg-[#B6A47E] hover:text-black transition-colors cursor-pointer"
                  >
                    + TAMBAH BARIS SIZE
                  </button>
                </div>

                {formErrors.rows && (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444" }}>
                    * {formErrors.rows}
                  </p>
                )}

                {/* Table Inputs */}
                <div
                  style={{
                    borderRadius: "6px",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                    overflow: "hidden",
                  }}
                  className="overflow-x-auto"
                >
                  <table className="w-full text-left text-xs uppercase tracking-wider font-mono">
                    <thead>
                      <tr
                        style={{
                          backgroundColor: isDarkMode ? "#121214" : "#F3F4F6",
                          borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
                        }}
                        className="text-[#8A8A8A] font-bold"
                      >
                        {formColumns.map((col, cIdx) => (
                          <th key={cIdx} style={{ padding: "10px 12px" }}>
                            {col}
                          </th>
                        ))}
                        <th style={{ padding: "10px 12px" }} className="text-right">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"}`}>
                      {formRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {formColumns.map((col, cIdx) => (
                            <td key={cIdx} style={{ padding: "6px 8px" }}>
                              <input
                                type="text"
                                value={row[col] || ""}
                                onChange={(e) => handleRowCellChange(rIdx, col, e.target.value)}
                                style={{
                                  width: "100%",
                                  padding: "8px 10px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  borderRadius: "4px",
                                  outline: "none",
                                  backgroundColor: isDarkMode ? "#18181C" : "#ffffff",
                                  border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                                  color: isDarkMode ? "#ffffff" : "#0A0A0A",
                                }}
                              />
                            </td>
                          ))}
                          <td style={{ padding: "6px 8px" }} className="text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(rIdx)}
                              style={{ padding: "6px" }}
                              className="text-red-400 hover:bg-red-500/20 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  <span>{modalMode === "add" ? "SIMPAN SIZE GUIDE" : "UPDATE SIZE GUIDE"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
