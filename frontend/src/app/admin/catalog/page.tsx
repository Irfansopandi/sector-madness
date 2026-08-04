"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getCategories, createCategory, updateCategory, deleteCategory, CategoryItem,
  getCollections, createCollection, updateCollection, deleteCollection, CollectionItem,
  getSortOptions, createSortOption, updateSortOption, deleteSortOption, SortOptionItem,
  getJournals, createJournal, updateJournal, deleteJournal, JournalArticle,
} from "@/utils/api";
import { SlidersHorizontal, Plus, X, Pencil, Trash2, Upload, Search, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminCatalogPage() {
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
  const [activeTab, setActiveTab] = useState<"categories" | "collections" | "sort" | "journals">("categories");

  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const [searchQuery, setSearchQuery] = useState("");
  const [rowLimit, setRowLimit] = useState<number>(10);

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

  // Modal / Form state
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formIssue, setFormIssue] = useState("");
  const [formCategory, setFormCategory] = useState("Collection Stories");
  const [formImage, setFormImage] = useState("");
  const [formQuote, setFormQuote] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

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

  // Queries
  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    refetchInterval: 5000,
  });

  const { data: collections = [], isLoading: loadingCols } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
    refetchInterval: 5000,
  });

  const { data: sortOptions = [], isLoading: loadingSorts } = useQuery({
    queryKey: ["sortOptions"],
    queryFn: getSortOptions,
    refetchInterval: 5000,
  });

  const { data: journals = [], isLoading: loadingJournals } = useQuery({
    queryKey: ["journals"],
    queryFn: () => getJournals(),
    refetchInterval: 5000,
  });

  // Category Mutations
  const addCategoryMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModal();
      showStatus("Category created successfully!");
    },
  });

  const updateCategoryMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModal();
      showStatus("Category updated successfully!");
    },
  });

  const deleteCategoryMut = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showStatus("Category deleted successfully!");
    },
  });

  // Collection Mutations
  const addCollectionMut = useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      closeModal();
      showStatus("Focus On Collection created successfully!");
    },
  });

  const updateCollectionMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      closeModal();
      showStatus("Focus On Collection updated successfully!");
    },
  });

  const deleteCollectionMut = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      showStatus("Focus On Collection deleted successfully!");
    },
  });

  // Sort Option Mutations
  const addSortMut = useMutation({
    mutationFn: createSortOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sortOptions"] });
      closeModal();
      showStatus("Sort option created successfully!");
    },
  });

  const updateSortMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateSortOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sortOptions"] });
      closeModal();
      showStatus("Sort option updated successfully!");
    },
  });

  const deleteSortMut = useMutation({
    mutationFn: deleteSortOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sortOptions"] });
      showStatus("Sort option deleted successfully!");
    },
  });

  // Journal Mutations
  const addJournalMut = useMutation({
    mutationFn: createJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      closeModal();
      showStatus("Journal article created successfully!");
    },
  });

  const updateJournalMut = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => updateJournal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      closeModal();
      showStatus("Journal article updated successfully!");
    },
  });

  const deleteJournalMut = useMutation({
    mutationFn: deleteJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      showStatus("Journal article deleted successfully!");
    },
  });

  const isSubmitting =
    addCategoryMut.isPending ||
    updateCategoryMut.isPending ||
    addCollectionMut.isPending ||
    updateCollectionMut.isPending ||
    addSortMut.isPending ||
    updateSortMut.isPending ||
    addJournalMut.isPending ||
    updateJournalMut.isPending;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formName.trim()) {
      newErrors.name = "Judul / Nama wajib diisi!";
    }
    if ((activeTab === "categories" || activeTab === "collections") && !formDescription.trim()) {
      newErrors.description = "Deskripsi wajib diisi!";
    }
    if (activeTab === "journals") {
      if (!formImage.trim()) {
        newErrors.image = "Foto item / sampul wajib diunggah!";
      }
      if (!formDescription.trim()) {
        newErrors.description = "Ringkasan / deskripsi wajib diisi!";
      }
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

  const showStatus = (msg: string) => {
    showSuccessAlert(msg);
  };

  const openAddModal = () => {
    setErrors({});
    setModalMode("add");
    setSelectedItem(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormSortOrder(0);
    setFormIssue("VOL. 01");
    setFormCategory("Collection Stories");
    setFormImage("");
    setFormQuote("");
  };

  const openEditModal = (item: any) => {
    setErrors({});
    setModalMode("edit");
    setSelectedItem(item);
    setFormName(item.name || item.title || "");
    setFormCode(item.code || "");
    setFormDescription(item.description || item.summary || "");
    setFormSortOrder(item.sort_order ?? 0);
    setFormIssue(item.issue || "VOL. 01");
    setFormCategory(item.category || "Collection Stories");
    setFormImage(item.image || "");
    setFormQuote(item.quote || "");
  };

  const closeModal = () => {
    setErrors({});
    setModalMode(null);
    setSelectedItem(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormSortOrder(0);
    setFormIssue("");
    setFormImage("");
    setFormQuote("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (activeTab === "categories") {
      if (modalMode === "add") {
        addCategoryMut.mutate({ name: formName, description: formDescription });
      } else if (modalMode === "edit" && selectedItem) {
        updateCategoryMut.mutate({ id: selectedItem.id, data: { name: formName, description: formDescription } });
      }
    } else if (activeTab === "collections") {
      if (modalMode === "add") {
        addCollectionMut.mutate({ name: formName, code: formCode, description: formDescription });
      } else if (modalMode === "edit" && selectedItem) {
        updateCollectionMut.mutate({ id: selectedItem.id, data: { name: formName, code: formCode, description: formDescription } });
      }
    } else if (activeTab === "sort") {
      if (modalMode === "add") {
        addSortMut.mutate({ name: formName, code: formCode, sort_order: formSortOrder });
      } else if (modalMode === "edit" && selectedItem) {
        updateSortMut.mutate({ id: selectedItem.id, data: { name: formName, code: formCode, sort_order: formSortOrder } });
      }
    } else if (activeTab === "journals") {
      const journalPayload = {
        title: formName,
        category: formCategory,
        issue: formIssue,
        summary: formDescription,
        image: formImage,
        quote: formQuote,
        sort_order: formSortOrder,
      };

      if (modalMode === "add") {
        addJournalMut.mutate(journalPayload);
      } else if (modalMode === "edit" && selectedItem) {
        updateJournalMut.mutate({ id: selectedItem.id, data: journalPayload });
      }
    }
  };

  const filteredCats = categories.filter((cat) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || cat.name.toLowerCase().includes(q) || (cat.slug || "").toLowerCase().includes(q) || (cat.description || "").toLowerCase().includes(q);
  });
  const displayedCats = rowLimit === 0 ? filteredCats : filteredCats.slice(0, rowLimit);

  const filteredCols = collections.filter((col) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || col.name.toLowerCase().includes(q) || (col.code || "").toLowerCase().includes(q) || (col.description || "").toLowerCase().includes(q);
  });
  const displayedCols = rowLimit === 0 ? filteredCols : filteredCols.slice(0, rowLimit);

  const filteredSorts = sortOptions.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || s.name.toLowerCase().includes(q) || (s.code || "").toLowerCase().includes(q);
  });
  const displayedSorts = rowLimit === 0 ? filteredSorts : filteredSorts.slice(0, rowLimit);

  const filteredCatJournals = journals.filter((j) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || j.title.toLowerCase().includes(q) || (j.category || "").toLowerCase().includes(q) || (j.summary || "").toLowerCase().includes(q);
  });
  const displayedCatJournals = rowLimit === 0 ? filteredCatJournals : filteredCatJournals.slice(0, rowLimit);

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = tabRefs.current[activeTab];
      if (activeEl) {
        setIndicatorStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab, categories.length, collections.length, sortOptions.length, journals.length]);

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col lg:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
      }`}
    >
      <AdminSidebar activeTab="catalog" isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="CATALOG MANAGEMENT"
          subtitle="Organize product categories, collections, sort parameters, and publication journals"
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
          {/* Toast Alert */}
          {statusMessage && (
            <div
              className={`mb-6 p-4 border rounded-[6px] text-xs tracking-wider uppercase font-semibold flex items-center justify-between shadow-sm ${
                isDarkMode
                  ? "bg-[#18181C] border-[#B6A47E]/40 text-[#B6A47E]"
                  : "bg-white border-[#B6A47E] text-[#0A0A0A]"
              }`}
            >
              <span>{statusMessage}</span>
              <button onClick={() => setStatusMessage("")} className="opacity-70 hover:opacity-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Smooth Sliding Button Pill Navigation Tabs */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
              padding: "6px",
              borderRadius: "10px",
              backgroundColor: isDarkMode ? "#18181C" : "#E5E7EB",
              border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #D1D5DB",
              marginBottom: "32px",
              width: "fit-content",
            }}
          >
            {/* Sliding Active Pill Indicator */}
            {indicatorStyle.width > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "6px",
                  bottom: "6px",
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                  borderRadius: "7px",
                  backgroundColor: isDarkMode ? "#121214" : "#FFFFFF",
                  border: "1.5px solid #B6A47E",
                  boxShadow: isDarkMode
                    ? "0 4px 14px rgba(0,0,0,0.6)"
                    : "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "left 0.35s cubic-bezier(0.16, 1, 0.3, 1), width 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              />
            )}

            {[
              { id: "categories", label: `CATEGORIES (${categories.length})` },
              { id: "collections", label: `FOCUS ON COLLECTIONS (${collections.length})` },
              { id: "sort", label: `SORT BY OPTIONS (${sortOptions.length})` },
              { id: "journals", label: `JOURNAL ARTICLES (${journals.length})` },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[tab.id] = el; }}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "10px 20px",
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    borderRadius: "7px",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    color: isActive
                      ? "#B6A47E"
                      : isDarkMode
                      ? "#8A8A8A"
                      : "#4B5563",
                    transition: "color 0.3s ease, transform 0.3s ease",
                    transform: isActive ? "scale(1.02)" : "scale(1)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = isDarkMode ? "#FFFFFF" : "#0A0A0A";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = isDarkMode ? "#8A8A8A" : "#4B5563";
                    }
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content & Action Bar */}
          <div style={{ marginTop: "24px", marginBottom: "24px" }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.15em",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className={`uppercase font-bold ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
            >
              {activeTab === "categories" && "Manage product categories visible in Shop filters & Navbar menu."}
              {activeTab === "collections" && "Manage Focus On collections featured in Navbar dropdown."}
              {activeTab === "sort" && "Manage Sort By filter options in the Shop page drawer."}
              {activeTab === "journals" && "Manage publication articles, stories, and editorial posts."}
            </p>
            <button
              onClick={openAddModal}
              style={{ padding: "12px 28px" }}
              className={`group inline-flex items-center justify-center font-bold text-xs tracking-[0.15em] uppercase rounded-[6px] transition-all duration-200 cursor-pointer shrink-0 gap-2.5 shadow-sm ${
                isDarkMode
                  ? "bg-[#B6A47E] text-[#0A0A0A] hover:bg-[#a3926d]"
                  : "bg-[#0A0A0A] text-white hover:bg-[#222222]"
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5] shrink-0 transition-transform duration-300 group-hover:rotate-90" />
              <span>ADD NEW {activeTab.toUpperCase().slice(0, -1)}</span>
            </button>
          </div>

          {/* TABLE CONTROL BAR: SEARCH & ROW LIMIT */}
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
            <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
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
                placeholder={`Cari data ${activeTab.toUpperCase()}...`}
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
                <option value={5}>5 BARIS</option>
                <option value={10}>10 BARIS</option>
                <option value={25}>25 BARIS</option>
                <option value={50}>50 BARIS</option>
                <option value={0}>SEMUA DATA</option>
              </select>
            </div>
          </div>

          {/* CATEGORIES TABLE */}
          {activeTab === "categories" && (
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
                      <th style={{ padding: "18px 24px" }} className="font-bold">ID</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">CATEGORY NAME</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">SLUG</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">DESCRIPTION</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"}`}>
                    {loadingCats ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "48px 24px" }} className={`text-center ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Loading categories...</td>
                      </tr>
                    ) : displayedCats.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "48px 24px" }} className={`text-center ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Tidak ada kategori yang sesuai dengan pencarian.</td>
                      </tr>
                    ) : (
                      displayedCats.map((cat: CategoryItem) => (
                        <tr key={cat.id} className={`transition-colors ${isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"}`}>
                          <td style={{ padding: "20px 24px" }} className="font-mono font-bold">{cat.id}</td>
                          <td style={{ padding: "20px 24px" }} className={`font-bold ${isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"}`}>{cat.name}</td>
                          <td style={{ padding: "20px 24px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>{cat.slug}</td>
                          <td style={{ padding: "20px 24px" }} className={`max-w-xs truncate ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>{cat.description || "—"}</td>
                          <td style={{ padding: "20px 24px" }} className="text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => openEditModal(cat)}
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
                                  confirmDelete(cat.name, () => deleteCategoryMut.mutate(cat.id));
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
          )}

          {/* COLLECTIONS TABLE */}
          {activeTab === "collections" && (
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
                      <th style={{ padding: "18px 24px" }} className="font-bold">ID</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">COLLECTION NAME</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">CODE / TAG</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">SLUG</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"}`}>
                    {loadingCols ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "48px 24px" }} className={`text-center ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Loading collections...</td>
                      </tr>
                    ) : displayedCols.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "48px 24px" }} className={`text-center ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Tidak ada koleksi yang sesuai dengan pencarian.</td>
                      </tr>
                    ) : (
                      displayedCols.map((col: CollectionItem) => (
                        <tr key={col.id} className={`transition-colors ${isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"}`}>
                          <td style={{ padding: "20px 24px" }} className="font-mono font-bold">{col.id}</td>
                          <td style={{ padding: "20px 24px" }} className={`font-bold ${isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"}`}>{col.name}</td>
                          <td style={{ padding: "20px 24px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>{col.code || col.name}</td>
                          <td style={{ padding: "20px 24px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>{col.slug}</td>
                          <td style={{ padding: "20px 24px" }} className="text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => openEditModal(col)}
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
                                  confirmDelete(col.name, () => deleteCollectionMut.mutate(col.id));
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
          )}

          {/* SORT OPTIONS TABLE */}
          {activeTab === "sort" && (
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
                      <th style={{ padding: "18px 24px" }} className="font-bold">OPTION NAME</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">SORT CODE</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"}`}>
                    {loadingSorts ? (
                      <tr>
                        <td colSpan={4} style={{ padding: "48px 24px" }} className={`text-center ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Loading sort options...</td>
                      </tr>
                    ) : displayedSorts.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: "48px 24px" }} className={`text-center ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Tidak ada opsi sort yang sesuai dengan pencarian.</td>
                      </tr>
                    ) : (
                      displayedSorts.map((sort: SortOptionItem) => (
                        <tr key={sort.id} className={`transition-colors ${isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"}`}>
                          <td style={{ padding: "20px 24px" }} className="font-mono font-bold">{sort.sort_order ?? 0}</td>
                          <td style={{ padding: "20px 24px" }} className={`font-bold ${isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"}`}>{sort.name}</td>
                          <td style={{ padding: "20px 24px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>{sort.code}</td>
                          <td style={{ padding: "20px 24px" }} className="text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => openEditModal(sort)}
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
                                  confirmDelete(sort.name, () => deleteSortMut.mutate(sort.id));
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
          )}

          {/* JOURNALS TABLE */}
          {activeTab === "journals" && (
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
                      <th style={{ padding: "18px 24px" }} className="font-bold">ID</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">TITLE</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">CATEGORY</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">ISSUE</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold">SUMMARY</th>
                      <th style={{ padding: "18px 24px" }} className="font-bold text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"}`}>
                    {loadingJournals ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "48px 24px" }} className={`text-center ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Loading journal articles...</td>
                      </tr>
                    ) : displayedCatJournals.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "48px 24px" }} className={`text-center ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>Tidak ada artikel jurnal yang sesuai dengan pencarian.</td>
                      </tr>
                    ) : (
                      displayedCatJournals.map((art: JournalArticle) => (
                        <tr key={art.id} className={`transition-colors ${isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"}`}>
                          <td style={{ padding: "20px 24px" }} className="font-mono font-bold">{art.id}</td>
                          <td style={{ padding: "20px 24px" }} className={`font-bold ${isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"}`}>{art.title}</td>
                          <td style={{ padding: "20px 24px" }} className="font-semibold text-[#B6A47E]">{art.category}</td>
                          <td style={{ padding: "20px 24px" }} className={`font-mono ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>{art.issue || "—"}</td>
                          <td style={{ padding: "20px 24px" }} className={`max-w-xs truncate ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>{art.summary || "—"}</td>
                          <td style={{ padding: "20px 24px" }} className="text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => openEditModal(art)}
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
                                  confirmDelete(art.title, () => deleteJournalMut.mutate(art.id));
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
          )}
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
                <SlidersHorizontal style={{ width: "18px", height: "18px" }} />
                <span>{modalMode === "add" ? "ADD NEW" : "EDIT"} {activeTab.toUpperCase().slice(0, -1)}</span>
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
                    color: errors.name ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                  }}
                >
                  TITLE / NAME *
                </label>
                <input
                  id="field-name"
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g. Outerwear Collection"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    outline: "none",
                    textTransform: "uppercase",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: errors.name ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                />
                {errors.name && (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {errors.name}
                  </p>
                )}
              </div>

              {activeTab === "journals" && (
                <>
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
                      CATEGORY *
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
                        cursor: "pointer",
                        backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                        color: isDarkMode ? "#ffffff" : "#0A0A0A",
                      }}
                    >
                      <option value="Collection Stories">Collection Stories</option>
                      <option value="Brand Philosophy">Brand Philosophy</option>
                      <option value="Materials & Craftsmanship">Materials & Craftsmanship</option>
                      <option value="Campaign">Campaign</option>
                      <option value="Archive">Archive</option>
                    </select>
                  </div>

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
                      ISSUE / VOL (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={formIssue}
                      onChange={(e) => setFormIssue(e.target.value)}
                      placeholder="e.g. VOL. 01"
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
                      UPLOAD ITEM / COVER IMAGE *
                    </label>
                    <div
                      id="field-image"
                      tabIndex={-1}
                      style={{
                        border: errors.image ? "2px dashed #EF4444" : (isDarkMode ? "2px dashed rgba(255, 255, 255, 0.2)" : "2px dashed #D1D5DB"),
                        borderRadius: "8px",
                        padding: "20px",
                        textAlign: "center",
                        backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => document.getElementById("catalogImageInput")?.click()}
                    >
                      <input
                        type="file"
                        id="catalogImageInput"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          handleImageFileChange(e, setFormImage);
                          if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
                        }}
                      />
                      {formImage ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                          <img
                            src={formImage}
                            alt="Preview"
                            style={{ maxHeight: "140px", borderRadius: "6px", objectFit: "cover", border: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E5E7EB" }}
                          />
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: "#B6A47E",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Upload style={{ width: "14px", height: "14px" }} />
                            CLICK TO CHANGE PHOTO
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <Upload style={{ width: "24px", height: "24px", color: errors.image ? "#EF4444" : "#B6A47E" }} />
                          <span style={{ fontSize: "12px", fontWeight: 600, color: errors.image ? "#EF4444" : (isDarkMode ? "#EEEEEE" : "#374151") }}>
                            CLICK OR DRAG PHOTO TO UPLOAD
                          </span>
                        </div>
                      )}
                    </div>
                    {errors.image ? (
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
                        color: isDarkMode ? "#CCCCCC" : "#374151",
                      }}
                    >
                      EDITORIAL QUOTE (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={formQuote}
                      onChange={(e) => setFormQuote(e.target.value)}
                      placeholder="e.g. True luxury is found in permanence..."
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
                </>
              )}

              {(activeTab === "collections" || activeTab === "sort") && (
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
                    CODE / TAG
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. PRICE_ASC or ZESTY"
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
              )}

              {(activeTab === "sort" || activeTab === "journals") && (
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
                    SORT ORDER
                  </label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "13px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      outline: "none",
                      backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                      border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                      color: isDarkMode ? "#ffffff" : "#0A0A0A",
                    }}
                  />
                </div>
              )}

              {(activeTab === "categories" || activeTab === "collections" || activeTab === "journals") && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: errors.description ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                    }}
                  >
                    {activeTab === "journals" ? "SUMMARY / DESCRIPTION *" : "DESCRIPTION *"}
                  </label>
                  <textarea
                    id="field-description"
                    rows={3}
                    value={formDescription}
                    onChange={(e) => {
                      setFormDescription(e.target.value);
                      if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                    }}
                    placeholder="Summary text..."
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "13px",
                      fontWeight: 500,
                      borderRadius: "6px",
                      outline: "none",
                      backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                      border: errors.description ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                      color: isDarkMode ? "#ffffff" : "#0A0A0A",
                    }}
                  />
                  {errors.description && (
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                      * {errors.description}
                    </p>
                  )}
                </div>
              )}

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
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 28px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    backgroundColor: "#B6A47E",
                    border: "none",
                    color: "#0A0A0A",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    opacity: isSubmitting ? 0.75 : 1,
                  }}
                  className="flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <span>SAVE CHANGES</span>
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
