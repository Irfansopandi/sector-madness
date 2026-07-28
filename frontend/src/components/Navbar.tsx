"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { products } from "@/data/products";
import { getBagItems } from "@/utils/bag";
import { getCart } from "@/utils/api";

const navLinks = [
  { label: "SHOP", href: "/shop", hasDropdown: true },
  { label: "JOURNAL", href: "/journal", hasDropdown: false },
  { label: "STORIES", href: "/brand", hasDropdown: false },
];

const productCategories = [
  { label: "> ALL PRODUCTS", filter: "ALL" },
  { label: "> ACCESSORIES", filter: "ACCESSORIES" },
  { label: "> JACKETS", filter: "JACKETS" },
  { label: "> SWEATSHIRTS", filter: "SWEATS" },
  { label: "> SHORTS & TROUSERS", filter: "TROUSERS" },
  { label: "> POLO SHIRTS", filter: "POLO SHIRT" },
  { label: "> T-SHIRT", filter: "T-SHIRT" },
  { label: "> SHIRTS", filter: "SHIRT" },
];

const focusOnItems = [
  { label: "> ZESTY", filter: "ZESTY" },
  { label: "> PRISTINE", filter: "PRISTINE" },
  { label: "> LOFTY", filter: "LOFTY" },
  { label: "> FANCY", filter: "FANCY" },
  { label: "> FROLIC", filter: "FROLIC" },
  { label: "> SECTOR MADNESS | ORIGIN", filter: "SECTOR MADNESS" },
];

interface NavbarProps {
  mode?: "dark" | "light";
  activeLink?: string;
}

