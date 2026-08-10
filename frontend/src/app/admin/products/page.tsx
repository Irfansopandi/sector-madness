"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getCategories,
  getCollections,
  uploadAdminImage,
  getImageUrl,
  getAdminOrders,
  AdminProduct,
} from "@/utils/api";
import {
  Package,
  Plus,
  X,
  Pencil,
  Trash2,
  Upload,
  Search,
  Filter,
  Images,
  Palette,
  Ruler,
  AlertCircle,
  Box,
  TrendingUp,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";

interface SizeGuideRow {
  size: string;
  chest: string;
  waist: string;
}

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "ALL SIZE"];
const AVAILABLE_COLORS = ["BLACK", "WHITE", "CHARCOAL", "SAND", "OLIVE", "NAVY", "BEIGE", "GREY"];

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("sector_madness_admin_theme");
      return savedTheme === null ? true : savedTheme === "dark";
    }
    return true;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [rowLimit, setRowLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState("");

  const [activeTab, setActiveTab] = useState<"CATALOG" | "TOP_SOLD">("CATALOG");

  // Reset page when filters or row limit change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, rowLimit, activeTab]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  const getLabelString = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      return val.name || val.color || val.size || val.label || String(val);
    }
    return String(val);
  };

  // Form States
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number | "">("");
  const [formCollection, setFormCollection] = useState("");
  const [formCollectionCode, setFormCollectionCode] = useState("");
  const [isCustomCollection, setIsCustomCollection] = useState(false);
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | "">("");
  const [formDiscountExpiresAt, setFormDiscountExpiresAt] = useState("");
  const [formIsFlashSale, setFormIsFlashSale] = useState(false);
  const [formLimited, setFormLimited] = useState(false);
  const [formStock, setFormStock] = useState<number | "">(10);
  const [formMaterial, setFormMaterial] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formDetails, setFormDetails] = useState("");
  const [sizeGuideRows, setSizeGuideRows] = useState<SizeGuideRow[]>([
    { size: "S", chest: "90 - 95", waist: "75 - 80" },
    { size: "M", chest: "96 - 101", waist: "81 - 86" },
    { size: "L", chest: "102 - 107", waist: "87 - 92" },
    { size: "XL", chest: "108 - 113", waist: "93 - 98" },
    { size: "XXL", chest: "114 - 119", waist: "99 - 104" },
  ]);
  const [formStory, setFormStory] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Single Cover Image
  const [formImagePath, setFormImagePath] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState("");

  // Multiple Gallery Photos
  const [galleryPaths, setGalleryPaths] = useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  // Sizes & Colors
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSizeInput, setCustomSizeInput] = useState("");

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColorInput, setCustomColorInput] = useState("");

  interface VariantStockItem {
    color: string;
    size: string;
    stock: number;
  }
  const [variantStocks, setVariantStocks] = useState<VariantStockItem[]>([]);

  const colorsKey = selectedColors.map(getLabelString).join(",");
  const sizesKey = selectedSizes.map(getLabelString).join(",");

  useEffect(() => {
    const colors = selectedColors.length > 0 ? selectedColors.map(getLabelString) : ["Default"];
    const sizes = selectedSizes.length > 0 ? selectedSizes.map(getLabelString) : ["All Size"];
    const totalCombos = colors.length * sizes.length;
    const currentStock = typeof formStock === "number" && formStock > 0 ? formStock : 10;
    const perComboStock = Math.max(1, Math.floor(currentStock / totalCombos));

    setVariantStocks((prev) => {
      const next: VariantStockItem[] = [];
      colors.forEach((c) => {
        sizes.forEach((s) => {
          const existing = prev.find((item) => item.color === c && item.size === s);
          next.push({
            color: c,
            size: s,
            stock: existing ? existing.stock : perComboStock,
          });
        });
      });
      return next;
    });
  }, [colorsKey, sizesKey]);

  const updateVariantStock = (color: string, size: string, stockVal: number) => {
    setVariantStocks((prev) => {
      const next = prev.map((item) => {
        if (item.color === color && item.size === size) {
          return { ...item, stock: Math.max(0, stockVal) };
        }
        return item;
      });
      const total = next.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
      if (total > 0) setFormStock(total);
      return next;
    });
  };

  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Queries
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["admin-products"],
    queryFn: getAdminProducts,
    refetchInterval: 15000,
    retry: false,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrders,
    refetchInterval: 15000,
    retry: false,
  });

  // Aggregate top best-selling products from all non-cancelled orders
  const topProducts = (() => {
    const map = new Map<string, { name: string; image: string; qty: number; revenue: number; unitPrice: number }>();
    orders
      .filter((ord) => {
        const st = (ord.shipping_status || ord.status || "").toUpperCase();
        const paySt = (ord.payment?.payment_status || "").toUpperCase();
        const isCancelled = st === "CANCELLED" || st === "CANCELED" || st === "DIBATALKAN" || st === "FAILED" || paySt === "CANCELLED" || paySt === "FAILED";
        const isPaid = paySt === "PAID" || paySt === "SETTLED" || paySt === "SUCCESS" || st === "PROCESSING" || st === "SHIPPED" || st === "DELIVERING" || st === "DELIVERED" || st === "COMPLETED" || st === "SELESAI" || st === "RECEIVED" || st === "IN PROCESSING";
        
        return !isCancelled && isPaid;
      })
      .forEach((ord) => {
        const items: any[] = (ord as any).items || (ord as any).products || [];
        items.forEach((item: any) => {
          const rawName: string = item.product_name || item.name || "Unknown Product";
          const qty: number = Number(item.quantity) || 1;

          // Match with official catalog products first by ID or Name
          let matchedProd: any = null;
          if (products.length > 0) {
            matchedProd = products.find((p: any) => {
              const pId = String(p.id || "");
              const iId = String(item.product_id || item.id || "");
              if (iId && pId === iId) return true;

              const pName = (p.name || p.title || "").toLowerCase().trim();
              const iName = rawName.toLowerCase().trim();
              return pName === iName || pName.includes(iName) || iName.includes(pName);
            });
          }

          const displayName = matchedProd?.name || rawName;

          // Image: Always prioritize live catalog image
          let image: string = "";
          if (matchedProd && (matchedProd.image || matchedProd.photo)) {
            image = matchedProd.image || matchedProd.photo;
          } else {
            image = item.product_image || item.image || item.photo || "";
          }

          // Price: Always prioritize live catalog price
          let unitPrice = 0;
          if (matchedProd && matchedProd.price) {
            const rawP = Number(matchedProd.price) || 0;
            unitPrice = rawP < 1000 ? rawP * 1000 : rawP;
          } else {
            const rawP = Number(item.price || item.unit_price) || 0;
            const normalizedP = rawP < 1000 ? rawP * 1000 : rawP;
            unitPrice = normalizedP > 1000000 && qty > 1 ? Math.round(normalizedP / qty) : normalizedP;
          }

          const existing = map.get(displayName);
          if (existing) {
            existing.qty += qty;
            existing.revenue += unitPrice * qty;
            if (image && (!existing.image || (matchedProd && matchedProd.image))) {
              existing.image = image;
            }
          } else {
            map.set(displayName, { name: displayName, image, qty, revenue: unitPrice * qty, unitPrice });
          }
        });
      });
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue || b.qty - a.qty)
      .map((p, i) => ({ ...p, rank: i + 1 }));
  })();

  const filteredTopProducts = topProducts.filter((prod) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || prod.name.toLowerCase().includes(q);
  });

  const displayedTopProducts =
    rowLimit === 0 ? filteredTopProducts : filteredTopProducts.slice(0, rowLimit);

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
  }, [activeTab, products.length, topProducts.length]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });

  // Mutations
  const addProductMut = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      showSuccessAlert("Produk berhasil ditambahkan!");
      closeModal();
    },
    onError: (err: any) => {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const laravelErrs = err.response.data.errors;
        const newErrs: Record<string, string> = {};
        Object.keys(laravelErrs).forEach(key => {
          newErrs[key] = laravelErrs[key][0];
        });
        setErrors(newErrs);
        const firstErrorKey = Object.keys(newErrs)[0];
        if (firstErrorKey) {
          setTimeout(() => {
            const targetElement = document.getElementById(`field-${firstErrorKey}`) || document.getElementById("field-image");
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 50);
        }
      } else {
        setErrors({ image: err.response?.data?.message || "Gagal menambahkan produk. Periksa kembali form." });
        setTimeout(() => {
          document.getElementById("field-image")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      }
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const updateProductMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AdminProduct> }) =>
      updateAdminProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      showSuccessAlert("Produk berhasil diperbarui!");
      closeModal();
    },
    onError: (err: any) => {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const laravelErrs = err.response.data.errors;
        const newErrs: Record<string, string> = {};
        Object.keys(laravelErrs).forEach(key => {
          newErrs[key] = laravelErrs[key][0];
        });
        setErrors(newErrs);
        const firstErrorKey = Object.keys(newErrs)[0];
        if (firstErrorKey) {
          setTimeout(() => {
            const targetElement = document.getElementById(`field-${firstErrorKey}`) || document.getElementById("field-image");
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 50);
        }
      } else {
        setErrors({ image: err.response?.data?.message || "Gagal memperbarui produk. Periksa kembali form." });
        setTimeout(() => {
          document.getElementById("field-image")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
      }
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const isSubmitting = isUploading || addProductMut.isPending || updateProductMut.isPending;

  const deleteProductMut = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      showSuccessAlert("Produk berhasil dihapus!");
    },
    onError: (err: any) => {
      showErrorAlert(err.response?.data?.message || "Gagal menghapus produk.");
    },
  });

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
        popup: isDarkMode
          ? "border border-white/10 rounded-[12px] shadow-2xl"
          : "border border-gray-200 rounded-[12px] shadow-2xl",
      },
    });
  };

  const showErrorAlert = (msg: string) => {
    Swal.fire({
      icon: "error",
      title: "ERROR",
      text: msg,
      background: isDarkMode ? "#18181C" : "#ffffff",
      color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
      confirmButtonColor: "#E53E3E",
    });
  };

  const confirmDelete = (productName: string, onConfirm: () => void) => {
    Swal.fire({
      title: "HAPUS PRODUK?",
      text: `Apakah Anda yakin ingin menghapus produk "${productName}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E53E3E",
      cancelButtonColor: isDarkMode ? "#27272a" : "#E5E7EB",
      confirmButtonText: "YA, HAPUS",
      cancelButtonText: "BATAL",
      reverseButtons: true,
      background: isDarkMode ? "#18181C" : "#ffffff",
      color: isDarkMode ? "#f5f5f5" : "#0a0a0a",
      customClass: {
        popup: isDarkMode
          ? "border border-white/10 rounded-[12px] shadow-2xl"
          : "border border-gray-200 rounded-[12px] shadow-2xl",
        confirmButton:
          "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-white",
        cancelButton: isDarkMode
          ? "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-200"
          : "px-5 py-2.5 rounded-lg font-bold text-xs tracking-widest uppercase cursor-pointer !text-gray-900 border border-gray-300 shadow-xs",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showErrorAlert("Ukuran file foto melebihi batas maksimal 5 MB.");
      return;
    }

    setFormImageFile(file);
    setErrors((prev) => ({ ...prev, image: "" }));
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    let hasOverLimit = false;

    files.forEach((file) => {
      if (file.size <= 5 * 1024 * 1024) {
        validFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      } else {
        hasOverLimit = true;
      }
    });

    if (hasOverLimit) {
      showErrorAlert("Beberapa file terlewati karena ukurannya melebihi batas 5 MB.");
    }

    setGalleryFiles((prev) => [...prev, ...validFiles]);
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeGalleryPhoto = (index: number) => {
    if (index < galleryPaths.length) {
      setGalleryPaths((prev) => prev.filter((_, i) => i !== index));
    } else {
      const localIndex = index - galleryPaths.length;
      setGalleryFiles((prev) => prev.filter((_, i) => i !== localIndex));
      setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };



  const formatSizeGuideText = (guide: any): string => {
    if (!guide) return "";
    if (typeof guide === "string") return guide;
    if (Array.isArray(guide)) {
      return guide
        .map((item) => {
          if (!item) return "";
          if (typeof item === "string") return item;
          if (typeof item === "object") {
            const sz = item.size || item.name || "";
            const chest = item.chest ? `Chest ${item.chest}` : "";
            const waist = item.waist ? `Waist ${item.waist}` : "";
            const length = item.length ? `Length ${item.length}` : "";
            const parts = [chest, waist, length].filter(Boolean).join(", ");
            return sz ? `${sz}: ${parts || JSON.stringify(item)}` : JSON.stringify(item);
          }
          return String(item);
        })
        .filter(Boolean)
        .join("\n");
    }
    if (typeof guide === "object") {
      return JSON.stringify(guide);
    }
    return String(guide);
  };

  const formatDetailsText = (details: any): string => {
    if (!details) return "";
    if (typeof details === "string") return details;
    if (Array.isArray(details)) {
      return details
        .map((item) => {
          if (!item) return "";
          if (typeof item === "string") return item;
          if (typeof item === "object") {
            return item.text || item.title || item.detail || JSON.stringify(item);
          }
          return String(item);
        })
        .filter(Boolean)
        .join("\n");
    }
    return String(details);
  };

  const parseSizeGuideRows = (guide: any): SizeGuideRow[] => {
    const defaultGuide: SizeGuideRow[] = [
      { size: "S", chest: "90 - 95", waist: "75 - 80" },
      { size: "M", chest: "96 - 101", waist: "81 - 86" },
      { size: "L", chest: "102 - 107", waist: "87 - 92" },
      { size: "XL", chest: "108 - 113", waist: "93 - 98" },
      { size: "XXL", chest: "114 - 119", waist: "99 - 104" },
    ];
    if (!guide) return defaultGuide;
    if (Array.isArray(guide) && guide.length > 0) {
      return guide.map((item) => {
        if (typeof item === "object" && item !== null) {
          return {
            size: item.size || item.name || "S",
            chest: item.chest || "",
            waist: item.waist || item.length || "",
          };
        }
        if (typeof item === "string") {
          const parts = item.split(":");
          const sz = parts[0]?.trim() || "S";
          const rest = parts[1] || "";
          const chestMatch = rest.match(/Chest\s*([^,]+)/i);
          const waistMatch = rest.match(/(?:Waist|Length)\s*([^,]+)/i);
          return {
            size: sz,
            chest: chestMatch ? chestMatch[1].trim() : rest.trim(),
            waist: waistMatch ? waistMatch[1].trim() : "",
          };
        }
        return { size: "S", chest: "", waist: "" };
      });
    }
    return defaultGuide;
  };

  const updateSizeGuideRow = (index: number, field: keyof SizeGuideRow, value: string) => {
    setSizeGuideRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addSizeGuideRow = () => {
    setSizeGuideRows((prev) => [...prev, { size: "BARU", chest: "", waist: "" }]);
  };

  const removeSizeGuideRow = (index: number) => {
    setSizeGuideRows((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (szVal: any) => {
    const sz = getLabelString(szVal);
    const curr = selectedSizes.map(getLabelString);
    if (curr.includes(sz)) {
      setSelectedSizes(curr.filter((s) => s !== sz));
    } else {
      setSelectedSizes([...curr, sz]);
    }
  };

  const addCustomSize = () => {
    const sz = customSizeInput.trim().toUpperCase();
    const curr = selectedSizes.map(getLabelString);
    if (sz && !curr.includes(sz)) {
      setSelectedSizes([...curr, sz]);
      setCustomSizeInput("");
    }
  };

  const toggleColor = (clrVal: any) => {
    const clr = getLabelString(clrVal);
    const curr = selectedColors.map(getLabelString);
    if (curr.includes(clr)) {
      setSelectedColors(curr.filter((c) => c !== clr));
    } else {
      setSelectedColors([...curr, clr]);
    }
  };

  const addCustomColor = () => {
    const clr = customColorInput.trim().toUpperCase();
    const curr = selectedColors.map(getLabelString);
    if (clr && !curr.includes(clr)) {
      setSelectedColors([...curr, clr]);
      setCustomColorInput("");
    }
  };

  const openAddModal = () => {
    setErrors({});
    setSelectedProduct(null);
    setFormName("");
    setFormCategoryId("");
    setFormCollection("");
    setFormCollectionCode("");
    setIsCustomCollection(false);
    setFormPrice("");
    setFormOriginalPrice("");
    setFormDiscountExpiresAt("");
    setFormIsFlashSale(false);
    setFormLimited(false);
    setFormStock(10);
    setFormMaterial("");
    setFormWeight("");
    setFormDetails("");
    setSizeGuideRows([]);
    setFormStory("");
    setFormDescription("");
    setFormImagePath("");
    setFormImageFile(null);
    setFormImagePreview("");
    setGalleryPaths([]);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setSelectedSizes(["S", "M", "L", "XL"]);
    setSelectedColors(["BLACK"]);
    setModalMode("add");
  };

  const openEditModal = (product: AdminProduct) => {
    setErrors({});
    setSelectedProduct(product);
    setFormName(product.name || "");
    setFormCategoryId(product.category_id || product.category?.id || "");
    const colName = product.collection || "";
    setFormCollection(colName);
    setFormCollectionCode(product.collection_code || colName);
    const matchInDb = collections.some((c) => c.name === colName || c.code === colName);
    setIsCustomCollection(Boolean(colName && !matchInDb));
    // Normal Price before discount
    const rawNormalPrice = product.original_price && product.original_price > product.price
      ? product.original_price
      : product.price;
    const realNormalPrice = rawNormalPrice ? (rawNormalPrice < 1000 ? rawNormalPrice * 1000 : rawNormalPrice) : "";
    
    // Discount Amount
    const rawDiscountAmt = product.original_price && product.original_price > product.price
      ? product.original_price - product.price
      : "";
    const realDiscountAmt = rawDiscountAmt ? (rawDiscountAmt < 1000 ? rawDiscountAmt * 1000 : rawDiscountAmt) : "";

    setFormPrice(realNormalPrice);
    setFormOriginalPrice(realDiscountAmt);
    setFormDiscountExpiresAt(product.discount_expires_at ? product.discount_expires_at.replace(" ", "T").slice(0, 16) : "");
    setFormIsFlashSale(Boolean(product.is_flash_sale));
    setFormLimited(Boolean(product.limited));
    setFormStock(product.stock ?? 10);
    setFormMaterial(product.material || "");
    setFormWeight(product.weight || "");
    setFormDetails(formatDetailsText(product.details));
    setSizeGuideRows(parseSizeGuideRows(product.size_guide));
    setFormStory(product.story || "");
    setFormDescription(product.description || "");
    setFormImagePath(product.image || "");
    setFormImageFile(null);
    setFormImagePreview(
      product.image
        ? product.image.startsWith("http")
          ? product.image
          : `http://brand.test${product.image}`
        : ""
    );

    const existingGallery = Array.isArray(product.gallery) ? product.gallery : [];
    setGalleryPaths(existingGallery);
    setGalleryFiles([]);
    setGalleryPreviews(
      existingGallery.map((g) => (g.startsWith("http") ? g : `http://brand.test${g}`))
    );

    setSelectedSizes(Array.isArray(product.sizes) ? product.sizes.map(getLabelString) : []);
    setSelectedColors(Array.isArray(product.colors) ? product.colors.map(getLabelString) : []);

    if (Array.isArray(product.variants) && product.variants.length > 0) {
      setVariantStocks(
        product.variants.map((v: any) => ({
          color: v.color || "Default",
          size: v.size || "All Size",
          stock: Number(v.stock) || 0,
        }))
      );
    }

    setModalMode("edit");
  };

  const closeModal = () => {
    setErrors({});
    setModalMode(null);
    setSelectedProduct(null);
    setFormImageFile(null);
    setFormImagePreview("");
    setGalleryFiles([]);
    setGalleryPreviews([]);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formName.trim()) {
      errs.name = "Nama produk wajib diisi.";
    }
    if (formPrice === "" || Number(formPrice) <= 0) {
      errs.price = "Harga jual wajib diisi dan harus lebih besar dari 0.";
    }
    if (formStock === "" || Number(formStock) < 0) {
      errs.stock = "Stok produk wajib diisi (minimal 0).";
    }
    if (modalMode === "add" && !formImageFile && !formImagePath) {
      errs.image = "Foto sampul utama produk wajib diunggah.";
    }

    setErrors(errs);

    // Auto-scroll to the first invalid input element inside the modal
    const firstErrorKey = Object.keys(errs)[0];
    if (firstErrorKey) {
      setTimeout(() => {
        const targetElement = document.getElementById(`field-${firstErrorKey}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
          const inputEl = targetElement.querySelector("input, select, textarea");
          if (inputEl && "focus" in inputEl) {
            (inputEl as HTMLElement).focus();
          }
        }
      }, 50);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUploading(true);
    try {
      let finalImagePath = formImagePath;

      if (formImageFile) {
        finalImagePath = await uploadAdminImage(formImageFile, "products");
      }

      const uploadedGalleryPaths: string[] = [...galleryPaths];
      for (const file of galleryFiles) {
        const path = await uploadAdminImage(file, "products");
        uploadedGalleryPaths.push(path);
      }

      const payload: Partial<AdminProduct> = {
        name: formName.trim(),
        price: Number(formPrice),
        original_price: formOriginalPrice ? Number(formOriginalPrice) : null,
        discount_expires_at: formDiscountExpiresAt ? formDiscountExpiresAt : null,
        is_flash_sale: formIsFlashSale,
        limited: formLimited,
        stock: Number(formStock),
        category_id: formCategoryId !== "" ? Number(formCategoryId) : undefined,
        collection: formCollection.trim() || undefined,
        collection_code: formCollectionCode.trim() || formCollection.trim() || undefined,
        material: formMaterial.trim() || undefined,
        weight: formWeight.trim() || undefined,
        details: formDetails.trim()
          ? formDetails.split("\n").map((s) => s.trim()).filter(Boolean)
          : undefined,
        size_guide: sizeGuideRows
          .filter((r) => r.size.trim())
          .map((r) => ({
            size: r.size.trim(),
            chest: r.chest.trim(),
            waist: r.waist.trim(),
          })),
        story: formStory.trim() || undefined,
        description: formDescription.trim() || undefined,
        image: finalImagePath,
        gallery: uploadedGalleryPaths,
        sizes: selectedSizes,
        colors: selectedColors,
        variants: variantStocks,
      };

      if (modalMode === "add") {
        addProductMut.mutate(payload);
      } else if (modalMode === "edit" && selectedProduct) {
        updateProductMut.mutate({ id: Number(selectedProduct.id), data: payload });
      }
    } catch (error: any) {
      setErrors({ image: error?.response?.data?.message || error?.message || "Gagal mengunggah foto produk. Pastikan file valid dan ukuran tidak terlalu besar." });
      setTimeout(() => {
        document.getElementById("field-image")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredProducts = products.filter((prod) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      prod.name.toLowerCase().includes(q) ||
      (prod.category?.name || "").toLowerCase().includes(q) ||
      (prod.material || "").toLowerCase().includes(q);

    const matchesCat =
      categoryFilter === "ALL" ||
      String(prod.category_id || prod.category?.id) === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const currentTotal = filteredProducts.length;
  const pageSize = rowLimit > 0 ? rowLimit : currentTotal;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(currentTotal / pageSize)) : 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = rowLimit > 0 ? Math.min(startIndex + pageSize, currentTotal) : currentTotal;

  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  const formatRupiah = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return "Rp 0";
    const realAmount = amount < 1000 ? amount * 1000 : amount;
    return `Rp ${realAmount.toLocaleString("id-ID")}`;
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

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
    color: isDarkMode ? "#8A8A8A" : "#4B5563",
  };

  return (
    <div
      suppressHydrationWarning
      className={`flex flex-col md:flex-row min-h-screen transition-colors duration-200 font-[family-name:var(--font-body)] ${
        isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
      }`}
    >
      <AdminSidebar activeTab="products" isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="KELOLA PRODUK"
          subtitle="Manajemen data katalog produk, galeri foto, ukuran, dan harga"
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

          {/* Button Pill Navigation Tabs (2-Column Grid on Tablet/iPad, 1-Row Flex on Desktop) */}
          <div
            style={{
              padding: "6px",
              borderRadius: "10px",
              marginBottom: "28px",
            }}
            className={`grid grid-cols-2 gap-2 sm:gap-2.5 lg:flex lg:flex-row lg:items-center lg:w-max w-full border ${
              isDarkMode
                ? "bg-[#18181C] border-white/10"
                : "bg-[#E5E7EB] border-[#D1D5DB]"
            }`}
          >
            {[
              { id: "CATALOG", label: "SEMUA PRODUK", count: products.length, icon: Package },
              { id: "TOP_SOLD", label: "PRODUK TERJUAL", count: topProducts.length, icon: TrendingUp },
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "7px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    transition: "all 0.2s ease",
                    backgroundColor: isActive
                      ? isDarkMode
                        ? "#121214"
                        : "#FFFFFF"
                      : "transparent",
                    color: isActive
                      ? isDarkMode
                        ? "#F5F5F5"
                        : "#0A0A0A"
                      : isDarkMode
                      ? "#8A8A8A"
                      : "#6B7280",
                    border: isActive
                      ? "1.5px solid #B6A47E"
                      : "1.5px solid transparent",
                    boxShadow: isActive
                      ? isDarkMode
                        ? "0 4px 14px rgba(0,0,0,0.6)"
                        : "0 2px 8px rgba(0,0,0,0.1)"
                      : "none",
                  }}
                  className={`group flex items-center justify-center sm:justify-start gap-2.5 w-full lg:w-auto font-mono tracking-wider uppercase transition-all duration-200 ${
                    isActive
                      ? ""
                      : isDarkMode
                      ? "hover:text-[#FFFFFF] hover:bg-white/[0.04]"
                      : "hover:text-[#0A0A0A] hover:bg-black/[0.04]"
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? "text-[#B6A47E]" : "opacity-60"}`} />
                  <span className="truncate">{tab.label}</span>
                  <span
                    style={{ padding: "2px 7px", borderRadius: "12px", fontSize: "10px" }}
                    className={`font-mono font-extrabold shrink-0 ${
                      isActive
                        ? "bg-[#B6A47E] text-black"
                        : isDarkMode ? "bg-white/10 text-[#8A8A8A]" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeTab === "CATALOG" && (
            <>
              {/* PAGE HEADER: TITLE COUNTER & ADD BUTTON */}
              <div style={{ marginBottom: "32px" }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.22em",
                    fontWeight: 700,
                    fontFamily: "'Inter', -apple-system, sans-serif",
                  }}
                  className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
                >
                  {filteredProducts.length} PRODUK DITEMUKAN ({products.length} TOTAL)
                </h2>
                <button
                  onClick={openAddModal}
                  style={{ padding: "12px 28px" }}
                  className={`group rounded-[6px] text-xs font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-sm whitespace-nowrap shrink-0 ${
                    isDarkMode
                      ? "bg-[#B6A47E] text-[#0A0A0A] hover:bg-[#a3926d]"
                      : "bg-[#0A0A0A] text-white hover:bg-[#222222]"
                  }`}
                >
                  <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                  <span>PRODUK BARU</span>
                </button>
              </div>

              {/* TABLE CONTROL BAR: SEARCH, FILTER & ROW LIMIT (2-Row on Tablet/Mobile, Side-by-side on Desktop) */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "8px",
                  marginBottom: "24px",
                }}
                className={`border shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
                  isDarkMode
                    ? "bg-[#18181C] border-white/10"
                    : "bg-white border-[#E5E7EB]"
                }`}
              >
                {/* ROW 1 (Mobile/Tablet) / LEFT (Desktop): Search Bar & Filter Dropdown (Side-by-side) */}
                <div className="flex flex-nowrap items-center gap-2.5 sm:gap-3 flex-1 min-w-0 w-full lg:w-auto">
                  {/* Search Bar */}
                  <div className="relative flex-1 min-w-[140px] sm:w-64 lg:w-72 shrink">
                    <Search
                      className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        isDarkMode ? "text-[#8A8A8A]" : "text-gray-400"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Cari Produk / Kategori / Material..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        paddingLeft: "40px",
                        paddingRight: "14px",
                        paddingTop: "9px",
                        paddingBottom: "9px",
                      }}
                      className={`w-full text-xs font-semibold rounded-[6px] border outline-none transition-colors ${
                        isDarkMode
                          ? "bg-[#121214] border-white/10 text-white focus:border-[#B6A47E]"
                          : "bg-[#F9FAFB] border-[#D1D5DB] text-gray-900 focus:border-[#B6A47E]"
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

                  {/* Category Filter Dropdown */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Filter className="w-3.5 h-3.5 text-[#B6A47E]" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      style={{ padding: "9px 14px" }}
                      className={`text-xs font-bold tracking-wider uppercase rounded-[6px] border outline-none cursor-pointer transition-colors ${
                        isDarkMode
                          ? "bg-[#121214] border-white/10 text-white focus:border-[#B6A47E]"
                          : "bg-[#F9FAFB] border-[#D1D5DB] text-gray-900 focus:border-[#B6A47E]"
                      }`}
                    >
                      <option value="ALL">SEMUA KATEGORI</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ROW 2 (Mobile/Tablet) / RIGHT (Desktop): Row Limit Select */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`text-[11px] font-bold tracking-wider uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>
                    TAMPILKAN:
                  </span>
                  <select
                    value={rowLimit}
                    onChange={(e) => setRowLimit(Number(e.target.value))}
                    style={{ padding: "9px 14px" }}
                    className={`text-xs font-bold tracking-wider uppercase rounded-[6px] border outline-none cursor-pointer transition-colors ${
                      isDarkMode
                        ? "bg-[#121214] border-white/10 text-white focus:border-[#B6A47E]"
                        : "bg-[#F9FAFB] border-[#D1D5DB] text-gray-900 focus:border-[#B6A47E]"
                    }`}
                  >
                    <option value={10}>10 BARIS</option>
                    <option value={20}>20 BARIS</option>
                    <option value={50}>50 BARIS</option>
                    <option value={0}>SEMUA BARIS</option>
                  </select>
                </div>
              </div>

              {/* PRODUCTS DATA TABLE */}
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
                      <th style={{ padding: "14px 10px", width: "40px" }} className="font-bold whitespace-nowrap">NO.</th>
                      <th style={{ padding: "14px 10px", width: "60px" }} className="font-bold whitespace-nowrap">FOTO</th>
                      <th style={{ padding: "14px 12px" }} className="font-bold whitespace-nowrap">NAMA PRODUK</th>
                      <th style={{ padding: "14px 12px" }} className="font-bold whitespace-nowrap">KATEGORI</th>
                      <th style={{ padding: "14px 12px" }} className="font-bold whitespace-nowrap">HARGA</th>
                      <th style={{ padding: "14px 12px" }} className="font-bold whitespace-nowrap">STOK</th>
                      <th style={{ padding: "14px 12px" }} className="font-bold text-right whitespace-nowrap">AKSI</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"
                    }`}
                  >
                    {displayedProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{ padding: "48px 24px" }}
                          className={`text-center ${
                            isDarkMode ? "text-[#777777]" : "text-[#6B7280]"
                          }`}
                        >
                          Tidak ada produk ditemukan sesuai kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      displayedProducts.map((prod, idx) => {
                        const imgUrl = prod.image
                          ? prod.image.startsWith("http")
                            ? prod.image
                            : `http://brand.test${prod.image}`
                          : "/images/placeholder.png";

                        return (
                          <tr
                            key={prod.id}
                            className={`transition-colors ${
                              isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-gray-50/80"
                            }`}
                          >
                            <td style={{ padding: "12px 10px" }} className={`font-mono font-bold text-center whitespace-nowrap ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"}`}>
                              {startIndex + idx + 1}
                            </td>
                            <td style={{ padding: "12px 10px" }} className="whitespace-nowrap">
                              <div
                                style={{ width: "44px", height: "52px" }}
                                className="rounded-md overflow-hidden bg-black/20 border border-white/10 relative shrink-0"
                              >
                                <img
                                  src={imgUrl}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td style={{ padding: "12px 12px" }} className="whitespace-nowrap">
                              <div className="font-bold text-xs tracking-wide whitespace-nowrap">{prod.name}</div>
                              {prod.material && (
                                <div
                                  style={{ marginTop: "2px", fontSize: "10px" }}
                                  className={`font-mono whitespace-nowrap ${
                                    isDarkMode ? "text-[#8A8A8A]" : "text-gray-500"
                                  }`}
                                >
                                  {prod.material}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "12px 12px" }} className="whitespace-nowrap">
                              <div className="flex flex-col gap-0.5 items-start whitespace-nowrap">
                                <span
                                  style={{ padding: "3px 8px", borderRadius: "4px", fontSize: "10px" }}
                                  className={`font-mono font-bold tracking-wider uppercase border whitespace-nowrap ${
                                    isDarkMode
                                      ? "bg-white/5 border-white/10 text-gray-300"
                                      : "bg-gray-100 border-gray-200 text-gray-700"
                                  }`}
                                >
                                  {prod.category?.name || "Uncategorized"}
                                </span>
                                {prod.collection && (
                                  <span style={{ fontSize: "9px" }} className="font-mono text-[#B6A47E] font-medium tracking-wider uppercase whitespace-nowrap">
                                    FOCUS: {prod.collection}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: "12px 12px" }} className="font-mono font-bold whitespace-nowrap text-xs">
                              <div className="whitespace-nowrap">{formatRupiah(prod.price)}</div>
                              {prod.original_price && prod.original_price > prod.price && (
                                <div style={{ fontSize: "9px", marginTop: "1px" }} className="text-red-500 line-through whitespace-nowrap">
                                  {formatRupiah(prod.original_price)}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "12px 12px" }} className="whitespace-nowrap">
                              <span
                                style={{ padding: "3px 10px", borderRadius: "9999px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}
                                className={`inline-flex items-center gap-1 uppercase font-mono border whitespace-nowrap ${
                                  prod.stock > 0
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${prod.stock > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
                                {prod.stock > 0 ? `${prod.stock} UNIT` : "HABIS"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 12px" }} className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateProductMut.mutate({
                                      id: Number(prod.id),
                                      data: { limited: !prod.limited },
                                    })
                                  }
                                  style={{ padding: "5px 8px", borderRadius: "4px" }}
                                  className={`text-[10px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1 border whitespace-nowrap ${
                                    prod.limited
                                      ? "bg-[#B6A47E]/15 border-[#B6A47E] text-[#B6A47E] hover:bg-[#B6A47E] hover:text-black"
                                      : "bg-white/5 border-white/10 text-gray-400 hover:text-gray-200 hover:border-gray-500"
                                  }`}
                                  title="Klik untuk ubah status Limited Release"
                                >
                                  <span>{prod.limited ? "⭐ LIMITED" : "REGULAR"}</span>
                                </button>

                                <button
                                  onClick={() => openEditModal(prod)}
                                  style={{ padding: "5px 8px", borderRadius: "4px" }}
                                  className={`text-[10px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1 border whitespace-nowrap ${
                                    isDarkMode
                                      ? "bg-white/5 border-white/10 text-white hover:border-[#B6A47E] hover:text-[#B6A47E]"
                                      : "bg-gray-100 border-gray-200 text-gray-800 hover:border-[#B6A47E] hover:text-[#B6A47E]"
                                  }`}
                                >
                                  <Pencil className="w-3 h-3" />
                                  <span>EDIT</span>
                                </button>
                                <button
                                  onClick={() =>
                                    confirmDelete(prod.name, () => deleteProductMut.mutate(prod.id))
                                  }
                                  style={{ padding: "5px 8px", borderRadius: "4px" }}
                                  className="text-[10px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 whitespace-nowrap"
                                  title="Hapus Produk"
                                >
                                  <Trash2 className="w-3 h-3" />
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
            </>
          )}

          {activeTab === "TOP_SOLD" && (
            <>
              <div style={{ marginBottom: "32px" }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" style={{ color: "#B6A47E" }} />
                  <h2
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.22em",
                      fontWeight: 700,
                      fontFamily: "'Inter', -apple-system, sans-serif",
                    }}
                    className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
                  >
                    {filteredTopProducts.length} PRODUK TERJUAL DITEMUKAN ({topProducts.length} TOTAL)
                  </h2>
                </div>
                <span
                  style={{ fontSize: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                  className={`font-medium tracking-wider uppercase ${isDarkMode ? "text-[#666666]" : "text-[#9CA3AF]"}`}
                >
                  BERDASARKAN TOTAL PENGHASILAN & QTY TERJUAL
                </span>
              </div>

              {/* CONTROL BAR: SEARCH & ROW LIMIT */}
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
                <div className="relative flex-1 min-w-[240px]">
                  <Search
                    className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? "text-[#8A8A8A]" : "text-gray-400"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Cari Produk Terjual..."
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

              <div
                className={`border rounded-[6px] overflow-hidden shadow-sm ${
                  isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
                }`}
              >
                {displayedTopProducts.length === 0 ? (
                  <div
                    style={{ padding: "64px 24px" }}
                    className={`text-center text-xs ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}
                  >
                    Tidak ada produk terjual ditemukan sesuai pencarian.
                  </div>
                ) : (
                  <div className={`divide-y ${isDarkMode ? "divide-white/[0.05]" : "divide-[#E5E7EB]"}`}>
                    {displayedTopProducts.map((prod) => {
                      const prodImg = prod.image ? getImageUrl(prod.image) : null;
                      return (
                        <div
                          key={prod.name}
                          style={{ padding: "20px 28px" }}
                          className={`flex items-center gap-5 transition-colors ${
                            isDarkMode ? "hover:bg-white/[0.02]" : "hover:bg-[#F9FAFB]"
                          }`}
                        >
                          {/* Rank badge */}
                          <span
                            style={{ width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0 }}
                            className={`inline-flex items-center justify-center font-black text-xs font-mono ${
                              prod.rank === 1
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : prod.rank === 2
                                ? "bg-slate-500/15 text-slate-400 border border-slate-500/30"
                                : prod.rank === 3
                                ? "bg-orange-900/20 text-orange-400 border border-orange-500/30"
                                : isDarkMode
                                ? "bg-white/5 text-[#8A8A8A] border border-white/10"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {prod.rank}
                          </span>

                          {/* Product Image Thumbnail */}
                          <div
                            style={{ width: "52px", height: "52px", borderRadius: "8px", flexShrink: 0 }}
                            className={`overflow-hidden border relative flex items-center justify-center ${
                              isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"
                            }`}
                          >
                            {prodImg ? (
                              <img
                                src={prodImg}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className={`w-5 h-5 ${isDarkMode ? "text-[#8A8A8A]" : "text-gray-400"}`} />
                            )}
                          </div>

                          {/* Product Name + Unit Price & Total Revenue */}
                          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <span
                              className={`font-bold text-xs uppercase tracking-wide truncate ${
                                isDarkMode ? "text-[#F5F5F5]" : "text-[#111827]"
                              }`}
                            >
                              {prod.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] font-mono">
                              <span
                                className={`font-semibold ${
                                  prod.rank === 1
                                    ? "text-[#B6A47E]"
                                    : isDarkMode
                                    ? "text-[#CCCCCC]"
                                    : "text-[#374151]"
                                }`}
                              >
                                Rp {prod.unitPrice.toLocaleString("id-ID")}
                                <span className="text-[10px] opacity-60 font-normal"> / pcs</span>
                              </span>
                              <span className="text-gray-500 font-sans opacity-50">•</span>
                              <span className={`text-[10px] ${isDarkMode ? "text-[#777777]" : "text-[#6B7280]"}`}>
                                Total: Rp {prod.revenue.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          {/* Qty pill */}
                          <span
                            style={{ padding: "8px 20px", borderRadius: "8px", flexShrink: 0 }}
                            className={`font-black font-mono text-sm ${
                              prod.rank === 1
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : isDarkMode
                                ? "bg-white/5 text-[#F5F5F5] border border-white/10"
                                : "bg-gray-100 text-[#111827] border border-gray-200"
                            }`}
                          >
                            {prod.qty} <span className="font-normal opacity-60 text-[10px]">pcs</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Add / Edit Product Modal */}
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
              width: "95%",
              maxWidth: "960px",
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
                <Package style={{ width: "18px", height: "18px" }} />
                <span>{modalMode === "add" ? "ADD NEW PRODUCT" : "EDIT PRODUCT"}</span>
              </h3>
              <button
                type="button"
                onClick={closeModal}
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

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Product Name (REQUIRED) */}
              <div id="field-name">
                <label style={labelStyle}>
                  NAMA PRODUK <span style={{ color: "#E53E3E" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Heavyweight Oversized Tee"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (e.target.value.trim()) {
                      setErrors((prev) => ({ ...prev, name: "" }));
                    }
                  }}
                  style={getInputStyle(!!errors.name)}
                />
                {errors.name && (
                  <p style={{ fontSize: "11px", color: "#E53E3E", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle style={{ width: "13px", height: "13px" }} />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Category (OPTIONAL), Collection (OPTIONAL), & Stock (REQUIRED) Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>KATEGORI (OPSIONAL)</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) =>
                      setFormCategoryId(e.target.value ? Number(e.target.value) : "")
                    }
                    style={{ ...getInputStyle(false), cursor: "pointer" }}
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>FOCUS ON / KOLEKSI (OPSIONAL)</label>
                  {!isCustomCollection ? (
                    <select
                      value={formCollection}
                      onChange={(e) => {
                        if (e.target.value === "__CUSTOM__") {
                          setIsCustomCollection(true);
                          setFormCollection("");
                          setFormCollectionCode("");
                        } else {
                          const val = e.target.value;
                          setFormCollection(val);
                          const match = collections.find((c) => c.name === val || c.code === val);
                          if (match) {
                            setFormCollectionCode(match.code || match.name);
                          } else {
                            setFormCollectionCode(val);
                          }
                        }
                      }}
                      style={{ ...getInputStyle(false), cursor: "pointer" }}
                    >
                      <option value="">Pilih Koleksi / Focus On...</option>
                      {collections.map((col) => (
                        <option key={col.id} value={col.name}>
                          {col.name.toUpperCase()} {col.code ? `(${col.code})` : ""}
                        </option>
                      ))}
                      <option value="__CUSTOM__">+ Tulis Manual (Kustom)...</option>
                    </select>
                  ) : (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        placeholder="Contoh: SECTOR MADNESS"
                        value={formCollection}
                        onChange={(e) => {
                          setFormCollection(e.target.value);
                          setFormCollectionCode(e.target.value);
                        }}
                        style={{ ...getInputStyle(false), flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCollection(false);
                          setFormCollection("");
                          setFormCollectionCode("");
                        }}
                        style={{
                          padding: "0 10px",
                          fontSize: "10px",
                          fontWeight: 700,
                          background: isDarkMode ? "#27272A" : "#E5E7EB",
                          color: isDarkMode ? "#FFF" : "#000",
                          borderRadius: "6px",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Pilih List
                      </button>
                    </div>
                  )}
                </div>

                <div id="field-stock">
                  <label style={labelStyle}>
                    STOK PRODUK <span style={{ color: "#E53E3E" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={formStock}
                    onChange={(e) => {
                      setFormStock(e.target.value !== "" ? Number(e.target.value) : "");
                      if (e.target.value !== "") {
                        setErrors((prev) => ({ ...prev, stock: "" }));
                      }
                    }}
                    style={getInputStyle(!!errors.stock)}
                  />
                  {errors.stock && (
                    <p style={{ fontSize: "11px", color: "#E53E3E", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <AlertCircle style={{ width: "13px", height: "13px" }} />
                      <span>{errors.stock}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Material & Weight Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>BAHAN / MATERIAL (OPSIONAL)</label>
                  <textarea
                    rows={2}
                    placeholder={"Contoh:\n100% Heavyweight Cotton 24s\nPre-shrunk combed cotton jersey"}
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    style={{ ...getInputStyle(false), resize: "vertical" }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>BOBOT / WEIGHT (OPSIONAL)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 480 GSM"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    style={getInputStyle(false)}
                  />
                </div>
              </div>

              {/* Price & Discount Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div id="field-price">
                  <label style={labelStyle}>
                    HARGA NORMAL / ASLI (RP) <span style={{ color: "#E53E3E" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="misal: 2000000"
                    value={formPrice}
                    onChange={(e) => {
                      setFormPrice(e.target.value ? Number(e.target.value) : "");
                      if (e.target.value && Number(e.target.value) > 0) {
                        setErrors((prev) => ({ ...prev, price: "" }));
                      }
                    }}
                    style={getInputStyle(!!errors.price)}
                  />
                  {errors.price && (
                    <p style={{ fontSize: "11px", color: "#E53E3E", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <AlertCircle style={{ width: "13px", height: "13px" }} />
                      <span>{errors.price}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label style={labelStyle}>NOMINAL DISKON (RP) (OPSIONAL)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="misal: 50000"
                    value={formOriginalPrice}
                    onChange={(e) =>
                      setFormOriginalPrice(e.target.value ? Number(e.target.value) : "")
                    }
                    style={getInputStyle(false)}
                  />
                  <p style={{ fontSize: "10px", color: isDarkMode ? "#8A8A8A" : "#6B7280", marginTop: "4px", fontFamily: "monospace" }}>
                    * Masukkan nominal potongan diskon (misal: 50000). Jika tidak ada diskon, kosongkan.
                  </p>
                </div>
              </div>

              {/* Live Price Calculation Preview */}
              {formPrice !== "" && Number(formPrice) > 0 && (() => {
                const norm = Number(formPrice) || 0;
                const disc = Number(formOriginalPrice) || 0;
                let finalSelling = norm;
                let slashed = 0;
                let pct = 0;

                if (disc > 0) {
                  if (disc < norm) {
                    finalSelling = norm - disc;
                    slashed = norm;
                    pct = Math.round((disc / norm) * 100);
                  } else {
                    finalSelling = norm;
                    slashed = disc;
                    pct = Math.round(((disc - norm) / disc) * 100);
                  }
                }

                return (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      backgroundColor: isDarkMode ? "#121214" : "#F3F4F6",
                      border: isDarkMode ? "1px solid rgba(182, 164, 126, 0.3)" : "1px solid #D1D5DB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: "#B6A47E", fontWeight: 700 }}>ESTIMASI HASIL HARGA:</span>
                    <div>
                      {slashed > 0 ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ textDecoration: "line-through", color: "#888888" }}>
                            Rp {slashed.toLocaleString("id-ID")}
                          </span>
                          <span style={{ backgroundColor: "#FF3B30", color: "#FFFFFF", fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "3px" }}>
                            -{pct}% OFF
                          </span>
                          <span style={{ color: "#00E676", fontSize: "13px", fontWeight: 800 }}>
                            Rp {finalSelling.toLocaleString("id-ID")}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#00E676", fontSize: "13px", fontWeight: 800 }}>
                          Rp {finalSelling.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Discount Expiration Date, Flash Sale, & Limited Release */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>BATAS WAKTU DISKON (OPSIONAL)</label>
                  <input
                    type="datetime-local"
                    value={formDiscountExpiresAt}
                    onChange={(e) => setFormDiscountExpiresAt(e.target.value)}
                    style={{ ...getInputStyle(false), colorScheme: isDarkMode ? "dark" : "light" }}
                  />
                  <p style={{ fontSize: "10px", color: isDarkMode ? "#8A8A8A" : "#6B7280", marginTop: "4px", fontFamily: "monospace" }}>
                    * Tanggal & jam berakhirnya promo diskon.
                  </p>
                </div>

                <div>
                  <label style={labelStyle}>FLASH SALE STATUS (OPSIONAL)</label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      backgroundColor: isDarkMode ? "#121214" : "#F3F4F6",
                      border: formIsFlashSale
                        ? "1px solid #FF3B30"
                        : isDarkMode
                        ? "1px solid rgba(255, 255, 255, 0.12)"
                        : "1px solid #D1D5DB",
                      cursor: "pointer",
                      marginTop: "2px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formIsFlashSale}
                      onChange={(e) => setFormIsFlashSale(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#FF3B30", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: formIsFlashSale ? "#FF3B30" : isDarkMode ? "#CCC" : "#333" }}>
                      {formIsFlashSale ? "🔥 FLASH SALE ACTIVE" : "FLASH SALE NON-AKTIF"}
                    </span>
                  </label>
                </div>

                <div>
                  <label style={labelStyle}>LIMITED RELEASE STATUS (OPSIONAL)</label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      backgroundColor: isDarkMode ? "#121214" : "#F3F4F6",
                      border: formLimited
                        ? "1px solid #B6A47E"
                        : isDarkMode
                        ? "1px solid rgba(255, 255, 255, 0.12)"
                        : "1px solid #D1D5DB",
                      cursor: "pointer",
                      marginTop: "2px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formLimited}
                      onChange={(e) => setFormLimited(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "#B6A47E", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 700, color: formLimited ? "#B6A47E" : isDarkMode ? "#CCC" : "#333" }}>
                      {formLimited ? "⭐ LIMITED RELEASE" : "STANDARD RELEASE"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Sizes (Ukuran) Management (OPTIONAL) */}
              <div>
                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Ruler style={{ width: "14px", height: "14px", color: "#B6A47E" }} />
                  <span>KELOLA UKURAN / SIZES (OPSIONAL)</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                  {AVAILABLE_SIZES.map((sz) => {
                    const isSel = selectedSizes.map(getLabelString).includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          backgroundColor: isSel ? "#B6A47E" : isDarkMode ? "#121214" : "#F3F4F6",
                          border: isSel ? "1px solid #B6A47E" : isDarkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid #D1D5DB",
                          color: isSel ? "#0A0A0A" : isDarkMode ? "#8A8A8A" : "#4B5563",
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                  {/* Custom Added Sizes */}
                  {selectedSizes
                    .map(getLabelString)
                    .filter((sz) => sz && !AVAILABLE_SIZES.includes(sz))
                    .map((sz, idx) => (
                      <div
                        key={`custom-sz-${sz}-${idx}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          borderRadius: "4px",
                          backgroundColor: "#B6A47E",
                          color: "#0A0A0A",
                          border: "1px solid #B6A47E",
                        }}
                      >
                        <span>{sz}</span>
                        <button
                          type="button"
                          onClick={() => toggleSize(sz)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            color: "#0A0A0A",
                          }}
                          title="Hapus ukuran custom"
                        >
                          <X style={{ width: "12px", height: "12px" }} />
                        </button>
                      </div>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Ukuran Custom (misal: 32, 34)..."
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    style={{ ...getInputStyle(false), flex: 1, padding: "8px 12px" }}
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    style={{
                      padding: "8px 16px",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      borderRadius: "6px",
                      cursor: "pointer",
                      backgroundColor: "rgba(182, 164, 126, 0.15)",
                      color: "#B6A47E",
                      border: "1px solid rgba(182, 164, 126, 0.3)",
                    }}
                  >
                    TAMBAH
                  </button>
                </div>
              </div>

              {/* Colors (Warna) Management (OPTIONAL) */}
              <div>
                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Palette style={{ width: "14px", height: "14px", color: "#B6A47E" }} />
                  <span>KELOLA WARNA / COLORS (OPSIONAL)</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                  {AVAILABLE_COLORS.map((clr) => {
                    const isSel = selectedColors.map(getLabelString).includes(clr);
                    return (
                      <button
                        type="button"
                        key={clr}
                        onClick={() => toggleColor(clr)}
                        style={{
                          padding: "6px 12px",
                          fontSize: "11px",
                          fontWeight: 700,
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          backgroundColor: isSel ? "#B6A47E" : isDarkMode ? "#121214" : "#F3F4F6",
                          border: isSel ? "1px solid #B6A47E" : isDarkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid #D1D5DB",
                          color: isSel ? "#0A0A0A" : isDarkMode ? "#8A8A8A" : "#4B5563",
                        }}
                      >
                        {clr}
                      </button>
                    );
                  })}
                  {/* Custom Added Colors */}
                  {selectedColors
                    .map(getLabelString)
                    .filter((clr) => clr && !AVAILABLE_COLORS.includes(clr))
                    .map((clr, idx) => (
                      <div
                        key={`custom-clr-${clr}-${idx}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          borderRadius: "4px",
                          backgroundColor: "#B6A47E",
                          color: "#0A0A0A",
                          border: "1px solid #B6A47E",
                        }}
                      >
                        <span>{clr}</span>
                        <button
                          type="button"
                          onClick={() => toggleColor(clr)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            color: "#0A0A0A",
                          }}
                          title="Hapus warna custom"
                        >
                          <X style={{ width: "12px", height: "12px" }} />
                        </button>
                      </div>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="Warna Custom (misal: WASHED BLUE)..."
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomColor();
                      }
                    }}
                    style={{ ...getInputStyle(false), flex: 1, padding: "8px 12px" }}
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    style={{
                      padding: "8px 16px",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      borderRadius: "6px",
                      cursor: "pointer",
                      backgroundColor: "rgba(182, 164, 126, 0.15)",
                      color: "#B6A47E",
                      border: "1px solid rgba(182, 164, 126, 0.3)",
                    }}
                  >
                    TAMBAH
                  </button>
                </div>
              </div>

              {/* Variant Stock Breakdown Matrix */}
              {(selectedSizes.length > 0 || selectedColors.length > 0) && variantStocks.length > 0 && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    backgroundColor: isDarkMode ? "#141416" : "#F9FAFB",
                    border: isDarkMode ? "1px solid rgba(182, 164, 126, 0.25)" : "1px solid #E5E7EB",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <label style={{ ...labelStyle, marginBottom: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                      <Box style={{ width: "14px", height: "14px", color: "#B6A47E" }} />
                      <span>RINCIAN STOK PER VARIAN (WARNA & UKURAN)</span>
                    </label>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#B6A47E", fontFamily: "monospace" }}>
                      TOTAL: {variantStocks.reduce((sum, item) => sum + (Number(item.stock) || 0), 0)} UNITS
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
                    {variantStocks.map((vItem, idx) => (
                      <div
                        key={`var-${vItem.color}-${vItem.size}-${idx}`}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "6px",
                          backgroundColor: isDarkMode ? "#0A0A0A" : "#FFFFFF",
                          border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #D1D5DB",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#B6A47E", letterSpacing: "0.08em" }}>
                          {vItem.color !== "Default" ? vItem.color : ""} {vItem.color !== "Default" && vItem.size !== "All Size" ? "•" : ""} {vItem.size !== "All Size" ? vItem.size : (vItem.color === "Default" ? "ALL VARIANTS" : "")}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={vItem.stock === 0 ? "" : vItem.stock}
                            onChange={(e) => {
                              const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                              updateVariantStock(vItem.color, vItem.size, isNaN(val) ? 0 : val);
                            }}
                            style={{
                              ...getInputStyle(false),
                              padding: "6px 8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              textAlign: "center",
                            }}
                          />
                          <span style={{ fontSize: "10px", color: isDarkMode ? "#8A8A8A" : "#6B7280", fontWeight: 600 }}>
                            Units
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: "10px", color: isDarkMode ? "#8A8A8A" : "#6B7280", marginTop: "10px", fontFamily: "monospace" }}>
                    * Mengisi stok per varian di atas akan otomatis memperbarui total Stok Produk.
                  </p>
                </div>
              )}

              {/* Primary Cover Image (REQUIRED) */}
              <div id="field-image">
                <label style={labelStyle}>
                  FOTO SAMPUL UTAMA <span style={{ color: "#E53E3E" }}>*</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {formImagePreview && (
                    <div style={{ width: "64px", height: "72px", borderRadius: "6px", overflow: "hidden", border: isDarkMode ? "1px solid rgba(255,255,255,0.15)" : "1px solid #D1D5DB", flexShrink: 0 }}>
                      <img
                        src={formImagePreview}
                        alt="Preview Utama"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <label
                    style={{
                      flex: 1,
                      padding: "14px 16px",
                      borderRadius: "6px",
                      border: errors.image
                        ? "1px dashed #E53E3E"
                        : isDarkMode
                        ? "1px dashed rgba(255, 255, 255, 0.2)"
                        : "1px dashed #9CA3AF",
                      backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <Upload style={{ width: "16px", height: "16px", color: "#B6A47E" }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: isDarkMode ? "#D1D5DB" : "#374151" }}>
                      {formImageFile ? formImageFile.name : "PILIH FOTO UTAMA"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
                <p style={{ fontSize: "10px", color: isDarkMode ? "#8A8A8A" : "#6B7280", marginTop: "4px", fontFamily: "monospace" }}>
                  * Maksimal ukuran file: 5 MB per foto. Format: JPG, PNG, WEBP.
                </p>
                {errors.image && (
                  <p style={{ fontSize: "11px", color: "#E53E3E", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle style={{ width: "13px", height: "13px" }} />
                    <span>{errors.image}</span>
                  </p>
                )}
              </div>

              {/* Multiple Gallery Photos (OPTIONAL) */}
              <div>
                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Images style={{ width: "14px", height: "14px", color: "#B6A47E" }} />
                  <span>GALERI FOTO PRODUK (OPSIONAL)</span>
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "14px 16px",
                    borderRadius: "6px",
                    border: isDarkMode ? "1px dashed rgba(255, 255, 255, 0.2)" : "1px dashed #9CA3AF",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                    cursor: "pointer",
                    marginBottom: "4px",
                  }}
                >
                  <Plus style={{ width: "16px", height: "16px", color: "#B6A47E" }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: isDarkMode ? "#D1D5DB" : "#374151" }}>
                    TAMBAH BANYAK FOTO GALERI
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleGalleryChange}
                    style={{ display: "none" }}
                  />
                </label>
                <p style={{ fontSize: "10px", color: isDarkMode ? "#8A8A8A" : "#6B7280", marginBottom: "12px", fontFamily: "monospace" }}>
                  * Maksimal ukuran file: 5 MB per foto. Format: JPG, PNG, WEBP.
                </p>

                {galleryPreviews.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                    {galleryPreviews.map((src, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "72px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          border: isDarkMode ? "1px solid rgba(255,255,255,0.15)" : "1px solid #D1D5DB",
                          backgroundColor: "#000000",
                        }}
                      >
                        <img
                          src={src}
                          alt={`Galeri ${idx + 1}`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryPhoto(idx)}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "9999px",
                            backgroundColor: "#E53E3E",
                            color: "#FFFFFF",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                          title="Hapus foto"
                        >
                          <X style={{ width: "12px", height: "12px" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>



              {/* Details & Specifications */}
              <div>
                <label style={labelStyle}>DETAILS & SPECIFICATIONS (OPSIONAL)</label>
                <textarea
                  rows={3}
                  placeholder={"Tulis 1 poin per baris, contoh:\nHeavyweight 480 GSM organic combed cotton jersey\nOversized drop-shoulder structural silhouette\nDouble-layered hood with hidden internal reinforced drawstring"}
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  style={{ ...getInputStyle(false), resize: "vertical" }}
                />
                <p style={{ fontSize: "10px", color: isDarkMode ? "#8A8A8A" : "#6B7280", marginTop: "4px", fontFamily: "monospace" }}>
                  * Tulis per baris (1 baris = 1 poin spesifikasi pada halaman detail produk).
                </p>
              </div>


              {/* Size Guide Table */}
              <div>
                <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Ruler style={{ width: "14px", height: "14px", color: "#B6A47E" }} />
                  <span>PANDUAN UKURAN / SIZE GUIDE (TABEL EDITABLE)</span>
                </label>
                <div
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                    backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                  }}
                >
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr
                        style={{
                          borderBottom: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E5E7EB",
                          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.03)" : "#F3F4F6",
                        }}
                      >
                        <th style={{ padding: "10px 14px", fontSize: "11px", letterSpacing: "0.1em", width: "120px" }} className="font-mono font-bold uppercase text-[#B6A47E]">
                          UKURAN (SIZE)
                        </th>
                        <th style={{ padding: "10px 14px", fontSize: "11px", letterSpacing: "0.1em" }} className="font-mono font-bold uppercase text-[#B6A47E]">
                          CHEST (DADA)
                        </th>
                        <th style={{ padding: "10px 14px", fontSize: "11px", letterSpacing: "0.1em" }} className="font-mono font-bold uppercase text-[#B6A47E]">
                          WAIST / LENGTH (PINGGANG/PANJANG)
                        </th>
                        <th style={{ padding: "10px 14px", fontSize: "11px", letterSpacing: "0.1em", width: "60px" }} className="font-mono font-bold uppercase text-[#B6A47E] text-right">
                          AKSI
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? "divide-white/10" : "divide-gray-200"}`}>
                      {sizeGuideRows.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: "8px 12px" }}>
                            <input
                              type="text"
                              value={row.size}
                              onChange={(e) => updateSizeGuideRow(idx, "size", e.target.value)}
                              style={{
                                ...getInputStyle(false),
                                padding: "6px 10px",
                                fontWeight: 700,
                                textAlign: "center",
                                textTransform: "uppercase",
                              }}
                            />
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <input
                              type="text"
                              placeholder="misal: 90 - 95"
                              value={row.chest}
                              onChange={(e) => updateSizeGuideRow(idx, "chest", e.target.value)}
                              style={{ ...getInputStyle(false), padding: "6px 10px" }}
                            />
                          </td>
                          <td style={{ padding: "8px 12px" }}>
                            <input
                              type="text"
                              placeholder="misal: 75 - 80"
                              value={row.waist}
                              onChange={(e) => updateSizeGuideRow(idx, "waist", e.target.value)}
                              style={{ ...getInputStyle(false), padding: "6px 10px" }}
                            />
                          </td>
                          <td style={{ padding: "8px 12px" }} className="text-right">
                            <button
                              type="button"
                              onClick={() => removeSizeGuideRow(idx)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: "4px",
                                border: "none",
                                backgroundColor: "rgba(229, 62, 62, 0.15)",
                                color: "#E53E3E",
                                cursor: "pointer",
                              }}
                              title="Hapus Baris Ukuran"
                            >
                              <X style={{ width: "14px", height: "14px" }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: "10px 14px", borderTop: isDarkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E5E7EB", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={addSizeGuideRow}
                      style={{
                        padding: "6px 14px",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        borderRadius: "6px",
                        cursor: "pointer",
                        backgroundColor: "rgba(182, 164, 126, 0.15)",
                        color: "#B6A47E",
                        border: "1px solid rgba(182, 164, 126, 0.3)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Plus style={{ width: "14px", height: "14px" }} />
                      <span>TAMBAH BARIS UKURAN</span>
                    </button>
                    {sizeGuideRows.length === 0 && (
                      <button
                        type="button"
                        onClick={() => setSizeGuideRows([
                          { size: "S", chest: "90 - 95", waist: "75 - 80" },
                          { size: "M", chest: "96 - 101", waist: "81 - 86" },
                          { size: "L", chest: "102 - 107", waist: "87 - 92" },
                          { size: "XL", chest: "108 - 113", waist: "93 - 98" },
                          { size: "XXL", chest: "114 - 119", waist: "99 - 104" },
                        ])}
                        style={{
                          padding: "6px 14px",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          borderRadius: "6px",
                          cursor: "pointer",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          color: isDarkMode ? "#D1D5DB" : "#4B5563",
                          border: isDarkMode ? "1px solid rgba(255,255,255,0.2)" : "1px solid #D1D5DB",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <span>ISI OTOMATIS STANDAR</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Story */}
              <div>
                <label style={labelStyle}>CERITA PRODUK / BRAND STORY (OPSIONAL)</label>
                <textarea
                  rows={2}
                  placeholder="Kisah atau konsep di balik pembuatan produk ini..."
                  value={formStory}
                  onChange={(e) => setFormStory(e.target.value)}
                  style={{ ...getInputStyle(false), resize: "vertical" }}
                />
              </div>

              {/* Description (OPTIONAL) */}
              <div>
                <label style={labelStyle}>DESKRIPSI UMUM PRODUK (OPSIONAL)</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat produk..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{ ...getInputStyle(false), resize: "vertical" }}
                />
              </div>

              {/* Submit Buttons */}
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
                  onClick={closeModal}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.15)" : "1px solid #D1D5DB",
                    backgroundColor: "transparent",
                    color: isDarkMode ? "#D1D5DB" : "#374151",
                  }}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    border: "none",
                    backgroundColor: isDarkMode ? "#B6A47E" : "#0A0A0A",
                    color: isDarkMode ? "#0A0A0A" : "#FFFFFF",
                    opacity: isSubmitting ? 0.75 : 1,
                  }}
                  className="flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{modalMode === "edit" ? "MENYIMPAN..." : "MENAMBAH..."}</span>
                    </>
                  ) : (
                    <span>{modalMode === "edit" ? "SIMPAN PERUBAHAN" : "SIMPAN PRODUK"}</span>
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
