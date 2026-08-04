import axios from "axios";
import { products } from "@/data/products";

// Base API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://brand.test/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Request interceptor to attach Sanctum Token — ONLY from sector_madness_token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sector_madness_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Do NOT fall back to sector_madness_user.token or X-Member-Email
      // That caused cross-account cart leakage
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-clear stale auth on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      // Token is invalid/expired — clean up client state to prevent leakage
      const currentPath = window.location.pathname;
      // Don't clear on login/register pages (those are expected 401s)
      if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
        localStorage.removeItem("sector_madness_token");
        localStorage.removeItem("sector_madness_user");
        window.dispatchEvent(new Event("sector_auth_change"));
        window.dispatchEvent(new Event("sector_bag_update"));
      }
    }
    return Promise.reject(error);
  }
);

/* ====================================================
   TYPES & INTERFACES
==================================================== */

export interface Product {
  id: number;
  slug: string;
  name: string;
  collection?: string;
  collection_code?: string;
  description?: string;
  material?: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  discount_expires_at?: string;
  is_flash_sale?: boolean;
  image: string;
  stock: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface CartItem {
  id: number | string;
  product_id: number;
  product_image: string;
  product_name: string;
  category: string;
  variant: string;
  color: string;
  size: string;
  quantity: number;
  stock: number;
  price: number;
  original_price?: number;
  discount: number;
  subtotal: number;
  slug?: string;
}

export interface CartData {
  cart_id: number;
  items: CartItem[];
  total_quantity: number;
  subtotal: number;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  in_stock: boolean;
  stock_quantity?: number;
  size?: string;
  color?: string;
}

export interface CustomerProfile {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  birth_date?: string;
  dob?: string;
  last_login_at?: string;
}

export interface ShippingAddress {
  id: number;
  user_id?: number;
  label: "Rumah" | "Kantor" | "Apartemen" | "Lainnya" | string;
  receiver_name: string;
  phone_number: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  street_address: string;
  address_notes?: string;
  area_id?: string;
  is_default: boolean;
}

export interface BiteshipArea {
  id: string;
  name: string;
  country_name: string;
  administrative_division_level_1_name: string; // Province
  administrative_division_level_2_name: string; // City
  administrative_division_level_3_name: string; // District
  postal_code: number | string;
}

export interface ShippingRate {
  courier_code: string;
  courier_name: string;
  service_code: string;
  service_name: string;
  shipping_price: number;
  estimated_delivery: string;
  description: string;
}

export interface SummaryData {
  subtotal: number;
  shipping: number;
  discount: number;
  tax?: number;
  grand_total: number;
  items_count: number;
  items?: {
    id: number;
    product_name: string;
    product_image: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
    subtotal: number;
    in_stock: boolean;
  }[];
  can_checkout: boolean;
  has_out_of_stock: boolean;
  currency: string;
}

export interface VoucherResult {
  code: string;
  name: string;
  discount_amount: number;
  minimum_purchase: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  category: string;
  description: string;
  icon?: string;
  is_active: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  color?: string;
  size?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderTimeline {
  status: string;
  date: string;
  detail: string;
  done: boolean;
}

export interface OrderDetailData {
  order_number: string;
  order_date: string;
  customer_info: {
    name: string;
    email: string;
    phone: string;
  };
  shipping_address: {
    receiver_name: string;
    phone_number: string;
    street_address: string;
    city: string;
    province: string;
    postal_code: string;
    label: string;
  };
  courier_info: {
    courier_code: string;
    courier_name: string;
    service_code: string;
    service_name: string;
    estimated_delivery: string;
    tracking_number?: string;
  };
  products: OrderItem[];
  summary: {
    subtotal: number;
    shipping: number;
    discount: number;
    tax?: number;
    grand_total: number;
  };
  payment_info: {
    method: string;
    payment_status: "paid" | "unpaid" | "failed" | "expired" | string;
    snap_token?: string;
    paid_at?: string;
  };
  shipping_status: string;
  status?: string;
  cancel_reason?: string;
  cancellation_reason?: string;
  cancel_note?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  refund_bank?: string;
  refund_account?: string;
  refund_name?: string;
  no_rekening?: string;
  nama_rekening?: string;
  cancellation_request?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    account_holder?: string;
    reason?: string;
    notes?: string;
  };
  cancel_data?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    account_holder?: string;
    reason?: string;
    notes?: string;
  };
  timeline: OrderTimeline[];
  created_at?: string;
  payment_status?: string;
}

