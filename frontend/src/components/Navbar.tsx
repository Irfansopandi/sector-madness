"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBagItems } from "@/utils/bag";
import { getCart, getCategories, getCollections, getProducts, getImageUrl } from "@/utils/api";

const navLinks = [
  { label: "SHOP", href: "/shop", hasDropdown: true },
  { label: "JOURNAL", href: "/journal", hasDropdown: false },
  { label: "STORIES", href: "/brand", hasDropdown: false },
];

interface NavbarProps {
  mode?: "dark" | "light";
  activeLink?: string;
}

export default function Navbar({ mode = "dark", activeLink }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [hoveredProductIndex, setHoveredProductIndex] = useState(0);
  const [navHidden, setNavHidden] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const lastScrollY = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const [currentToken, setCurrentToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("sector_madness_token") : null
  );

  const hasToken = !!currentToken;

  // Detect desktop breakpoint to conditionally apply mobile/tablet margins
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const { data: cartData, refetch: refetchCart } = useQuery({
    queryKey: ["cart", currentToken ?? "guest"],
    queryFn: getCart,
    retry: 1,
    refetchInterval: hasToken ? 3000 : false,
    refetchOnWindowFocus: true,
    enabled: hasToken,
  });

  const [hoveredFilter, setHoveredFilter] = useState<string>("ALL");

  const { data: apiProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: apiCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: apiCollections } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });

  const dynamicCategories = (apiCategories && apiCategories.length > 0)
    ? [
        { label: "> ALL PRODUCTS", filter: "ALL" },
        ...apiCategories.slice(0, 6).map(c => ({ label: `> ${c.name.toUpperCase()}`, filter: c.name }))
      ]
    : [{ label: "> ALL PRODUCTS", filter: "ALL" }];

  const dynamicFocusOn = (apiCollections && apiCollections.length > 0)
    ? apiCollections.map(c => ({ label: `> ${c.name.toUpperCase()}`, filter: c.code || c.name }))
    : [];

  const actualBagCount = hasToken && cartData ? cartData.total_quantity : bagCount;

  const isLightMode = mode === "light";

  useEffect(() => {
    setMounted(true);
    const checkLoginAndBag = () => {
      const token = localStorage.getItem("sector_madness_token");
      // Sync reactive token state — this changes the cart query key per user
      setCurrentToken(token);

      try {
        const userData = localStorage.getItem("sector_madness_user");
        if (userData && token) {
          const parsed = JSON.parse(userData);
          setIsLoggedIn(!!parsed?.loggedIn);
          setIsAdmin(!!parsed?.isAdmin || !!parsed?.is_admin || parsed?.role === "admin" || parsed?.role === "administrator");
        } else {
          setIsLoggedIn(false);
          setIsAdmin(false);
          setBagCount(0);
        }
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setBagCount(0);
      }

      if (!token) {
        setBagCount(0);
        // Remove ALL cart cache entries (old user tokens included)
        queryClient.removeQueries({ queryKey: ["cart"] });
        return;
      }

      try {
        const items = getBagItems();
        const count = items.reduce((acc, i) => acc + i.quantity, 0);
        setBagCount(count);
      } catch {
        setBagCount(0);
      }

      // Refetch cart for the now-active user
      refetchCart();
    };
    checkLoginAndBag();
    window.addEventListener("storage", checkLoginAndBag);
    window.addEventListener("sector_auth_change", checkLoginAndBag);
    window.addEventListener("sector_bag_change", checkLoginAndBag);
    window.addEventListener("sector_bag_update", checkLoginAndBag);
    window.addEventListener("sector_wishlist_change", checkLoginAndBag);
    return () => {
      window.removeEventListener("storage", checkLoginAndBag);
      window.removeEventListener("sector_auth_change", checkLoginAndBag);
      window.removeEventListener("sector_bag_change", checkLoginAndBag);
      window.removeEventListener("sector_bag_update", checkLoginAndBag);
      window.removeEventListener("sector_wishlist_change", checkLoginAndBag);
    };
  }, [queryClient, refetchCart]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 60);

      // Only hide/show after scrolling past navbar height
      if (currentY > 100) {
        if (currentY > lastScrollY.current + 5) {
          // Scrolling DOWN → hide navbar
          setNavHidden(true);
        } else if (currentY < lastScrollY.current - 5) {
          // Scrolling UP → show navbar
          setNavHidden(false);
        }
      } else {
        setNavHidden(false);
      }

      lastScrollY.current = currentY;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (mobileOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isSearchOpen, mounted]);

  // Auto-focus search input when search modal opens & ESC key to close
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen]);

  // Filter products based on search query using real-time API products
  const activeProducts = apiProducts && apiProducts.length > 0 ? apiProducts : [];

  const searchResults = activeProducts.filter((p: any) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.collection && p.collection.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.material && p.material.toLowerCase().includes(q))
    );
  });

  const featuredShopProduct = (() => {
    if (!activeProducts || activeProducts.length === 0) return null;
    
    // Fallback to a product with an image if ALL is hovered
    if (!hoveredFilter || hoveredFilter === "ALL") {
      return activeProducts.find((p: any) => p.image) || null;
    }

    const cat = hoveredFilter.toUpperCase();
    const search = cat.toLowerCase();

    // 1. Exact match for custom Focus On / Collections or Category from Admin (Highest Priority)
    const exactMatch = activeProducts.find((p: any) => {
      if (!p.image) return false; // Ensure product has an image
      const coll = (p.collection || "").toLowerCase();
      const collCode = (p.collection_code || "").toLowerCase();
      const catName = (p.category?.name || "").toLowerCase();
      
      return (
        coll === search || collCode === search || coll.includes(search) || collCode.includes(search) ||
        catName === search || catName.includes(search)
      );
    });
    
    if (exactMatch) return exactMatch;

    // 2. Check Category Matches via regex if exact match not found
    if (cat === "OUTERWEAR" || cat === "JACKETS") {
      const match = activeProducts.find((p: any) => p.image && p.name.toLowerCase().match(/(bomber|trench|anorak|vest|jacket|coat)/i));
      if (match) return match;
    }
    if (cat === "T-SHIRT" || cat === "T-SHIRTS" || cat === "POLO SHIRT" || cat === "SHIRTS") {
      const match = activeProducts.find((p: any) => p.image && p.name.toLowerCase().match(/(tee|t-shirt|shirt|polo)/i));
      if (match) return match;
    }
    if (cat === "BOTTOMS" || cat === "CARGO" || cat === "TROUSERS" || cat === "SHORTS & TROUSERS") {
      const match = activeProducts.find((p: any) => p.image && p.name.toLowerCase().match(/(cargo|trousers|pants|shorts)/i));
      if (match) return match;
    }
    if (cat === "SWEATSHIRTS" || cat === "HOODIE") {
      const match = activeProducts.find((p: any) => p.image && p.name.toLowerCase().match(/(hoodie|sweat|sweatshirt|zip)/i));
      if (match) return match;
    }
    if (cat === "ACCESSORIES") {
      const match = activeProducts.find((p: any) => p.image && p.name.toLowerCase().match(/(vest|cap|accessory|bag|belt)/i));
      if (match) return match;
    }

    // 3. Search match for names and descriptions as last resort
    const searchMatch = activeProducts.find((p: any) => {
      if (!p.image) return false;
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return name.includes(search) || desc.includes(search);
    });

    if (searchMatch) return searchMatch;

    // Return null if no related product with image is found
    return null;
  })();

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 pointer-events-auto transition-transform duration-300 ease-out overflow-x-hidden ${
          navHidden && !isShopHovered && !mobileOpen ? "-translate-y-full" : "translate-y-0"
        }`}
        onMouseLeave={() => setIsShopHovered(false)}
      >
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`w-full transition-all duration-300 ease-out border-b ${
          isLightMode || isShopHovered
            ? "bg-[#FFFFFF] text-[#0A0A0A] border-[#E5E5E5]"
            : scrolled
            ? "bg-[#0A0A0A]/80 backdrop-blur-md border-[#222222]/40 text-[#F5F5F5]"
            : "bg-transparent text-[#F5F5F5] border-transparent"
        }`}
      >
        {/* Container: mobile pakai inline style padding agar pasti bekerja, desktop pakai lg:px-20 */}
        <div className="max-w-[1480px] mx-auto lg:px-20">
          <div
            className="relative flex justify-between items-center h-[76px] sm:h-[92px] lg:h-[116px]"
            style={{ paddingLeft: 0, paddingRight: 0 }}
          >
            {/* Mobile/Tablet: Hamburger Button di Kiri - inline margin untuk jarak pasti dari tepi layar */}
            <button
              className="lg:hidden cursor-pointer relative z-30 p-2 flex flex-col justify-center items-center gap-[4.5px]"
              style={{ marginLeft: isDesktop ? 0 : "clamp(20px, 6vw, 48px)" }}
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <span
                className={`block w-5 h-[1.5px] transition-all duration-300 ${
                  isLightMode || isShopHovered ? "bg-[#0A0A0A]" : "bg-[#F5F5F5]"
                }`}
              />
              <span
                className={`block w-5 h-[1.5px] transition-all duration-300 ${
                  isLightMode || isShopHovered ? "bg-[#0A0A0A]" : "bg-[#F5F5F5]"
                }`}
              />
              <span
                className={`block w-5 h-[1.5px] transition-all duration-300 ${
                  isLightMode || isShopHovered ? "bg-[#0A0A0A]" : "bg-[#F5F5F5]"
                }`}
              />
            </button>

            {/* Desktop: Bagian Kiri Navigasi Utama (100% Identik Asli dengan paddingLeft 50px) */}
            <div className="hidden lg:flex items-center gap-8 justify-start z-10" style={{ paddingLeft: "50px" }}>
              {navLinks.map((link) => {
                const isActive = activeLink === link.label;

                return (
                  <div
                    key={link.label}
                    onMouseEnter={() => {
                      if (link.hasDropdown) setIsShopHovered(true);
                      else setIsShopHovered(false);
                    }}
                    className="relative"
                  >
                    <Link
                      href={link.href}
                      className={`text-xs uppercase tracking-[0.15em] transition-colors duration-300 cursor-pointer font-medium ${
                        isActive
                          ? isLightMode || isShopHovered
                            ? "text-black font-bold border-b-2 border-black pb-1"
                            : "text-white font-bold border-b-2 border-white pb-1"
                          : isLightMode || isShopHovered
                          ? "text-gray-600 hover:text-black"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Bagian Tengah (Logo - Diperbesar untuk Mobile & Tablet) */}
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 lg:-translate-x-[calc(50%-14px)] pointer-events-none z-20 flex items-center justify-center">
              <Link
                href="/"
                className="relative z-50 cursor-pointer flex items-center justify-center pointer-events-auto"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src="/images/logo.png"
                  alt="SECTOR MADNESS"
                  width={597}
                  height={418}
                  className={`h-[75px] sm:h-[90px] md:h-[100px] lg:h-[110px] w-auto object-contain transition-all duration-300 ${
                    isLightMode || isShopHovered ? "brightness-0" : ""
                  }`}
                  priority
                />
              </Link>
            </div>

            {/* Bagian Kanan (Desktop: paddingLeft 50px, Mobile/Tablet: inline margin dari tepi layar) */}
            <div
              className="flex items-center gap-4 sm:gap-6 lg:gap-8 justify-end z-10 lg:pl-[50px]"
              style={{ marginRight: isDesktop ? 0 : "clamp(20px, 6vw, 48px)" }}
            >
              {/* Search Icon */}
              <button
                onClick={() => { setIsSearchOpen(true); setSearchQuery(""); }}
                className="cursor-pointer group p-1 flex items-center justify-center"
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-colors duration-300 ${
                    isLightMode || isShopHovered
                      ? "text-gray-600 group-hover:text-black"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              {/* Login / Account Link (Hanya Tampil di Desktop >= lg) */}
              <Link
                href={isLoggedIn ? (isAdmin ? "/admin" : "/dashboard") : "/login"}
                className="hidden lg:block cursor-pointer group"
                aria-label={isLoggedIn ? (isAdmin ? "Admin Panel" : "Account") : "Login"}
              >
                <span
                  className={`text-xs uppercase tracking-[0.15em] transition-colors duration-300 font-medium ${
                    isLightMode || isShopHovered
                      ? "text-gray-600 group-hover:text-black"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
                  {isLoggedIn ? (isAdmin ? "ADMIN PANEL" : "ACCOUNT") : "LOGIN"}
                </span>
              </Link>

              {/* Cart Icon */}
              <Link
                href="/bag"
                className="cursor-pointer group relative flex items-center p-3"
                aria-label="Shopping Bag"
              >
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-colors duration-300 ${
                      isLightMode || isShopHovered
                        ? "text-gray-600 group-hover:text-black"
                        : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <AnimatePresence>
                    {actualBagCount > 0 && (
                      <motion.span
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 450, damping: 25 }}
                        className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-[#B6A47E] text-[#0A0A0A] font-mono text-[9.5px] font-extrabold flex items-center justify-center shadow-md leading-none"
                      >
                        {actualBagCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hover Dropdown Mega Menu (James Boogie Style Desktop) */}
      <AnimatePresence>
        {isShopHovered && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full bg-[#FFFFFF] text-[#0A0A0A] border-b border-[#E5E5E5] shadow-xl overflow-y-auto max-h-[85vh]"
            onMouseEnter={() => setIsShopHovered(true)}
            onMouseLeave={() => setIsShopHovered(false)}
          >
            <div
              style={{ paddingLeft: "60px", paddingRight: "60px" }}
              className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20 pt-8 pb-16 lg:pt-10 lg:pb-20 grid grid-cols-12 gap-8 items-start"
            >
              {/* Column 1: PRODUCTS List */}
              <div className="col-span-5 border-r border-[#EEEEEE] pr-10">
                <h4 style={{ marginBottom: "28px" }} className="font-[family-name:var(--font-display)] text-[13px] md:text-[14px] tracking-[0.2em] font-medium text-[#777777] uppercase">
                  PRODUCTS
                </h4>
                <ul className="flex flex-col gap-4">
                  {dynamicCategories.map((cat) => (
                    <li key={cat.label}>
                      <Link
                        href={`/shop?category=${encodeURIComponent(cat.filter)}`}
                        onMouseEnter={() => setHoveredFilter(cat.filter)}
                        className="text-xs md:text-[13px] tracking-[0.2em] uppercase font-sans text-gray-500 font-normal hover:text-black hover:font-bold transition-all block cursor-pointer"
                      >
                        {cat.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: FOCUS ON List */}
              <div className="col-span-5 border-r border-[#EEEEEE] pr-10 pl-10">
                <h4 style={{ marginBottom: "28px" }} className="font-[family-name:var(--font-display)] text-[13px] md:text-[14px] tracking-[0.2em] font-medium text-[#777777] uppercase">
                  FOCUS ON
                </h4>
                <ul className="flex flex-col gap-4">
                  {dynamicFocusOn.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={`/shop?category=${encodeURIComponent(item.filter)}`}
                        onMouseEnter={() => setHoveredFilter(item.filter)}
                        className="text-xs md:text-[13px] tracking-[0.2em] uppercase font-sans text-gray-500 font-normal hover:text-black hover:font-bold transition-all block cursor-pointer"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Featured Product Preview */}
              <div className="col-span-2 pl-6 flex flex-col items-center justify-center">
                {featuredShopProduct ? (
                  <Link
                    href={`/product/${featuredShopProduct.slug}`}
                    className="group block w-full max-w-[260px]"
                  >
                    <div className="relative aspect-[3/4] w-full bg-[#F4F4F4] overflow-hidden mb-3 border border-[#E5E5E5] flex items-center justify-center">
                      <Image
                        src={getImageUrl(featuredShopProduct.image)}
                        alt={featuredShopProduct.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {(() => {
                        const isOutOfStock = featuredShopProduct.variants && Array.isArray(featuredShopProduct.variants)
                          ? featuredShopProduct.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0) === 0
                          : false;
                        return (
                          <>
                            {isOutOfStock && (
                              <div className="absolute top-2 right-2 z-10">
                                <span className="text-[8px] tracking-[0.1em] uppercase text-[#FF3B30] font-[family-name:var(--font-body)] font-bold">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                            {featuredShopProduct.discount_percentage && featuredShopProduct.discount_percentage > 0 && !isOutOfStock && (
                              <div className="absolute top-2 left-2 bg-[#FF3B30] text-white text-[8px] font-bold tracking-[0.1em] uppercase px-1.5 py-0.5 z-10 shadow-sm">
                                -{featuredShopProduct.discount_percentage}% OFF
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#0A0A0A] line-clamp-1">
                        {featuredShopProduct.name}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-0.5 flex-wrap">
                        <p className="text-[10px] tracking-[0.15em] text-[#0A0A0A] font-semibold uppercase">
                          Rp {(featuredShopProduct.price < 1000 ? featuredShopProduct.price * 1000 : featuredShopProduct.price).toLocaleString("id-ID")}
                        </p>
                        {featuredShopProduct.original_price && featuredShopProduct.original_price > featuredShopProduct.price && (
                          <p className="text-[9px] tracking-[0.1em] text-[#999999] line-through uppercase">
                            Rp {(featuredShopProduct.original_price < 1000 ? featuredShopProduct.original_price * 1000 : featuredShopProduct.original_price).toLocaleString("id-ID")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="block w-full max-w-[260px] invisible pointer-events-none">
                    <div className="relative aspect-[3/4] w-full mb-3 p-4"></div>
                    <div className="text-center">
                      <p className="text-[11px] font-semibold tracking-[0.1em] uppercase line-clamp-1">&nbsp;</p>
                      <div className="flex items-center justify-center gap-1.5 mt-0.5 flex-wrap">
                        <p className="text-[10px] tracking-[0.15em] font-semibold uppercase">&nbsp;</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* ── RENDER OVERLAYS TO DOCUMENT.BODY VIA PORTAL TO PREVENT CSS TRANSFORM CLIPPING ── */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {/* ── MOBILE MENU OVERLAY (IMAGE 3 REFERENCE STYLE) ── */}
            {mobileOpen && (
              <motion.div
                key="mobile-menu-overlay"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 99998,
                  backgroundColor: "#FFFFFF",
                  color: "#0A0A0A",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                className="pointer-events-auto lg:hidden"
              >
                {/* Header Row: Close (X) on left, Logo in center — mirror exact navbar header */}
                <div className="w-full border-b border-[#E5E5E5]">
                  <div className="max-w-[1480px] mx-auto">
                    <div
                      className="relative flex justify-between items-center h-[76px] sm:h-[92px] md:h-[116px]"
                    >
                      {/* Left: Close X Button — same margin as hamburger in navbar */}
                      <button
                        onClick={() => setMobileOpen(false)}
                        className="cursor-pointer p-2 text-[#0A0A0A] hover:opacity-60 transition-opacity z-20 flex items-center justify-center"
                        style={{ marginLeft: isDesktop ? 0 : "clamp(20px, 6vw, 48px)" }}
                        aria-label="Close menu"
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>

                      {/* Center: Logo — same size as navbar logo */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10 flex items-center justify-center">
                        <Link href="/" onClick={() => setMobileOpen(false)}>
                          <Image
                            src="/images/logo.png"
                            alt="SECTOR MADNESS"
                            width={597}
                            height={418}
                            className="h-[75px] sm:h-[90px] md:h-[100px] lg:h-[110px] w-auto object-contain brightness-0"
                            priority
                          />
                        </Link>
                      </div>

                      {/* Right: Spacer to balance Close button */}
                      <div style={{ marginRight: isDesktop ? 0 : "clamp(20px, 6vw, 48px)", width: "38px" }} />
                    </div>
                  </div>
                </div>

                {/* Main Body Content */}
                <div
                  className="flex-1 flex flex-col max-w-[1480px] w-full mx-auto overflow-y-auto"
                  style={{
                    paddingLeft: "clamp(28px, 8vw, 72px)",
                    paddingRight: "clamp(28px, 8vw, 72px)",
                    paddingTop: "28px",
                    paddingBottom: "clamp(28px, 5vh, 44px)",
                  }}
                >
                  {/* Top: Primary Nav Links with Interactive SHOP Dropdown */}
                  <div className="flex flex-col">
                    {navLinks.map((link) => {
                      if (link.hasDropdown) {
                        return (
                          <div key={link.label} className="border-b border-[#F0F0F0]">
                            <button
                              type="button"
                              onClick={() => setIsMobileShopOpen((prev) => !prev)}
                              className="w-full flex items-center justify-between group cursor-pointer text-left"
                              style={{ paddingTop: '18px', paddingBottom: '18px' }}
                            >
                              <span className="text-[13px] sm:text-[15px] tracking-[0.15em] uppercase font-semibold text-[#0A0A0A] group-hover:text-[#666666] transition-colors">
                                {link.label}
                              </span>
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`text-[#0A0A0A] flex-shrink-0 transition-transform duration-300 ${
                                  isMobileShopOpen ? "rotate-90" : ""
                                }`}
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>

                            {/* Dropdown Content */}
                            <AnimatePresence>
                              {isMobileShopOpen && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25, ease: "easeInOut" }}
                                  className="overflow-hidden bg-[#FAFAFA]"
                                >
                                  <div className="py-5 px-1 border-t border-[#F0F0F0] grid grid-cols-2 gap-4">
                                    {/* Left Column: PRODUCTS */}
                                    <div className="flex flex-col">
                                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#888888] mb-4">
                                        PRODUCTS
                                      </p>
                                      <div className="flex flex-col gap-2.5">
                                        {dynamicCategories.map((cat) => (
                                          <Link
                                            key={cat.label}
                                            href={`/shop?category=${encodeURIComponent(cat.filter)}`}
                                            onClick={() => {
                                              setMobileOpen(false);
                                              setIsMobileShopOpen(false);
                                            }}
                                            className="text-[11px] sm:text-[12px] tracking-[0.12em] uppercase font-medium text-[#333333] hover:text-[#0A0A0A] transition-colors py-0.5 block leading-snug"
                                          >
                                            {cat.label}
                                          </Link>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Right Column: FOCUS ON */}
                                    {dynamicFocusOn.length > 0 && (
                                      <div className="flex flex-col border-l border-[#F0F0F0] pl-3 sm:pl-4">
                                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#888888] mb-4">
                                          FOCUS ON
                                        </p>
                                        <div className="flex flex-col gap-2.5">
                                          {dynamicFocusOn.map((item) => (
                                            <Link
                                              key={item.label}
                                              href={`/shop?category=${encodeURIComponent(item.filter)}`}
                                              onClick={() => {
                                                setMobileOpen(false);
                                                setIsMobileShopOpen(false);
                                              }}
                                              className="text-[11px] sm:text-[12px] tracking-[0.12em] uppercase font-medium text-[#333333] hover:text-[#0A0A0A] transition-colors py-0.5 block leading-snug"
                                            >
                                              {item.label}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between group border-b border-[#F0F0F0]"
                          style={{ paddingTop: '18px', paddingBottom: '18px' }}
                        >
                          <span className="text-[13px] sm:text-[15px] tracking-[0.15em] uppercase font-semibold text-[#0A0A0A] group-hover:text-[#666666] transition-colors">
                            {link.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Spacer — large empty middle area like reference image */}
                  <div className="flex-1" />

                  {/* Bottom section: Account/Customer Support above Instagram */}
                  <div>
                    {/* Separator + secondary links */}
                    <div
                      className="border-t border-[#E0E0E0] flex flex-col"
                      style={{ paddingTop: '24px', paddingBottom: '32px', gap: '24px' }}
                    >
                      <Link
                        href={isLoggedIn ? (isAdmin ? "/admin" : "/dashboard") : "/login"}
                        onClick={() => setMobileOpen(false)}
                        className="text-[11px] sm:text-[12px] tracking-[0.18em] uppercase text-[#0A0A0A] font-medium hover:opacity-60 transition-opacity w-fit"
                      >
                        {isLoggedIn ? (isAdmin ? "ADMIN PANEL" : "ACCOUNT") : "LOG IN"}
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setMobileOpen(false)}
                        className="text-[11px] sm:text-[12px] tracking-[0.18em] uppercase text-[#0A0A0A] font-medium hover:opacity-60 transition-opacity w-fit"
                      >
                        CUSTOMER SUPPORT
                      </Link>
                    </div>

                    {/* Footer bottom line — no icon */}
                    <div className="border-t border-[#E0E0E0]" />
                  </div>
                </div>

              </motion.div>
            )}

            {/* ── STONE ISLAND STYLE FULLSCREEN SEARCH OVERLAY ── */}
            {isSearchOpen && (
              <motion.div
                key="search-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  width: "100%",
                  height: "100vh",
                  zIndex: 99999,
                  backgroundColor: "#FFFFFF",
                  color: "#0A0A0A",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                className="pointer-events-auto"
              >
                {/* Top Header — mirror exact navbar header (same height, logo size, and margins) */}
                <div className="w-full border-b border-[#E5E5E5]/40">
                  <div className="max-w-[1480px] mx-auto lg:px-20">
                    <div className="relative flex justify-between items-center h-[76px] sm:h-[92px] lg:h-[116px]">
                      {/* Left: Close Button on Mobile / Placeholder on Desktop */}
                      <div className="flex items-center justify-start z-10 lg:pl-[50px]">
                        <button
                          onClick={() => setIsSearchOpen(false)}
                          style={{ marginLeft: isDesktop ? 0 : "clamp(20px, 6vw, 48px)" }}
                          className="cursor-pointer hover:opacity-60 transition-opacity flex items-center justify-center text-[#0A0A0A] lg:hidden"
                          aria-label="Close search"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>

                      {/* Center Logo — exact same as navbar */}
                      <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 lg:-translate-x-[calc(50%-14px)] pointer-events-none z-20 flex items-center justify-center">
                        <Link
                          href="/"
                          onClick={() => setIsSearchOpen(false)}
                          className="relative z-50 cursor-pointer flex items-center justify-center pointer-events-auto"
                        >
                          <Image
                            src="/images/logo.png"
                            alt="SECTOR MADNESS"
                            width={597}
                            height={418}
                            className="h-[75px] sm:h-[90px] md:h-[100px] lg:h-[110px] w-auto object-contain brightness-0 transition-all duration-300"
                            priority
                          />
                        </Link>
                      </div>

                      {/* Right: Close button on Desktop / Spacer on Mobile */}
                      <div className="flex items-center gap-4 justify-end z-10 lg:pr-[50px]">
                        <button
                          onClick={() => setIsSearchOpen(false)}
                          style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 700 }}
                          className="hidden lg:flex cursor-pointer hover:opacity-60 transition-opacity items-center gap-2 text-[#0A0A0A] uppercase"
                          aria-label="Close search"
                        >
                          <span>CLOSE</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                        <div style={{ marginRight: isDesktop ? 0 : "clamp(20px, 6vw, 48px)", width: "20px" }} className="lg:hidden" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Search Body */}
                <div className="w-full flex-1 flex flex-col max-w-[1480px] mx-auto">
                  <div
                    style={{
                      paddingLeft: isDesktop ? "60px" : "clamp(28px, 8vw, 72px)",
                      paddingRight: isDesktop ? "60px" : "clamp(28px, 8vw, 72px)",
                      paddingTop: "32px",
                      paddingBottom: "64px",
                    }}
                    className="w-full flex-1 flex flex-col"
                  >
                    {/* Search Input Box with generous breathing space beneath */}
                    <div style={{ marginBottom: "60px" }}>
                      <p style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 700, marginBottom: "12px" }} className="uppercase text-[#0A0A0A]">
                        SEARCH
                      </p>
                      <div className="relative border-b-2 border-[#0A0A0A]">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Type to search"
                          style={{ fontSize: "24px", paddingBottom: "14px" }}
                          className="w-full bg-transparent tracking-normal text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none font-medium"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: 700 }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 uppercase text-[#666666] hover:text-[#0A0A0A] cursor-pointer transition-colors"
                          >
                            CLEAR
                          </button>
                        )}
                      </div>

                      {/* Quick Service Links removed from top */}
                    </div>

                    {/* Suggestions & Results Layout with guaranteed vertical whitespace */}
                    <div style={{ marginTop: "30px" }} className="grid grid-cols-1 md:grid-cols-12 gap-12 flex-1 items-start">
                      {/* Left Column: SUGGESTIONS */}
                      <div className="md:col-span-3">
                        <h4 style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 700, marginBottom: "28px" }} className="uppercase text-[#0A0A0A]">
                          SUGGESTIONS
                        </h4>
                        <ul className="flex flex-col gap-[20px]">
                          {[
                            { name: "COATS & JACKETS", filter: "JACKETS" },
                            { name: "HOODIES", filter: "HOODIE" },
                            { name: "SWEATSHIRTS", filter: "SWEATS" },
                            { name: "TROUSERS & CARGOS", filter: "CARGO" },
                            { name: "ALL PRODUCTS", filter: "ALL" },
                          ].map((item) => (
                            <li key={item.name}>
                              <Link
                                href={`/shop?category=${encodeURIComponent(item.filter)}`}
                                onClick={() => setIsSearchOpen(false)}
                                style={{ fontSize: "14px", letterSpacing: "0.15em", fontWeight: 600 }}
                                className="uppercase text-[#555555] hover:text-[#0A0A0A] transition-colors inline-block cursor-pointer"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right Column: PREVIEWS OR LIVE SEARCH RESULTS */}
                      <div className="md:col-span-9">
                        {!searchQuery.trim() ? (
                          /* Default Recommendations (Clean Stone Island Reference Style) */
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                            {activeProducts.slice(0, 3).map((prod: any, idx: number) => (
                              <Link
                                key={prod.id}
                                href={`/product/${prod.slug}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="group cursor-pointer block"
                              >
                                {/* Clean image container without disturbing box borders */}
                                <div className="relative aspect-[4/5] w-full bg-[#F5F5F5] overflow-hidden mb-5 flex items-center justify-center">
                                  <Image
                                    src={getImageUrl(prod.image)}
                                    alt={prod.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    sizes="(max-w-768px) 100vw, 33vw"
                                  />
                                </div>
                                <h5 style={{ fontSize: "14px", letterSpacing: "0.15em", fontWeight: 700 }} className="uppercase text-[#0A0A0A] group-hover:underline mb-1">
                                  {prod.name}
                                </h5>
                                <p style={{ fontSize: "12px", letterSpacing: "0.1em" }} className="text-[#666666] uppercase">
                                  EXPLORE ITEM →
                                </p>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          /* Live Search Results Grid */
                          <div>
                            <p style={{ fontSize: "12px", letterSpacing: "0.15em", fontWeight: 600 }} className="uppercase text-[#666666] mb-8">
                              FOUND {searchResults.length} RESULT{searchResults.length !== 1 ? "S" : ""} FOR &ldquo;{searchQuery.toUpperCase()}&rdquo;
                            </p>
                            {searchResults.length === 0 ? (
                              <div style={{ padding: "80px 0" }} className="text-center border-t border-b border-[#EEEEEE]">
                                <p style={{ fontSize: "14px", letterSpacing: "0.15em" }} className="uppercase text-[#666666]">
                                  No matching items found.
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                {searchResults.map((prod) => (
                                  <Link
                                    key={prod.id}
                                    href={`/product/${prod.slug}`}
                                    onClick={() => setIsSearchOpen(false)}
                                    className="group block cursor-pointer"
                                  >
                                    <div className="relative aspect-[4/5] w-full bg-[#F5F5F5] overflow-hidden mb-4 flex items-center justify-center">
                                      <Image
                                        src={getImageUrl(prod.image)}
                                        alt={prod.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-w-768px) 100vw, 33vw"
                                      />
                                    </div>
                                    <h5 style={{ fontSize: "13px", letterSpacing: "0.15em", fontWeight: 700 }} className="uppercase text-[#0A0A0A] group-hover:underline">
                                      {prod.name}
                                    </h5>
                                    <p style={{ fontSize: "13px", letterSpacing: "0.05em", marginTop: "4px", color: "#555555" }}>
                                      Rp {(prod.price < 1000 ? prod.price * 1000 : prod.price).toLocaleString("id-ID")}
                                    </p>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Bar */}
                <div className="w-full border-t border-[#E5E5E5] bg-[#FFFFFF]">
                  <div className="max-w-[1480px] mx-auto py-5">
                    <div
                      className="flex flex-nowrap items-center justify-start overflow-x-auto"
                      style={{
                        paddingLeft: isDesktop ? "60px" : "clamp(28px, 8vw, 72px)",
                        paddingRight: isDesktop ? "60px" : "clamp(28px, 8vw, 72px)",
                        gap: isDesktop ? "48px" : "clamp(16px, 4vw, 36px)",
                      }}
                    >
                      {[
                        { name: "SHOP", href: "/shop" },
                        { name: "SIZE GUIDE", href: "/size-guide" },
                        { name: "CONTACT US", href: "/contact" },
                        { name: "SHIPPING", href: "/shipping" },
                        { name: "FAQ", href: "/faq" },
                      ].map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsSearchOpen(false)}
                          style={{
                            fontSize: isDesktop ? "12px" : "10px",
                            letterSpacing: "0.15em",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                          className="uppercase text-[#0A0A0A] hover:opacity-60 transition-opacity cursor-pointer flex-shrink-0"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

