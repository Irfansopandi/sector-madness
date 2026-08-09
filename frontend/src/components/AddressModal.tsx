import React, { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2 } from "lucide-react";
import { addShippingAddress, updateShippingAddress, searchBiteshipAreas, type ShippingAddress, type BiteshipArea } from "@/utils/api";
import { INDONESIA_LOCATION_DIRECTORY, getRealtimeProvince, getRealtimePostalCode } from "@/utils/location";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAddress?: ShippingAddress) => void;
  editingAddress?: ShippingAddress | null;
  defaultValues?: {
    receiver_name?: string;
    phone_number?: string;
    is_default?: boolean;
  };
}

export default function AddressModal({ isOpen, onClose, onSuccess, editingAddress, defaultValues }: AddressModalProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [activeDropdownField, setActiveDropdownField] = useState<"district" | "city" | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [areaResults, setAreaResults] = useState<BiteshipArea[]>([]);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const [addressForm, setAddressForm] = useState({
    label: editingAddress?.label || "",
    receiver_name: editingAddress?.receiver_name || defaultValues?.receiver_name || "",
    phone_number: editingAddress?.phone_number || defaultValues?.phone_number || "",
    province: editingAddress?.province || "",
    city: editingAddress?.city || "",
    district: editingAddress?.district || "",
    postal_code: editingAddress?.postal_code || "",
    street_address: editingAddress?.street_address || "",
    is_default: editingAddress?.is_default ?? (defaultValues?.is_default || false),
  });

  useEffect(() => {
    if (isOpen) {
      setAddressForm({
        label: editingAddress?.label || "",
        receiver_name: editingAddress?.receiver_name || defaultValues?.receiver_name || "",
        phone_number: editingAddress?.phone_number || defaultValues?.phone_number || "",
        province: editingAddress?.province || "",
        city: editingAddress?.city || "",
        district: editingAddress?.district || "",
        postal_code: editingAddress?.postal_code || "",
        street_address: editingAddress?.street_address || "",
        is_default: editingAddress?.is_default ?? (defaultValues?.is_default || false),
      });
      setFormErrors({});
      setLocationError(null);
    }
  }, [isOpen, editingAddress, defaultValues?.receiver_name, defaultValues?.phone_number, defaultValues?.is_default]);

  const handleUseCurrentLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`);
          if (!res.ok) throw new Error("Failed to fetch address");
          const data = await res.json();
          
          if (data && data.address) {
            const addr = data.address;
            const newCity = addr.city || addr.town || addr.municipality || addr.regency || "";
            const newDistrict = addr.suburb || addr.neighbourhood || addr.village || "";
            const newProvince = addr.state || addr.province || "";
            let newPostal = addr.postcode || addr.postal_code || addr.zipcode || addr.zip_code || "";
            
            if (!newPostal && (newDistrict || newCity)) {
              try {
                const { searchBiteshipAreas } = await import("@/utils/api");
                let matchedArea = null;
                
                if (newDistrict) {
                  const areas = await searchBiteshipAreas(newDistrict);
                  matchedArea = areas.find(a => a.name.toLowerCase().includes(newCity.toLowerCase()));
                }
                
                if (!matchedArea && newCity) {
                  const areas = await searchBiteshipAreas(newCity);
                  if (areas.length > 0) matchedArea = areas[0];
                }

                if (matchedArea) {
                  if (matchedArea.postal_code) {
                    newPostal = String(matchedArea.postal_code);
                  } else if (matchedArea.name) {
                    const match = matchedArea.name.match(/(\d{5})$/);
                    if (match) newPostal = match[1];
                  }
                }
              } catch (e) {
                // Ignore fallback error
              }
            }

            setAddressForm((prev) => ({
              ...prev,
              city: newCity,
              district: newDistrict,
              province: newProvince,
              postal_code: newPostal,
            }));
          }
        } catch (error: any) {
          setLocationError("Failed to get address from coordinates.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setLocationError(error.message || "Failed to get location");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleChange = (field: keyof typeof addressForm, value: string | boolean) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLocationInputChange = (val: string, field: "district" | "city") => {
    handleChange(field, val);
    if (field === "city") {
      handleChange("district", "");
      handleChange("postal_code", "");
    }
    setLocationQuery(val);
    setShowLocationDropdown(true);
    setActiveDropdownField(field);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (val.length >= 2) {
      setIsSearchingArea(true);
      debounceTimeout.current = setTimeout(async () => {
        try {
          const res = await searchBiteshipAreas(val);
          setAreaResults(res || []);
        } catch {
          setAreaResults([]);
        } finally {
          setIsSearchingArea(false);
        }
      }, 350);
    }
  };

  const filteredLocations = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return INDONESIA_LOCATION_DIRECTORY.slice(0, 8);
    const localMatches = INDONESIA_LOCATION_DIRECTORY.filter(
      (item) =>
        item.district.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.province.toLowerCase().includes(q) ||
        item.postal_code.includes(q) ||
        (item.subdistrict && item.subdistrict.toLowerCase().includes(q)) ||
        (item.keywords && item.keywords.some((k) => k.toLowerCase().includes(q)))
    );
    const apiMatches = (areaResults || []).map((a: any) => {
      const dist = a.administrative_division_level_3_name || a.name || "District";
      const cty = a.administrative_division_level_2_name || a.name || "City";
      const prov = a.administrative_division_level_1_name || getRealtimeProvince(dist, cty);
      const derivedZip = a.postal_code || a.postcode || a.zip_code || getRealtimePostalCode(dist, cty, prov);
      return {
        district: dist,
        city: cty,
        province: prov,
        postal_code: String(derivedZip),
        area_id: a.id || "IDNPJ001",
      };
    });
    const combined = [...localMatches, ...apiMatches];
    const seen = new Set();
    const unique: typeof INDONESIA_LOCATION_DIRECTORY = [];
    for (const item of combined) {
      const key = `${item.district.toLowerCase()}-${item.city.toLowerCase()}-${item.postal_code}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }
    return unique.length > 0 ? unique.slice(0, 10) : INDONESIA_LOCATION_DIRECTORY.slice(0, 6);
  }, [locationQuery, areaResults]);

  const selectLocation = (loc: { district: string; city: string; province: string; postal_code: string }) => {
    setAddressForm(prev => ({
      ...prev,
      district: loc.district,
      city: loc.city,
      province: loc.province,
      postal_code: loc.postal_code
    }));
    setFormErrors(prev => ({ ...prev, district: "", city: "", province: "", postal_code: "" }));
    setShowLocationDropdown(false);
    setActiveDropdownField(null);
  };

  useEffect(() => {
    if (!addressForm.district.trim() && !addressForm.city.trim()) return;
    const derivedProv = getRealtimeProvince(addressForm.district, addressForm.city, addressForm.province);
    if (derivedProv && derivedProv !== "Indonesia" && addressForm.province !== derivedProv) {
      setAddressForm(prev => ({ ...prev, province: derivedProv }));
    }
    const derivedZip = getRealtimePostalCode(addressForm.district, addressForm.city, derivedProv);
    if (derivedZip !== addressForm.postal_code) {
      setAddressForm(prev => ({ ...prev, postal_code: derivedZip }));
    }
  }, [addressForm.district, addressForm.city]);

  const handleSaveAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { [key: string]: string } = {};
    if (!addressForm.label.trim()) errors.label = "Address label is required";
    if (!addressForm.receiver_name.trim()) errors.receiver_name = "Receiver name is required";
    if (!addressForm.phone_number.trim()) errors.phone_number = "Phone number is required";
    if (!addressForm.province.trim()) errors.province = "Province is required";
    if (!addressForm.city.trim()) errors.city = "City is required";
    if (!addressForm.district.trim()) errors.district = "District is required";
    if (!addressForm.postal_code.trim()) errors.postal_code = "Postal code is required";
    if (!addressForm.street_address.trim()) errors.street_address = "Street address is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstErrorField = Object.keys(errors)[0];
      const el = document.getElementById(`input-${firstErrorField}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
      return;
    }

    setFormErrors({});
    setIsSaving(true);
    try {
      let savedData: ShippingAddress;
      if (editingAddress) {
        savedData = await updateShippingAddress({ id: editingAddress.id, ...addressForm });
      } else {
        savedData = await addShippingAddress(addressForm);
      }
      onSuccess(savedData);
    } catch (err: any) {
      setLocationError(err.message || "Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <style dangerouslySetInnerHTML={{ __html: `
            @media (max-width: 1023px) {
              .address-modal-container {
                padding: 24px 20px !important;
                gap: 20px !important;
              }
              .address-modal-form {
                padding: 0 4px !important;
                gap: 24px !important;
              }
              .address-form-grid {
                gap: 16px !important;
              }
              .address-search-item {
                padding: 12px 14px !important;
              }
              .address-search-item-title {
                font-size: 11px !important;
              }
              .address-search-item-badge {
                padding: 2px 6px !important;
                font-size: 9px !important;
                margin-left: 8px !important;
              }
              .address-search-item-desc {
                font-size: 9px !important;
              }
            }
          `}} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ padding: "60px", gap: "32px" }}
            className="address-modal-container bg-[#141414] border border-white/[0.15] text-[#F5F5F5] w-full max-w-3xl flex flex-col shadow-2xl relative text-left rounded-sm max-h-[90vh] overflow-y-auto font-sans"
          >
            <button
              onClick={() => { onClose(); setLocationError(null); }}
              className="absolute top-6 right-6 text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors p-2 cursor-pointer font-mono text-xl"
              aria-label="Close Address Form"
            >
              ✕
            </button>

            <div className="border-b border-white/[0.1] pb-4">
              <span className="text-xs font-mono text-[#B6A47E] uppercase tracking-[0.25em] block font-bold">
                [ATELIER ADDRESS CONFIGURATION]
              </span>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-wide text-[#F5F5F5] mt-1.5 font-serif">
                {editingAddress ? "EDIT ADDRESS" : "ADD NEW ADDRESS"}
              </h3>
              <p className="text-xs text-[#8A8A8A] font-mono mt-1">
                Complete your shipping address information below
              </p>
            </div>

            {locationError && (
              <div style={{ margin: "0 24px -16px 24px", padding: "16px 20px" }} className="bg-[#0A0A0A] border border-red-500/50 text-red-400 text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-3.5 rounded-none shadow-xl">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{locationError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddressSubmit} noValidate style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: "40px" }} className="address-modal-form">
              
              <div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  style={{ padding: "16px 24px" }}
                  className="w-full bg-[#1C1C1C] border border-white/[0.12] hover:border-[#B6A47E]/50 text-[#F5F5F5] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-colors cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLocating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> GETTING LOCATION...</>
                  ) : (
                    <><MapPin className="w-4 h-4 text-[#B6A47E]" /> USE CURRENT LOCATION</>
                  )}
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                <label className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest block font-bold">
                  1. BASIC INFORMATION:
                </label>
                <div className="space-y-2" style={{ marginTop: "16px" }}>
                  <span className="text-[11px] font-mono text-[#8A8A8A] block uppercase tracking-wider">ADDRESS LABEL (E.G., HOME, OFFICE) *</span>
                  <input
                    id="input-label"
                    type="text"
                    required
                    placeholder="Enter label for this address"
                    value={addressForm.label}
                    onChange={(e) => handleChange("label", e.target.value)}
                    style={{ padding: "18px 24px" }}
                    className={`w-full font-mono text-sm focus:outline-none focus:ring-1 rounded-sm transition-all ${formErrors.label ? "bg-[#220B0B] border border-[#FF3333] text-white focus:border-[#FF5555] focus:ring-[#FF5555]/50" : "bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] focus:border-[#B6A47E] focus:ring-[#B6A47E]/50"}`}
                  />
                  {formErrors.label && <span className="text-[#FF3333] text-[10px] font-mono mt-1 block font-bold">{formErrors.label}</span>}
                </div>
                <div className="address-form-grid grid grid-cols-1 sm:grid-cols-2 gap-8" style={{ marginTop: "24px" }}>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#8A8A8A] block uppercase tracking-wider">RECEIVER NAME *</span>
                    <input
                      id="input-receiver_name"
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={addressForm.receiver_name}
                      onChange={(e) => handleChange("receiver_name", e.target.value)}
                      style={{ padding: "18px 24px" }}
                      className={`w-full font-mono text-sm focus:outline-none focus:ring-1 rounded-sm transition-all ${formErrors.receiver_name ? "bg-[#220B0B] border border-[#FF3333] text-white focus:border-[#FF5555] focus:ring-[#FF5555]/50" : "bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] focus:border-[#B6A47E] focus:ring-[#B6A47E]/50"}`}
                    />
                    {formErrors.receiver_name && <span className="text-[#FF3333] text-[10px] font-mono mt-1 block font-bold">{formErrors.receiver_name}</span>}
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#8A8A8A] block uppercase tracking-wider">PHONE NUMBER *</span>
                    <input
                      id="input-phone_number"
                      type="tel"
                      inputMode="numeric"
                      required
                      placeholder="Enter your phone number"
                      value={addressForm.phone_number}
                      onChange={(e) => handleChange("phone_number", e.target.value.replace(/[^0-9]/g, ""))}
                      style={{ padding: "18px 24px" }}
                      className={`w-full font-mono text-sm focus:outline-none focus:ring-1 rounded-sm transition-all ${formErrors.phone_number ? "bg-[#220B0B] border border-[#FF3333] text-white focus:border-[#FF5555] focus:ring-[#FF5555]/50" : "bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] focus:border-[#B6A47E] focus:ring-[#B6A47E]/50"}`}
                    />
                    {formErrors.phone_number && <span className="text-[#FF3333] text-[10px] font-mono mt-1 block font-bold">{formErrors.phone_number}</span>}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                <label className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest block font-bold">
                  2. DETAILED ADDRESS:
                </label>
                <div className="address-form-grid grid grid-cols-1 sm:grid-cols-2 gap-8" style={{ marginTop: "16px" }}>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#8A8A8A] block uppercase tracking-wider">PROVINCE *</span>
                    <input
                      id="input-province"
                      type="text"
                      required
                      value={addressForm.province}
                      onChange={(e) => handleChange("province", e.target.value)}
                      placeholder="Enter your province"
                      style={{ padding: "18px 24px" }}
                      className={`w-full font-mono text-sm focus:outline-none focus:ring-1 rounded-sm transition-all placeholder:text-[#444444] ${formErrors.province ? "bg-[#220B0B] border border-[#FF3333] text-white focus:border-[#FF5555] focus:ring-[#FF5555]/50" : "bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] focus:border-[#B6A47E] focus:ring-[#B6A47E]/50"}`}
                    />
                    {formErrors.province && <span className="text-[#FF3333] text-[10px] font-mono mt-1 block font-bold">{formErrors.province}</span>}
                  </div>
                  <div className="space-y-2 relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#8A8A8A] uppercase tracking-wider">CITY / REGENCY *</span>
                    </div>
                    <input
                      id="input-city"
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => handleLocationInputChange(e.target.value, "city")}
                      onFocus={() => {
                        setLocationQuery(addressForm.city);
                        setShowLocationDropdown(true);
                        setActiveDropdownField("city");
                      }}
                      onBlur={() => setTimeout(() => {
                        if (activeDropdownField === "city") setShowLocationDropdown(false);
                      }, 300)}
                      placeholder="Enter your city"
                      style={{ padding: "18px 24px" }}
                      className={`w-full font-mono text-sm focus:outline-none focus:ring-1 rounded-sm transition-all placeholder:text-[#444444] ${formErrors.city ? "bg-[#220B0B] border border-[#FF3333] text-white focus:border-[#FF5555] focus:ring-[#FF5555]/50" : "bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] focus:border-[#B6A47E] focus:ring-[#B6A47E]/50"}`}
                    />
                    {formErrors.city && <span className="text-[#FF3333] text-[10px] font-mono mt-1 block font-bold">{formErrors.city}</span>}
                    
                    {/* City Autocomplete Dropdown */}
                    {showLocationDropdown && activeDropdownField === "city" && (
                      <div style={{ width: "100%", maxWidth: "100%" }} className="absolute left-0 right-0 top-full mt-2 bg-[#141414] border border-[#444444] z-[200] max-h-80 overflow-y-auto overflow-x-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
                        <div className="p-3 bg-[#181818] border-b border-[#2E2E2E] text-[10px] text-[#AAAAAA] font-mono uppercase tracking-[0.15em] font-bold text-center">
                          <span className="block break-words">SELECT REGION FOR REALTIME POSTAL CODE</span>
                        </div>
                        {filteredLocations.map((loc, idx) => (
                          <div
                            key={`city-sugg-${loc.district}-${idx}`}
                            onMouseDown={() => selectLocation(loc)}
                            style={{ padding: "16px 20px" }}
                            className="address-search-item border-b border-[#2A2A2A] hover:bg-[#252525] cursor-pointer transition-all font-mono group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="address-search-item-title text-[#FFFFFF] group-hover:text-white font-extrabold text-sm uppercase tracking-wide transition-colors min-w-0 break-words flex-1">
                                {loc.city}
                              </span>
                              <span className="address-search-item-badge bg-[#1C1C1C] text-[#DDDDDD] border border-[#3A3A3A] px-2.5 py-1 text-xs font-bold tracking-widest shrink-0 whitespace-nowrap">
                                POS: {loc.postal_code}
                              </span>
                            </div>
                            <div className="address-search-item-desc text-[#888888] text-xs pt-1.5 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                              <span>City: <strong className="text-[#DDDDDD]">{loc.district}</strong></span>
                              <span className="hidden sm:inline">•</span>
                              <span>Prov: <strong className="text-[#AAAAAA]">{loc.province}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#8A8A8A] uppercase tracking-wider whitespace-nowrap shrink-0">DISTRICT / SUB-DISTRICT *</span>
                      <span className="text-[10px] text-[#777777] font-bold tracking-tight whitespace-nowrap shrink-0">
                        LIVE REGIONAL SEARCH
                      </span>
                    </div>
                    <input
                      id="input-district"
                      type="text"
                      required
                      value={addressForm.district}
                      onChange={(e) => handleLocationInputChange(e.target.value, "district")}
                      onFocus={() => {
                        setLocationQuery(addressForm.district);
                        setShowLocationDropdown(true);
                        setActiveDropdownField("district");
                      }}
                      onBlur={() => setTimeout(() => {
                        if (activeDropdownField === "district") setShowLocationDropdown(false);
                      }, 300)}
                      placeholder="Enter your district"
                      style={{ padding: "18px 24px" }}
                      className={`w-full font-mono text-sm focus:outline-none focus:ring-1 rounded-sm transition-all placeholder:text-[#444444] ${formErrors.district ? "bg-[#220B0B] border border-[#FF3333] text-white focus:border-[#FF5555] focus:ring-[#FF5555]/50" : "bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] focus:border-[#B6A47E] focus:ring-[#B6A47E]/50"}`}
                    />
                    {formErrors.district && <span className="text-[#FF3333] text-[10px] font-mono mt-1 block font-bold">{formErrors.district}</span>}

                    {/* District Autocomplete Dropdown */}
                    {showLocationDropdown && activeDropdownField === "district" && (
                      <div style={{ width: "100%", maxWidth: "100%" }} className="absolute left-0 right-0 top-full mt-2 bg-[#141414] border border-[#444444] z-[200] max-h-80 overflow-y-auto overflow-x-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
                        <div className="p-3 bg-[#181818] border-b border-[#2E2E2E] text-[10px] text-[#AAAAAA] font-mono uppercase tracking-[0.15em] font-bold text-center">
                          <span className="block break-words">SELECT REGION FOR REALTIME POSTAL CODE</span>
                        </div>
                        {filteredLocations.map((loc, idx) => (
                          <div
                            key={`district-sugg-${loc.district}-${idx}`}
                            onMouseDown={() => selectLocation(loc)}
                            style={{ padding: "16px 20px" }}
                            className="address-search-item border-b border-[#2A2A2A] hover:bg-[#252525] cursor-pointer transition-all font-mono group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="address-search-item-title text-[#FFFFFF] group-hover:text-white font-extrabold text-sm uppercase tracking-wide transition-colors min-w-0 break-words flex-1">
                                {loc.district} {loc.subdistrict ? <span className="text-[#B6A47E] font-normal text-xs normal-case ml-1 inline-block">(Desa: {loc.subdistrict})</span> : ""}
                              </span>
                              <span className="address-search-item-badge bg-[#1C1C1C] text-[#DDDDDD] border border-[#3A3A3A] px-2.5 py-1 text-xs font-bold tracking-widest shrink-0 whitespace-nowrap">
                                POS: {loc.postal_code}
                              </span>
                            </div>
                            <div className="address-search-item-desc text-[#888888] text-xs pt-1.5 uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                              <span>City: <strong className="text-[#DDDDDD]">{loc.city}</strong></span>
                              <span className="hidden sm:inline">•</span>
                              <span>Prov: <strong className="text-[#AAAAAA]">{loc.province}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-[#8A8A8A] block uppercase tracking-wider">POSTAL CODE *</span>
                    <input
                      id="input-postal_code"
                      type="text"
                      required
                      value={addressForm.postal_code}
                      onChange={(e) => handleChange("postal_code", e.target.value)}
                      placeholder="Enter your postal code"
                      style={{ padding: "18px 24px" }}
                      className={`w-full font-mono text-sm focus:outline-none focus:ring-1 rounded-sm transition-all placeholder:text-[#444444] ${formErrors.postal_code ? "bg-[#220B0B] border border-[#FF3333] text-white focus:border-[#FF5555] focus:ring-[#FF5555]/50" : "bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] focus:border-[#B6A47E] focus:ring-[#B6A47E]/50"}`}
                    />
                    {formErrors.postal_code && <span className="text-[#FF3333] text-[10px] font-mono mt-1 block font-bold">{formErrors.postal_code}</span>}
                  </div>
                </div>
                <div className="space-y-2" style={{ marginTop: "24px" }}>
                  <span className="text-[11px] font-mono text-[#8A8A8A] block uppercase tracking-wider">FULL ADDRESS *</span>
                  <textarea
                    id="input-street_address"
                    rows={3}
                    required
                    value={addressForm.street_address}
                    onChange={(e) => handleChange("street_address", e.target.value)}
                    placeholder="Enter your address"
                    style={{ padding: "18px 24px" }}
                    className={`w-full font-mono text-sm focus:outline-none focus:ring-1 rounded-sm transition-all placeholder:text-[#444444] ${formErrors.street_address ? "bg-[#220B0B] border border-[#FF3333] text-white focus:border-[#FF5555] focus:ring-[#FF5555]/50" : "bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] focus:border-[#B6A47E] focus:ring-[#B6A47E]/50"}`}
                  />
                  {formErrors.street_address && <span className="text-[#FF3333] text-[10px] font-mono mt-1 block font-bold">{formErrors.street_address}</span>}
                </div>
              </div>
              
              <div style={{ padding: "16px 20px" }} className="bg-[#1C1C1C] border border-white/[0.12] rounded-sm text-xs font-mono leading-relaxed space-y-1.5 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_default_check"
                  checked={addressForm.is_default}
                  onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                  className="h-4 w-4 accent-[#B6A47E] cursor-pointer shrink-0"
                />
                <label htmlFor="is_default_check" className="font-bold text-[#F5F5F5] tracking-wider uppercase cursor-pointer">
                  SET AS DEFAULT SHIPPING ADDRESS
                </label>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => { onClose(); setLocationError(null); }}
                  disabled={isSaving}
                  style={{ padding: "18px 0" }}
                  className="flex-1 border border-white/10 text-[#8A8A8A] hover:text-white font-mono text-xs uppercase font-bold tracking-widest transition-colors rounded-sm cursor-pointer block text-center disabled:opacity-50"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: "18px 0" }}
                  className="flex-[2] bg-[#B6A47E] hover:bg-white text-[#0A0A0A] font-mono text-xs uppercase font-extrabold tracking-[0.2em] transition-colors shadow-lg rounded-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>SAVE ADDRESS</span>
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
