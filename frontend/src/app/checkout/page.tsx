"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getCustomerProfile,
  updateCustomerProfile,
  getShippingAddresses,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  searchBiteshipAreas,
  getShippingRates,
  getOrderSummary,
  checkVoucher,
  getPaymentMethods,
  createPaymentTransaction,
  ShippingAddress,
  ShippingRate,
  BiteshipArea,
} from "@/utils/api";
import {
  AddressSkeleton,
  ShippingSkeleton,
  PaymentMethodSkeleton,
  SummarySkeleton,
  ErrorState,
} from "@/components/UIState";
import { useToast } from "@/components/Toast";

declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast, success, error } = useToast();

  /* ====================================================
     1. CUSTOMER INFORMATION (LOAD OTOMATIS)
  ==================================================== */
  const { data: customer, isLoading: isCustomerLoading, refetch: refetchCustomer } = useQuery({
    queryKey: ["customer"],
    queryFn: getCustomerProfile,
  });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (customer) {
      setFullName(customer.name || "");
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
    }
  }, [customer]);

  const updateProfileMutation = useMutation({
    mutationFn: () => updateCustomerProfile({ name: fullName, email, phone }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["customer"], updated);
      setIsEditingProfile(false);
      success("Customer profile updated successfully.", "MEMBER PROFILE");
    },
    onError: (err: any) => {
      error(err.response?.data?.message || "Failed to update profile info.");
    },
  });

  /* ====================================================
     2. ADDRESS BOOK & BITESHIP AREA AUTOCOMPLETE
  ==================================================== */
  const { data: addresses = [], isLoading: isAddressesLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: getShippingAddresses,
  });

  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  // Auto select default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddress(def);
    }
  }, [addresses, selectedAddress]);

  // Form State for Add/Edit Address
  const [formLabel, setFormLabel] = useState("Rumah");
  const [formReceiver, setFormReceiver] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formStreet, setFormStreet] = useState("");
  const [formProvince, setFormProvince] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formDistrict, setFormDistrict] = useState("");
  const [formPostal, setFormPostal] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formAreaId, setFormAreaId] = useState("IDNPJ001");
  const [formDefault, setFormDefault] = useState(true);

  // Searchable Autocomplete for Biteship Area
  const [areaSearchInput, setAreaSearchInput] = useState("");
  const [areaResults, setAreaResults] = useState<BiteshipArea[]>([]);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleAreaInput = (val: string) => {
    setAreaSearchInput(val);
    setShowAreaDropdown(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (val.length < 3) {
      setAreaResults([]);
      return;
    }
    setIsSearchingArea(true);
    debounceTimeout.current = setTimeout(async () => {
      const res = await searchBiteshipAreas(val);
      setAreaResults(res);
      setIsSearchingArea(false);
    }, 350);
  };

  const selectArea = (area: BiteshipArea) => {
    setFormProvince(area.administrative_division_level_1_name || "DKI Jakarta");
    setFormCity(area.administrative_division_level_2_name || "Jakarta Selatan");
    setFormDistrict(area.administrative_division_level_3_name || "Kebayoran Baru");
    setFormPostal(String(area.postal_code || "12110"));
    setFormAreaId(area.id || "IDNPJ001");
    setAreaSearchInput(`${area.name}, ${area.administrative_division_level_2_name}`);
    setShowAreaDropdown(false);
  };

  const addAddressMutation = useMutation({
    mutationFn: () =>
      addShippingAddress({
        label: formLabel,
        receiver_name: formReceiver,
        phone_number: formPhone,
        province: formProvince || "DKI Jakarta",
        city: formCity || "Jakarta Selatan",
        district: formDistrict || "Kebayoran Baru",
        postal_code: formPostal || "12110",
        street_address: formStreet,
        address_notes: formNotes,
        area_id: formAreaId,
        is_default: formDefault,
      }),
    onSuccess: (newAddr) => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
      setSelectedAddress(newAddr);
      setShowAddAddressModal(false);
      resetAddressForm();
      success("New shipping address added to address book.", "ADDRESS BOOK");
    },
    onError: (err: any) => error(err.response?.data?.message || "Failed to save shipping address."),
  });

  const updateAddressMutation = useMutation({
    mutationFn: () =>
      updateShippingAddress({
        id: editingAddressId!,
        label: formLabel,
        receiver_name: formReceiver,
        phone_number: formPhone,
        province: formProvince,
        city: formCity,
        district: formDistrict,
        postal_code: formPostal,
        street_address: formStreet,
        address_notes: formNotes,
        area_id: formAreaId,
        is_default: formDefault,
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
      setSelectedAddress(updated);
      setShowAddAddressModal(false);
      resetAddressForm();
      success("Shipping address updated successfully.", "ADDRESS BOOK");
    },
    onError: (err: any) => error(err.response?.data?.message || "Failed to update shipping address."),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => deleteShippingAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-addresses"] });
      showToast("Address removed from address book.", "info", "ADDRESS BOOK");
      if (selectedAddress?.id === editingAddressId) {
        setSelectedAddress(null);
      }
    },
    onError: (err: any) => error(err.response?.data?.message || "Failed to delete address."),
  });

  const openAddModal = () => {
    resetAddressForm();
    setEditingAddressId(null);
    setShowAddAddressModal(true);
  };

  const openEditModal = (addr: ShippingAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setFormLabel(addr.label || "Rumah");
    setFormReceiver(addr.receiver_name || "");
    setFormPhone(addr.phone_number || "");
    setFormStreet(addr.street_address || "");
    setFormProvince(addr.province || "");
    setFormCity(addr.city || "");
    setFormDistrict(addr.district || "");
    setFormPostal(addr.postal_code || "");
    setFormNotes(addr.address_notes || "");
    setFormAreaId(addr.area_id || "IDNPJ001");
    setFormDefault(addr.is_default || false);
    setAreaSearchInput(`${addr.district || ""}, ${addr.city || ""}`);
    setShowAddAddressModal(true);
  };

  const resetAddressForm = () => {
    setFormLabel("Rumah");
    setFormReceiver(customer?.name || "");
    setFormPhone(customer?.phone || "");
    setFormStreet("");
    setFormProvince("DKI Jakarta");
    setFormCity("Jakarta Selatan");
    setFormDistrict("Kebayoran Baru");
    setFormPostal("12110");
    setFormNotes("");
    setFormAreaId("IDNPJ001");
    setFormDefault(true);
    setAreaSearchInput("");
  };

  /* ====================================================
     3. BITESHIP SHIPPING (DYNAMIC FROM BACKEND)
  ==================================================== */
  const { data: shippingRates = [], isLoading: isRatesLoading } = useQuery({
    queryKey: ["shipping-rates", selectedAddress?.area_id || "IDNPJ001"],
    queryFn: () => getShippingRates({ destination_area_id: selectedAddress?.area_id || "IDNPJ001" }),
    enabled: !!selectedAddress || addresses.length === 0,
  });

  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  useEffect(() => {
    if (shippingRates.length > 0 && (!selectedRate || !shippingRates.some((r) => r.service_code === selectedRate.service_code))) {
      setSelectedRate(shippingRates[0]);
    }
  }, [shippingRates, selectedRate]);

  /* ====================================================
     4. VOUCHER CHECK
  ==================================================== */
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);

  const voucherMutation = useMutation({
    mutationFn: (code: string) => checkVoucher(code),
    onSuccess: (res) => {
      setAppliedVoucher(res.code);
      success(`Promo ${res.code} applied! Discount Rp ${res.discount_amount.toLocaleString("id-ID")}`, "PROMOTION APPLIED");
    },
    onError: (err: any) => {
      setAppliedVoucher(null);
      error(err.response?.data?.message || "Invalid or expired promo voucher code.");
    },
  });

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    voucherMutation.mutate(voucherInput.trim());
  };

  /* ====================================================
     5. PAYMENT METHOD (LOAD DARI BACKEND)
  ==================================================== */
  const { data: paymentMethods = [], isLoading: isMethodsLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: getPaymentMethods,
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("qris");

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPaymentMethod]);

  /* ====================================================
     6. ORDER SUMMARY (ALL CALCULATED BY BACKEND)
  ==================================================== */
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: [
      "order-summary",
      selectedRate?.shipping_price || 0,
      selectedRate?.courier_code || "",
      selectedRate?.service_code || "",
      appliedVoucher || "",
    ],
    queryFn: () =>
      getOrderSummary({
        shipping_price: selectedRate?.shipping_price || 0,
        courier_code: selectedRate?.courier_code || "",
        service_code: selectedRate?.service_code || "",
        voucher_code: appliedVoucher || undefined,
      }),
  });

  /* ====================================================
     7. VALIDASI SEBELUM PEMBAYARAN & MIDTRANS SNAP
  ==================================================== */
  const [isPaying, setIsPaying] = useState(false);

  const handlePayNow = async () => {
    if (!selectedAddress && addresses.length > 0) {
      error("Please select a shipping address before taking action.");
      return;
    }
    if (!selectedRate) {
      error("Please select an integrated Biteship courier service.");
      return;
    }
    if (!selectedPaymentMethod) {
      error("Please pick an authorization payment method.");
      return;
    }

    setIsPaying(true);
    try {
      const res = await createPaymentTransaction({
        address_id: selectedAddress ? selectedAddress.id : undefined,
        receiver_name: selectedAddress ? selectedAddress.receiver_name : customer?.name || "Member",
        phone_number: selectedAddress ? selectedAddress.phone_number : customer?.phone || "081234567890",
        street_address: selectedAddress ? selectedAddress.street_address : "Jl. Senopati Raya No. 28",
        province: selectedAddress ? selectedAddress.province : "DKI Jakarta",
        city: selectedAddress ? selectedAddress.city : "Jakarta Selatan",
        postal_code: selectedAddress ? selectedAddress.postal_code : "12110",
        courier_code: selectedRate.courier_code,
        courier_name: selectedRate.courier_name,
        service_code: selectedRate.service_code,
        service_name: selectedRate.service_name,
        shipping_price: selectedRate.shipping_price,
        estimated_delivery: selectedRate.estimated_delivery,
        payment_method: selectedPaymentMethod,
        voucher_code: appliedVoucher || undefined,
      });

      if (!res.status || !res.snap_token) {
        throw new Error("Failed to generate Midtrans transaction authorization.");
      }

      showToast("Midtrans Snap transaction initialized...", "info", "MIDTRANS GATEWAY");

      // Buka Midtrans Snap Popup hanya setelah user klik Bayar Sekarang & validasi lolos!
      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(res.snap_token, {
          onSuccess: function (result: any) {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            router.push(`/checkout/success?order_number=${res.order_number}`);
          },
          onPending: function (result: any) {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            showToast("Transaction status pending authorization.", "warning", "PAYMENT PENDING");
            router.push(`/orders/${res.order_number}`);
          },
          onError: function (result: any) {
            error("Transaction declined by bank or payment provider. Please retry.");
            setIsPaying(false);
          },
          onClose: function () {
            showToast("You closed the payment popup before completing authorization.", "warning", "PAYMENT UNFINISHED");
            setIsPaying(false);
          },
        });
      } else {
        // Fallback bila Snap SDK belum selesai mengunduh dari CDN sandbox
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        router.push(`/checkout/success?order_number=${res.order_number}&simulated=true`);
      }
    } catch (err: any) {
      setIsPaying(false);
      error(err.response?.data?.message || err.message || "Validation failed during checkout transaction creation.");
    }
  };

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex flex-col selection:bg-[#FFFFFF] selection:text-[#0A0A0A]"
    >
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="Mid-client-sBSqTk7RhzcH4GEK" strategy="afterInteractive" />
      
      <Navbar />

      {/* FULL-WIDTH HEADER SECTION WITH EDGE-TO-EDGE BORDER LINE */}
      <div style={{ paddingTop: "140px" }} className="w-full border-b border-[#262626] pb-8">
        <div className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20">
          <div style={{ paddingLeft: "60px", paddingRight: "60px" }} className="flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#8A8A8A] uppercase block mb-2 font-bold">
                ATELIER CONCIERGE // CHECKOUT PROTOCOL
              </span>
              <h1 className="text-3xl lg:text-5xl font-extrabold uppercase tracking-[0.08em] text-white">
                SECURE CHECKOUT
              </h1>
            </div>
            <Link href="/bag" className="font-mono text-xs text-[#8A8A8A] uppercase tracking-wider hover:text-white transition-colors">
              ← RETURN TO SHOPPING BAG
            </Link>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION BELOW THE FULL-WIDTH LINE */}
      <div className="flex-1 w-full max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20 py-16 pb-36">
        <div style={{ paddingLeft: "60px", paddingRight: "60px" }}>
          {/* Full Page 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ── KOLOM KIRI: CHECKOUT FORM (Col-span-7 or 8) ── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            
            {/* 1. CUSTOMER INFORMATION */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                <h2 className="text-base font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-[#D4AF37]" /> 01 // CUSTOMER INFORMATION
                </h2>
                {!isEditingProfile ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#888888] hover:text-white transition-colors cursor-pointer"
                  >
                    [EDIT PROFILE DATA]
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => updateProfileMutation.mutate()}
                      disabled={updateProfileMutation.isPending}
                      className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#38A169] font-bold hover:underline cursor-pointer"
                    >
                      [SAVE CHANGES]
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#666666] hover:text-white transition-colors"
                    >
                      [CANCEL]
                    </button>
                  </div>
                )}
              </div>

              {isCustomerLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse p-6 bg-[#101010] border border-[#222]">
                  <div className="h-4 bg-[#222]" /><div className="h-4 bg-[#222]" /><div className="h-4 bg-[#222]" />
                </div>
              ) : !isEditingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#111111] border border-[#262626]">
                  <div>
                    <p className="text-[10px] font-mono text-[#777777] uppercase tracking-[0.18em]">FULL NAME</p>
                    <p className="text-sm font-mono text-white font-bold tracking-wide pt-1">{fullName || "Archive Member"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-[#777777] uppercase tracking-[0.18em]">EMAIL ADDRESS</p>
                    <p className="text-sm font-mono text-[#D4AF37] font-bold tracking-wide pt-1 truncate">{email || "member@sectormadness.com"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-[#777777] uppercase tracking-[0.18em]">PHONE NUMBER</p>
                    <p className="text-sm font-mono text-white font-bold tracking-wide pt-1">{phone || "081234567890"}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#141414] border border-[#3A3A3A]">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">FULL NAME</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#333333] px-3 py-2 text-sm text-white font-mono focus:border-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">EMAIL ADDRESS</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#333333] px-3 py-2 text-sm text-white font-mono focus:border-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">PHONE NUMBER (DIGITS ONLY)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#333333] px-3 py-2 text-sm text-white font-mono focus:border-white outline-none"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* 2. ADDRESS BOOK */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                <h2 className="text-base font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-[#D4AF37]" /> 02 // ADDRESS BOOK & LOGISTICS ORIGIN
                </h2>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#FFFFFF] hover:text-[#0A0A0A] border border-[#333333] font-mono text-[11px] font-bold uppercase tracking-[0.2em] transition-all cursor-pointer"
                >
                  + TAMBAH ALAMAT
                </button>
              </div>

              {isAddressesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AddressSkeleton /><AddressSkeleton />
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-8 bg-[#111] border border-[#222] text-center font-mono text-xs uppercase text-[#888]">
                  No shipping addresses found in your address book. Click "+ Tambah Alamat" above to add your location.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress?.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`p-6 border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                          isSelected
                            ? "bg-[#141414] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                            : "bg-[#0E0E0E] border-[#222222] hover:border-[#444444]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[11px] font-mono uppercase px-2 py-0.5 font-bold tracking-widest ${
                              isSelected ? "bg-[#D4AF37] text-[#0A0A0A]" : "bg-[#222222] text-[#888888]"
                            }`}>
                              {addr.label}
                            </span>
                            {addr.is_default && (
                              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">
                                ● DEFAULT ADDRESS
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                            {addr.receiver_name} <span className="text-xs font-mono text-[#8A8A8A] font-normal">({addr.phone_number})</span>
                          </h3>
                          
                          <p className="text-xs font-mono text-[#CCCCCC] leading-relaxed pt-2">
                            {addr.street_address}
                          </p>
                          <p className="text-xs font-mono text-[#888888] pt-1">
                            {addr.district}, {addr.city}, {addr.province} — {addr.postal_code}
                          </p>
                          {addr.address_notes && (
                            <p className="text-[11px] font-mono text-[#A0A0A0] bg-[#191919] p-2 mt-3 italic border-l-2 border-[#555]">
                              "{addr.address_notes}"
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="pt-3 border-t border-[#1C1C1C] flex justify-end items-center gap-4">
                          <button
                            type="button"
                            onClick={(e) => openEditModal(addr, e)}
                            className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A0A0A0] hover:text-white transition-colors"
                          >
                            [EDIT]
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Remove address from book?")) deleteAddressMutation.mutate(addr.id);
                            }}
                            className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#777777] hover:text-[#E53E3E] transition-colors"
                          >
                            [DELETE]
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 3. BITESHIP SHIPPING (NO HARDCODE COURIER) */}
            <section className="space-y-6">
              <div className="border-b border-[#222222] pb-4">
                <h2 className="text-base font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-[#D4AF37]" /> 03 // BITESHIP LOGISTICS & SHIPPING RATES
                </h2>
                <p className="text-xs font-mono text-[#888888] uppercase tracking-wider pt-1">
                  AUTHENTIC LIVE RATES AUTOMATICATED REFRESHED ON ADDRESS SELECTION
                </p>
              </div>

              {isRatesLoading ? (
                <ShippingSkeleton />
              ) : shippingRates.length === 0 ? (
                <div className="p-8 bg-[#111] border border-[#222] text-center font-mono text-xs uppercase text-[#888]">
                  Please pick or create a shipping address above to unlock live Biteship courier rates.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {shippingRates.map((rate, idx) => {
                    const isSelected = selectedRate?.service_code === rate.service_code && selectedRate?.courier_code === rate.courier_code;
                    return (
                      <div
                        key={`${rate.courier_code}-${rate.service_code}-${idx}`}
                        onClick={() => setSelectedRate(rate)}
                        className={`p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                          isSelected
                            ? "bg-[#161616] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                            : "bg-[#0E0E0E] border-[#262626] hover:border-[#444444]"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-sm font-extrabold uppercase font-mono tracking-wider text-[#FFFFFF] block">
                                {rate.courier_name}
                              </span>
                              <span className="text-xs font-mono text-[#8A8A8A] uppercase block">
                                {rate.service_name} ({rate.service_code})
                              </span>
                            </div>
                            <span className="text-xs font-mono font-black text-[#D4AF37] bg-[#1A1A1A] px-2 py-1 border border-[#333]">
                              Rp {rate.shipping_price.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <p className="text-[11px] font-mono text-[#A0A0A0] leading-normal pt-2 border-t border-[#1C1C1C]">
                            {rate.description}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs font-mono">
                          <span className="text-[#666666] uppercase">ESTIMATED DELIVERY:</span>
                          <span className="text-[#00FF66] font-extrabold">{rate.estimated_delivery}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 4. PAYMENT METHOD (LOAD METODE DARI BACKEND) */}
            <section className="space-y-6">
              <div className="border-b border-[#222222] pb-4">
                <h2 className="text-base font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-[#D4AF37]" /> 04 // AUTHORIZATION PAYMENT METHOD
                </h2>
                <p className="text-xs font-mono text-[#888888] uppercase tracking-wider pt-1">
                  SELECT ACTIVE MIDTRANS GATEWAY PROTOCOL (TRANSACTION INITIATED ON PAY NOW)
                </p>
              </div>

              {isMethodsLoading ? (
                <PaymentMethodSkeleton />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paymentMethods.map((method) => {
                    const isSelected = selectedPaymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`p-5 border transition-all cursor-pointer flex flex-col justify-between h-36 ${
                          isSelected
                            ? "bg-[#171717] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                            : "bg-[#0F0F0F] border-[#222222] hover:border-[#444444]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold uppercase font-mono tracking-wider text-white block">
                              {method.name}
                            </span>
                            <span className={`w-3 h-3 ${isSelected ? "bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" : "bg-[#2A2A2A]"}`} />
                          </div>
                          <span className="text-[10px] font-mono text-[#777777] uppercase tracking-widest block">
                            [{method.category}]
                          </span>
                        </div>

                        <p className="text-[11px] font-mono text-[#999999] leading-tight pt-2 border-t border-[#1C1C1C]">
                          {method.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </div>

          {/* ── KOLOM KANAN: STICKY ORDER SUMMARY (Col-span-5 or 4) ── */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-32 space-y-6">
            <div className="p-8 bg-[#101010] border border-[#262626] shadow-2xl space-y-6">
              <h2 className="text-lg font-black uppercase tracking-[0.2em] text-white pb-4 border-b border-[#222222]">
                ATELIER ORDER SUMMARY
              </h2>

              {/* Promo Voucher Section */}
              <form onSubmit={handleApplyVoucher} className="space-y-2 pt-2">
                <label className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest block">
                  PROMOTIONAL VOUCHER CODE
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="e.g. WELCOME10, SECTOR50"
                    className="flex-1 bg-[#050505] border border-[#333333] px-3 py-2 text-xs text-white uppercase font-mono tracking-widest focus:border-[#D4AF37] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={voucherMutation.isPending}
                    className="px-4 bg-[#FFFFFF] text-[#0A0A0A] font-extrabold font-mono text-xs uppercase tracking-widest hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    APPLY
                  </button>
                </div>
                {appliedVoucher && (
                  <p className="text-xs font-mono text-[#38A169] font-bold uppercase tracking-wider">
                    ✓ PROMO ({appliedVoucher}) ACTIVE ON ORDER
                  </p>
                )}
              </form>

              {/* Summary Breakdown (Loaded from Backend, NOT calculated by Frontend!) */}
              {isSummaryLoading ? (
                <SummarySkeleton />
              ) : !summary ? (
                <p className="text-xs font-mono text-[#888888] uppercase">Loading live summary calculations...</p>
              ) : (
                <div className="space-y-4 pt-4 border-t border-[#1C1C1C] font-mono text-xs tracking-wider">
                  <div className="flex justify-between text-[#CCCCCC]">
                    <span>SUBTOTAL ({summary.items_count || 0} ITEMS)</span>
                    <span className="font-bold">Rp {(summary.subtotal || 0).toLocaleString("id-ID")}</span>
                  </div>

                  <div className="flex justify-between text-[#CCCCCC]">
                    <span>SHIPPING ({selectedRate ? selectedRate.service_code : "PENDING"})</span>
                    <span className="font-bold">Rp {(summary.shipping || 0).toLocaleString("id-ID")}</span>
                  </div>

                  {summary.discount > 0 && (
                    <div className="flex justify-between text-[#38A169]">
                      <span>PROMO DISCOUNT</span>
                      <span className="font-bold">−Rp {(summary.discount || 0).toLocaleString("id-ID")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#CCCCCC]">
                    <span>EST. TAX (PPN 11%)</span>
                    <span className="font-bold">Rp {(summary.tax || 0).toLocaleString("id-ID")}</span>
                  </div>

                  <div className="pt-5 border-t border-[#262626] flex justify-between items-baseline">
                    <span className="font-mono text-sm font-extrabold text-white tracking-widest">
                      GRAND TOTAL
                    </span>
                    <span className="font-mono text-2xl font-black text-[#D4AF37] tracking-wider">
                      Rp {(summary.grand_total || 0).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}

              {/* Button Bayar Sekarang */}
              <button
                type="button"
                onClick={handlePayNow}
                disabled={isPaying || isSummaryLoading || !summary?.can_checkout}
                className={`w-full py-5 text-center font-extrabold font-mono text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-2xl border ${
                  isPaying || !summary?.can_checkout
                    ? "bg-[#222222] text-[#666666] border-[#333333] cursor-not-allowed"
                    : "bg-[#FFFFFF] text-[#0A0A0A] border-[#FFFFFF] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-[#0A0A0A] cursor-pointer"
                }`}
              >
                {isPaying ? "AUTHORIZING MIDTRANS SNAP..." : "BAYAR SEKARANG"}
              </button>

              <div className="p-4 bg-[#141414] border border-[#222222] space-y-2 font-mono text-[11px] text-[#888888] uppercase tracking-wider">
                <p className="font-bold text-white flex items-center gap-2">
                  <span className="text-[#D4AF37]">🔒</span> ATELIER GUARANTEE PROTOCOL
                </p>
                <p>• INSTANT DISPATCH AFTER MIDTRANS AUTHORIZATION.</p>
                <p>• REALTIME LOGISTICS TRACKING VIA BITESHIP NETWORK.</p>
              </div>
            </div>
          </div>

        </div>
        </div>
      </div>

      <Footer />

      {/* ── MODAL TAMBAH / EDIT ALAMAT (DENGAN SEARCHABLE AUTOCOMPLETE BITESHIP) ── */}
      <AnimatePresence>
        {showAddAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] bg-[#000000]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0D0D0D] border border-[#333333] p-8 md:p-10 w-full max-w-2xl text-white shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#222222] mb-6">
                <span className="font-mono text-[11px] tracking-[0.25em] uppercase font-extrabold text-[#D4AF37]">
                  {editingAddressId ? "UPDATE ADDRESS RECORD // ATELIER BOOK" : "NEW LOGISTICS DESTINATION // ADDRESS BOOK"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="font-mono text-xl text-[#777777] hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingAddressId) updateAddressMutation.mutate();
                  else addAddressMutation.mutate();
                }}
                className="space-y-6 font-mono text-xs"
              >
                {/* Label Selector: Rumah, Kantor, Apartemen, Lainnya */}
                <div className="space-y-2">
                  <label className="text-[#888888] uppercase tracking-widest block">LABEL ALAMAT</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["Rumah", "Kantor", "Apartemen", "Lainnya"].map((lbl) => (
                      <button
                        type="button"
                        key={lbl}
                        onClick={() => setFormLabel(lbl)}
                        className={`py-2.5 border uppercase font-extrabold text-[11px] transition-all ${
                          formLabel === lbl ? "bg-[#D4AF37] text-[#0A0A0A] border-[#D4AF37]" : "bg-[#141414] text-[#888888] border-[#2A2A2A] hover:border-[#555]"
                        }`}
                      >
                        ○ {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Receiver Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#888888] uppercase tracking-widest block">RECEIVER NAME</label>
                    <input
                      type="text"
                      required
                      value={formReceiver}
                      onChange={(e) => setFormReceiver(e.target.value)}
                      placeholder="e.g. Archive Member"
                      className="w-full bg-[#050505] border border-[#333333] px-4 py-3 text-white uppercase focus:border-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#888888] uppercase tracking-widest block">PHONE NUMBER</label>
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="e.g. 081234567890"
                      className="w-full bg-[#050505] border border-[#333333] px-4 py-3 text-white uppercase focus:border-white outline-none"
                    />
                  </div>
                </div>

                {/* SEARCHABLE AUTOCOMPLETE BITESHIP AREA (BUKAN TEXTAREA!) */}
                <div className="space-y-2 relative">
                  <label className="text-[#D4AF37] font-bold uppercase tracking-widest block flex justify-between">
                    <span>BITESHIP AREA AUTOCOMPLETE (SEARCH CITY / DISTRICT)</span>
                    {isSearchingArea && <span className="text-[#888] animate-pulse">SEARCHING API...</span>}
                  </label>
                  <input
                    type="text"
                    required
                    value={areaSearchInput}
                    onChange={(e) => handleAreaInput(e.target.value)}
                    placeholder="Type city or district (min. 3 characters, e.g. Senopati, Kebayoran, Bandung)"
                    className="w-full bg-[#111111] border border-[#444444] px-4 py-3 text-white uppercase focus:border-[#D4AF37] outline-none font-bold"
                  />
                  
                  {/* Floating Autocomplete Dropdown */}
                  {showAreaDropdown && areaResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-16 bg-[#141414] border border-[#444444] z-50 max-h-56 overflow-y-auto shadow-2xl">
                      {areaResults.map((area) => (
                        <div
                          key={area.id}
                          onClick={() => selectArea(area)}
                          className="p-3.5 border-b border-[#222222] hover:bg-[#2A2A2A] cursor-pointer transition-colors text-[11px]"
                        >
                          <span className="text-[#00FF66] font-extrabold uppercase">{area.name}</span>
                          <span className="text-[#AAAAAA] block pt-0.5">
                            {area.administrative_division_level_3_name}, {area.administrative_division_level_2_name}, {area.administrative_division_level_1_name} — Postal: {area.postal_code}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Readonly auto-filled fields from Biteship */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#111] p-4 border border-[#222]">
                  <div>
                    <p className="text-[10px] text-[#666]">PROVINCE</p>
                    <p className="text-white font-bold truncate pt-1">{formProvince || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#666]">CITY</p>
                    <p className="text-white font-bold truncate pt-1">{formCity || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#666]">DISTRICT</p>
                    <p className="text-white font-bold truncate pt-1">{formDistrict || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#666]">POSTAL CODE</p>
                    <p className="text-white font-bold pt-1">{formPostal || "—"}</p>
                  </div>
                </div>

                {/* Street Address */}
                <div className="space-y-1">
                  <label className="text-[#888888] uppercase tracking-widest block">STREET ADDRESS / HOUSE NUMBER & BLOCK</label>
                  <input
                    type="text"
                    required
                    value={formStreet}
                    onChange={(e) => setFormStreet(e.target.value)}
                    placeholder="e.g. Jl. Senopati Raya No. 28, Lobi Utama Lantai 1"
                    className="w-full bg-[#050505] border border-[#333333] px-4 py-3 text-white uppercase focus:border-white outline-none"
                  />
                </div>

                {/* Address Notes */}
                <div className="space-y-1">
                  <label className="text-[#888888] uppercase tracking-widest block">ADDRESS NOTES (OPTIONAL)</label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. Tinggal di lobi atau titipkan ke security gedung"
                    className="w-full bg-[#050505] border border-[#333333] px-4 py-3 text-white uppercase focus:border-white outline-none"
                  />
                </div>

                {/* Default Address Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isDefaultCheckbox"
                    checked={formDefault}
                    onChange={(e) => setFormDefault(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37] bg-transparent border border-[#555] cursor-pointer"
                  />
                  <label htmlFor="isDefaultCheckbox" className="text-white uppercase tracking-wider cursor-pointer font-bold">
                    SET AS DEFAULT LOGISTICS ADDRESS
                  </label>
                </div>

                <div className="pt-4 border-t border-[#222222] flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddAddressModal(false)}
                    className="px-6 py-3.5 bg-[#171717] hover:bg-[#262626] text-[#AAAAAA] uppercase tracking-widest font-extrabold transition-colors cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                    className="px-8 py-3.5 bg-[#FFFFFF] text-[#0A0A0A] uppercase tracking-[0.25em] font-extrabold hover:bg-[#D4AF37] hover:text-[#0A0A0A] transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {editingAddressId ? "UPDATE ADDRESS" : "SAVE ADDRESS"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
