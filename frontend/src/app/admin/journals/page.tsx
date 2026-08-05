"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
  uploadAdminImage,
  JournalArticle,
} from "@/utils/api";
import { BookOpen, Plus, X, Pencil, Trash2, Upload, Search, Filter } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminJournalsPage() {
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
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [rowLimit, setRowLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, rowLimit]);

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
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Collection Stories");
  const [formIssue, setFormIssue] = useState("VOL. 01");
  const [formSummary, setFormSummary] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState("");
  const [formQuote, setFormQuote] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formTitle.trim()) {
      newErrors.title = "Judul artikel wajib diisi!";
    }
    if (!formCategory.trim()) {
      newErrors.category = "Kategori artikel wajib dipilih!";
    }
    if (!formImage.trim() && !formImageFile) {
      newErrors.image = "Foto sampul artikel wajib diunggah!";
    }
    if (!formSummary.trim()) {
      newErrors.summary = "Ringkasan artikel wajib diisi!";
    }
    if (!formContent.trim()) {
      newErrors.content = "Konten utama artikel wajib diisi!";
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

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ["journals"],
    queryFn: () => getJournals(),
    refetchInterval: 5000,
  });

  const addJournalMut = useMutation({
    mutationFn: createJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      closeModal();
      showStatus("Journal article published successfully!");
    },
  });

  const updateJournalMut = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<JournalArticle> }) =>
      updateJournal(id, data),
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

  const showStatus = (msg: string) => {
    showSuccessAlert(msg);
  };

  const openAddModal = () => {
    setErrors({});
    setModalMode("add");
    setSelectedArticle(null);
    setFormTitle("");
    setFormCategory("Collection Stories");
    setFormIssue("VOL. 01");
    setFormSummary("");
    setFormImage("");
    setFormImageFile(null);
    setFormImagePreview("");
    setFormQuote("");
    setFormContent("");
    setFormSortOrder(0);
  };

  const openEditModal = (article: JournalArticle) => {
    setErrors({});
    setModalMode("edit");
    setSelectedArticle(article);
    setFormTitle(article.title || "");
    setFormCategory(article.category || "Collection Stories");
    setFormIssue(article.issue || "VOL. 01");
    setFormSummary(article.summary || "");
    setFormImage(article.image || "");
    setFormImageFile(null);
    setFormImagePreview(article.image ? `http://brand.test${article.image}` : "");
    setFormQuote(article.quote || "");
    setFormContent(
      Array.isArray(article.content) ? article.content.join("\n\n") : article.content || ""
    );
    setFormSortOrder(article.sort_order ?? 0);
  };

  const closeModal = () => {
    setErrors({});
    setModalMode(null);
    setSelectedArticle(null);
    setFormImageFile(null);
    setFormImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUploading(true);
    try {
      let finalImage = formImage;

      if (formImageFile) {
        finalImage = await uploadAdminImage(formImageFile, "journals");
      }

      const payload = {
        title: formTitle,
        category: formCategory,
        issue: formIssue,
        summary: formSummary,
        image: finalImage,
        quote: formQuote,
        content: formContent.split("\n\n").filter(Boolean),
        sort_order: formSortOrder,
      };

      if (modalMode === "add") {
        addJournalMut.mutate(payload);
      } else if (modalMode === "edit" && selectedArticle) {
        updateJournalMut.mutate({ id: selectedArticle.id, data: payload });
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

  const filteredJournals = journals.filter((article) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      article.title.toLowerCase().includes(q) ||
      (article.category || "").toLowerCase().includes(q) ||
      (article.issue || "").toLowerCase().includes(q) ||
      (article.summary || "").toLowerCase().includes(q);

    const matchesCategory =
      categoryFilter === "ALL" || article.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const currentTotal = filteredJournals.length;
  const pageSize = rowLimit > 0 ? rowLimit : currentTotal;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(currentTotal / pageSize)) : 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = rowLimit > 0 ? Math.min(startIndex + pageSize, currentTotal) : currentTotal;

  const displayedJournals = filteredJournals.slice(startIndex, endIndex);

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col lg:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
      }`}
    >
      <AdminSidebar activeTab="journals" isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="KELOLA ARTIKEL JURNAL"
          subtitle="Manajemen publikasi artikel, cerita brand, dan jurnal editorial"
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
            <h2
              style={{
                fontSize: "11px",
                letterSpacing: "0.22em",
                fontWeight: 700,
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
            >
              {filteredJournals.length} ARTIKEL JURNAL DITEMUKAN ({journals.length} TOTAL)
            </h2>
            <button
              onClick={openAddModal}
              style={{ padding: "12px 28px" }}
              className={`group rounded-[6px] text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm ${
                isDarkMode
                  ? "bg-[#B6A47E] text-[#0A0A0A] hover:bg-[#a3926d]"
                  : "bg-[#0A0A0A] text-white hover:bg-[#222222]"
              }`}
            >
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              <span>TAMBAH ARTIKEL JURNAL</span>
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
                  placeholder="Cari Judul Artikel, Volume, Summary..."
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

              {/* Category Filter Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                    textTransform: "uppercase",
                    cursor: "pointer",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                    color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                  }}
                >
                  <option value="ALL">SEMUA KATEGORI</option>
                  <option value="Collection Stories">Collection Stories</option>
                  <option value="Brand Philosophy">Brand Philosophy</option>
                  <option value="Materials & Craftsmanship">Materials & Craftsmanship</option>
                  <option value="Campaign">Campaign</option>
                  <option value="Archive">Archive</option>
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
                <option value={5}>5 BARIS</option>
                <option value={10}>10 BARIS</option>
                <option value={25}>25 BARIS</option>
                <option value={50}>50 BARIS</option>
                <option value={0}>SEMUA ({filteredJournals.length})</option>
              </select>
            </div>
          </div>

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
                    <th style={{ padding: "18px 24px" }} className="font-bold">NO.</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">ARTICLE TITLE</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">CATEGORY</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">ISSUE / VOL</th>
                    <th style={{ padding: "18px 24px" }} className="font-bold">SUMMARY</th>
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
                        colSpan={6}
                        style={{ padding: "48px 24px" }}
                        className={`text-center ${
                          isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
                        }`}
                      >
                        Loading journal articles...
                      </td>
                    </tr>
                  ) : displayedJournals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ padding: "48px 24px" }}
                        className={`text-center ${
                          isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
                        }`}
                      >
                        Tidak ada artikel jurnal yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    displayedJournals.map((art, idx) => (
                      <tr
                        key={art.id}
                        className={`transition-colors ${
                          isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"
                        }`}
                      >
                        <td style={{ padding: "20px 24px" }} className={`font-mono font-bold ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>{startIndex + idx + 1}</td>
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`font-bold ${
                            isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                          }`}
                        >
                          {art.title}
                        </td>
                        <td style={{ padding: "20px 24px" }} className="font-semibold text-[#B6A47E]">
                          {art.category}
                        </td>
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`font-mono ${
                            isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                          }`}
                        >
                          {art.issue || "—"}
                        </td>
                        <td
                          style={{ padding: "20px 24px" }}
                          className={`max-w-xs truncate ${
                            isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"
                          }`}
                        >
                          {art.summary || "—"}
                        </td>
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
              maxWidth: "640px",
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
                <BookOpen style={{ width: "18px", height: "18px" }} />
                <span>{modalMode === "add" ? "WRITE NEW ARTICLE" : "EDIT ARTICLE"}</span>
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
                    color: errors.title ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                  }}
                >
                  ARTICLE TITLE *
                </label>
                <input
                  id="field-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  placeholder="e.g. The Origin of Sector 001"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    outline: "none",
                    textTransform: "uppercase",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: errors.title ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                />
                {errors.title && (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {errors.title}
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
                    color: errors.category ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                  }}
                >
                  CATEGORY *
                </label>
                <select
                  id="field-category"
                  value={formCategory}
                  onChange={(e) => {
                    setFormCategory(e.target.value);
                    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                  }}
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
                    border: errors.category ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                >
                  <option value="Collection Stories">Collection Stories</option>
                  <option value="Brand Philosophy">Brand Philosophy</option>
                  <option value="Materials & Craftsmanship">Materials & Craftsmanship</option>
                  <option value="Campaign">Campaign</option>
                  <option value="Archive">Archive</option>
                </select>
                {errors.category && (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {errors.category}
                  </p>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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
                    ISSUE / VOL
                  </label>
                  <input
                    type="text"
                    value={formIssue}
                    onChange={(e) => setFormIssue(e.target.value)}
                    placeholder="VOL. 01"
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
                      color: isDarkMode ? "#CCCCCC" : "#374151",
                    }}
                  >
                    SORT ORDER (URUTAN TAMPIL)
                  </label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => setFormSortOrder(Math.max(0, formSortOrder - 1))}
                      style={{
                        width: "42px",
                        height: "44px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: 700,
                        borderRadius: "6px 0 0 6px",
                        cursor: "pointer",
                        backgroundColor: isDarkMode ? "#1E1E22" : "#F3F4F6",
                        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                        color: isDarkMode ? "#CCCCCC" : "#374151",
                        transition: "all 0.15s ease",
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#B6A47E"; e.currentTarget.style.color = "#0A0A0A"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? "#1E1E22" : "#F3F4F6"; e.currentTarget.style.color = isDarkMode ? "#CCCCCC" : "#374151"; }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={formSortOrder}
                      onChange={(e) => setFormSortOrder(Math.max(0, Number(e.target.value)))}
                      style={{
                        flex: 1,
                        height: "44px",
                        padding: "0 12px",
                        fontSize: "15px",
                        fontWeight: 800,
                        textAlign: "center",
                        outline: "none",
                        backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                        borderTop: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                        borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                        borderLeft: "none",
                        borderRight: "none",
                        color: "#B6A47E",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormSortOrder(formSortOrder + 1)}
                      style={{
                        width: "42px",
                        height: "44px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: 700,
                        borderRadius: "0 6px 6px 0",
                        cursor: "pointer",
                        backgroundColor: isDarkMode ? "#1E1E22" : "#F3F4F6",
                        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                        color: isDarkMode ? "#CCCCCC" : "#374151",
                        transition: "all 0.15s ease",
                        userSelect: "none",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#B6A47E"; e.currentTarget.style.color = "#0A0A0A"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? "#1E1E22" : "#F3F4F6"; e.currentTarget.style.color = isDarkMode ? "#CCCCCC" : "#374151"; }}
                    >
                      +
                    </button>
                  </div>
                  <p style={{ fontSize: "10px", fontWeight: 600, color: isDarkMode ? "#8A8A8A" : "#6B7280", marginTop: "2px" }}>
                    * Angka lebih kecil akan tampil lebih dulu. 0 = urutan default
                  </p>
                </div>
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
                  UPLOAD ARTICLE COVER IMAGE *
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
                  onClick={() => document.getElementById("journalImageInput")?.click()}
                >
                  <input
                    type="file"
                    id="journalImageInput"
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
                      setFormImage("pending-upload");
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
                    color: errors.summary ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                  }}
                >
                  ARTICLE SUMMARY *
                </label>
                <textarea
                  id="field-summary"
                  rows={2}
                  value={formSummary}
                  onChange={(e) => {
                    setFormSummary(e.target.value);
                    if (errors.summary) setErrors((prev) => ({ ...prev, summary: "" }));
                  }}
                  placeholder="Short summary of the story..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderRadius: "6px",
                    outline: "none",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: errors.summary ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                />
                {errors.summary && (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {errors.summary}
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
                    color: errors.content ? "#EF4444" : (isDarkMode ? "#CCCCCC" : "#374151"),
                  }}
                >
                  FULL CONTENT PARAGRAPHS * (SEPARATE BY DOUBLE NEWLINES)
                </label>
                <textarea
                  id="field-content"
                  rows={4}
                  value={formContent}
                  onChange={(e) => {
                    setFormContent(e.target.value);
                    if (errors.content) setErrors((prev) => ({ ...prev, content: "" }));
                  }}
                  placeholder="First paragraph text...\n\nSecond paragraph text..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderRadius: "6px",
                    outline: "none",
                    backgroundColor: isDarkMode ? "#121214" : "#ffffff",
                    border: errors.content ? "1.5px solid #EF4444" : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB"),
                    color: isDarkMode ? "#ffffff" : "#0A0A0A",
                  }}
                />
                {errors.content && (
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#EF4444", marginTop: "2px" }}>
                    * {errors.content}
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
                  HIGHLIGHT EDITORIAL QUOTE
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
                  disabled={isUploading || addJournalMut.isPending || updateJournalMut.isPending}
                  style={{
                    padding: "10px 28px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    cursor: isUploading || addJournalMut.isPending || updateJournalMut.isPending ? "not-allowed" : "pointer",
                    backgroundColor: "#B6A47E",
                    border: "none",
                    color: "#0A0A0A",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    opacity: isUploading || addJournalMut.isPending || updateJournalMut.isPending ? 0.5 : 1,
                  }}
                >
                  {isUploading ? "UPLOADING..." : addJournalMut.isPending || updateJournalMut.isPending ? "SAVING..." : "PUBLISH ARTICLE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