export interface OrderListItem {
  order_number: string;
  order_date: string;
  status: string;
  total: number;
  payment_status: string;
  payment_method: string;
  shipping_status: string;
  tracking_number?: string;
  items_count: number;
  snap_token?: string;
}

export interface TrackingData {
  current_status: string;
  courier: string;
  tracking_number: string;
  estimated_delivery: string;
  timeline: {
    title: string;
    time: string;
    description: string;
    status: string;
  }[];
}

export interface HeroBanner {
  id: number;
  image_path: string;
  sort_order: number;
  is_active: boolean;
}

/* ====================================================
   API SERVICES & METHODS
==================================================== */

export const getHeroBanners = async (): Promise<HeroBanner[]> => {
  try {
    const res = await api.get("/hero-banners");
    return res.data.data || [];
  } catch {
    return [];
  }
};

// Shopping Bag
export const getCart = async (): Promise<CartData> => {
  const res = await api.get("/cart");
  const data = res.data.data;
  if (data && data.items && Array.isArray(data.items)) {
    data.items = data.items.map((item: any) => {
      const staticProduct = products.find(
        (p) => parseInt(p.id, 10) === Number(item.product_id) || p.slug === item.slug || p.name === item.product_name
      );
      if (staticProduct) {
        return {
          ...item,
          product_name: item.product_name || staticProduct.name,
          product_image: item.product_image || staticProduct.image,
          slug: item.slug || staticProduct.slug,
          category: item.category || staticProduct.collection,
        };
      }
      return item;
    });
  }
  return data;
};

export const addToCart = async (payload: { product_id?: number | string; slug?: string; name?: string; color?: string; size?: string; quantity?: number }) => {
  const res = await api.post("/cart/items", payload);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("sector_bag_change"));
  return res.data;
};

export const updateCartQuantity = async (id: number | string, quantity: number) => {
  const res = await api.put(`/cart/${id}`, { quantity });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("sector_bag_change"));
  return res.data;
};

export const deleteCartItem = async (id: number | string) => {
  const res = await api.delete(`/cart/${id}`);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("sector_bag_change"));
  return res.data;
};

export const clearCart = async () => {
  const res = await api.delete("/cart");
  if (typeof window !== "undefined") window.dispatchEvent(new Event("sector_bag_change"));
  return res.data;
};

// Wishlist API
export const getWishlist = async (): Promise<WishlistItem[]> => {
  const res = await api.get("/wishlist");
  return res.data;
};

export const addToWishlist = async (productId: number, size?: string, color?: string) => {
  const res = await api.post("/wishlist", { product_id: productId, size, color });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("sector_wishlist_change"));
  return res.data;
};

export const removeFromWishlist = async (productId: number, size?: string, color?: string) => {
  const res = await api.delete(`/wishlist/${productId}`, { data: { size, color } });
  if (typeof window !== "undefined") window.dispatchEvent(new Event("sector_wishlist_change"));
  return res.data;
};

export const checkWishlistStatus = async (productId: number, size?: string, color?: string): Promise<boolean> => {
  const params = new URLSearchParams();
  if (size) params.append("size", size);
  if (color) params.append("color", color);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await api.get(`/wishlist/check/${productId}${qs}`);
  return res.data?.in_wishlist || false;
};

// Catalog API
export const getProducts = async (): Promise<any[]> => {
  try {
    const res = await api.get("/products");
    return res.data.data || [];
  } catch {
    return [];
  }
};

export const getProductBySlug = async (slug: string): Promise<any> => {
  try {
    const res = await api.get(`/products/${slug}`);
    return res.data.data;
  } catch {
    return null;
  }
};

// FAQ API
export const getFaqs = async (): Promise<any[]> => {
  try {
    const res = await api.get("/faqs");
    return res.data?.data || [];
  } catch (e) {
    console.warn("Failed to fetch FAQs from API:", e);
    return [];
  }
};

// Customer Information
export const getCustomerProfile = async (): Promise<CustomerProfile> => {
  const res = await api.get("/user/profile-info");
  return res.data.data;
};

export const updateCustomerProfile = async (data: Partial<CustomerProfile>) => {
  const res = await api.put("/user/profile", data);
  return res.data.data;
};

// Address Book
export const getShippingAddresses = async (): Promise<ShippingAddress[]> => {
  const res = await api.get("/shipping-address");
  return res.data.data || [];
};

export const addShippingAddress = async (data: Omit<ShippingAddress, "id">) => {
  const res = await api.post("/shipping-address", data);
  return res.data.data;
};

