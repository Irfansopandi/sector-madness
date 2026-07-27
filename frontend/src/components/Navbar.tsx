"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Container from "./Container";

const navLinks = [
  { label: "Collection", href: "#collection" },
  { label: "Archive", href: "#campaign" },
  { label: "Story", href: "#story" },
  { label: "Journal", href: "#journal" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out pointer-events-none ${
          scrolled
            ? "bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#222222]/50"
            : "bg-transparent"
        }`}
      >
        {/* Same exact container wrapper as Footer (max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20) */}
        <div className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20 pointer-events-auto">
          <div className="flex items-center justify-between h-22 md:h-26">
            {/* Official Transparent Logo Image - Same exact 60px left padding offset as Footer */}
            <div className="flex-1 flex items-center" style={{ paddingLeft: "60px" }}>
              <Link
                href="/"
                className="relative z-50 cursor-pointer flex items-center"
                onClick={() => setMobileOpen(false)}
              >
                <Image
                  src="/images/logo.png"
                  alt="SECTOR MADNESS"
                  width={320}
                  height={90}
                  className="h-12 md:h-16 lg:h-18 w-auto object-contain max-w-[240px] md:max-w-[310px]"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation - Centered horizontally */}
            <div className="hidden lg:flex items-center justify-center gap-10 flex-1 text-center">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors duration-300 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Actions - Comfortable right alignment inside Container */}
            <div className="flex items-center justify-end gap-6 flex-1">
              {/* Search */}
              <button
                className="hidden md:block cursor-pointer group"
                aria-label="Search"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[#8A8A8A] group-hover:text-[#F5F5F5] transition-colors duration-300"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>

              {/* Account */}
              <button
                className="hidden md:block cursor-pointer group"
                aria-label="Account"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[#8A8A8A] group-hover:text-[#F5F5F5] transition-colors duration-300"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {/* Bag */}
              <button
                className="cursor-pointer group relative"
                aria-label="Bag"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-[#8A8A8A] group-hover:text-[#F5F5F5] transition-colors duration-300"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#F5F5F5] text-[#0A0A0A] text-[8px] font-medium rounded-full flex items-center justify-center">
                  0
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden cursor-pointer relative z-50 w-6 h-6 flex flex-col justify-center items-center gap-[5px]"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                <span
                  className={`block w-5 h-[1px] bg-[#F5F5F5] transition-all duration-300 ${
                    mobileOpen ? "rotate-45 translate-y-[3px]" : ""
                  }`}
                />
                <span
                  className={`block w-5 h-[1px] bg-[#F5F5F5] transition-all duration-300 ${
                    mobileOpen ? "-rotate-45 -translate-y-[3px]" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

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
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
                  onClick={() => setMobileOpen(false)}
                  className="text-[13px] tracking-[0.3em] uppercase text-[#F5F5F5] hover:text-[#B6A47E] transition-colors duration-300 cursor-pointer"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="w-8 h-[1px] bg-[#222222] my-4" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center gap-8"
              >
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8A] cursor-pointer hover:text-[#F5F5F5] transition-colors duration-300">
                  Search
                </span>
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#8A8A8A] cursor-pointer hover:text-[#F5F5F5] transition-colors duration-300">
                  Account
                </span>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