export default function Navbar({ mode = "dark", activeLink }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [hoveredProductIndex, setHoveredProductIndex] = useState(0);
  const [navHidden, setNavHidden] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [bagCount, setBagCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const lastScrollY = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    retry: 1,
  });

  const actualBagCount = cartData ? cartData.total_quantity : bagCount;

  const isLightMode = mode === "light";

  useEffect(() => {
    setMounted(true);
    const checkLoginAndBag = () => {
      try {
        const userData = localStorage.getItem("sector_madness_user");
        if (userData) {
          const parsed = JSON.parse(userData);
          setIsLoggedIn(!!parsed?.loggedIn);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }

      try {
        const items = getBagItems();
        const count = items.reduce((acc, i) => acc + i.quantity, 0);
        setBagCount(count);
      } catch {
        setBagCount(0);
      }
    };
    checkLoginAndBag();
    window.addEventListener("storage", checkLoginAndBag);
    window.addEventListener("sector_auth_change", checkLoginAndBag);
    window.addEventListener("sector_bag_change", checkLoginAndBag);
    return () => {
      window.removeEventListener("storage", checkLoginAndBag);
      window.removeEventListener("sector_auth_change", checkLoginAndBag);
      window.removeEventListener("sector_bag_change", checkLoginAndBag);
    };
  }, []);

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

  // Filter products based on search query
  const searchResults = products.filter((p) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.collection.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q)
    );
  });

  const featuredShopProduct = products[hoveredProductIndex] || products[0];

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 pointer-events-auto transition-transform duration-300 ease-out ${
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
            ? "bg-[#0A0A0A]/95 backdrop-blur-sm border-[#222222]/50 text-[#F5F5F5]"
            : "bg-transparent text-[#F5F5F5] border-transparent"
        }`}
      >
        <div className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20">
          <div className="flex justify-between items-center h-[88px] md:h-[116px]">
            {/* Bagian Kiri (Menu Navigasi) - Matching Footer exact 60px inset padding */}
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-start" style={{ paddingLeft: "60px" }}>
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

            {/* Bagian Tengah (Logo) */}
            <div className="flex-1 flex items-center justify-center">
              <Link
                href="/"
                className="relative z-50 cursor-pointer flex items-center justify-center"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src="/images/logo.png"
                  alt="SECTOR MADNESS"
                  width={420}
                  height={120}
                  className={`h-[60px] md:h-[85px] lg:h-[110px] w-auto object-contain transition-all duration-300 ${
                    isLightMode || isShopHovered ? "brightness-0" : ""
                  }`}
                  priority
                />
              </Link>
            </div>

            {/* Bagian Kanan (Menu Aksi) - Matching Footer exact 60px inset padding */}
            <div className="flex items-center justify-end gap-8 flex-1" style={{ paddingRight: "60px" }}>
              {/* Search Icon */}
              <button
                onClick={() => { setIsSearchOpen(true); setSearchQuery(""); }}
                className="hidden md:block cursor-pointer group"
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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

              {/* Login / Account Link */}
              <Link
                href="/login"
                className="hidden md:block cursor-pointer group"
                aria-label={isLoggedIn ? "Account" : "Login"}
              >
                <span
                  className={`text-xs uppercase tracking-[0.15em] transition-colors duration-300 font-medium ${
                    isLightMode || isShopHovered
                      ? "text-gray-600 group-hover:text-black"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
                  {isLoggedIn ? "ACCOUNT" : "LOGIN"}
                </span>
              </Link>

              {/* Cart Icon */}
              <Link
                href="/bag"
                className="cursor-pointer group relative flex items-center gap-1.5"
                aria-label="Shopping Bag"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
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
                      style={{ fontSize: "11.5px", fontWeight: 700 }}
                      className="text-[#B6A47E] font-mono tracking-tighter block"
                    >
                      ●{actualBagCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden cursor-pointer relative z-50 w-6 h-6 flex flex-col justify-center items-center gap-[5px]"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                <span
                  className={`block w-5 h-[1px] transition-all duration-300 ${
                    isLightMode || isShopHovered ? "bg-[#0A0A0A]" : "bg-[#F5F5F5]"
                  } ${mobileOpen ? "rotate-45 translate-y-[3px]" : ""}`}
                />
                <span
                  className={`block w-5 h-[1px] transition-all duration-300 ${
                    isLightMode || isShopHovered ? "bg-[#0A0A0A]" : "bg-[#F5F5F5]"
                  } ${mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hover Dropdown Mega Menu (James Boogie Style) */}
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
              className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20 pt-8 pb-12 lg:pt-10 lg:pb-14 grid grid-cols-12 gap-8 items-start"
            >
              {/* Column 1: PRODUCTS List */}
              <div className="col-span-5 border-r border-[#EEEEEE] pr-10">
                <h4 style={{ marginBottom: "36px" }} className="font-[family-name:var(--font-display)] text-[13px] md:text-[14px] tracking-[0.2em] font-medium text-[#777777] uppercase">
                  PRODUCTS
                </h4>
                <ul className="flex flex-col gap-5">
                  {productCategories.map((cat, idx) => (
                    <li key={cat.label}>
                      <Link
                        href={`/shop?category=${encodeURIComponent(cat.filter)}`}
                        onMouseEnter={() => setHoveredProductIndex(idx % products.length)}
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
                <h4 style={{ marginBottom: "36px" }} className="font-[family-name:var(--font-display)] text-[13px] md:text-[14px] tracking-[0.2em] font-medium text-[#777777] uppercase">
                  FOCUS ON
                </h4>
                <ul className="flex flex-col gap-5">
                  {focusOnItems.map((item, idx) => (
                    <li key={item.label}>
                      <Link
                        href={`/shop?category=${encodeURIComponent(item.filter)}`}
                        onMouseEnter={() => setHoveredProductIndex((idx + 2) % products.length)}
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
                <Link
                  href={`/product/${featuredShopProduct.slug}`}
                  className="group block w-full max-w-[260px]"
                >
                  <div className="relative aspect-[3/4] w-full bg-[#F4F4F4] overflow-hidden mb-3 border border-[#E5E5E5] flex items-center justify-center p-4">
                    <Image
                      src={featuredShopProduct.image}
                      alt={featuredShopProduct.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#0A0A0A] line-clamp-1">
                      {featuredShopProduct.name}
                    </p>
                    <p className="text-[10px] tracking-[0.15em] text-[#777777] uppercase mt-0.5">
                      Rp {(featuredShopProduct.price * 15000).toLocaleString("id-ID")}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-[#0A0A0A] flex flex-col items-center justify-center lg:hidden pointer-events-auto"
          >
            <nav className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-[13px] tracking-[0.3em] uppercase text-[#F5F5F5] hover:text-[#B6A47E] transition-colors duration-300 cursor-pointer font-medium"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="w-8 h-[1px] bg-[#222222] my-4" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center gap-8"
              >
                <span
                  onClick={() => { setMobileOpen(false); setIsSearchOpen(true); setSearchQuery(""); }}
                  className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8A] cursor-pointer hover:text-[#F5F5F5] transition-colors duration-300"
                >
                  Search
                </span>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8A] cursor-pointer hover:text-[#F5F5F5] transition-colors duration-300"
                >
                  {isLoggedIn ? "Account" : "Login"}
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* ── RENDER OVERLAYS TO DOCUMENT.BODY VIA PORTAL TO PREVENT CSS TRANSFORM CLIPPING ── */}
      {mounted &&
        createPortal(
          <AnimatePresence>
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
                  width: "100vw",
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
                {/* Top Header: Centered Logo & Close Button (100% identical structural size and positioning as main Navbar) */}
                <div className="w-full border-b border-[#E5E5E5]/40">
                  <div className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20">
                    <div className="flex justify-between items-center h-[88px] md:h-[116px]">
                      {/* Bagian Kiri (Senada dengan padding navbar utama) */}
                      <div className="flex-1 hidden lg:flex items-center justify-start" style={{ paddingLeft: "60px" }}></div>
                      <div className="flex-1 lg:hidden flex items-center justify-start"></div>

                      {/* Bagian Tengah (Logo Presisi Sama PERSIS seperti Navbar) */}
                      <div className="flex-1 flex items-center justify-center">
                        <Link
                          href="/"
                          onClick={() => setIsSearchOpen(false)}
                          className="relative z-50 cursor-pointer flex items-center justify-center"
                        >
                          <Image
                            src="/images/logo.png"
                            alt="SECTOR MADNESS"
                            width={420}
                            height={120}
                            className="h-[60px] md:h-[85px] lg:h-[110px] w-auto object-contain brightness-0 transition-all duration-300"
                            priority
                          />
                        </Link>
                      </div>

                      {/* Bagian Kanan (Tombol Close) */}
                      <div className="flex-1 flex items-center justify-end" style={{ paddingRight: "60px" }}>
                        <button
                          onClick={() => setIsSearchOpen(false)}
                          style={{ fontSize: "12px", letterSpacing: "0.2em", fontWeight: 700 }}
                          className="cursor-pointer hover:opacity-60 transition-opacity flex items-center gap-2 text-[#0A0A0A] uppercase"
                          aria-label="Close search"
                        >
                          <span className="hidden sm:inline">CLOSE</span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Search Body */}
                <div className="w-full flex-1 flex flex-col max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20">
                  <div style={{ paddingLeft: "60px", paddingRight: "60px", paddingTop: "32px", paddingBottom: "64px" }} className="w-full flex-1 flex flex-col">
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
                            {products.slice(0, 3).map((prod, idx) => (
                              <Link
                                key={prod.id}
                                href={`/product/${prod.slug}`}
                                onClick={() => setIsSearchOpen(false)}
                                className="group cursor-pointer block"
                              >
                                {/* Clean image container without disturbing box borders */}
                                <div className="relative aspect-[4/5] w-full bg-[#F5F5F5] overflow-hidden mb-5 flex items-center justify-center">
                                  <Image
                                    src={prod.image}
                                    alt={prod.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                    sizes="(max-w-768px) 100vw, 33vw"
                                  />
                                </div>
                                <h5 style={{ fontSize: "14px", letterSpacing: "0.15em", fontWeight: 700 }} className="uppercase text-[#0A0A0A] group-hover:underline mb-1">
                                  {idx === 0 ? "NEW ARRIVALS" : idx === 1 ? "SECTOR MADNESS | ORIGIN" : "VENTILE® COLLECTION"}
                                </h5>
                                <p style={{ fontSize: "12px", letterSpacing: "0.1em" }} className="text-[#666666] uppercase">
                                  EXPLORE COLLECTION →
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
                                  No matching items found in the Sector Madness database.
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
                                        src={prod.image}
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
                                      Rp {(prod.price * 15000).toLocaleString("id-ID")}
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
                  <div className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20 py-6">
                    <div style={{ paddingLeft: "60px", paddingRight: "60px" }} className="flex flex-wrap items-center justify-start gap-12">
                      {["CLIENT SERVICE", "CONTACT US", "OUR SERVICES", "STORE LOCATOR"].map((service) => (
                        <Link
                          key={service}
                          href="/"
                          onClick={() => setIsSearchOpen(false)}
                          style={{ fontSize: "12px", letterSpacing: "0.18em", fontWeight: 700 }}
                          className="uppercase text-[#0A0A0A] hover:opacity-60 transition-opacity cursor-pointer"
                        >
                          {service}
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

