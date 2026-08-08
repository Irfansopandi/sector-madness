"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getContactSettings } from "@/utils/api";

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<{ name: string; url: string }[]>([
    { name: "Instagram", url: "https://www.instagram.com/sectormadness.id?igsh=dWRjeGR4M3l3ZWw5" },
  ]);

  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  useEffect(() => {
    async function loadSocial() {
      const data = await getContactSettings();
      if (data && data.length > 0) {
        const socials = data
          .filter((item) => item.type === "social" || item.subtitle?.toLowerCase().includes("social") || item.title.toLowerCase().includes("archive"))
          .map((item) => ({
            name: item.value || item.title,
            url: item.link || "#",
          }));
        if (socials.length > 0) {
          setSocialLinks(socials);
        }
      }
    }
    loadSocial();
  }, []);

  const aboutLinks = [
    { label: "New Arrivals", href: "/shop?category=NEW+ARRIVALS" },
    { label: "Outerwear", href: "/shop?category=OUTERWEAR" },
    { label: "T-Shirt", href: "/shop?category=T-SHIRT" },
    { label: "Bottoms", href: "/shop?category=BOTTOMS" },
    { label: "Accessories", href: "/shop?category=ACCESSORIES" },
    { label: "Stories", href: "/brand" },
    { label: "Journal", href: "/journal" },
  ];

  const legalLinks = [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ];

  const customerLinks = [
    { label: "Shipping", href: "/shipping" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="w-full bg-[#0A0A0A] text-[#F5F5F5] mt-12 md:mt-16 lg:mt-20 pb-12 md:pb-16 border-t border-[#222222]/80">
      
      {/* ── 1. DESKTOP / LAPTOP FOOTER (100% UNCHANGED ORIGINAL LAYOUT) ── */}
      <div className="hidden lg:block">
        {/* Upper Content Container - Infallible explicit style padding for generous top & bottom boundaries */}
        <div 
          style={{ 
            paddingLeft: "clamp(50px, 7vw, 120px)", 
            paddingRight: "clamp(50px, 7vw, 120px)",
            paddingTop: "clamp(38px, 4.5vw, 60px)",
            paddingBottom: "clamp(24px, 2.5vw, 36px)"
          }} 
          className="w-full"
        >
          {/* Upper Navigation & Manifesto Area */}
          <div className="flex flex-row justify-between gap-16 lg:gap-24 xl:gap-36">
            
            {/* LEFT SECTION: Brand Manifesto */}
            <div className="lg:w-[380px] xl:w-[440px] flex flex-col justify-between shrink-0">
              <div>
                <h3 
                  translate="no" 
                  className="font-[family-name:var(--font-display)] text-[26px] md:text-[30px] lg:text-[34px] font-normal tracking-[0.06em] uppercase text-[#F5F5F5] mb-8"
                >
                  SECTOR MADNESS
                </h3>
                <div className="text-[13px] md:text-[14px] font-[family-name:var(--font-body)] text-[#8A8A8A] font-light leading-[2.1] tracking-[0.04em] space-y-4 mb-12">
                  <p className="text-[#F5F5F5]/90 font-normal">
                    WE TRUST QUALITY
                  </p>
                  <p>
                    CREATED FOR THOSE WHO DEFINE THEIR OWN DIRECTION.
                  </p>
                  <p className="text-[#B6A47E] text-[11px] md:text-[12px] tracking-[0.22em] font-medium pt-3">
                    EST. 2024
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/brand"
                  className="group inline-flex items-center text-[11px] md:text-[12px] tracking-[0.25em] uppercase font-[family-name:var(--font-body)] font-medium text-[#F5F5F5] opacity-90 hover:opacity-100 hover:text-[#B6A47E] transition-all duration-300 ease-out"
                >
                  <span className="relative pb-1.5 border-b border-[#F5F5F5]/30 group-hover:border-[#B6A47E] group-hover:translate-x-1 transition-all duration-300 ease-out inline-block">
                    DISCOVER OUR STORY
                  </span>
                  <span className="ml-4 transition-transform duration-300 ease-out group-hover:translate-x-2">
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* RIGHT SECTION: Three Columns Navigation */}
            <div className="grid grid-cols-3 gap-12 sm:gap-14 lg:gap-16 xl:gap-24 flex-1 max-w-full pt-1">
              
              {/* COLUMN 1: Collections */}
              <div>
                <h4 className="font-[family-name:var(--font-display)] text-[13px] md:text-[14px] tracking-[0.2em] uppercase font-medium text-[#F5F5F5] mb-8 md:mb-10">
                  COLLECTIONS
                </h4>
                <ul className="space-y-4 md:space-y-5">
                  {[
                    { label: "New Arrivals", href: "/shop?category=NEW+ARRIVALS" },
                    { label: "Outerwear", href: "/shop?category=OUTERWEAR" },
                    { label: "T-Shirt", href: "/shop?category=T-SHIRT" },
                    { label: "Bottoms", href: "/shop?category=BOTTOMS" },
                    { label: "Accessories", href: "/shop?category=ACCESSORIES" },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-[13px] md:text-[14px] font-[family-name:var(--font-body)] font-light text-[#8A8A8A] hover:text-[#F5F5F5] hover:translate-x-[4px] transition-all duration-300 ease-out inline-block leading-[1.6]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* COLUMN 2: Customer */}
              <div>
                <h4 className="font-[family-name:var(--font-display)] text-[13px] md:text-[14px] tracking-[0.2em] uppercase font-medium text-[#F5F5F5] mb-8 md:mb-10">
                  CUSTOMER
                </h4>
                <ul className="space-y-4 md:space-y-5">
                  {[
                    { label: "Shipping", href: "/shipping" },
                    { label: "Size Guide", href: "/size-guide" },
                    { label: "FAQ", href: "/faq" },
                    { label: "Contact", href: "/contact" },
                  ].map((item) => (
                    <li key={item.label}>
                      {item.href.startsWith("/") ? (
                        <Link
                          href={item.href}
                          className="text-[13px] md:text-[14px] font-[family-name:var(--font-body)] font-light text-[#8A8A8A] hover:text-[#F5F5F5] hover:translate-x-[4px] transition-all duration-300 ease-out inline-block leading-[1.6]"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          target={item.href.startsWith("http") ? "_blank" : undefined}
                          rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="text-[13px] md:text-[14px] font-[family-name:var(--font-body)] font-light text-[#8A8A8A] hover:text-[#F5F5F5] hover:translate-x-[4px] transition-all duration-300 ease-out inline-block leading-[1.6]"
                        >
                          {item.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* COLUMN 3: Company */}
              <div>
                <h4 className="font-[family-name:var(--font-display)] text-[13px] md:text-[14px] tracking-[0.2em] uppercase font-medium text-[#F5F5F5] mb-8 md:mb-10">
                  COMPANY
                </h4>
                <ul className="space-y-4 md:space-y-5">
                  {[
                    { label: "Stories", href: "/brand" },
                    { label: "Journal", href: "/journal" },
                    { label: "Terms & Conditions", href: "/terms" },
                    { label: "Privacy Policy", href: "/privacy" },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-[13px] md:text-[14px] font-[family-name:var(--font-body)] font-light text-[#8A8A8A] hover:text-[#F5F5F5] hover:translate-x-[4px] transition-all duration-300 ease-out inline-block leading-[1.6]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </div>

        {/* Thin Horizontal Divider */}
        <div className="w-full h-[1px] bg-[#222222]/70 mb-10 md:mb-14" />

        {/* Bottom Copyright and Socials Section */}
        <div 
          style={{ paddingLeft: "clamp(50px, 7vw, 120px)", paddingRight: "clamp(50px, 7vw, 120px)" }} 
          className="w-full"
        >
          <div className="flex flex-row items-center justify-between gap-8 text-[11px] md:text-[12px] font-[family-name:var(--font-body)] text-[#8A8A8A] tracking-[0.08em]">
            <div className="flex flex-wrap items-center gap-4 leading-relaxed">
              <span className="text-[#F5F5F5] font-normal inline" translate="no">
                © 2026 SECTOR MADNESS.
              </span>
              <span className="inline text-[#333333]">//</span>
              <span className="inline">
                ALL RIGHTS RESERVED.
              </span>
              <span className="inline text-[#333333]">//</span>
              <span className="text-[#B6A47E]/90 font-light inline">
                Crafted in Karawang, Indonesia.
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-8 md:gap-10 shrink-0">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uppercase tracking-[0.22em] font-medium text-[#F5F5F5] opacity-85 hover:opacity-100 hover:text-[#B6A47E] transition-colors duration-300 ease-out inline-block"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. MOBILE & TABLET FOOTER (STRUCTURE FROM REFERENCE, TEXT & MENUS FROM DESKTOP) ── */}
      <div className="block lg:hidden">
        <div
          style={{
            paddingLeft: "clamp(28px, 6vw, 60px)",
            paddingRight: "clamp(28px, 6vw, 60px)",
            paddingTop: "48px",
            paddingBottom: "40px",
          }}
          className="w-full"
        >
          {/* Brand Manifesto Section with generous bottom spacing matching reference */}
          <div style={{ paddingBottom: "56px", marginBottom: "20px" }} className="border-b border-[#222222]">
            <h3 
              translate="no" 
              className="font-[family-name:var(--font-display)] text-[22px] sm:text-[26px] font-normal tracking-[0.06em] uppercase text-[#F5F5F5] mb-4"
            >
              SECTOR MADNESS
            </h3>
            <div className="text-[12px] sm:text-[13px] font-[family-name:var(--font-body)] text-[#8A8A8A] font-light leading-[1.9] tracking-[0.04em] space-y-2 mb-8">
              <p className="text-[#F5F5F5]/90 font-normal">
                WE TRUST QUALITY
              </p>
              <p>
                CREATED FOR THOSE WHO DEFINE THEIR OWN DIRECTION.
              </p>
              <p className="text-[#B6A47E] text-[11px] tracking-[0.2em] font-medium pt-2">
                EST. 2024
              </p>
            </div>
            <Link
              href="/brand"
              className="group inline-flex items-center text-[11px] tracking-[0.25em] uppercase font-[family-name:var(--font-body)] font-medium text-[#F5F5F5] opacity-90 hover:opacity-100 hover:text-[#B6A47E] transition-all duration-300 ease-out"
            >
              <span className="relative pb-1 border-b border-[#F5F5F5]/30 group-hover:border-[#B6A47E] inline-block">
                DISCOVER OUR STORY
              </span>
              <span className="ml-3 transition-transform duration-300 ease-out group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* Accordion Menu Sections with wider vertical spacing matching reference */}
          <div className="py-2">
            {/* COLLECTIONS */}
            <div className="border-b border-[#222222]">
              <button
                onClick={() => toggleSection("collections")}
                style={{ paddingTop: "28px", paddingBottom: "28px" }}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <span className="font-[family-name:var(--font-display)] text-[13px] font-medium tracking-[0.2em] uppercase text-[#F5F5F5]">
                  COLLECTIONS
                </span>
                <span className="text-[20px] text-[#F5F5F5] font-light">
                  {openSection === "collections" ? "−" : "+"}
                </span>
              </button>
              {openSection === "collections" && (
                <div className="pt-1 pb-8 pl-1 flex flex-col space-y-4">
                  {[
                    { label: "New Arrivals", href: "/shop?category=NEW+ARRIVALS" },
                    { label: "Outerwear", href: "/shop?category=OUTERWEAR" },
                    { label: "T-Shirt", href: "/shop?category=T-SHIRT" },
                    { label: "Bottoms", href: "/shop?category=BOTTOMS" },
                    { label: "Accessories", href: "/shop?category=ACCESSORIES" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-[13px] font-[family-name:var(--font-body)] font-light text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors leading-[1.6]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* CUSTOMER */}
            <div className="border-b border-[#222222]">
              <button
                onClick={() => toggleSection("customer")}
                style={{ paddingTop: "28px", paddingBottom: "28px" }}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <span className="font-[family-name:var(--font-display)] text-[13px] font-medium tracking-[0.2em] uppercase text-[#F5F5F5]">
                  CUSTOMER
                </span>
                <span className="text-[20px] text-[#F5F5F5] font-light">
                  {openSection === "customer" ? "−" : "+"}
                </span>
              </button>
              {openSection === "customer" && (
                <div className="pt-1 pb-8 pl-1 flex flex-col space-y-4">
                  {[
                    { label: "Shipping", href: "/shipping" },
                    { label: "Size Guide", href: "/size-guide" },
                    { label: "FAQ", href: "/faq" },
                    { label: "Contact", href: "/contact" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-[13px] font-[family-name:var(--font-body)] font-light text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors leading-[1.6]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* COMPANY */}
            <div className="border-b border-[#222222]">
              <button
                onClick={() => toggleSection("company")}
                style={{ paddingTop: "28px", paddingBottom: "28px" }}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <span className="font-[family-name:var(--font-display)] text-[13px] font-medium tracking-[0.2em] uppercase text-[#F5F5F5]">
                  COMPANY
                </span>
                <span className="text-[20px] text-[#F5F5F5] font-light">
                  {openSection === "company" ? "−" : "+"}
                </span>
              </button>
              {openSection === "company" && (
                <div className="pt-1 pb-8 pl-1 flex flex-col space-y-4">
                  {[
                    { label: "Stories", href: "/brand" },
                    { label: "Journal", href: "/journal" },
                    { label: "Terms & Conditions", href: "/terms" },
                    { label: "Privacy Policy", href: "/privacy" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="text-[13px] font-[family-name:var(--font-body)] font-light text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors leading-[1.6]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Copyright & Socials */}
          <div className="pt-12 flex flex-col gap-6 text-[11px] font-[family-name:var(--font-body)] text-[#8A8A8A] tracking-[0.08em]">
            <div className="space-y-2 leading-relaxed">
              <span className="text-[#F5F5F5] font-normal block" translate="no">
                © 2026 SECTOR MADNESS. ALL RIGHTS RESERVED.
              </span>
              <span className="text-[#B6A47E]/90 font-light block pt-1">
                Crafted in Karawang, Indonesia.
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-8 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uppercase tracking-[0.22em] font-medium text-[#F5F5F5] opacity-85 hover:opacity-100 hover:text-[#B6A47E] transition-colors duration-300 ease-out inline-block"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