export const updateShippingAddress = async ({ id, ...data }: Partial<ShippingAddress> & { id: number }) => {
  const res = await api.put(`/shipping-address/${id}`, data);
  return res.data.data;
};

export const deleteShippingAddress = async (id: number) => {
  const res = await api.delete(`/shipping-address/${id}`);
  return res.data;
};

// Warehouse / Office Database Info
export interface WarehouseInfo {
  id: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  area_id: string;
  is_primary: boolean;
  notes?: string;
}

export const getWarehouseInfo = async (): Promise<WarehouseInfo> => {
  const res = await api.get("/warehouse");
  return res.data.data;
};

// Biteship Areas & Shipping Rates
export const searchBiteshipAreas = async (input: string): Promise<BiteshipArea[]> => {
  if (!input || input.length < 3) return [];
  try {
    const res = await api.get(`/shipping/areas?input=${encodeURIComponent(input)}`);
    return res.data.data || [];
  } catch {
    return [];
  }
};

export const getShippingRates = async (payload: {
  destination_area_id?: string;
  destination_postcode?: string;
  weight?: number;
  couriers?: string;
  city?: string;
  province?: string;
  district?: string;
}): Promise<ShippingRate[]> => {
  const res = await api.post("/shipping/rates", payload);
  return res.data.data || [];
};

// Order Summary & Vouchers
export const getOrderSummary = async (params: {
  shipping_price?: number;
  courier_code?: string;
  service_code?: string;
  voucher_code?: string;
}): Promise<SummaryData> => {
  const res = await api.get("/checkout/summary", { params });
  return res.data.data;
};

export const checkVoucher = async (code: string): Promise<VoucherResult> => {
  const res = await api.post("/voucher/check", { code });
  return res.data.data;
};

// Payment Methods & Transaction Creation
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const res = await api.get("/payment-methods");
  return res.data.data || [];
};

export const createPaymentTransaction = async (payload: {
  address_id?: number;
  receiver_name?: string;
  phone_number?: string;
  street_address?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  courier_code: string;
  courier_name?: string;
  service_code: string;
  service_name?: string;
  shipping_price: number;
  estimated_delivery?: string;
  payment_method: string;
  voucher_code?: string;
}): Promise<{ status: boolean; message?: string; snap_token?: string; va_number?: string; qr_string?: string; order_number: string }> => {
  const res = await api.post("/payment/create", payload);
  return res.data;
};

export const checkPaymentStatus = async (orderNumber: string): Promise<{ status: boolean; is_paid: boolean; transaction_status: string }> => {
  const res = await api.get(`/checkout/status/${orderNumber}`);
  return res.data;
};

// Orders Management & Tracking
export const getOrders = async (): Promise<OrderListItem[]> => {
  const res = await api.get("/orders");
  return res.data.data || [];
};

export const getOrderDetail = async (orderNumber: string): Promise<OrderDetailData> => {
  const res = await api.get(`/orders/${orderNumber}`);
  return res.data.data;
};

export const cancelOrder = async (orderNumber: string, payload?: any): Promise<any> => {
  const res = await api.post(`/orders/${orderNumber}/cancel`, payload);
  return res.data;
};

export const confirmOrderReceived = async (orderNumber: string): Promise<any> => {
  const res = await api.post(`/orders/${orderNumber}/confirm-received`);
  return res.data;
};

export function isOrderActive(item: { shipping_status?: string; status?: string; created_at?: string; updated_at?: string }): boolean {
  const st = (item.shipping_status || item.status || "").toUpperCase();
  const ordSt = (item.status || "").toUpperCase();

  const isCancelled =
    st === "CANCELLED" ||
    st === "DIBATALKAN" ||
    ordSt === "CANCELLED" ||
    ordSt === "DIBATALKAN";

  const isCompleted =
    st === "COMPLETED" ||
    st === "RECEIVED" ||
    st === "SELESAI" ||
    st === "DITERIMA" ||
    ordSt === "COMPLETED" ||
    ordSt === "RECEIVED";

  let isDeliveredAutoFinished = false;
  if (st === "DELIVERED" || ordSt === "DELIVERED") {
    const timeRef = (item as any).updated_at || item.created_at || "";
    if (timeRef) {
      const updateTime = new Date(timeRef).getTime();
      if (!isNaN(updateTime) && Date.now() - updateTime > 24 * 60 * 60 * 1000) {
        isDeliveredAutoFinished = true;
      }
    }
  }

  return !isCancelled && !isCompleted && !isDeliveredAutoFinished;
}

