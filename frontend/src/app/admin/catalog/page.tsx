"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getCategories, createCategory, updateCategory, deleteCategory, CategoryItem,
  getCollections, createCollection, updateCollection, deleteCollection, CollectionItem,
  getSortOptions, createSortOption, updateSortOption, deleteSortOption, SortOptionItem,
} from "@/utils/api";

export default function AdminCatalogPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"categories" | "collections" | "sort">("categories");

  // Modal / Form state
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
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

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const openAddModal = () => {
    setSelectedItem(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormSortOrder(0);
    setModalMode("add");
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormName(item.name || "");
    setFormCode(item.code || "");
    setFormDescription(item.description || "");
    setFormSortOrder(item.sort_order || 0);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedItem(null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormSortOrder(0);
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
    }
  };

  return (
    <div className="bg-[#FFFFFF] text-[#0A0A0A] min-h-screen flex flex-col font-[family-name:var(--font-body)]">
      <Navbar mode="light" activeLink="ADMIN" />

      <main className="flex-1" style={{ paddingTop: "120px", paddingBottom: "120px" }}>
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 w-full">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5E5E5]">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#777777] font-semibold block mb-1">
                ADMIN CONTROL CENTER
              </span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase text-[#0A0A0A]">
                SHOP FILTERS & CATEGORIES MANAGEMENT
              </h1>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-[0.15em] font-semibold px-4 py-2 border border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white transition-colors"
            >
              VIEW LIVE SHOP →
            </Link>
          </div>

          {/* Toast Alert */}
          {statusMessage && (
            <div className="mb-6 p-4 bg-[#0A0A0A] text-white text-xs tracking-wider uppercase font-semibold flex items-center justify-between">
              <span>{statusMessage}</span>
              <button onClick={() => setStatusMessage("")} className="text-white opacity-70 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 mb-8 border-b border-[#EEEEEE]">
            {[
              { id: "categories", label: `CATEGORIES (${categories.length})` },
              { id: "collections", label: `FOCUS ON COLLECTIONS (${collections.length})` },
              { id: "sort", label: `SORT BY OPTIONS (${sortOptions.length})` },
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
        </div>
      </main>

      {/* MODAL FORM */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md p-6 border border-[#E5E5E5] shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#EEEEEE]">
              <h3 className="text-sm font-bold tracking-wider uppercase text-[#0A0A0A]">
                {modalMode === "add" ? "ADD NEW" : "EDIT"} {activeTab.toUpperCase().slice(0, -1)}
              </h3>
              <button onClick={closeModal} className="text-xs font-bold uppercase text-[#777777] hover:text-[#0A0A0A]">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                  NAME *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. OUTERWEAR"
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none uppercase font-semibold"
                />
              </div>

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

              {activeTab === "sort" && (
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

              {(activeTab === "categories" || activeTab === "collections") && (
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Optional description..."
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

      <Footer />
    </div>
  );
}
