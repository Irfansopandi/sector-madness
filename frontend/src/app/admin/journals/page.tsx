"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
  JournalArticle,
} from "@/utils/api";

export default function AdminJournalsPage() {
  const queryClient = useQueryClient();

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Collection Stories");
  const [formIssue, setFormIssue] = useState("VOL. 01");
  const [formSummary, setFormSummary] = useState("");
  const [formImage, setFormImage] = useState("/images/campaign/campaign-1.png");
  const [formQuote, setFormQuote] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState("");

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ["journals"],
    queryFn: () => getJournals(),
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
    mutationFn: ({ id, data }: { id: number | string; data: any }) =>
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
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(""), 4000);
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedArticle(null);
    setFormTitle("");
    setFormCategory("Collection Stories");
    setFormIssue("VOL. 01");
    setFormSummary("");
    setFormImage("/images/campaign/campaign-1.png");
    setFormQuote("");
    setFormContent("");
    setFormSortOrder(0);
  };

  const openEditModal = (article: JournalArticle) => {
    setModalMode("edit");
    setSelectedArticle(article);
    setFormTitle(article.title || "");
    setFormCategory(article.category || "Collection Stories");
    setFormIssue(article.issue || "VOL. 01");
    setFormSummary(article.summary || "");
    setFormImage(article.image || "/images/campaign/campaign-1.png");
    setFormQuote(article.quote || "");
    setFormContent(
      Array.isArray(article.content) ? article.content.join("\n\n") : article.content || ""
    );
    setFormSortOrder(article.sort_order ?? 0);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedArticle(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const payload = {
      title: formTitle,
      category: formCategory,
      issue: formIssue,
      summary: formSummary,
      image: formImage,
      quote: formQuote,
      content: formContent.split("\n\n").filter(Boolean),
      sort_order: formSortOrder,
    };

    if (modalMode === "add") {
      addJournalMut.mutate(payload);
    } else if (modalMode === "edit" && selectedArticle) {
      updateJournalMut.mutate({ id: selectedArticle.id, data: payload });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F9F9F9] font-[family-name:var(--font-body)]">
      <AdminSidebar activeTab="journals" />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="JOURNAL ARTICLES"
          subtitle="Manage brand editorial stories and publications"
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
              {journals.length} PUBLISHED ARTICLES AVAILABLE IN DATABASE
            </p>
            <button
              onClick={openAddModal}
              className="bg-[#0A0A0A] text-white px-5 py-2.5 text-xs tracking-[0.15em] font-bold uppercase hover:bg-[#222222] transition-colors cursor-pointer"
            >
              + WRITE NEW ARTICLE
            </button>
          </div>

          <div className="bg-white border border-[#E5E5E5] overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs uppercase tracking-wider">
              <thead className="bg-[#F8F8F8] border-b border-[#E5E5E5] text-[#555555]">
                <tr>
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">ARTICLE TITLE</th>
                  <th className="p-4 font-bold">CATEGORY</th>
                  <th className="p-4 font-bold">ISSUE / VOL</th>
                  <th className="p-4 font-bold">SUMMARY</th>
                  <th className="p-4 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEEEE]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#888888]">
                      Loading journal articles...
                    </td>
                  </tr>
                ) : journals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#888888]">
                      No journal articles found. Click "+ WRITE NEW ARTICLE" to create one.
                    </td>
                  </tr>
                ) : (
                  journals.map((art) => (
                    <tr key={art.id} className="hover:bg-[#FAFAFA]">
                      <td className="p-4 font-mono font-bold">{art.id}</td>
                      <td className="p-4 font-bold text-[#0A0A0A]">{art.title}</td>
                      <td className="p-4 font-semibold text-[#B6A47E]">
                        {art.category}
                      </td>
                      <td className="p-4 font-mono text-[#666666]">
                        {art.issue || "—"}
                      </td>
                      <td className="p-4 text-[#777777] max-w-xs truncate">
                        {art.summary || "—"}
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button
                          onClick={() => openEditModal(art)}
                          className="font-bold text-[#0A0A0A] hover:underline cursor-pointer"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Are you sure you want to delete article "${art.title}"?`
                              )
                            ) {
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
        </main>
      </div>

      {/* Modal Form */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg p-6 border border-[#E5E5E5] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#EEEEEE]">
              <h3 className="text-sm font-bold tracking-wider uppercase text-[#0A0A0A]">
                {modalMode === "add" ? "WRITE NEW ARTICLE" : "EDIT ARTICLE"}
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
                  ARTICLE TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. The Origin of Sector 001"
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-semibold uppercase"
                />
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                    ISSUE / VOL
                  </label>
                  <input
                    type="text"
                    value={formIssue}
                    onChange={(e) => setFormIssue(e.target.value)}
                    placeholder="VOL. 01"
                    className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-semibold uppercase"
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
                  ARTICLE SUMMARY
                </label>
                <textarea
                  rows={2}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Short summary of the story..."
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                  FULL CONTENT PARAGRAPHS (SEPARATE BY DOUBLE NEWLINES)
                </label>
                <textarea
                  rows={5}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="First paragraph text...\n\nSecond paragraph text..."
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#444] mb-1">
                  HIGHLIGHT EDITORIAL QUOTE
                </label>
                <input
                  type="text"
                  value={formQuote}
                  onChange={(e) => setFormQuote(e.target.value)}
                  placeholder="e.g. True luxury is found in permanence..."
                  className="w-full p-2.5 text-xs border border-[#CCCCCC] focus:border-[#0A0A0A] outline-none font-medium"
                />
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
                  PUBLISH ARTICLE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
