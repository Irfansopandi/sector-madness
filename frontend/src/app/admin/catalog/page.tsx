"use client";

import { useState } from "react";
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

export default function AdminCatalogPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"categories" | "collections" | "sort" | "journals">("categories");

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

  // Queries
  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: collections = [], isLoading: loadingCols } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });

  const { data: sortOptions = [], isLoading: loadingSorts } = useQuery({
    queryKey: ["sortOptions"],
    queryFn: getSortOptions,
  });

  const { data: journals = [], isLoading: loadingJournals } = useQuery({
    queryKey: ["journals"],
    queryFn: () => getJournals(),
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

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedItem(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormSortOrder(0);
    setFormIssue("VOL. 01");
    setFormCategory("Collection Stories");
    setFormImage("/images/campaign/campaign-1.png");
    setFormQuote("");
  };

  const openEditModal = (item: any) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormName(item.name || item.title || "");
    setFormCode(item.code || "");
    setFormDescription(item.description || item.summary || "");
    setFormSortOrder(item.sort_order ?? 0);
    setFormIssue(item.issue || "VOL. 01");
    setFormCategory(item.category || "Collection Stories");
    setFormImage(item.image || "/images/campaign/campaign-1.png");
    setFormQuote(item.quote || "");
  };

  const closeModal = () => {
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
    if (!formName.trim()) return;

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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F9F9F9] font-[family-name:var(--font-body)]">
      <AdminSidebar activeTab="catalog" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="CATALOG & CATEGORIES MANAGEMENT"
          subtitle="Manage product categories, Focus On collections, and shop sort filters"
        />

        <main className="px-6 py-8 md:px-8 md:py-10 w-full max-w-[1400px] mx-auto">

          {/* Toast Alert */}
          {statusMessage && (
            <div className="mb-6 p-4 bg-[#0A0A0A] text-white text-xs tracking-wider uppercase font-semibold flex items-center justify-between">
              <span>{statusMessage}</span>
              <button onClick={() => setStatusMessage("")} className="text-white opacity-70 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-4 mb-8 border-b border-[#EEEEEE]">
            {[
              { id: "categories", label: `CATEGORIES (${categories.length})` },
              { id: "collections", label: `FOCUS ON COLLECTIONS (${collections.length})` },
              { id: "sort", label: `SORT BY OPTIONS (${sortOptions.length})` },
              { id: "journals", label: `JOURNAL ARTICLES (${journals.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs md:text-sm tracking-[0.15em] font-bold uppercase transition-colors border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? "border-[#0A0A0A] text-[#0A0A0A]"
                    : "border-transparent text-[#888888] hover:text-[#0A0A0A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content & Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-xs tracking-wider uppercase text-[#666666]">
              {activeTab === "categories" && "Manage product categories visible in Shop filters & Navbar menu."}
              {activeTab === "collections" && "Manage Focus On collections featured in Navbar dropdown."}
              {activeTab === "sort" && "Manage Sort By filter options in the Shop page drawer."}
              {activeTab === "journals" && "Manage publication articles, stories, and editorial posts."}
            </p>
            <button
              onClick={openAddModal}
              className="bg-[#0A0A0A] text-white px-5 py-2.5 text-xs tracking-[0.15em] font-bold uppercase hover:bg-[#222222] transition-colors cursor-pointer"
            >
              + ADD NEW {activeTab.toUpperCase().slice(0, -1)}
            </button>
          </div>

          {/* CATEGORIES TABLE */}
          {activeTab === "categories" && (
            <div className="border border-[#E5E5E5] overflow-x-auto">
              <table className="w-full text-left text-xs uppercase tracking-wider">
                <thead className="bg-[#F8F8F8] border-b border-[#E5E5E5] text-[#555555]">
                  <tr>
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 font-bold">CATEGORY NAME</th>
                    <th className="p-4 font-bold">SLUG</th>
                    <th className="p-4 font-bold">DESCRIPTION</th>
                    <th className="p-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {loadingCats ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#888888]">Loading categories...</td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#888888]">No categories found. Click "+ ADD NEW" to create one.</td>
                    </tr>
                  ) : (
                    categories.map((cat: CategoryItem) => (
                      <tr key={cat.id} className="hover:bg-[#FAFAFA]">
                        <td className="p-4 font-mono font-bold">{cat.id}</td>
                        <td className="p-4 font-bold text-[#0A0A0A]">{cat.name}</td>
                        <td className="p-4 font-mono text-[#666666]">{cat.slug}</td>
                        <td className="p-4 text-[#777777] max-w-xs truncate">{cat.description || "—"}</td>
                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="font-bold text-[#0A0A0A] hover:underline cursor-pointer"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                deleteCategoryMut.mutate(cat.id);
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
          )}

          {/* COLLECTIONS TABLE */}
          {activeTab === "collections" && (
            <div className="border border-[#E5E5E5] overflow-x-auto">
              <table className="w-full text-left text-xs uppercase tracking-wider">
                <thead className="bg-[#F8F8F8] border-b border-[#E5E5E5] text-[#555555]">
                  <tr>
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 font-bold">COLLECTION NAME</th>
                    <th className="p-4 font-bold">CODE / TAG</th>
                    <th className="p-4 font-bold">SLUG</th>
                    <th className="p-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {loadingCols ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#888888]">Loading collections...</td>
                    </tr>
                  ) : collections.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#888888]">No collections found. Click "+ ADD NEW" to create one.</td>
                    </tr>
                  ) : (
                    collections.map((col: CollectionItem) => (
                      <tr key={col.id} className="hover:bg-[#FAFAFA]">
                        <td className="p-4 font-mono font-bold">{col.id}</td>
                        <td className="p-4 font-bold text-[#0A0A0A]">{col.name}</td>
                        <td className="p-4 font-mono text-[#666666]">{col.code || col.name}</td>
                        <td className="p-4 font-mono text-[#666666]">{col.slug}</td>
                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => openEditModal(col)}
                            className="font-bold text-[#0A0A0A] hover:underline cursor-pointer"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete collection "${col.name}"?`)) {
                                deleteCollectionMut.mutate(col.id);
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
          )}

          {/* SORT OPTIONS TABLE */}
          {activeTab === "sort" && (
            <div className="border border-[#E5E5E5] overflow-x-auto">
              <table className="w-full text-left text-xs uppercase tracking-wider">
                <thead className="bg-[#F8F8F8] border-b border-[#E5E5E5] text-[#555555]">
                  <tr>
                    <th className="p-4 font-bold">SORT ORDER</th>
                    <th className="p-4 font-bold">OPTION NAME</th>
                    <th className="p-4 font-bold">SORT CODE</th>
                    <th className="p-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {loadingSorts ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#888888]">Loading sort options...</td>
                    </tr>
                  ) : sortOptions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#888888]">No sort options found. Click "+ ADD NEW" to create one.</td>
                    </tr>
                  ) : (
                    sortOptions.map((sort: SortOptionItem) => (
                      <tr key={sort.id} className="hover:bg-[#FAFAFA]">
                        <td className="p-4 font-mono font-bold">{sort.sort_order ?? 0}</td>
                        <td className="p-4 font-bold text-[#0A0A0A]">{sort.name}</td>
                        <td className="p-4 font-mono text-[#666666]">{sort.code}</td>
                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => openEditModal(sort)}
                            className="font-bold text-[#0A0A0A] hover:underline cursor-pointer"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete sort option "${sort.name}"?`)) {
                                deleteSortMut.mutate(sort.id);
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
          )}

          {/* JOURNALS TABLE */}
          {activeTab === "journals" && (
            <div className="border border-[#E5E5E5] overflow-x-auto">
              <table className="w-full text-left text-xs uppercase tracking-wider">
                <thead className="bg-[#F8F8F8] border-b border-[#E5E5E5] text-[#555555]">
                  <tr>
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 font-bold">TITLE</th>
                    <th className="p-4 font-bold">CATEGORY</th>
                    <th className="p-4 font-bold">ISSUE</th>
                    <th className="p-4 font-bold">SUMMARY</th>
                    <th className="p-4 font-bold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {loadingJournals ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#888888]">Loading journal articles...</td>
                    </tr>
                  ) : journals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#888888]">No journal articles found. Click "+ ADD NEW" to create one.</td>
                    </tr>
                  ) : (
                    journals.map((art: JournalArticle) => (
                      <tr key={art.id} className="hover:bg-[#FAFAFA]">
                        <td className="p-4 font-mono font-bold">{art.id}</td>
                        <td className="p-4 font-bold text-[#0A0A0A]">{art.title}</td>
                        <td className="p-4 font-semibold text-[#B6A47E]">{art.category}</td>
                        <td className="p-4 font-mono text-[#666666]">{art.issue || "—"}</td>
                        <td className="p-4 text-[#777777] max-w-xs truncate">{art.summary || "—"}</td>
                        <td className="p-4 text-right space-x-3">
                          <button
                            onClick={() => openEditModal(art)}
                            className="font-bold text-[#0A0A0A] hover:underline cursor-pointer"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete article "${art.title}"?`)) {
                                deleteJournalMut.mutate(art.id);
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
          )}
        </main>

      {/* MODAL FORM */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md p-6 border border-[#E5E5E5] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#EEEEEE]">
              <h3 className="text-sm font-bold tracking-wider uppercase text-[#0A0A0A]">
                {modalMode === "add" ? "ADD NEW" : "EDIT"} {activeTab.toUpperCase().slice(0, -1)}
              </h3>
              <button onClick={closeModal} className="text-xs font-bold uppercase text-[#777777] hover:text-[#0A0A0A]">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                  TITLE / NAME *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. The Origin of Sector 001"
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none uppercase font-semibold"
                />
              </div>

              {activeTab === "journals" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                      CATEGORY *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-semibold uppercase bg-white"
                    >
                      <option value="Collection Stories">Collection Stories</option>
                      <option value="Brand Philosophy">Brand Philosophy</option>
                      <option value="Materials & Craftsmanship">Materials & Craftsmanship</option>
                      <option value="Campaign">Campaign</option>
                      <option value="Archive">Archive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                      ISSUE / VOL (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={formIssue}
                      onChange={(e) => setFormIssue(e.target.value)}
                      placeholder="e.g. VOL. 01"
                      className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-semibold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                      IMAGE PATH / URL
                    </label>
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="/images/campaign/campaign-1.png"
                      className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                      EDITORIAL QUOTE (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      value={formQuote}
                      onChange={(e) => setFormQuote(e.target.value)}
                      placeholder="e.g. True luxury is found in permanence..."
                      className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-medium"
                    />
                  </div>
                </>
              )}

              {(activeTab === "collections" || activeTab === "sort") && (
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                    CODE / TAG
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. PRICE_ASC or ZESTY"
                    className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none uppercase font-semibold"
                  />
                </div>
              )}

              {(activeTab === "sort" || activeTab === "journals") && (
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
              )}

              {(activeTab === "categories" || activeTab === "collections" || activeTab === "journals") && (
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                    {activeTab === "journals" ? "SUMMARY / DESCRIPTION" : "DESCRIPTION"}
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Summary text..."
                    className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-medium"
                  />
                </div>
              )}

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
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
