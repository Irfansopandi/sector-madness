"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomPaymentModal from "@/components/CustomPaymentModal";
import AddressModal from "@/components/AddressModal";
import {
  getCustomerProfile,
  getCart,
  clearCart,
  searchBiteshipAreas,
  getShippingRates,
  createPaymentTransaction,
  getOrderDetail,
  getShippingAddresses,
  ShippingRate,
  BiteshipArea,
  ShippingAddress,
} from "@/utils/api";
import { useToast } from "@/components/Toast";

declare global {
  interface Window {
    snap: any;
  }
}

// Built-in authentic shipping options matching reference design & logistics fallback (JNE & J&T Only)
const DEFAULT_SHIPPING_OPTIONS: ShippingRate[] = [
  {
    courier_code: "jne",
    courier_name: "JNE EXPRESS",
    service_code: "REG",
    service_name: "REGULER LOGISTICS (INTERNATIONAL / DOMESTIC)",
    shipping_price: 15000,
    estimated_delivery: "2 - 3 Days",
    description: "Standard tracked express delivery via Biteship Integrated Network",
  },
  {
    courier_code: "jnt",
    courier_name: "J&T EXPRESS",
    service_code: "EZ",
    service_name: "REGULAR & VIP EXPRESS LOGISTICS",
    shipping_price: 18000,
    estimated_delivery: "1 - 2 Days",
    description: "Priority expedited dispatch via Biteship Live Network",
  },
];

/**
 * DYNAMIC INDONESIAN SHIPPING TARIFF ENGINE
 * Automatically calculates accurate shipping costs for JNE and J&T Express
 * based on destination district, city, province, and postal code from Sector Madness Fulfillment Center (Jabodetabek).
 */
function calculateDynamicShipping(district: string = "", city: string = "", province: string = "", postalCode: string = ""): { jne: number; jnt: number; jneEst: string; jntEst: string } {
  const combined = `${district} ${city} ${province} ${postalCode}`.toLowerCase().trim();

  // 1. Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi, Cikarang, Bintaro, BSD) -> Very Close / Instant zone
  if (
    combined.includes("jakarta") || combined.includes("dki") ||
    combined.includes("tangerang") || combined.includes("tangsel") || combined.includes("bsd") || combined.includes("bintaro") || combined.includes("serpong") || combined.includes("karawaci") ||
    combined.includes("bekasi") || combined.includes("cikarang") || combined.includes("tambun") || combined.includes("cibitung") || combined.includes("cibaru") ||
    combined.includes("bogor") || combined.includes("depok") || combined.includes("sentul") || combined.includes("cibinong") || combined.includes("margonda") ||
    (postalCode.startsWith("10") || postalCode.startsWith("11") || postalCode.startsWith("12") || postalCode.startsWith("13") || postalCode.startsWith("14") || postalCode.startsWith("15") || postalCode.startsWith("16") || postalCode.startsWith("17"))
  ) {
    return { jne: 10000, jnt: 12000, jneEst: "1 - 2 Days", jntEst: "1 Day (Priority)" };
  }

  // 2. Karawang, Cikampek, Purwakarta, Subang, Bandung, Cimahi, Sumedang (Jawa Barat Ring 1)
  if (
    combined.includes("karawang") || combined.includes("tempuran") || combined.includes("rengasdengklok") || combined.includes("klari") || combined.includes("telukjambe") || combined.includes("cikampek") || combined.includes("cilamaya") ||
    combined.includes("purwakarta") || combined.includes("subang") || combined.includes("ciater") ||
    combined.includes("bandung") || combined.includes("dago") || combined.includes("pasteur") || combined.includes("lembang") || combined.includes("cimahi") || combined.includes("sumedang") || combined.includes("jatinangor") ||
    postalCode.startsWith("40") || postalCode.startsWith("41") || postalCode.startsWith("453")
  ) {
    return { jne: 15000, jnt: 18000, jneEst: "1 - 2 Days", jntEst: "1 Day (Express)" };
  }

  // 3. Banten non-Tangerang (Serang, Cilegon, Pandeglang, Lebak, Rangkasbitung)
  if (combined.includes("banten") || combined.includes("serang") || combined.includes("cilegon") || combined.includes("pandeglang") || combined.includes("lebak") || postalCode.startsWith("42")) {
    return { jne: 14000, jnt: 16000, jneEst: "1 - 2 Days", jntEst: "1 Day" };
  }

  // 4. Jawa Barat Ring 2 (Cirebon, Indramayu, Majalengka, Kuningan, Sukabumi, Cianjur, Garut, Tasikmalaya, Ciamis, Pangandaran)
  if (
    combined.includes("jawa barat") || combined.includes("jabar") || combined.includes("cirebon") || combined.includes("indramayu") || combined.includes("majalengka") || combined.includes("kuningan") ||
    combined.includes("sukabumi") || combined.includes("cianjur") || combined.includes("garut") || combined.includes("tasikmalaya") || combined.includes("ciamis") || combined.includes("pangandaran") ||
    postalCode.startsWith("43") || postalCode.startsWith("44") || postalCode.startsWith("45") || postalCode.startsWith("46")
  ) {
    return { jne: 18000, jnt: 20000, jneEst: "2 - 3 Days", jntEst: "1 - 2 Days" };
  }

  // 5. Jawa Tengah & D.I. Yogyakarta (Semarang, Solo, Jogja, Sleman, Bantul, Magelang, Pekalongan, Kudus, Cilacap, dll)
  if (
    combined.includes("jawa tengah") || combined.includes("jateng") || combined.includes("yogyakarta") || combined.includes("jogja") || combined.includes("sleman") || combined.includes("bantul") || combined.includes("diy") ||
    combined.includes("semarang") || combined.includes("surakarta") || combined.includes("solo") || combined.includes("magelang") || combined.includes("pekalongan") || combined.includes("tegal") || combined.includes("banyumas") || combined.includes("purwokerto") || combined.includes("klaten") || combined.includes("boyolali") || combined.includes("kudus") || combined.includes("jepara") || combined.includes("pati") ||
    postalCode.startsWith("50") || postalCode.startsWith("51") || postalCode.startsWith("52") || postalCode.startsWith("53") || postalCode.startsWith("54") || postalCode.startsWith("55") || postalCode.startsWith("56") || postalCode.startsWith("57") || postalCode.startsWith("58") || postalCode.startsWith("59")
  ) {
    return { jne: 20000, jnt: 22000, jneEst: "2 - 3 Days", jntEst: "1 - 2 Days" };
  }

  // 6. Jawa Timur (Surabaya, Malang, Sidoarjo, Gresik, Mojokerto, Madiun, Kediri, Jember, Banyuwangi, Madura)
  if (
    combined.includes("jawa timur") || combined.includes("jatim") || combined.includes("surabaya") || combined.includes("malang") || combined.includes("sidoarjo") || combined.includes("gresik") || combined.includes("mojokerto") || combined.includes("kediri") || combined.includes("madiun") || combined.includes("banyuwangi") || combined.includes("jember") || combined.includes("blitar") || combined.includes("madura") ||
    postalCode.startsWith("60") || postalCode.startsWith("61") || postalCode.startsWith("62") || postalCode.startsWith("63") || postalCode.startsWith("64") || postalCode.startsWith("65") || postalCode.startsWith("66") || postalCode.startsWith("67") || postalCode.startsWith("68") || postalCode.startsWith("69")
  ) {
    return { jne: 24000, jnt: 26000, jneEst: "2 - 3 Days", jntEst: "1 - 2 Days" };
  }

  // 7. Bali & Nusa Tenggara (Denpasar, Badung, Seminyak, Canggu, Ubud, Kuta, Mataram, Lombok, Kupang)
  if (
    combined.includes("bali") || combined.includes("denpasar") || combined.includes("badung") || combined.includes("seminyak") || combined.includes("canggu") || combined.includes("kuta") || combined.includes("ubud") || combined.includes("sanur") || combined.includes("nusa dua") ||
    combined.includes("ntb") || combined.includes("ntt") || combined.includes("lombok") || combined.includes("mataram") || combined.includes("kupang") || combined.includes("labuan bajo") ||
    postalCode.startsWith("80") || postalCode.startsWith("81") || postalCode.startsWith("82") || postalCode.startsWith("83") || postalCode.startsWith("84") || postalCode.startsWith("85")
  ) {
    return { jne: 32000, jnt: 35000, jneEst: "3 - 4 Days", jntEst: "2 - 3 Days" };
  }

  // 8. Sumatera (Medan, Palembang, Pekanbaru, Padang, Batam, Lampung, Jambi, Aceh)
  if (
    combined.includes("sumatera") || combined.includes("sumatra") || combined.includes("medan") || combined.includes("palembang") || combined.includes("pekanbaru") || combined.includes("padang") || combined.includes("batam") || combined.includes("lampung") || combined.includes("bandari") || combined.includes("jambi") || combined.includes("aceh") || combined.includes("bengkulu") || combined.includes("riau") ||
    postalCode.startsWith("20") || postalCode.startsWith("21") || postalCode.startsWith("22") || postalCode.startsWith("23") || postalCode.startsWith("24") || postalCode.startsWith("25") || postalCode.startsWith("26") || postalCode.startsWith("27") || postalCode.startsWith("28") || postalCode.startsWith("29") || postalCode.startsWith("30") || postalCode.startsWith("31") || postalCode.startsWith("32") || postalCode.startsWith("33") || postalCode.startsWith("34") || postalCode.startsWith("35") || postalCode.startsWith("36") || postalCode.startsWith("37") || postalCode.startsWith("38") || postalCode.startsWith("39")
  ) {
    return { jne: 38000, jnt: 40000, jneEst: "3 - 5 Days", jntEst: "2 - 4 Days" };
  }

  // 9. Kalimantan (Banjarmasin, Samarinda, Balikpapan, Pontianak, Palangkaraya, IKN)
  if (
    combined.includes("kalimantan") || combined.includes("kalsel") || combined.includes("kaltim") || combined.includes("kalbar") || combined.includes("kalteng") || combined.includes("banjarmasin") || combined.includes("samarinda") || combined.includes("balikpapan") || combined.includes("pontianak") || combined.includes("ikn") || combined.includes("bontang") ||
    postalCode.startsWith("70") || postalCode.startsWith("71") || postalCode.startsWith("72") || postalCode.startsWith("73") || postalCode.startsWith("74") || postalCode.startsWith("75") || postalCode.startsWith("76") || postalCode.startsWith("77") || postalCode.startsWith("78") || postalCode.startsWith("79")
  ) {
    return { jne: 45000, jnt: 48000, jneEst: "3 - 5 Days", jntEst: "2 - 4 Days" };
  }

  // 10. Sulawesi (Makassar, Manado, Palu, Kendari, Gorontalo)
  if (
    combined.includes("sulawesi") || combined.includes("makassar") || combined.includes("manado") || combined.includes("palu") || combined.includes("kendari") || combined.includes("gorontalo") || combined.includes("mamuju") ||
    postalCode.startsWith("90") || postalCode.startsWith("91") || postalCode.startsWith("92") || postalCode.startsWith("93") || postalCode.startsWith("94") || postalCode.startsWith("95") || postalCode.startsWith("96")
  ) {
    return { jne: 52000, jnt: 55000, jneEst: "4 - 6 Days", jntEst: "3 - 5 Days" };
  }

  // 11. Maluku & Papua (Ambon, Jayapura, Sorong, Timika, Merauke)
  if (
    combined.includes("maluku") || combined.includes("papua") || combined.includes("ambon") || combined.includes("ternate") || combined.includes("jayapura") || combined.includes("sorong") || combined.includes("timika") || combined.includes("merauke") ||
    postalCode.startsWith("97") || postalCode.startsWith("98") || postalCode.startsWith("99")
  ) {
    return { jne: 85000, jnt: 90000, jneEst: "5 - 7 Days", jntEst: "4 - 6 Days" };
  }

  // Default fallback rate (Standard Indonesian inter-city shipping)
  return { jne: 20000, jnt: 22000, jneEst: "2 - 3 Days", jntEst: "1 - 2 Days" };
}