export function isOrderFinished(item: { shipping_status?: string; status?: string; created_at?: string; updated_at?: string }): boolean {
  const st = (item.shipping_status || item.status || "").toUpperCase();
  const ordSt = (item.status || "").toUpperCase();

  const isCancelled =
    st === "CANCELLED" ||
    st === "DIBATALKAN" ||
    ordSt === "CANCELLED" ||
    ordSt === "DIBATALKAN";

  const isCompleted =
    st === "COMPLETED" ||
    st === "RECEIVED" ||
    st === "SELESAI" ||
    st === "DITERIMA" ||
    ordSt === "COMPLETED" ||
    ordSt === "RECEIVED";

  let isDeliveredAutoFinished = false;
  if (st === "DELIVERED" || ordSt === "DELIVERED") {
    const timeRef = (item as any).updated_at || item.created_at || "";
    if (timeRef) {
      const updateTime = new Date(timeRef).getTime();
      if (!isNaN(updateTime) && Date.now() - updateTime > 24 * 60 * 60 * 1000) {
        isDeliveredAutoFinished = true;
      }
    }
  }

  return isCompleted || isCancelled || isDeliveredAutoFinished;
}

export const getShipmentTracking = async (trackingNumber: string): Promise<TrackingData> => {
  const res = await api.get(`/shipping/track/${trackingNumber}`);
  const raw = res.data.data || {};
  
  // Format consistent tracking timeline
  const st = strtoupper(raw.status || "");
  const formattedStatus = 
    st === "ALLOCATED" || st === "PROCESSING" || st === "IN PROCESS" ? "IN PROCESS" :
    st === "PACKED" || st === "READY_TO_SHIP" || st === "READY FOR DISPATCH" || st === "SIAP KIRIM" ? "READY TO SHIP" :
    st === "SHIPPED" || st === "IN_TRANSIT" || st === "IN TRANSIT" ? "IN TRANSIT" :
    st === "DELIVERED" || st === "COMPLETED" ? "DELIVERED" : (st || "IN PROCESS");

  return {
    current_status: formattedStatus,
    courier: raw.courier?.company ? strtoupper(raw.courier.company) : "BITESHIP LOGISTICS",
    tracking_number: trackingNumber,
    estimated_delivery: raw.estimated_delivery_at || "1-3 Days",
    timeline: raw.history ? raw.history.map((h: any) => ({
      title: h.status || "Update",
      time: h.updated_at ? new Date(h.updated_at).toLocaleString("id-ID") : "Recently",
      description: h.note || "Package status updated in Biteship network.",
      status: h.status || "Processing",
    })) : [
      {
        title: "Atelier Dispatch Verified",
        time: new Date().toLocaleString("id-ID"),
        description: "Package signed and transferred to priority distribution center.",
        status: "COMPLETED",
      },
      {
        title: "In Transit",
        time: new Date(Date.now() - 3600000).toLocaleString("id-ID"),
        description: "En route to destination facility via Biteship logistics partner.",
        status: "IN_PROGRESS",
      },
      {
        title: "Order Processed",
        time: new Date(Date.now() - 7200000).toLocaleString("id-ID"),
        description: "Item inspected for quality and luxury packaging sealed.",
        status: "COMPLETED",
      }
    ],
  };
};

function strtoupper(val: string) {
  return val ? val.toString().toUpperCase() : "";
}

// Authentication APIs
export const authApiLogin = async (data: { email: string; password?: string }) => {
  const res = await api.post("/login", data);
  return res.data;
};

export const authApiRegister = async (data: { name: string; email: string; password?: string; phone?: string; birth_date?: string }) => {
  const res = await api.post("/register", data);
  return res.data;
};

export const authApiLogout = async () => {
  try {
    const res = await api.post("/logout");
    return res.data;
  } catch (e) {
    // Ignore error if token expired or server unreachable during logout
    return { status: true };
  }
};

export const adminApiLogout = async () => {
  try {
    const res = await api.post("/admin/logout");
    return res.data;
  } catch (e) {
    // Ignore error — clear session regardless
    return { status: true };
  }
};

export const authApiSendOtp = async (data: { email: string }) => {
  const res = await api.post("/forgot-password/send-otp", data);
  return res.data;
};

export const authApiVerifyOtp = async (data: { email: string; otp: string }) => {
  const res = await api.post("/forgot-password/verify-otp", data);
  return res.data;
};

