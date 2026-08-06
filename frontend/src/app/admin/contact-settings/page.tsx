"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminContactSettings,
  createContactSetting,
  updateContactSetting,
  deleteContactSetting,
  ContactSettingItem,
  AdminWarehouseItem,
  formatMailtoUrl,
} from "@/utils/api";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminLocationPickerMap from "@/components/AdminLocationPickerMap";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Share2,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminContactSettingsPage() {
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

  const [activeSubTab, setActiveSubTab] = useState<"address" | "email" | "phone" | "schedule" | "social">("address");
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sliding Tab Active Indicator Animation (Matching Orders Page)
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const activeEl = tabRefs.current[activeSubTab];
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      if (savedTheme !== null) {
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

  // Fetch all contact settings and warehouse detail from Backend API
  const { data, isLoading } = useQuery({
    queryKey: ["admin-contact-settings"],
    queryFn: () => getAdminContactSettings(),
  });

  const settingsList: ContactSettingItem[] = data?.settings || [];
  const primaryWarehouse: AdminWarehouseItem | null = data?.warehouse || null;

  const warehouseSettingItem = settingsList.find((s) => s.type === "warehouse" || s.type === "address");

  // Mutation for create
  const createMut = useMutation({
    mutationFn: createContactSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-settings"] });
      closeModal();
      showToast("Data kontak berhasil ditambahkan!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal menambahkan data kontak", "error");
    },
  });

  // Mutation for update
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Record<string, any> }) =>
      updateContactSetting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-settings"] });
      closeModal();
      showToast("Data kontak berhasil diperbarui!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal memperbarui data kontak", "error");
    },
  });

  // Mutation for delete
  const deleteMut = useMutation({
    mutationFn: deleteContactSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contact-settings"] });
      showToast("Data kontak berhasil dihapus!");
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || "Gagal menghapus data kontak", "error");
    },
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: type,
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
      title: "HAPUS DATA KONTAK?",
      text: `Apakah Anda yakin ingin menghapus "${itemName}"? Data akan terhapus dari database.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: isDarkMode ? "#27272a" : "#6b7280",
      confirmButtonText: "YA, HAPUS",
      cancelButtonText: "BATAL",
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

  // Modal State
  const [modalMode, setModalMode] = useState<"add" | "edit" | "edit-warehouse" | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContactSettingItem | null>(null);

  // Form Fields
  const [formType, setFormType] = useState<string>("channel");
  const [formCode, setFormCode] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formValue, setFormValue] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Warehouse Form Fields
  const [whName, setWhName] = useState("");
  const [whContactName, setWhContactName] = useState("");
  const [whAddress, setWhAddress] = useState("");
  const [whCity, setWhCity] = useState("");
  const [whProvince, setWhProvince] = useState("");
  const [whPostalCode, setWhPostalCode] = useState("");
  const [whPhone, setWhPhone] = useState("");
  const [whEmail, setWhEmail] = useState("");
  const [whNotes, setWhNotes] = useState("");
  const [whLat, setWhLat] = useState<number>(-6.3533);
  const [whLng, setWhLng] = useState<number>(107.2831);

  const openAddModal = (type: string, defaultCode = "") => {
    setErrors({});
    setModalMode("add");
    setSelectedItem(null);
    setFormType(type);
    setFormCode(defaultCode);
    setFormTitle("");
    setFormSubtitle("");
    setFormValue("");
    setFormLink("");
    setFormNote("");
    setFormSortOrder(settingsList.length + 1);
    setFormIsActive(true);
  };

  const openEditModal = (item: ContactSettingItem) => {
    setErrors({});
    setModalMode("edit");
    setSelectedItem(item);
    setFormType(item.type);
    setFormCode(item.code || "");
    setFormTitle(item.title || "");
    setFormSubtitle(item.subtitle || "");
    setFormValue(item.value || "");
    setFormLink(item.link || "");
    setFormNote(item.note || "");
    setFormSortOrder(item.sort_order ?? 0);
    setFormIsActive(item.is_active ?? true);
  };

  const openWarehouseEditModal = () => {
    setErrors({});
    setModalMode("edit-warehouse");
    setWhName(primaryWarehouse?.name || "Sector Madness Central Warehouse & Archive Lab");
    setWhContactName(primaryWarehouse?.contact_name || "Logistics Operations Lead");
    setWhAddress(primaryWarehouse?.address || "Jl citarum No 51 Adiarsa barat");
    setWhCity(primaryWarehouse?.city || "Karawang");
    setWhProvince(primaryWarehouse?.province || "Jawa Barat");
    setWhPostalCode(primaryWarehouse?.postal_code || "41311");
    setWhPhone(primaryWarehouse?.phone ? primaryWarehouse.phone.replace(/[^\d+]/g, "") : "085946653103");
    setWhEmail(primaryWarehouse?.email || "logistics@sectormadness.com");
    setWhNotes(primaryWarehouse?.notes || "Main Fulfillment Dock B - Sector Madness Headquarter");
    setWhLat(primaryWarehouse?.latitude ? Number(primaryWarehouse.latitude) : -6.3117);
    setWhLng(primaryWarehouse?.longitude ? Number(primaryWarehouse.longitude) : 107.3015);
  };

  const triggerSmartGeocode = async (rawAddr: string, city: string, prov: string) => {
    if (!rawAddr && !city) return;

    // Clean house numbers, RT/RW, Blok patterns that prevent OpenStreetMap matches
    const cleanStreet = rawAddr
      .replace(/no\.?\s*\d+[a-z]?/gi, "")
      .replace(/rt\.?\s*\d+/gi, "")
      .replace(/rw\.?\s*\d+/gi, "")
      .replace(/blok\.?\s*\w+/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    const candidates = [
      `${cleanStreet} ${city} ${prov}`.trim(),
      `${cleanStreet} ${city}`.trim(),
      `${cleanStreet}`.trim(),
      `${city} ${prov}`.trim(),
    ];

    for (const q of candidates) {
      if (!q || q.length < 3) continue;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            q + ", Indonesia"
          )}`,
          {
            headers: {
              "User-Agent": "SectorMadness/1.0 (logistics@sectormadness.com)",
            },
          }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const nLat = parseFloat(data[0].lat);
          const nLng = parseFloat(data[0].lon);
          if (!isNaN(nLat) && !isNaN(nLng)) {
            setWhLat(nLat);
            setWhLng(nLng);
            return;
          }
        }
      } catch (err) {
        console.error("Geocoding candidate failed:", q, err);
      }
    }
  };

  // Automatic debounced geocoding whenever address, city, province, or postal code changes in warehouse modal
  useEffect(() => {
    if (modalMode !== "edit-warehouse") return;
    if (!whAddress.trim() && !whCity.trim()) return;

    const timer = setTimeout(() => {
      triggerSmartGeocode(whAddress, whCity, whProvince);
    }, 600);

    return () => clearTimeout(timer);
  }, [whAddress, whCity, whProvince, whPostalCode, modalMode]);

  const closeModal = () => {
    setErrors({});
    setModalMode(null);
    setSelectedItem(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (modalMode === "edit-warehouse") {
      if (!whAddress.trim()) newErrors.whAddress = "Alamat gudang wajib diisi!";
      if (!whCity.trim()) newErrors.whCity = "Kota gudang wajib diisi!";
      if (!whProvince.trim()) newErrors.whProvince = "Provinsi gudang wajib diisi!";
      if (!whPostalCode.trim()) newErrors.whPostalCode = "Kode pos wajib diisi!";
      if (whEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(whEmail)) {
        newErrors.whEmail = "Format email gudang tidak valid!";
      }
    } else {
      if (!formTitle.trim()) newErrors.title = "Judul / Nama platform wajib diisi!";
      if (!formValue.trim()) newErrors.value = "Nilai / Alamat / Jam operasional wajib diisi!";

      if (activeSubTab === "email" || formLink.startsWith("mailto:")) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValue.trim())) {
          newErrors.value = "Format email tidak valid!";
        }
      }

      if (activeSubTab === "phone") {
        const cleanedPhone = formValue.replace(/[^\d+]/g, "");
        if (cleanedPhone.length < 8) {
          newErrors.value = "Nomor telepon/WhatsApp minimal 8 digit!";
        }
      }

      if (activeSubTab === "social" && formLink.trim()) {
        if (!/^https?:\/\/.+$/i.test(formLink.trim())) {
          newErrors.link = "Format URL tidak valid! Harus diawali dengan http:// atau https://";
        }
      }

      // Validasi Unik Sort Order
      const duplicateSort = settingsList.find((item) => {
        if (selectedItem && item.id === selectedItem.id) return false;
        return Number(item.sort_order) === Number(formSortOrder);
      });

      if (duplicateSort) {
        newErrors.sortOrder = `Urutan (Sort Order) ${formSortOrder} sudah digunakan oleh "${duplicateSort.title}"!`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (modalMode === "edit-warehouse") {
      const payload = {
        type: "warehouse",
        code: "W1",
        title: whName,
        subtitle: "OUR WAREHOUSE",
        value: whAddress,
        warehouse_name: whName,
        contact_name: whContactName,
        address: whAddress,
        city: whCity,
        province: whProvince,
        postal_code: whPostalCode,
        phone: whPhone,
        email: whEmail,
        note: whNotes,
        latitude: whLat,
        longitude: whLng,
      };

      if (warehouseSettingItem) {
        updateMut.mutate({ id: warehouseSettingItem.id, data: payload });
      } else {
        createMut.mutate(payload);
      }
      return;
    }

    const payload = {
      type: formType,
      code: formCode,
      title: formTitle,
      subtitle: formSubtitle,
      value: formValue,
      link: formLink,
      note: formNote,
      sort_order: formSortOrder,
      is_active: formIsActive,
    };

    if (modalMode === "add") {
      createMut.mutate(payload);
    } else if (modalMode === "edit" && selectedItem) {
      updateMut.mutate({ id: selectedItem.id, data: payload });
    }
  };

  // Filter items by search & subtab category
  const filteredItems = settingsList.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.subtitle || "").toLowerCase().includes(q) ||
      item.value.toLowerCase().includes(q) ||
      (item.code || "").toLowerCase().includes(q);

    if (activeSubTab === "address") return matchesSearch && (item.type === "warehouse" || item.type === "address");
    if (activeSubTab === "email") return matchesSearch && (item.title.toLowerCase().includes("email") || item.link?.startsWith("mailto:"));
    if (activeSubTab === "phone") return matchesSearch && (item.title.toLowerCase().includes("messaging") || item.title.toLowerCase().includes("phone") || item.link?.includes("wa.me"));
    if (activeSubTab === "schedule") return matchesSearch && (item.title.toLowerCase().includes("hours") || item.title.toLowerCase().includes("schedule") || item.subtitle?.toLowerCase().includes("schedule"));
    if (activeSubTab === "social") return matchesSearch && (item.title.toLowerCase().includes("archive") || item.subtitle?.toLowerCase().includes("social") || item.type === "social");

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col lg:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#0F0F11] text-[#F5F5F5]" : "bg-[#F4F5F8] text-[#0A0A0A]"
      }`}
    >
      <AdminSidebar activeTab="contact-settings" isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="CONTACT SETTINGS"
          subtitle="Manajemen informasi alamat gudang, email, nomor telepon, jadwal support, dan akun sosial media"
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
            marginLeft: "auto",
            marginRight: "auto",
            width: "100%",
          }}
          className="min-w-0"
        >
          {/* HEADER ACTION & SUMMARY BAR (Matching Admin Catalog Page) */}
          <div style={{ marginBottom: "24px" }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2
              style={{
                fontSize: "11px",
                letterSpacing: "0.22em",
                fontWeight: 700,
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
            >
              {filteredItems.length} INFORMASI KONTAK DITEMUKAN ({settingsList.length} TOTAL)
            </h2>

            {activeSubTab === "address" ? (
              <button
                onClick={openWarehouseEditModal}
                style={{ padding: "12px 28px" }}
                className={`group inline-flex items-center justify-center font-bold text-xs tracking-[0.15em] uppercase rounded-[6px] transition-all duration-200 cursor-pointer shrink-0 gap-2.5 shadow-sm ${
                  isDarkMode
                    ? "bg-[#B6A47E] text-[#0A0A0A] hover:bg-[#a3926d]"
                    : "bg-[#0A0A0A] text-white hover:bg-[#222222]"
                }`}
              >
                <Pencil className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span>EDIT ADDRESS & WAREHOUSE</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (activeSubTab === "email") openAddModal("channel", "01");
                  else if (activeSubTab === "phone") openAddModal("channel", "02");
                  else if (activeSubTab === "schedule") openAddModal("channel", "03");
                  else if (activeSubTab === "social") openAddModal("channel", "04");
                }}
                style={{ padding: "12px 28px" }}
                className={`group inline-flex items-center justify-center font-bold text-xs tracking-[0.15em] uppercase rounded-[6px] transition-all duration-200 cursor-pointer shrink-0 gap-2.5 shadow-sm ${
                  isDarkMode
                    ? "bg-[#B6A47E] text-[#0A0A0A] hover:bg-[#a3926d]"
                    : "bg-[#0A0A0A] text-white hover:bg-[#222222]"
                }`}
              >
                <Plus className="w-4 h-4 stroke-[2.5] shrink-0 transition-transform duration-300 group-hover:rotate-90" />
                <span>
                  TAMBAH{" "}
                  {activeSubTab === "email"
                    ? "EMAIL"
                    : activeSubTab === "phone"
                    ? "NOMOR TELEPON"
                    : activeSubTab === "schedule"
                    ? "JADWAL SUPPORT"
                    : "SOSIAL MEDIA"}{" "}
                  BARU
                </span>
              </button>
            )}
          </div>

          {/* SMOOTH SLIDING BUTTON PILL NAVIGATION TABS (Matching Orders Page) */}
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
              marginBottom: "28px",
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
              { id: "address", label: "1. Address & Warehouse", icon: MapPin },
              { id: "email", label: "2. Email Inquiries", icon: Mail },
              { id: "phone", label: "3. Contact Phone", icon: Phone },
              { id: "schedule", label: "4. Support Schedule", icon: Clock },
              { id: "social", label: "5. Social Media", icon: Share2 },
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[tab.id] = el; }}
                  type="button"
                  onClick={() => {
                    setActiveSubTab(tab.id as any);
                    setCurrentPage(1);
                  }}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "10px 20px",
                    borderRadius: "7px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "color 0.2s ease, opacity 0.2s ease",
                    border: "none",
                    background: "transparent",
                    color: isActive
                      ? isDarkMode
                        ? "#F5F5F5"
                        : "#0A0A0A"
                      : isDarkMode
                      ? "#8A8A8A"
                      : "#6B7280",
                  }}
                  className="group hover:opacity-100"
                >
                  <IconComponent
                    className={`w-3.5 h-3.5 transition-colors duration-200 ${
                      isActive ? "text-[#B6A47E]" : isDarkMode ? "text-[#8A8A8A] group-hover:text-[#B6A47E]" : "text-[#6B7280] group-hover:text-[#B6A47E]"
                    }`}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TABLE CONTROL BAR: SEARCH & ROW LIMIT (Matching Catalog Page) */}
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
                placeholder={`Cari data kontak...`}
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

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: isDarkMode ? "#8A8A8A" : "#6B7280",
                }}
              >
                TAMPILKAN BARIS:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  paddingLeft: "12px",
                  paddingRight: "28px",
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
                <option value={5}>5 Baris</option>
                <option value={10}>10 Baris</option>
                <option value={20}>20 Baris</option>
                <option value={50}>50 Baris</option>
              </select>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          {isLoading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-2 border-[#B6A47E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs font-mono tracking-widest uppercase text-[#8A8A8A]">
                Memuat data contact settings dari database...
              </p>
            </div>
          ) : activeSubTab === "address" ? (
            /* SECTION 1: ADDRESS & WAREHOUSE INTEGRATION (Matching Catalog / Orders Card Styling) */
            <div
              style={{
                borderRadius: "10px",
                backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
                padding: "44px 40px",
              }}
            >
              {/* Warehouse Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-lg bg-[#B6A47E]/15 text-[#B6A47E] flex items-center justify-center shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#B6A47E] uppercase block mb-2">
                      PRIMARY WAREHOUSE &amp; FULFILLMENT DOCK
                    </span>
                    <h3 className={`text-2xl font-extrabold tracking-tight leading-snug ${isDarkMode ? "text-white" : "text-[#111827]"}`}>
                      {primaryWarehouse?.name || "Sector Madness Central Warehouse & Archive Lab"}
                    </h3>
                  </div>
                </div>

                <span
                  style={{ padding: "6px 16px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}
                  className="inline-flex items-center gap-2 uppercase font-mono border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 self-start md:self-auto shrink-0"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SINGLE SOURCE OF TRUTH (ACTIVE DB)
                </span>
              </div>

              {/* Explicit Divider Line with 28px top and 36px bottom margin */}
              <div
                style={{
                  marginTop: "28px",
                  marginBottom: "36px",
                  height: "1px",
                  width: "100%",
                  backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#E5E7EB",
                }}
              />

              {/* Warehouse Detail Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                <div className="space-y-2">
                  <span className={`text-[11px] font-mono uppercase tracking-[0.18em] font-bold block ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>
                    OPERATIONS CONTACT
                  </span>
                  <p className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-[#111827]"}`}>
                    {primaryWarehouse?.contact_name || "Logistics Operations Lead"}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className={`text-[11px] font-mono uppercase tracking-[0.18em] font-bold block ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>
                    PHONE NUMBER
                  </span>
                  <p className={`text-base font-semibold font-mono tracking-wider ${isDarkMode ? "text-white" : "text-[#111827]"}`}>
                    {primaryWarehouse?.phone || "+62 859-4665-3103"}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className={`text-[11px] font-mono uppercase tracking-[0.18em] font-bold block ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>
                    SUPPORT EMAIL
                  </span>
                  <p className={`text-base font-semibold ${isDarkMode ? "text-white" : "text-[#111827]"}`}>
                    <a
                      href={formatMailtoUrl(primaryWarehouse?.email || "logistics@sectormadness.com", "LOGISTICS SUPPORT INQUIRY")}
                      className="hover:text-[#B6A47E] transition-colors hover:underline"
                    >
                      {primaryWarehouse?.email || "logistics@sectormadness.com"}
                    </a>
                  </p>
                </div>

                <div className={`md:col-span-3 pt-10 border-t space-y-3 ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono uppercase tracking-[0.18em] font-bold block ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>
                      FULL PHYSICAL ADDRESS &amp; LOCATION MAP
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${primaryWarehouse?.latitude || -6.3533},${primaryWarehouse?.longitude || 107.2831}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#B6A47E] hover:underline uppercase tracking-wider"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className={`text-lg font-medium leading-relaxed whitespace-pre-line ${isDarkMode ? "text-[#F4F4F5]" : "text-[#374151]"}`}>
                    {(() => {
                      const raw = primaryWarehouse?.address || "Kawasan Industri KIIC, Jl. Harapan V Lot KK-2, Karawang Barat";
                      const cityStr = primaryWarehouse?.city || "Karawang";
                      const cleanStreet = raw.split(new RegExp(cityStr, "i"))[0].trim().replace(/[\n,]+$/, "");
                      return cleanStreet || raw;
                    })()}<br />
                    {primaryWarehouse?.city || "Karawang"}, {primaryWarehouse?.province || "Jawa Barat"} {primaryWarehouse?.postal_code || "41361"}, Indonesia
                  </p>

                  <div className="pt-2">
                    <AdminLocationPickerMap
                      lat={primaryWarehouse?.latitude ? Number(primaryWarehouse.latitude) : -6.3117}
                      lng={primaryWarehouse?.longitude ? Number(primaryWarehouse.longitude) : 107.3015}
                      isDarkMode={isDarkMode}
                      readOnly={true}
                      onLocationChange={() => {}}
                    />
                  </div>
                </div>

                {primaryWarehouse?.notes && (
                  <div className={`md:col-span-3 pt-8 border-t space-y-2 ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
                    <span className={`text-[11px] font-mono uppercase tracking-[0.18em] font-bold block ${isDarkMode ? "text-[#8A8A8A]" : "text-[#6B7280]"}`}>
                      INTERNAL DOCK NOTES
                    </span>
                    <p className={`text-xs font-mono leading-relaxed ${isDarkMode ? "text-[#D4D4D8]" : "text-[#4B5563]"}`}>
                      * {primaryWarehouse.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TABLE SECTION (Matching Admin Catalog Page Table) */
            <div
              style={{
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#18181C" : "#FFFFFF",
                border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
                overflow: "hidden",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                        borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E5E7EB",
                        fontSize: "10px",
                        letterSpacing: "0.18em",
                      }}
                      className={`font-mono font-bold uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
                    >
                      <th style={{ padding: "16px 20px" }}>CODE / ORDER</th>
                      <th style={{ padding: "16px 20px" }}>TITLE / PLATFORM</th>
                      <th style={{ padding: "16px 20px" }}>SUBTITLE / TYPE</th>
                      <th style={{ padding: "16px 20px" }}>VALUE / DATA</th>
                      <th style={{ padding: "16px 20px" }}>STATUS</th>
                      <th style={{ padding: "16px 20px" }} className="text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y text-xs ${isDarkMode ? "divide-white/10" : "divide-gray-200"}`}>
                    {paginatedItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "48px" }} className={`text-center font-mono uppercase tracking-widest ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>
                          Belum ada data kontak untuk kategori ini di database.
                        </td>
                      </tr>
                    ) : (
                      paginatedItems.map((item) => (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isDarkMode ? "hover:bg-white/[0.03]" : "hover:bg-gray-50"
                          }`}
                        >
                          <td style={{ padding: "16px 20px" }} className="font-mono font-bold text-[#B6A47E]">
                            {item.code || `#${item.sort_order || item.id}`}
                          </td>
                          <td style={{ padding: "16px 20px" }} className={`font-bold uppercase ${isDarkMode ? "text-white" : "text-[#111827]"}`}>
                            {item.title}
                          </td>
                          <td style={{ padding: "16px 20px" }} className={`uppercase ${isDarkMode ? "text-[#A1A1AA]" : "text-[#6B7280]"}`}>
                            {item.subtitle || "-"}
                          </td>
                          <td style={{ padding: "16px 20px" }} className="max-w-xs">
                            <p className={`font-semibold truncate ${isDarkMode ? "text-white" : "text-[#111827]"}`}>{item.value}</p>
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-[#B6A47E] hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <span>{item.link}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>
                          <td style={{ padding: "16px 20px" }}>
                            <span
                              style={{ padding: "4px 12px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em" }}
                              className={`inline-flex items-center gap-1.5 uppercase font-mono border ${
                                item.is_active !== false
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.is_active !== false ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                              {item.is_active !== false ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          <td style={{ padding: "16px 20px" }} className="text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => openEditModal(item)}
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
                                onClick={() => confirmDelete(item.title, () => deleteMut.mutate(item.id))}
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

      {/* MODAL FORM (Matching Catalog Page Modal Spacing & Design) */}
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
              maxWidth: modalMode === "edit-warehouse" ? "640px" : "560px",
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
                <span>
                  {modalMode === "edit-warehouse"
                    ? "EDIT ADDRESS & WAREHOUSE LOCATION"
                    : modalMode === "add"
                    ? "TAMBAH INFORMASI KONTAK BARU"
                    : "EDIT INFORMASI KONTAK"}
                </span>
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
              {modalMode === "edit-warehouse" ? (
                /* WAREHOUSE ADDRESS FORM */
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                      NAMA GUDANG / HUB
                    </label>
                    <input
                      type="text"
                      value={whName}
                      onChange={(e) => setWhName(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                        NAMA KONTAK LOGISTIK
                      </label>
                      <input
                        type="text"
                        value={whContactName}
                        onChange={(e) => setWhContactName(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                        NO. TELEPON GUDANG
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Contoh: 085946653103"
                        value={whPhone}
                        onChange={(e) => setWhPhone(e.target.value.replace(/[^\d+]/g, ""))}
                        style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                      EMAIL LOGISTIK
                    </label>
                    <input
                      type="email"
                      value={whEmail}
                      onChange={(e) => setWhEmail(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: errors.whEmail ? "1px solid #EF4444" : isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                    />
                    {errors.whEmail && <p style={{ fontSize: "11px", color: "#EF4444" }}>{errors.whEmail}</p>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: errors.whAddress ? "#EF4444" : isDarkMode ? "#CCCCCC" : "#374151" }}>
                      ALAMAT LENGKAP GUDANG *
                    </label>
                    <textarea
                      rows={3}
                      value={whAddress}
                      onChange={(e) => setWhAddress(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: errors.whAddress ? "1px solid #EF4444" : isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                    />
                    {errors.whAddress && <p style={{ fontSize: "11px", color: "#EF4444" }}>{errors.whAddress}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                        KOTA *
                      </label>
                      <input
                        type="text"
                        value={whCity}
                        onChange={(e) => setWhCity(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: errors.whCity ? "1px solid #EF4444" : isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                        PROVINSI *
                      </label>
                      <input
                        type="text"
                        value={whProvince}
                        onChange={(e) => setWhProvince(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: errors.whProvince ? "1px solid #EF4444" : isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                        KODE POS *
                      </label>
                      <input
                        type="text"
                        value={whPostalCode}
                        onChange={(e) => setWhPostalCode(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: errors.whPostalCode ? "1px solid #EF4444" : isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                      />
                    </div>
                  </div>

                  {/* INTERACTIVE LOCATION PICKER MAP */}
                  <div className="pt-2">
                    <AdminLocationPickerMap
                      lat={whLat}
                      lng={whLng}
                      isDarkMode={isDarkMode}
                      onLocationChange={(newLat, newLng, details) => {
                        setWhLat(newLat);
                        setWhLng(newLng);
                        if (details?.address) setWhAddress(details.address);
                        if (details?.city) setWhCity(details.city);
                        if (details?.province) setWhProvince(details.province);
                        if (details?.postalCode) setWhPostalCode(details.postalCode);
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                      CATATAN FULFILLMENT DOCK
                    </label>
                    <input
                      type="text"
                      value={whNotes}
                      onChange={(e) => setWhNotes(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                    />
                  </div>
                </>
              ) : (
                /* CONTACT ITEM FORM */
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                        KODE / LABEL (KODE UNIK)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 01, 02, IG"
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: errors.sortOrder ? "#EF4444" : isDarkMode ? "#CCCCCC" : "#374151" }}>
                        SORT ORDER (URUTAN TAMPIL) *
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFormSortOrder((prev) => Math.max(1, prev - 1))}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            fontWeight: 800,
                            fontSize: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            backgroundColor: isDarkMode ? "#27272A" : "#E5E7EB",
                            color: isDarkMode ? "#FFFFFF" : "#111827",
                            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                          }}
                          className="hover:bg-[#B6A47E] hover:text-black transition-colors shrink-0"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={formSortOrder}
                          onChange={(e) => setFormSortOrder(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{
                            flex: 1,
                            minWidth: "0px",
                            textAlign: "center",
                            padding: "8px 8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            borderRadius: "6px",
                            outline: "none",
                            backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                            border: errors.sortOrder ? "1px solid #EF4444" : isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                            color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormSortOrder((prev) => prev + 1)}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "6px",
                            fontWeight: 800,
                            fontSize: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            backgroundColor: isDarkMode ? "#27272A" : "#E5E7EB",
                            color: isDarkMode ? "#FFFFFF" : "#111827",
                            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                          }}
                          className="hover:bg-[#B6A47E] hover:text-black transition-colors shrink-0"
                        >
                          +
                        </button>
                      </div>
                      {errors.sortOrder && <p style={{ fontSize: "11px", color: "#EF4444" }}>{errors.sortOrder}</p>}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: errors.title ? "#EF4444" : isDarkMode ? "#CCCCCC" : "#374151" }}>
                      {activeSubTab === "phone"
                        ? "JUDUL CHATTING / MESSAGING *"
                        : activeSubTab === "email"
                        ? "JUDUL EMAIL INQUIRY *"
                        : activeSubTab === "schedule"
                        ? "JUDUL JAM OPERASIONAL *"
                        : activeSubTab === "social"
                        ? "NAMA PLATFORM SOCIAL MEDIA *"
                        : "JUDUL / NAMA PLATFORM *"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        activeSubTab === "phone"
                          ? "Contoh: DIRECT MESSAGING"
                          : activeSubTab === "email"
                          ? "Contoh: EMAIL INQUIRIES"
                          : activeSubTab === "schedule"
                          ? "Contoh: OPERATIONAL HOURS"
                          : activeSubTab === "social"
                          ? "Contoh: INSTAGRAM"
                          : "Contoh: EMAIL INQUIRIES, WHATSAPP CONSULTANT"
                      }
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: errors.title ? "1px solid #EF4444" : isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                    />
                    {errors.title && <p style={{ fontSize: "11px", color: "#EF4444" }}>{errors.title}</p>}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                      SUBTITLE / TIPE LAYANAN
                    </label>
                    <input
                      type="text"
                      placeholder={
                        activeSubTab === "phone"
                          ? "Contoh: WHATSAPP CONSULTANT"
                          : activeSubTab === "email"
                          ? "Contoh: GENERAL & ORDER SUPPORT"
                          : activeSubTab === "schedule"
                          ? "Contoh: CUSTOMER SUPPORT SCHEDULE"
                          : "Contoh: GENERAL & ORDER SUPPORT, SOCIAL MEDIA"
                      }
                      value={formSubtitle}
                      onChange={(e) => setFormSubtitle(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: errors.value ? "#EF4444" : isDarkMode ? "#CCCCCC" : "#374151" }}>
                      {activeSubTab === "phone"
                        ? "NOMOR TELEPON / WHATSAPP *"
                        : activeSubTab === "email"
                        ? "ALAMAT EMAIL *"
                        : activeSubTab === "schedule"
                        ? "HARI & JAM OPERASIONAL (Pisahkan Jam dengan Koma atau Enter) *"
                        : activeSubTab === "social"
                        ? "NAMA TAMPILAN KANAL SOCIAL *"
                        : "NILAI / DATA *"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        activeSubTab === "phone"
                          ? "Contoh: 085946653103"
                          : activeSubTab === "email"
                          ? "Contoh: info@sectormadness.com"
                          : activeSubTab === "schedule"
                          ? "Contoh: Monday — Saturday, 09:00 AM — 05:00 PM (WIB)"
                          : "Contoh: info@sectormadness.com atau 085946653103"
                      }
                      value={formValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (activeSubTab === "phone") {
                          setFormValue(val.replace(/[^\d+]/g, ""));
                        } else {
                          setFormValue(val);
                        }
                      }}
                      style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: errors.value ? "1px solid #EF4444" : isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                    />
                    {errors.value && <p style={{ fontSize: "11px", color: "#EF4444" }}>{errors.value}</p>}
                  </div>

                  {activeSubTab !== "phone" && activeSubTab !== "schedule" && activeSubTab !== "email" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: errors.link ? "#EF4444" : isDarkMode ? "#CCCCCC" : "#374151" }}>
                        {activeSubTab === "social"
                          ? "TAUTAN URL PROFIL (HTTP / HTTPS) *"
                          : "LINK TAUTAN CUSTOM (OPSIONAL — OTOMATIS BILA KOSONG)"}
                      </label>
                      <input
                        type="text"
                        placeholder={
                          activeSubTab === "social"
                            ? "Contoh: https://www.instagram.com/sectormadness.id"
                            : "Biarkan kosong (otomatis terformat mailto dengan subjek)"
                        }
                        value={formLink}
                        onChange={(e) => setFormLink(e.target.value)}
                        style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: errors.link ? "1px solid #EF4444" : isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                      />
                      {errors.link && <p style={{ fontSize: "11px", color: "#EF4444" }}>{errors.link}</p>}
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: isDarkMode ? "#CCCCCC" : "#374151" }}>
                      CATATAN / NOTE TAMBAHAN
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Response protocol: Within 24 business hours."
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px", outline: "none", backgroundColor: isDarkMode ? "#121214" : "#F9FAFB", border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB", color: isDarkMode ? "#FFFFFF" : "#0A0A0A" }}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 accent-[#B6A47E] cursor-pointer"
                    />
                    <label htmlFor="is_active" className="text-xs font-bold uppercase cursor-pointer">
                      AKTIFKAN INFORMASI KONTAK INI
                    </label>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "12px",
                  paddingTop: "16px",
                  borderTop: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  style={{ padding: "10px 20px" }}
                  className={`rounded-[6px] text-xs font-bold tracking-widest uppercase transition-all cursor-pointer border ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={createMut.isPending || updateMut.isPending}
                  style={{ padding: "10px 24px" }}
                  className={`rounded-[6px] text-xs font-bold tracking-widest uppercase transition-all cursor-pointer shadow-md border-none ${
                    isDarkMode
                      ? "bg-[#B6A47E] text-[#0A0A0A] hover:bg-[#a3926d]"
                      : "bg-[#0A0A0A] text-white hover:bg-[#222222]"
                  } disabled:opacity-50`}
                >
                  {createMut.isPending || updateMut.isPending ? "MENYIMPAN..." : "SIMPAN PERUBAHAN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