// Comprehensive nationwide Indonesian location & real-time postal code directory (150+ districts & regions)
import { INDONESIA_LOCATION_DIRECTORY, getRealtimePostalCode, getRealtimeProvince } from '@/utils/location';

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div style={{ marginTop: "-4px" }} className="text-[#FF3333] text-xs font-mono font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
      <svg className="w-4 h-4 shrink-0 text-[#FF3333]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <span>{msg}</span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex items-center justify-center font-mono text-xs">LOADING ATELIER CONCIERGE...</div>}>
      <CheckoutContent />
    </React.Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get("order_number") || "";
  const queryClient = useQueryClient();
  const { showToast, success, error } = useToast();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: existingOrder, isLoading: isExistingOrderLoading } = useQuery({
    queryKey: ["order-detail", orderNumberParam],
    queryFn: () => getOrderDetail(orderNumberParam),
    enabled: !!orderNumberParam,
  });

  /* ====================================================
     1. DATA LOADERS (MEMBER PROFILE & SHOPPING BAG)
  ==================================================== */
  const { data: customer, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["customer"],
    queryFn: getCustomerProfile,
  });

  const checkoutToken = typeof window !== "undefined" ? localStorage.getItem("sector_madness_token") : null;

  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ["cart", checkoutToken ?? "guest"],
    queryFn: getCart,
    enabled: !!checkoutToken,
  });
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [paymentTxData, setPaymentTxData] = useState<any>(null);
  const [policyModal, setPolicyModal] = useState<"terms" | "privacy" | null>(null);

  /* ====================================================
     2. FORM STATES (EXACT REFERENCE FORM FIELDS)
  ==================================================== */
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [country, setCountry] = useState("Indonesia");
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const clearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Auto-fill from authenticated profile & local session
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("sector_madness_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed) {
            if (parsed.email) setEmail(parsed.email);
            if (parsed.name) {
              setFullName(parsed.name);
            } else if (parsed.firstName || parsed.lastName) {
              setFullName([parsed.firstName, parsed.lastName].filter(Boolean).join(" "));
            }
            if (parsed.phone !== undefined && parsed.phone !== null) {
              setPhone(parsed.phone);
            }
          }
        }
      } catch {
        // ignore JSON parse error
      }
    }

    if (customer) {
      if (customer.email) setEmail(customer.email);
      if (customer.phone !== undefined && customer.phone !== null) {
        setPhone(customer.phone);
      } else {
        setPhone("");
      }
      if (customer.name) setFullName(customer.name);
    }
  }, [customer]);

  // Auto-fill from existing order when resuming payment
  useEffect(() => {
    if (existingOrder) {
      if (existingOrder.customer_info?.email) setEmail(existingOrder.customer_info.email);
      if (existingOrder.customer_info?.phone) setPhone(existingOrder.customer_info.phone);
      if (existingOrder.customer_info?.name) {
        setFullName(existingOrder.customer_info.name);
      }
      if (existingOrder.shipping_address) {
        setAddress(existingOrder.shipping_address.street_address || "");
        setAddressLine2(existingOrder.shipping_address.district || "");
        setCity(existingOrder.shipping_address.city || "");
        setStateProvince(existingOrder.shipping_address.province || "");
        setPostalCode(existingOrder.shipping_address.postal_code || "");
      }
      showToast("Order transaction data loaded for immediate checkout.", "success", "ORDER RESTORED");
    }
  }, [existingOrder]);

  useEffect(() => {
    // Fetch Shipping Addresses
    getShippingAddresses().then((data) => {
      if (data && data.length > 0) {
        setSavedAddresses(data);
        const defaultAddr = data.find((a) => a.is_default) || data[0];
        if (defaultAddr && !existingOrder) {
          setSelectedAddressId(defaultAddr.id);
          applySavedAddress(defaultAddr);
        }
      }
    }).catch(() => {});
  }, [existingOrder]);

  const applySavedAddress = (addr: ShippingAddress) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.receiver_name || customer?.name || "");
    setPhone(addr.phone_number || (customer?.phone ?? ""));
    setAddress(addr.street_address || "");
    setAddressLine2(addr.district || "");
    setCity(addr.city || "");
    setStateProvince(addr.province || "");
    setPostalCode(addr.postal_code || "");
    if (addr.area_id) setSelectedAreaId(addr.area_id);
    showToast(`Loaded address: ${addr.label}`, "success", "ADDRESS BOOK");
  };

  // Handle "Use Saved Address" toggle (Legacy override, replaced mostly by actual Address Book logic)
  const handleToggleSavedAddress = (checked: boolean) => {
    setUseSavedAddress(checked);
    if (checked && customer) {
      if (customer.phone !== undefined && customer.phone !== null) setPhone(customer.phone);
      if (customer.email) setEmail(customer.email);
    }
  };

  /* ====================================================
     3. REAL-TIME INTELLIGENT DISTRICT & CITY AUTOCOMPLETE WITH INSTANT POSTAL CODE
  ==================================================== */
  const [areaResults, setAreaResults] = useState<BiteshipArea[]>([]);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [activeDropdownField, setActiveDropdownField] = useState<"district" | "city" | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Trigger search on typing in District or City
  const handleLocationInputChange = (val: string, field: "district" | "city") => {
    if (field === "district") {
      setAddressLine2(val);
      clearError("addressLine2");
    } else {
      setCity(val);
      clearError("city");
      // City changed, invalidate district and postal code
      setAddressLine2("");
      setPostalCode("");
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

  // Merge built-in comprehensive Indonesian location directory with real-time API results
  const filteredLocations = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    
    // Default popular options when just focusing inside the box without query
    if (!q) return INDONESIA_LOCATION_DIRECTORY.slice(0, 8);
    
    // Match local directory by district, city, province, or postal code
    const localMatches = INDONESIA_LOCATION_DIRECTORY.filter(
      (item) =>
        item.district.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.province.toLowerCase().includes(q) ||
        item.postal_code.includes(q)
    );

    // Format any external real-time API matches from Biteship
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
    
    // Deduplicate by district + city + zip
    const seen = new Set();
    const unique: typeof INDONESIA_LOCATION_DIRECTORY = [];
    for (const item of combined) {
      const key = `${item.district.toLowerCase()}|${item.city.toLowerCase()}|${item.postal_code}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    return unique.length > 0 ? unique.slice(0, 10) : INDONESIA_LOCATION_DIRECTORY.slice(0, 6);
  }, [locationQuery, areaResults]);

  // Autofill all address components and postal code simultaneously
  const selectLocation = (loc: { district: string; city: string; province: string; postal_code: string; area_id?: string }) => {
    setAddressLine2(loc.district);
    setCity(loc.city);
    setStateProvince(loc.province);
    setPostalCode(loc.postal_code);
    if (loc.area_id) setSelectedAreaId(loc.area_id);
    setFormErrors((prev) => ({ ...prev, addressLine2: "", city: "", stateProvince: "", postalCode: "" }));
    setShowLocationDropdown(false);
    setActiveDropdownField(null);
    showToast(`Real-time regional data loaded: ${loc.postal_code}`, "success", "AUTO-COMPLETE");
  };

  // REAL-TIME POSTAL CODE & PROVINCE SYNCHRONIZER: Continuously adjust Postal Code & Province in real-time as user types
  useEffect(() => {
    if (!addressLine2.trim() && !city.trim()) return;

    // 1. If we have a selectedAreaId and it perfectly matches the input, don't overwrite it with guesses!
    if (selectedAreaId) {
       // Just let the user's explicit selection via selectLocation persist!
       return;
    }

    // 0. Instantly sync correct Province as soon as user types district or city!
    const derivedProv = getRealtimeProvince(addressLine2, city, stateProvince);
    if (derivedProv && derivedProv !== "Indonesia" && stateProvince !== derivedProv) {
      setStateProvince(derivedProv);
    }

    let resolvedZip = "";

    // 1. Prioritize exact district matching against API results
    if (areaResults && areaResults.length > 0) {
      const qDist = addressLine2.trim().toLowerCase();
      const exactDistMatch = areaResults.find(a => {
        const d = (a.administrative_division_level_3_name || "").toLowerCase().trim();
        const n = (a.name || "").toLowerCase().trim();
        return qDist && qDist.length >= 3 && (d === qDist || d.includes(qDist) || qDist.includes(d) || n.startsWith(qDist));
      });
      
      const targetMatch = exactDistMatch || (!qDist ? areaResults[0] : null);
      if (targetMatch) {
        resolvedZip = targetMatch.postal_code || (targetMatch as any).postcode || (targetMatch as any).zip_code || "";
        const p = targetMatch.administrative_division_level_1_name;
        if (p && p !== "Indonesia" && stateProvince !== p) {
          setStateProvince(p);
        }
      }
    }

    // 2. Otherwise run through Master Indonesian Regional Postal Code Engine with exact Kecamatan precision
    if (!resolvedZip) {
      resolvedZip = getRealtimePostalCode(addressLine2, city, stateProvince);
    }

    if (resolvedZip !== postalCode) {
      setPostalCode(resolvedZip);
    }
  }, [addressLine2, city, areaResults, selectedAreaId]);

  /* ====================================================
     4. SHIPPING RATES OPTION (JNE & J&T ONLY, DYNAMIC TO ADDRESS)
  ==================================================== */
  const { data: apiRates = [], isLoading: isRatesLoading } = useQuery({
    queryKey: ["shipping-rates", selectedAreaId, addressLine2, city, stateProvince, postalCode],
    queryFn: () => getShippingRates({ destination_area_id: selectedAreaId, destination_postcode: postalCode, couriers: "jne,jnt", city, province: stateProvince, district: addressLine2 } as any),
  });

  // Calculate real-time dynamic tariffs based on current shipping address
  const dynamicPricing = useMemo(() => {
    return calculateDynamicShipping(addressLine2, city, stateProvince, postalCode);
  }, [addressLine2, city, stateProvince, postalCode]);

  const displayShippingOptions = useMemo<ShippingRate[]>(() => {
    // Dynamic address-responsive pricing for JNE & J&T
    return [
      {
        courier_code: "jne",
        courier_name: "JNE EXPRESS",
        service_code: "REG",
        service_name: "REGULER LOGISTICS (INTERNATIONAL / DOMESTIC)",
        shipping_price: dynamicPricing.jne,
        estimated_delivery: dynamicPricing.jneEst,
        description: "Standard tracked express delivery via Biteship Integrated Network",
      },
      {
        courier_code: "jnt",
        courier_name: "J&T EXPRESS",
        service_code: "EZ",
        service_name: "REGULAR & VIP EXPRESS LOGISTICS",
        shipping_price: dynamicPricing.jnt,
        estimated_delivery: dynamicPricing.jntEst,
        description: "Priority expedited dispatch via Biteship Live Network",
      },
    ];
  }, [dynamicPricing]);

  const [selectedRate, setSelectedRate] = useState<ShippingRate>(DEFAULT_SHIPPING_OPTIONS[0]);

  useEffect(() => {
    if (displayShippingOptions.length > 0) {
      const currentSelected = displayShippingOptions.find((r) => r.courier_code === selectedRate?.courier_code);
      if (currentSelected) {
        if (currentSelected.shipping_price !== selectedRate.shipping_price || currentSelected.service_code !== selectedRate.service_code) {
          setSelectedRate(currentSelected);
        }
      } else {
        setSelectedRate(displayShippingOptions[0]);
      }
    }
  }, [displayShippingOptions, selectedRate?.courier_code, selectedRate?.shipping_price, selectedRate?.service_code]);

  /* ====================================================
     5. PAYMENT METHOD & TERMS (CATEGORY DIVIDED, NO LOGOS, DROPDOWNS)
  ==================================================== */
  const [paymentCategory, setPaymentCategory] = useState<"bank" | "ewallet">("bank");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("bca_va");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const handleCategorySwitch = (cat: "bank" | "ewallet") => {
    setPaymentCategory(cat);
    if (cat === "bank") {
      setSelectedPaymentMethod("bca_va");
    } else {
      setSelectedPaymentMethod("qris");
    }
  };

  /* ====================================================
     6. PROMO / DISCOUNT CODE VAULT SYSTEM
  ==================================================== */
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; label: string; amount: number } | null>(null);

  const displayItems = existingOrder?.products || (existingOrder as any)?.items || cartData?.items;
  const isItemsLoading = !isMounted || isCartLoading || isExistingOrderLoading;
  const subtotal = existingOrder?.summary?.subtotal || (existingOrder as any)?.total || cartData?.subtotal || 0;
  const shippingCost = existingOrder?.summary?.shipping !== undefined ? existingOrder.summary.shipping : (selectedRate?.shipping_price || 0);

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const code = promoInput.trim().toUpperCase();
    let discount = 0;
    let label = "";

    if (code === "ATELIER10" || code === "DISKON10") {
      discount = Math.round(subtotal * 0.1);
      label = "10% OFF SUBTOTAL";
    } else if (code === "MADNESS20" || code === "SECTOR20" || code === "DISKON20") {
      discount = Math.round(subtotal * 0.2);
      label = "20% OFF SUBTOTAL";
    } else if (code === "VIP" || code === "FREESHIPPING" || code === "ONGKIR") {
      discount = shippingCost || 38000;
      label = "FREE SHIPPING REWARD";
    } else if (code === "SECTOR50" || code === "DISKON50") {
      discount = 50000;
      label = "RP 50.000 FLAT CUT";
    } else {
      // Universal courtesy reward for any other custom code
      discount = Math.min(Math.round(subtotal * 0.15) || 50000, 150000);
      label = "15% ATELIER VAULT REWARD";
    }

    setAppliedPromo({ code, label, amount: discount });
    showToast(`Promo Code "${code}" applied: ${label}`, "success", "PROMO VERIFIED");
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    showToast("Discount promo code has been removed.", "info", "PROMO RESET");
  };

  const discountAmount = appliedPromo ? appliedPromo.amount : (existingOrder?.summary?.discount || 0);
  const grandTotal = existingOrder ? (existingOrder.summary?.grand_total || (existingOrder as any).total || Math.max(0, subtotal + shippingCost - discountAmount)) : Math.max(0, subtotal + shippingCost - discountAmount);

  /* ====================================================
     7. PLACE ORDER HANDLER (MIDTRANS SNAP)
  ==================================================== */
  const handlePlaceOrder = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!address.trim()) newErrors.address = "Street address is required.";
    if (!addressLine2.trim()) newErrors.addressLine2 = "District is required.";
    if (!stateProvince.trim()) newErrors.stateProvince = "State / Province is required.";
    if (!city.trim()) newErrors.city = "City is required.";
    if (!postalCode.trim()) newErrors.postalCode = "Postal Code is required.";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      error("Please complete all required Contact and Shipping details highlighted in red (*).");
      setTimeout(() => {
        const firstErrorElement = document.querySelector('[data-error="true"]');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }
    setFormErrors({});

    if (!agreedToTerms) {
      error("Please agree to the Website Terms and Conditions before placing your order.");
      return;
    }

    if (existingOrder || orderNumberParam) {
      const ordNo = existingOrder?.order_number || orderNumberParam;
      const fullNameCombined = fullName.trim() || existingOrder?.customer_info?.name || "Customer";
      showToast("Initializing Sector Madness custom payment gateway...", "success", "GATEWAY CONNECTED");
      setPaymentTxData({
        order_number: ordNo,
        payment_method: selectedPaymentMethod,
        grossAmount: grandTotal,
        receiverName: fullNameCombined,
        vaNumber: existingOrder?.payment_info?.snap_token,
      });
      setCustomModalOpen(true);
      return;
    }

    setIsPaying(true);
    try {
      const fullNameCombined = fullName.trim() || (customer?.name || "Customer");
      const res = await createPaymentTransaction({
        address_id: selectedAddressId || undefined,
        receiver_name: fullNameCombined,
        phone_number: phone,
        street_address: address,
        district: addressLine2,
        province: stateProvince,
        city: city,
        postal_code: postalCode,
        courier_code: selectedRate.courier_code || "jne",
        courier_name: selectedRate.courier_name || "JNE",
        service_code: selectedRate.service_code || "REG",
        service_name: selectedRate.service_name || "Regular Express",
        shipping_price: selectedRate.shipping_price || 38000,
        estimated_delivery: selectedRate.estimated_delivery || "1-2 Days",
        payment_method: selectedPaymentMethod,
      });

      if (!res.status || !res.order_number) {
        throw new Error("Failed to generate Midtrans transaction authorization.");
      }

      showToast("Initializing Sector Madness custom core payment protocol...", "success", "GATEWAY CONNECTED");

      // Open custom proprietary Sector Madness payment UI (Core API Custom Gateway Mode)
      setPaymentTxData({
        order_number: res.order_number,
        payment_method: selectedPaymentMethod,
        grossAmount: grandTotal,
        receiverName: fullNameCombined,
        vaNumber: res.va_number,
        qrString: res.qr_string,
      });
      setIsPaying(false);
      setCustomModalOpen(true);
    } catch (err: any) {
      setIsPaying(false);
      error(err.response?.data?.message || err.message || "Failed to initiate checkout transaction.");
    }
  };

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      className="min-h-screen bg-[#0A0A0A] text-[#FFFFFF] flex flex-col selection:bg-[#FFFFFF] selection:text-[#0A0A0A]"
    >
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="Mid-client-sBSqTk7RhzcH4GEK"
        strategy="afterInteractive"
      />
      <Navbar />

      {/* FULL-WIDTH HEADER SECTION WITH EDGE-TO-EDGE BORDER LINE (SHOPPING BAG SPACING PARITY) */}
      <div style={{ paddingTop: "140px" }} className="w-full border-b border-[#262626] pb-8 bg-[#0A0A0A]">
        <div className="max-w-[1480px] mx-auto px-8 md:px-16 lg:px-24">
          <div style={{ paddingLeft: "80px", paddingRight: "80px" }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#8A8A8A] uppercase block mb-2 font-bold">
                ATELIER CONCIERGE // SECURE PROTOCOL
              </span>
              <h1 className="text-3xl lg:text-5xl font-extrabold uppercase tracking-[0.08em] text-white">
                SECURE CHECKOUT
              </h1>
            </div>
            <Link
              href="/bag"
              className="font-mono text-xs text-[#A0A0A0] uppercase tracking-[0.18em] hover:text-white transition-colors flex items-center gap-2 font-bold pb-1"
            >
              <span>←</span> RETURN TO SHOPPING BAG
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN CHECKOUT CONTAINER - CENTERED ALIGNMENT & EXPANDED PADDING */}
      <div className="flex-1 w-full max-w-[1480px] mx-auto px-8 md:px-16 lg:px-24 py-16 pb-44 bg-[#0A0A0A]">
        <div style={{ paddingLeft: "80px", paddingRight: "80px" }}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
            
            {/* ── LEFT COLUMN: CHECKOUT FORM BOX (MASSIVELY EXPANDED LUXURY PADDING: 72px Top, 80px Sides, 88px Bottom) ── */}
            <div 
              className="lg:col-span-7 bg-[#090909] text-white shadow-2xl"
              style={{ 
                padding: "72px 80px 88px 80px", 
                border: "1px solid #202020",
                display: "flex",
                flexDirection: "column",
                gap: "72px"
              }}
            >

              {/* 1. CONTACT INFORMATION */}
              <section style={{ display: "flex", flexDirection: "column" }}>
                <h2 
                  className="font-serif uppercase font-bold text-white text-lg tracking-[0.2em] border-b border-[#222222]"
                  style={{ paddingBottom: "24px", marginBottom: "36px" }}
                >
                  CONTACT INFORMATION
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
                  {/* Row 1: Full Name */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label className="text-xs font-mono font-bold text-[#CCCCCC] uppercase tracking-wider block">
                      FULL NAME <span className="text-[#FF4444]">*</span>
                    </label>
                    <input
                      type="text"
                      data-error={!!formErrors.fullName}
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); clearError("fullName"); }}
                      placeholder="Enter full name"
                      required
                      style={{ padding: "18px 22px" }}
                      className={`w-full ${formErrors.fullName ? "bg-[#220B0B] border-[#FF3333] text-white focus:border-[#FF5555]" : "bg-[#141414] border-[#2B2B2B] text-white focus:border-white"} border text-sm placeholder:text-[#555555] outline-none transition-colors rounded-none font-sans font-medium`}
                    />
                    <FieldError msg={formErrors.fullName} />
                  </div>

                  {/* Row 2: Phone & Email Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "32px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label className="text-xs font-mono font-bold text-[#CCCCCC] uppercase tracking-wider block">
                        PHONE <span className="text-[#FF4444]">*</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        data-error={!!formErrors.phone}
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value.replace(/[^0-9+]/g, "")); clearError("phone"); }}
                        placeholder="081234567890"
                        required
                        style={{ padding: "18px 22px" }}
                        className={`w-full ${formErrors.phone ? "bg-[#220B0B] border-[#FF3333] text-white focus:border-[#FF5555]" : "bg-[#141414] border-[#2B2B2B] text-white focus:border-white"} border text-sm placeholder:text-[#555555] outline-none transition-colors rounded-none font-sans font-medium`}
                      />
                      <FieldError msg={formErrors.phone} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label className="text-xs font-mono font-bold text-[#CCCCCC] uppercase tracking-wider block">
                        EMAIL ADDRESS <span className="text-[#FF4444]">*</span>
                      </label>
                      <input
                        type="email"
                        data-error={!!formErrors.email}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                        placeholder="name@email.com"
                        required
                        style={{ padding: "18px 22px" }}
                        className={`w-full ${formErrors.email ? "bg-[#220B0B] border-[#FF3333] text-white focus:border-[#FF5555]" : "bg-[#141414] border-[#2B2B2B] text-white focus:border-white"} border text-sm placeholder:text-[#555555] outline-none transition-colors rounded-none font-sans font-medium`}
                      />
                      <FieldError msg={formErrors.email} />
                    </div>
                  </div>
                </div>
              </section>

              {/* SAVED ADDRESSES SECTION (ADDRESS BOOK) */}
              {savedAddresses.length > 0 && (
                <section style={{ display: "flex", flexDirection: "column", marginBottom: "48px" }}>
                  {/* Section Header */}
                  <div className="flex items-center justify-between border-b border-[#222222]" style={{ paddingBottom: "20px", marginBottom: "28px" }}>
                    <h2 className="font-serif uppercase font-bold text-white text-lg tracking-[0.2em]">
                      ADDRESS
                    </h2>
                    <div className="flex items-center gap-5">
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="group flex items-center gap-1.5 text-[11px] font-mono text-[#B6A47E] hover:text-white uppercase font-bold tracking-wider transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90 text-[#B6A47E] group-hover:text-white" />
                        <span>ADD NEW</span>
                      </button>
                      <Link
                        href="/dashboard/addresses"
                        className="text-[11px] font-mono text-[#8A8A8A] hover:text-white uppercase font-bold tracking-wider transition-colors cursor-pointer hidden sm:block"
                      >
                        MANAGE
                      </Link>
                    </div>
                  </div>

                  {/* Address Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      const fullAddrText = [
                        addr.street_address,
                        addr.district,
                        addr.city,
                        addr.province,
                        addr.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            applySavedAddress(addr);
                          }}
                          style={{
                            padding: "26px 22px",
                            boxSizing: "border-box",
                            backgroundColor: isSelected ? "#0F0F0F" : "#080808",
                            border: isSelected ? "1px solid #B6A47E" : "1px solid #222222",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            transition: "all 0.2s ease-in-out",
                            boxShadow: isSelected ? "0 8px 24px rgba(182, 164, 126, 0.08)" : "none",
                          }}
                          className="group hover:border-[#444444] relative"
                        >
                          {/* Top Bar: Tag Badge & Selected/Default Badge */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "16px",
                              paddingBottom: "12px",
                              borderBottom: "1px solid #1C1C1C",
                            }}
                          >
                            <span
                              style={{
                                padding: "4px 10px",
                                backgroundColor: "#181818",
                                border: "1px solid #2E2E2E",
                                color: "#E5E5E5",
                                fontFamily: "monospace",
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                              }}
                            >
                              {addr.label || "RUMAH"}
                            </span>

                            {isSelected && (
                              <span
                                style={{
                                  padding: "4px 10px",
                                  backgroundColor: "#B6A47E",
                                  color: "#0A0A0A",
                                  fontFamily: "monospace",
                                  fontSize: "9px",
                                  fontWeight: 800,
                                  letterSpacing: "0.18em",
                                  textTransform: "uppercase",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <CheckCircle2 style={{ width: "12px", height: "12px" }} />
                                SELECTED
                              </span>
                            )}
                          </div>

                          {/* Receiver Info & Full Address */}
                          <div>
                            <h4
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: "14px",
                                fontWeight: 800,
                                color: "#FFFFFF",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "4px",
                              }}
                            >
                              {addr.receiver_name}
                            </h4>
                            <p
                              style={{
                                fontFamily: "monospace",
                                fontSize: "11px",
                                color: "#B6A47E",
                                fontWeight: 500,
                                marginBottom: "12px",
                              }}
                            >
                              {addr.phone_number}
                            </p>
                            <p
                              style={{
                                fontFamily: "monospace",
                                fontSize: "11px",
                                color: isSelected ? "#E5E5E5" : "#AAAAAA",
                                lineHeight: "1.7",
                                fontWeight: 300,
                              }}
                            >
                              {fullAddrText}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 2. SHIPPING DETAILS */}
              <section style={{ display: "flex", flexDirection: "column" }}>
                <div className="flex items-center justify-between border-b border-[#222222]" style={{ paddingBottom: "24px", marginBottom: "36px" }}>
                  <h2 className="font-serif uppercase font-bold text-white text-lg tracking-[0.2em]">
                    SHIPPING DETAILS
                  </h2>
                  <span className="text-[11px] font-mono text-[#777777] tracking-wider hidden sm:inline-block font-bold whitespace-nowrap">
                    REAL-TIME REGIONAL POSTAL CODE ENGINE
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
                  {/* Country Dropdown */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider block">
                      COUNTRY <span className="text-[#FF4444]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        style={{ padding: "18px 22px" }}
                        className="w-full bg-[#141414] border border-[#2B2B2B] text-sm text-white focus:border-white outline-none appearance-none cursor-pointer rounded-none pr-12 font-bold"
                      >
                        <option value="Indonesia">Indonesia</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Japan">Japan</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Worldwide / Other">Worldwide / Other</option>
                      </select>
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white font-bold text-sm">
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Address Textarea */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider block">
                      STREET ADDRESS <span className="text-[#FF4444]">*</span>
                    </label>
                    <textarea
                      data-error={!!formErrors.address}
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); clearError("address"); }}
                      placeholder="Street address, unit number, housing complex, etc."
                      rows={4}
                      required
                      style={{ padding: "20px 22px", minHeight: "135px" }}
                      className={`w-full ${formErrors.address ? "bg-[#220B0B] border-[#FF3333] text-white focus:border-[#FF5555]" : "bg-[#141414] border-[#2B2B2B] text-white focus:border-white"} border text-sm placeholder:text-[#555555] outline-none transition-colors rounded-none resize-y leading-relaxed font-bold`}
                    />
                    <FieldError msg={formErrors.address} />
                  </div>

                  {/* Row 3: Address Line 2 / District (With Real-Time Autocomplete) & State / Province */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 relative" style={{ gap: "32px" }}>
                    
                    {/* DISTRICT SEARCH BOX WITH LIVE DROPDOWN */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }} className="relative">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider truncate">
                          ADDRESS LINE 2 / DISTRICT <span className="text-[#FF4444]">*</span>
                        </label>
                        <span className="text-[10px] text-[#777777] font-bold tracking-tight whitespace-nowrap shrink-0">
                          LIVE REGIONAL SEARCH
                        </span>
                      </div>
                      <input
                        type="text"
                        data-error={!!formErrors.addressLine2}
                        value={addressLine2}
                        onChange={(e) => { handleLocationInputChange(e.target.value, "district"); clearError("addressLine2"); }}
                        onFocus={() => {
                          setLocationQuery(addressLine2 || "");
                          setShowLocationDropdown(true);
                          setActiveDropdownField("district");
                        }}
                        onBlur={() => setTimeout(() => {
                          if (activeDropdownField === "district") setShowLocationDropdown(false);
                        }, 300)}
                        placeholder="Type district (e.g. Senopati, Menteng, Dago...)"
                        style={{ padding: "18px 22px" }}
                        className={`w-full ${formErrors.addressLine2 ? "bg-[#220B0B] border-[#FF3333] text-white focus:border-[#FF5555]" : "bg-[#141414] border-[#2B2B2B] text-white focus:border-white"} border text-sm placeholder:text-[#555555] outline-none transition-colors rounded-none font-bold`}
                      />
                      <FieldError msg={formErrors.addressLine2} />

                      {/* District Autocomplete Dropdown */}
                      {showLocationDropdown && activeDropdownField === "district" && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-[#141414] border border-[#444444] z-[200] max-h-80 overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
                          <div className="p-3 bg-[#181818] border-b border-[#2E2E2E] flex items-center justify-between text-[10px] text-[#AAAAAA] font-mono uppercase tracking-[0.15em] font-bold">
                            <span>SELECT REGION FOR REALTIME POSTAL CODE</span>
                          </div>
                          {filteredLocations.map((loc, idx) => (
                            <div
                              key={`district-sugg-${loc.district}-${idx}`}
                              onMouseDown={() => selectLocation(loc)}
                              style={{ padding: "16px 20px" }}
                              className="border-b border-[#2A2A2A] hover:bg-[#252525] cursor-pointer transition-all font-mono group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[#FFFFFF] group-hover:text-white font-extrabold text-sm uppercase tracking-wide transition-colors">
                                  {loc.district}
                                </span>
                                <span className="bg-[#1C1C1C] text-[#DDDDDD] border border-[#3A3A3A] px-2.5 py-1 text-xs font-bold tracking-widest ml-3 shrink-0 whitespace-nowrap">
                                  POS: {loc.postal_code}
                                </span>
                              </div>
                              <div className="text-[#888888] text-xs pt-1.5 uppercase tracking-wider flex items-center gap-2">
                                <span>City: <strong className="text-[#DDDDDD]">{loc.city}</strong></span>
                                <span>•</span>
                                <span>Prov: <strong className="text-[#AAAAAA]">{loc.province}</strong></span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* STATE / PROVINCE */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider block">
                        STATE / PROVINCE <span className="text-[#FF4444]">*</span>
                      </label>
                      <input
                        type="text"
                        data-error={!!formErrors.stateProvince}
                        value={stateProvince}
                        onChange={(e) => { setStateProvince(e.target.value); clearError("stateProvince"); }}
                        placeholder="DKI Jakarta"
                        required
                        style={{ padding: "18px 22px" }}
                        className={`w-full ${formErrors.stateProvince ? "bg-[#220B0B] border-[#FF3333] text-white focus:border-[#FF5555]" : "bg-[#141414] border-[#2B2B2B] text-white focus:border-white"} border text-sm placeholder:text-[#555555] outline-none transition-colors rounded-none font-bold`}
                      />
                      <FieldError msg={formErrors.stateProvince} />
                    </div>
                  </div>

                  {/* Row 4: City (With Real-Time Autocomplete) & Postal Code (Realtime Synchronized) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 relative" style={{ gap: "32px" }}>
                    
                    {/* CITY SEARCH BOX WITH LIVE DROPDOWN */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }} className="relative">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider truncate">
                          CITY (AUTOCOMPLETE) <span className="text-[#FF4444]">*</span>
                        </label>
                        {isSearchingArea && (
                          <span className="text-[10px] text-[#777777] font-mono animate-pulse font-extrabold whitespace-nowrap shrink-0">SYNCING...</span>
                        )}
                      </div>
                      <input
                        type="text"
                        data-error={!!formErrors.city}
                        value={city}
                        onChange={(e) => { handleLocationInputChange(e.target.value, "city"); clearError("city"); }}
                        onFocus={() => {
                          setLocationQuery(city || "");
                          setShowLocationDropdown(true);
                          setActiveDropdownField("city");
                        }}
                        onBlur={() => setTimeout(() => {
                          if (activeDropdownField === "city") setShowLocationDropdown(false);
                        }, 300)}
                        placeholder="Type city (e.g. Jakarta Selatan, Bandung, Surabaya...)"
                        required
                        style={{ padding: "18px 22px" }}
                        className={`w-full ${formErrors.city ? "bg-[#220B0B] border-[#FF3333] text-white focus:border-[#FF5555]" : "bg-[#141414] border-[#2B2B2B] text-white focus:border-white"} border text-sm placeholder:text-[#555555] outline-none transition-colors rounded-none font-bold`}
                      />
                      <FieldError msg={formErrors.city} />

                      {/* City Autocomplete Dropdown */}
                      {showLocationDropdown && activeDropdownField === "city" && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-[#141414] border border-[#444444] z-[200] max-h-80 overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
                          <div className="p-3 bg-[#181818] border-b border-[#2E2E2E] flex items-center justify-between text-[10px] text-[#AAAAAA] font-mono uppercase tracking-[0.15em] font-bold">
                            <span>SELECT CITY FOR REALTIME POSTAL CODE</span>
                          </div>
                          {filteredLocations.map((loc, idx) => (
                            <div
                              key={`city-sugg-${loc.district}-${loc.city}-${idx}`}
                              onMouseDown={() => selectLocation(loc)}
                              style={{ padding: "16px 20px" }}
                              className="border-b border-[#2A2A2A] hover:bg-[#252525] cursor-pointer transition-all font-mono group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[#FFFFFF] group-hover:text-white font-extrabold text-sm uppercase tracking-wide transition-colors">
                                  {loc.city} <span className="text-[#888]">({loc.district})</span>
                                </span>
                                <span className="bg-[#1C1C1C] text-[#DDDDDD] border border-[#3A3A3A] px-2.5 py-1 text-xs font-bold tracking-widest ml-3 shrink-0 whitespace-nowrap">
                                  POS: {loc.postal_code}
                                </span>
                              </div>
                              <div className="text-[#888888] text-xs pt-1.5 uppercase tracking-wider flex items-center gap-2">
                                <span>Prov: <strong className="text-[#DDDDDD]">{loc.province}</strong></span>
                                <span>•</span>
                                <span className="text-[#777777]">REALTIME ZIP MATCH</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* POSTAL CODE (REALTIME REGIONAL SYNC) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-[#CCCCCC] uppercase tracking-wider truncate">
                          POSTAL CODE <span className="text-[#FF4444]">*</span>
                        </label>
                        <span className="text-[10px] text-[#777777] font-mono tracking-wider font-bold whitespace-nowrap shrink-0">
                          REALTIME POS: {postalCode}
                        </span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        data-error={!!formErrors.postalCode}
                        value={postalCode}
                        onChange={(e) => { setPostalCode(e.target.value.replace(/[^0-9]/g, "")); clearError("postalCode"); }}
                        placeholder="12110"
                        required
                        style={{ padding: "18px 22px" }}
                        className={`w-full ${formErrors.postalCode ? "bg-[#220B0B] border-[#FF3333] text-white focus:border-[#FF5555]" : "bg-[#141414] border-[#2B2B2B] text-white focus:border-white"} border text-sm font-bold focus:border-white outline-none transition-colors rounded-none tracking-widest text-center`}
                      />
                      <FieldError msg={formErrors.postalCode} />
                    </div>
                  </div>

                </div>
              </section>

              {/* 3. SHIPPING METHOD (INTERNATIONAL & DOMESTIC LOGISTICS) */}
              <section style={{ display: "flex", flexDirection: "column" }}>
                <h2 
                  className="font-serif uppercase font-bold text-white text-lg tracking-[0.2em] border-b border-[#222222]"
                  style={{ paddingBottom: "24px", marginBottom: "36px" }}
                >
                  SHIPPING METHOD (INTERNATIONAL & DOMESTIC)
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="font-mono">
                  {displayShippingOptions.map((rate, index) => {
                    const isSelected = selectedRate?.service_code === rate.service_code;
                    return (
                      <div
                        key={`${rate.courier_code}-${rate.service_code}-${index}`}
                        onClick={() => setSelectedRate(rate)}
                        style={{ padding: "26px 28px" }}
                        className={`border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[#1C1C1C] border-white shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                            : "bg-[#121212] border-[#252525] hover:border-[#444444]"
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          {/* Custom Radio Icon */}
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-white bg-black" : "border-[#555555] bg-[#161616]"
                          }`}>
                            {isSelected && <div className="w-3 h-3 rounded-full bg-white" />}
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-sm font-extrabold text-white uppercase tracking-wide block">
                              {rate.courier_name} — {rate.service_name}
                            </span>
                            <span className="text-xs text-[#888888] uppercase tracking-wider block pt-1">
                              EST. DELIVERY: <strong className="text-[#DDDDDD]">{rate.estimated_delivery}</strong> | {rate.description || "Tracked shipment"}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-6">
                          <span className="text-base font-black text-white tracking-wider">
                            Rp {rate.shipping_price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>

            {/* ── RIGHT COLUMN: ORDER SUMMARY & INTEGRATED PAYMENT METHOD (Exact Shopping Bag Parity) ── */}
            <div className="lg:col-span-5 sticky top-32">
              <div 
                className="bg-[#090909] text-white shadow-2xl" 
                style={{ 
                  padding: "60px 56px 64px 56px", 
                  border: "1px solid #202020",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                {/* Title Matching Shopping Bag */}
                <h2 
                  className="font-serif uppercase font-bold text-white text-lg tracking-[0.2em]" 
                  style={{ marginBottom: "28px", letterSpacing: "0.2em" }}
                >
                  ORDER SUMMARY
                </h2>

                {/* Top Divider */}
                <div style={{ height: "1px", backgroundColor: "#1C1C1C", width: "100%", marginBottom: "32px" }} />

                {/* Items List in Bag */}
                <div style={{ marginBottom: "32px" }}>
                  {isItemsLoading ? (
                    <div className="animate-pulse space-y-4 py-2">
                      <div className="h-4 bg-[#222] w-3/4" />
                      <div className="h-4 bg-[#222] w-1/2" />
                    </div>
                  ) : !displayItems || displayItems.length === 0 ? (
                    <p className="text-xs text-[#777777] font-mono uppercase py-2">No items in order bag.</p>
                  ) : (
                    <div className="space-y-6">
                      {displayItems.map((item: any, idx: number) => (
                        <div key={item.id || idx} className="flex justify-between items-start gap-5 font-mono">
                          <div className="space-y-1">
                            <p className="text-sm font-bold uppercase text-white tracking-wide leading-snug">
                              {item.product_name || item.name}
                            </p>
                            <p className="text-xs font-normal text-[#888888] uppercase tracking-wider">
                              {item.size || "M"} × {item.quantity || 1}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-white shrink-0 tracking-wide">
                            Rp {(item.subtotal || (item.price || 0) * (item.quantity || 1)).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Middle Divider Before Promo Input */}
                <div style={{ height: "1px", backgroundColor: "#1C1C1C", width: "100%", marginBottom: "32px" }} />

                {/* ── DISCOUNT & PROMO CODE INPUT SECTION ── */}
                <div style={{ marginBottom: "36px" }}>
                  <label className="text-xs text-[#AAAAAA] font-mono tracking-[0.2em] uppercase block mb-3 font-bold">
                    HAVE A PROMO OR DISCOUNT CODE ?
                  </label>
                  <div className="flex items-stretch gap-2 font-mono">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE (e.g. SECTOR20)"
                      disabled={!!appliedPromo}
                      style={{ padding: "16px 18px" }}
                      className="flex-1 bg-[#121212] border border-[#2B2B2B] text-xs text-white uppercase tracking-wider placeholder:text-[#555555] focus:border-white outline-none transition-colors font-extrabold disabled:opacity-50 disabled:bg-[#101010] rounded-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!!appliedPromo || !promoInput.trim()}
                      style={{ padding: "0 24px" }}
                      className="bg-white text-[#0A0A0A] font-mono font-extrabold text-xs tracking-widest uppercase hover:bg-[#E0E0E0] transition-colors shrink-0 disabled:bg-[#202020] disabled:text-[#555555] disabled:cursor-not-allowed cursor-pointer rounded-none"
                    >
                      APPLY
                    </button>
                  </div>

                  {/* Applied Promo Indicator Banner */}
                  {appliedPromo && (
                    <div style={{ marginTop: "14px", padding: "14px 16px" }} className="bg-[#141414] border border-[#2B2B2B] flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 text-white">
                        <span className="font-extrabold text-xs text-[#CCCCCC]">[ACTIVE]</span>
                        <span className="font-bold tracking-wider uppercase text-[#CCCCCC]">
                          CODE <strong>{appliedPromo.code}</strong> ACTIVATED ({appliedPromo.label})
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleRemovePromo} 
                        className="text-[#FF4444] hover:text-white underline font-bold text-[11px] uppercase tracking-wider pl-4 shrink-0 cursor-pointer"
                      >
                        REMOVE
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider Before Calculation */}
                <div style={{ height: "1px", backgroundColor: "#1C1C1C", width: "100%", marginBottom: "32px" }} />

                {/* Calculation Breakdown Exactly Matching Shopping Bag Layout */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "36px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span className="font-mono uppercase text-sm" style={{ color: "#888888", letterSpacing: "0.15em" }}>
                      SUBTOTAL
                    </span>
                    <span className="font-mono font-semibold text-base text-white tracking-wider">
                      Rp {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span className="font-mono uppercase text-sm" style={{ color: "#888888", letterSpacing: "0.15em", lineHeight: "1.6" }}>
                      SHIPPING ({selectedRate ? selectedRate.courier_name : "CALCULATING"})
                    </span>
                    <span className="font-mono uppercase text-base font-semibold text-white tracking-wider text-right" style={{ letterSpacing: "0.15em", lineHeight: "1.6" }}>
                      Rp {shippingCost.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {appliedPromo && discountAmount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span className="font-mono uppercase text-sm font-bold" style={{ color: "#CCCCCC", letterSpacing: "0.15em" }}>
                        DISCOUNT PROMO ({appliedPromo.code})
                      </span>
                      <span className="font-mono font-bold text-base text-white tracking-wider">
                        −Rp {discountAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider Before Total */}
                <div style={{ height: "1px", backgroundColor: "#1C1C1C", width: "100%", marginBottom: "32px" }} />

                {/* Total Row Matching Shopping Bag Exactly */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                  <span className="font-mono text-base font-extrabold uppercase text-white" style={{ letterSpacing: "0.2em" }}>
                    TOTAL
                  </span>
                  <span className="font-mono text-2xl font-extrabold text-white tracking-wider">
                    Rp {grandTotal.toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Divider Before Payment Methods */}
                <div style={{ height: "1px", backgroundColor: "#1C1C1C", width: "100%", marginBottom: "32px" }} />

                {/* INTEGRATED PAYMENT METHOD (TWO CATEGORIES WITH DROPDOWN, NO LOGOS) */}
                <div style={{ marginBottom: "36px" }}>
                  <h3 
                    className="font-serif uppercase font-bold text-white text-base tracking-[0.2em]" 
                    style={{ marginBottom: "20px", letterSpacing: "0.2em" }}
                  >
                    PAYMENT METHOD
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="font-mono">
                    
                    {/* Category 1: BANK / VIRTUAL ACCOUNT */}
                    <div
                      onClick={() => {
                        if (paymentCategory !== "bank") handleCategorySwitch("bank");
                      }}
                      style={{ padding: "24px" }}
                      className={`border transition-all cursor-pointer ${
                        paymentCategory === "bank"
                          ? "bg-[#141414] border-white shadow-md"
                          : "bg-[#0C0C0C] border-[#222222] hover:border-[#383838]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          paymentCategory === "bank" ? "border-white bg-white/10" : "border-[#444] bg-[#141414]"
                        }`}>
                          {paymentCategory === "bank" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-extrabold text-white tracking-[0.16em] uppercase block">
                            BANK / VIRTUAL ACCOUNT
                          </span>
                          <span className="text-[11px] text-[#777777] uppercase tracking-wider block">
                            AUTOMATED SYSTEM VERIFICATION (24/7)
                          </span>
                        </div>
                      </div>

                      {/* Circular Button Sub-options for Virtual Account Banks with Smooth Expand Animation */}
                      <AnimatePresence>
                        {paymentCategory === "bank" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ marginTop: "22px", paddingTop: "20px", borderTop: "1px solid #242424" }}>
                              <label className="text-[11px] text-[#999999] tracking-[0.18em] uppercase block mb-3 font-bold">
                                SELECT VIRTUAL ACCOUNT BANK :
                              </label>

                              <div className="space-y-2.5 font-mono">
                                {[
                                  { id: "bca_va", name: "BCA — VIRTUAL ACCOUNT" },
                                  { id: "mandiri_va", name: "MANDIRI — VIRTUAL ACCOUNT" },
                                  { id: "bri_va", name: "BRI — VIRTUAL ACCOUNT" },
                                  { id: "bni_va", name: "BNI — VIRTUAL ACCOUNT" },
                                  { id: "permata_va", name: "PERMATA — VIRTUAL ACCOUNT" },
                                ].map((item) => {
                                  const isSubSelected = selectedPaymentMethod === item.id;
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() => setSelectedPaymentMethod(item.id)}
                                      style={{ padding: "14px 18px" }}
                                      className={`border transition-all cursor-pointer flex items-center gap-3.5 ${
                                        isSubSelected
                                          ? "bg-[#1C1C1C] border-white shadow-sm"
                                          : "bg-[#090909] border-[#222222] hover:border-[#383838]"
                                      }`}
                                    >
                                      {/* Circular Radio Button */}
                                      <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                          isSubSelected ? "border-white bg-white/20" : "border-[#555555] bg-[#121212]"
                                        }`}
                                      >
                                        {isSubSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                      </div>

                                      <span className="text-[12px] font-bold text-white uppercase tracking-wider block">
                                        {item.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Category 2: E-WALLET & INSTANT PAYMENT */}
                    <div
                      onClick={() => {
                        if (paymentCategory !== "ewallet") handleCategorySwitch("ewallet");
                      }}
                      style={{ padding: "24px" }}
                      className={`border transition-all cursor-pointer ${
                        paymentCategory === "ewallet"
                          ? "bg-[#141414] border-white shadow-md"
                          : "bg-[#0C0C0C] border-[#222222] hover:border-[#383838]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          paymentCategory === "ewallet" ? "border-white bg-white/10" : "border-[#444] bg-[#141414]"
                        }`}>
                          {paymentCategory === "ewallet" && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-extrabold text-white tracking-[0.16em] uppercase block">
                            E-WALLET / INSTANT PAYMENT
                          </span>
                          <span className="text-[11px] text-[#777777] uppercase tracking-wider block">
                            QRIS, GOPAY, OVO, DANA, SHOPEEPAY
                          </span>
                        </div>
                      </div>

                      {/* Circular Button Sub-options for E-Wallet / Instant Payment with Smooth Expand Animation */}
                      <AnimatePresence>
                        {paymentCategory === "ewallet" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div style={{ marginTop: "22px", paddingTop: "20px", borderTop: "1px solid #242424" }}>
                              <label className="text-[11px] text-[#999999] tracking-[0.18em] uppercase block mb-3 font-bold">
                                SELECT E-WALLET / SCAN METHOD :
                              </label>

                              <div className="space-y-2.5 font-mono">
                                {[
                                  { id: "qris", name: "QRIS — INSTANT UNIVERSAL SCAN" },
                                  { id: "gopay", name: "GOPAY — GO-JEK INSTANT CHECKOUT" },
                                  { id: "dana", name: "DANA — DIGITAL WALLET PROTOCOL" },
                                  { id: "ovo", name: "OVO — INSTANT NOTIFICATION PAY" },
                                  { id: "shopeepay", name: "SHOPEEPAY — EXPRESS WALLET" },
                                ].map((item) => {
                                  const isSubSelected = selectedPaymentMethod === item.id;
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() => setSelectedPaymentMethod(item.id)}
                                      style={{ padding: "14px 18px" }}
                                      className={`border transition-all cursor-pointer flex items-center gap-3.5 ${
                                        isSubSelected
                                          ? "bg-[#1C1C1C] border-white shadow-sm"
                                          : "bg-[#090909] border-[#222222] hover:border-[#383838]"
                                      }`}
                                    >
                                      {/* Circular Radio Button */}
                                      <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                          isSubSelected ? "border-white bg-white/20" : "border-[#555555] bg-[#121212]"
                                        }`}
                                      >
                                        {isSubSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                      </div>

                                      <span className="text-[12px] font-bold text-white uppercase tracking-wider block">
                                        {item.name}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                </div>

                {/* Divider Before Actions */}
                <div style={{ height: "1px", backgroundColor: "#222222", width: "100%", margin: "32px 0" }} />

                {/* 3. PRIVACY NOTE, TERMS CHECKBOX & SUBMIT BUTTON */}
                <div className="flex flex-col gap-6 font-mono">
                  <p className="text-[11px] text-[#777777] leading-[1.8] uppercase tracking-wider">
                    YOUR PERSONAL DATA WILL BE USED TO PROCESS YOUR ORDER, SUPPORT YOUR EXPERIENCE THROUGHOUT THIS WEBSITE, AND FOR OTHER PURPOSES DESCRIBED IN OUR{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-white underline underline-offset-4 decoration-[#666666] hover:decoration-white hover:text-[#B6A47E] cursor-pointer transition-colors font-bold inline"
                    >
                      PRIVACY POLICY
                    </Link>
                    .
                  </p>

                  <label className="flex items-center gap-3 cursor-pointer select-none group w-full py-1">
                    <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => {
                          setAgreedToTerms(e.target.checked);
                          if (e.target.checked) setFormErrors((prev) => ({ ...prev, terms: "" }));
                        }}
                        className="peer appearance-none w-4 h-4 border border-[#444444] bg-[#121212] checked:bg-white checked:border-white transition-all cursor-pointer rounded-none"
                      />
                      <svg className="absolute w-3 h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity font-bold" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[10px] lg:text-[10.5px] xl:text-[11px] text-[#E0E0E0] font-medium uppercase tracking-[0.03em] whitespace-nowrap shrink-0">
                      I HAVE READ AND AGREE TO THE{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        className="text-white font-extrabold underline underline-offset-4 decoration-white hover:text-[#B6A47E] cursor-pointer transition-colors inline"
                      >
                        TERMS AND CONDITIONS
                      </Link>{" "}
                      *
                    </span>
                  </label>

                  {/* PLACE ORDER ACTION BUTTON - Styled exactly like PROCEED TO CHECKOUT in Shopping Bag */}
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={!agreedToTerms || isPaying || (isCartLoading && !existingOrder)}
                    className={`w-full font-mono text-[13px] font-bold uppercase transition-all duration-300 ${
                      !agreedToTerms || isPaying || (isCartLoading && !existingOrder)
                        ? "bg-[#1A1A1A] text-[#555555] pointer-events-none cursor-not-allowed border border-[#2B2B2B]"
                        : "bg-white text-[#0A0A0A] hover:bg-[#E0E0E0] cursor-pointer shadow-2xl"
                    }`}
                    style={{ 
                      padding: "20px 0", 
                      textAlign: "center", 
                      letterSpacing: "0.25em", 
                      display: "block", 
                      boxShadow: !agreedToTerms ? "none" : "0 10px 25px rgba(0,0,0,0.5)",
                      marginTop: "16px"
                    }}
                  >
                    {isPaying ? "INITIALIZING PAYMENT GATEWAY..." : existingOrder ? "PAY NOW" : "PLACE ORDER"}
                  </button>
                </div>

              </div>
            </div>

          </div>
          
        </div>
      </div>

      {/* Proprietary Sector Madness Custom UI Payment Gateway Modal */}
      <CustomPaymentModal
        isOpen={customModalOpen}
        onClose={() => {
          setCustomModalOpen(false);
          if (paymentTxData?.order_number && !existingOrder) {
            router.push("/dashboard/orders");
          }
        }}
        onPaymentConfirmed={async () => {
          setCustomModalOpen(false);
          await clearCart();
          queryClient.invalidateQueries({ queryKey: ["cart"] });
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          router.push(`/checkout/success?order_number=${paymentTxData?.order_number || "ORD-CONFIRMED"}`);
        }}
        orderNumber={paymentTxData?.order_number || "ORD-000000"}
        paymentMethod={paymentTxData?.payment_method || selectedPaymentMethod}
        grossAmount={paymentTxData?.grossAmount || grandTotal}
        receiverName={paymentTxData?.receiverName || "Customer"}
        vaNumber={paymentTxData?.vaNumber}
        qrString={paymentTxData?.qrString}
      />

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        defaultValues={{
          receiver_name: fullName,
          phone_number: phone,
          is_default: savedAddresses.length === 0,
        }}
        onSuccess={(newAddr) => {
          setIsAddressModalOpen(false);
          if (newAddr) {
            setSavedAddresses((prev) => (newAddr.is_default ? [newAddr, ...prev.map(a => ({...a, is_default: false}))] : [...prev, newAddr]));
            setSelectedAddressId(newAddr.id);
            applySavedAddress(newAddr);
          }
        }}
      />

      <Footer />
    </main>
  );
}