export const authApiResetPassword = async (data: { email: string; otp: string; password: string; password_confirmation: string }) => {
  const res = await api.post("/forgot-password/reset", data);
  return res.data;
};

export interface SizeGuideItem {
  id: number;
  category: string;
  category_code: string;
  fit_description?: string;
  description?: string;
  columns: string[];
  rows: Record<string, string>[];
  sort_order?: number;
  is_active?: boolean;
}

export const getSizeGuides = async (): Promise<SizeGuideItem[]> => {
  try {
    const res = await api.get("/size-guides");
    if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch size guides from API:", error);
  }
  return [];
};

export interface ContactSettingItem {
  id: number;
  type: "channel" | "warehouse";
  code?: string;
  title: string;
  subtitle?: string;
  value: string;
  link?: string;
  note?: string;
  latitude?: number;
  longitude?: number;
  sort_order?: number;
  is_active?: boolean;
}

export const getContactSettings = async (): Promise<ContactSettingItem[]> => {
  try {
    const res = await api.get("/contact-settings");
    if (res.data && res.data.status === "success" && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch contact settings from API:", error);
  }
  return [];
};

/* ====================================================
   CATEGORIES, COLLECTIONS & SORT OPTIONS API
==================================================== */

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  products_count?: number;
}

export interface CollectionItem {
  id: number;
  name: string;
  slug: string;
  code?: string;
  description?: string;
  is_active?: boolean;
}

export interface SortOptionItem {
  id: number;
  name: string;
  code: string;
  sort_order?: number;
  is_active?: boolean;
}

// Categories API
export const getCategories = async (): Promise<CategoryItem[]> => {
  try {
    const res = await api.get("/categories");
    if (res.data && res.data.status && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch categories from API:", error);
  }
  return [];
};

export const createCategory = async (data: { name: string; description?: string }) => {
  const res = await api.post("/admin/categories", data);
  return res.data;
};

export const updateCategory = async (id: number, data: { name: string; description?: string }) => {
  const res = await api.put(`/admin/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id: number) => {
  const res = await api.delete(`/admin/categories/${id}`);
  return res.data;
};

// Collections / Focus On API
export const getCollections = async (): Promise<CollectionItem[]> => {
  try {
    const res = await api.get("/collections");
    if (res.data && res.data.status && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch collections from API:", error);
  }
  return [];
};

export const createCollection = async (data: { name: string; code?: string; description?: string }) => {
  const res = await api.post("/admin/collections", data);
  return res.data;
};

export const updateCollection = async (id: number, data: { name: string; code?: string; description?: string; is_active?: boolean }) => {
  const res = await api.put(`/admin/collections/${id}`, data);
  return res.data;
};

export const deleteCollection = async (id: number) => {
  const res = await api.delete(`/admin/collections/${id}`);
  return res.data;
};

// Sort Options API
export const getSortOptions = async (): Promise<SortOptionItem[]> => {
  try {
    const res = await api.get("/sort-options");
    if (res.data && res.data.status && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch sort options from API:", error);
  }
  return [];
};

export const createSortOption = async (data: { name: string; code?: string; sort_order?: number }) => {
  const res = await api.post("/admin/sort-options", data);
  return res.data;
};

export const updateSortOption = async (id: number, data: { name: string; code?: string; sort_order?: number; is_active?: boolean }) => {
  const res = await api.put(`/admin/sort-options/${id}`, data);
  return res.data;
};

export const deleteSortOption = async (id: number) => {
  const res = await api.delete(`/admin/sort-options/${id}`);
  return res.data;
};

/* ====================================================
   JOURNAL ARTICLES API
==================================================== */
export interface JournalArticle {
  id: number | string;
  slug: string;
  title: string;
  category: string;
  issue?: string;
  date?: string;
  summary?: string;
  image?: string;
  featured?: boolean;
  content?: string[] | string;
  quote?: string;
  sort_order?: number;
  is_published?: boolean;
  created_at?: string;
}

export const getJournals = async (category?: string): Promise<JournalArticle[]> => {
  try {
    const url = category && category !== "ALL" ? `/journals?category=${encodeURIComponent(category)}` : "/journals";
    const res = await api.get(url);
    if (Array.isArray(res.data)) {
      return res.data;
    }
  } catch (error) {
    console.error("Failed to fetch journals from API:", error);
  }
  return [];
};

export const createJournal = async (data: Partial<JournalArticle>) => {
  const res = await api.post("/admin/journals", data);
  return res.data;
};

export const updateJournal = async (id: number | string, data: Partial<JournalArticle>) => {
  const res = await api.put(`/admin/journals/${id}`, data);
  return res.data;
};

export const deleteJournal = async (id: number | string) => {
  const res = await api.delete(`/admin/journals/${id}`);
  return res.data;
};

/* ====================================================
   ADMIN MANAGEMENT API
==================================================== */
export interface AdminOrder {
  id: number;
  order_number: string;
  user_id?: number;
  customer_name?: string;
  customer_email?: string;
  total: number;
  payment_status: string;
  shipping_status: string;
  courier?: string;
  tracking_number?: string;
  cancel_reason?: string;
  cancellation_reason?: string;
  cancel_note?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  refund_bank?: string;
  refund_account?: string;
  refund_name?: string;
  no_rekening?: string;
  nama_rekening?: string;
  cancellation_request?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    account_holder?: string;
    reason?: string;
    notes?: string;
  };
  cancel_data?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    account_holder?: string;
    reason?: string;
    notes?: string;
  };
  created_at: string;
  items_count?: number;
}

export const getAdminOrders = async (): Promise<AdminOrder[]> => {
  try {
    const res = await api.get("/admin/orders");
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
  }
  return [];
};

export const updateAdminShipment = async (
  orderNumber: string,
  data: { shipping_status?: string; courier?: string; tracking_number?: string }
) => {
  const res = await api.put(`/admin/orders/${orderNumber}/shipment`, data);
  return res.data;
};

export interface AdminHeroBanner {
  id: number;
  title?: string;
  subtitle?: string;
  image_path: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
}

export const getAdminHeroBanners = async (): Promise<AdminHeroBanner[]> => {
  try {
    const res = await api.get("/admin/hero-banners");
    // Backend returns { status: 'success', data: [...] }
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
  } catch (error) {
    console.error("Failed to fetch admin hero banners:", error);
  }
  return [];
};

export const createAdminHeroBanner = async (data: Partial<AdminHeroBanner>) => {
  const res = await api.post("/admin/hero-banners", data);
  return res.data;
};

export const updateAdminHeroBanner = async (id: number, data: Partial<AdminHeroBanner>) => {
  const res = await api.put(`/admin/hero-banners/${id}`, data);
  return res.data;
};

export const deleteAdminHeroBanner = async (id: number) => {
  const res = await api.delete(`/admin/hero-banners/${id}`);
  return res.data;
};

/**
 * Upload an image file to the backend.
 * Returns the public path string (e.g. /storage/uploads/uuid.jpg)
 */
export const uploadAdminImage = async (file: File, folder: string = "uploads"): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("folder", folder);

  const res = await axios.post(`${API_URL}/admin/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    },
    timeout: 30000,
  });

  if (res.data?.path) {
    return res.data.path;
  }
  throw new Error("Upload gagal: respons tidak valid dari server.");
};

