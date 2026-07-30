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
  timeout: 15000,
});

// Request interceptor to attach Sanctum Token or Member Email
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("sector_madness_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const userStr = localStorage.getItem("sector_madness_user");
        if (userStr) {
          try {
            const parsed = JSON.parse(userStr);
            if (parsed?.token) {
              config.headers.Authorization = `Bearer ${parsed.token}`;
            } else if (parsed?.email) {
              config.headers["X-Member-Email"] = parsed.email;
            }
          } catch {
            // ignore JSON errors
          }
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ====================================================
   TYPES & INTERFACES
==================================================== */

export interface Product {
  id: number;
  slug: string;
  name: string;
  collection?: string;
  price: number;
  image: string;
  stock: number;
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
  tax: number;
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
    tax: number;
    grand_total: number;
  };
  payment_info: {
    method: string;
    payment_status: "paid" | "unpaid" | "failed" | "expired" | string;
    snap_token?: string;
    paid_at?: string;
  };
  shipping_status: string;
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

/* ====================================================
   API SERVICES & METHODS
==================================================== */

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
          product_name: staticProduct.name,
          product_image: staticProduct.image,
          slug: staticProduct.slug,
          category: staticProduct.collection || item.category,
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

export default api;