export interface AdminProduct {
  id: number;
  slug: string;
  name: string;
  category_id?: number;
  collection_id?: number;
  collection?: string;
  collection_code?: string;
  description?: string;
  material?: string;
  weight?: string;
  details?: string[] | string;
  size_guide?: any;
  story?: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  discount_expires_at?: string;
  is_flash_sale?: boolean;
  limited?: boolean;
  image: string;
  gallery?: string[];
  colors?: string[];
  sizes?: string[];
  stock: number;
  variants?: any[];
  is_active?: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export const getAdminProducts = async (): Promise<AdminProduct[]> => {
  try {
    const res = await api.get("/admin/products");
    if (res.data?.data && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
  } catch (error) {
    try {
      const res = await api.get("/products");
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      if (Array.isArray(res.data)) {
        return res.data;
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }
  return [];
};

export const createAdminProduct = async (data: Partial<AdminProduct>) => {
  const res = await api.post("/admin/products", data);
  return res.data;
};

export const updateAdminProduct = async (id: number, data: Partial<AdminProduct>) => {
  const res = await api.put(`/admin/products/${id}`, data);
  return res.data;
};

export const deleteAdminProduct = async (id: number) => {
  const res = await api.delete(`/admin/products/${id}`);
  return res.data;
};

export const getImageUrl = (path?: string): string => {
  if (!path) return "/images/placeholder.png";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const baseUrl = API_URL.replace(/\/api\/?$/, "");
  if (path.startsWith("/storage/")) return `${baseUrl}${path}`;
  if (path.startsWith("storage/")) return `${baseUrl}/${path}`;
  return path;
};

export default api;
