"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SectionItem {
  code: string;
  title: string;
  intro?: string;
  paragraphs?: string[];
  listIntro?: string;
  bullets?: string[];
  outro?: string[];
}

export default function TermsPage() {
  const sections: SectionItem[] = [
    {
      code: "01",
      title: "GENERAL PROTOCOL",
      paragraphs: [
        "SECTOR MADNESS provides this website as a digital platform for catalog discovery and online product acquisition.",
        "By accessing and utilizing this website, users are responsible for providing truthful information and operating in accordance with applicable terms and regulations.",
        "SECTOR MADNESS reserves the right to modify content, products, pricing, and terms on the website without prior notice whenever operational adjustments are required.",
      ],
    },
    {
      code: "02",
      title: "PRODUCT SPECIFICATIONS",
      paragraphs: [
        "We endeavor to present product information as accurately as possible, including photography, color fidelity, sizing parameters, material specifications, and product details.",
        "However, actual color representation may vary slightly depending on display hardware, screen resolution, and color calibration.",
        "Users are advised to thoroughly review all product information and the Size Guide prior to completing a purchase.",
        "Product availability is subject to change at any time based on available inventory stock.",
      ],
    },
    {
      code: "03",
      title: "ORDER FULFILLMENT PROTOCOL",
      listIntro: "Users are strictly responsible for ensuring all order details are correct before completing payment, including:",
      bullets: [
        "Selected product item",
        "Garment sizing",
        "Product quantity",
        "Recipient name",
        "Contact phone number",
        "Shipping delivery address",
      ],
      outro: [
        "Once an order is confirmed and processed, modifications to order information may no longer be possible.",
        "SECTOR MADNESS reserves the right to cancel an order under specific conditions such as product information errors, pricing inaccuracies, stock issues, or unprocessable conditions.",
        "If a cancellation is initiated by SECTOR MADNESS for these reasons, payment resolution will be executed according to applicable conditions and payment methods.",
      ],
    },
    {
      code: "04",
      title: "PRICING & PAYMENT",
      paragraphs: [
        "Prices listed on the website reflect current rates at the time of purchase and are subject to adjustment without prior notice.",
        "Price adjustments will not affect previously confirmed orders, except in cases of verified pricing errors or necessary corrections.",
        "Full payment confirmation is required before an order can enter logistics processing.",
        "Shipping tariffs are calculated based on destination address and courier selection, displayed clearly during checkout.",
      ],
    },
    {
      code: "05",
      title: "LOGISTICS & DISPATCH",
      paragraphs: [
        "SECTOR MADNESS provides dispatch services via available courier logistics partners, including JNE and J&T.",
        "Shipping rates and estimated transit times vary based on destination location, selected service tier, and courier operational schedules.",
        "Once an order is dispatched, tracking information or waybill numbers will be provided when available.",
        "Delays caused by courier operations, weather conditions, statutory holidays, or events beyond SECTOR MADNESS control may affect final delivery times.",
        "For additional logistics information, users are encouraged to view our Shipping Protocol page.",
      ],
    },
    {
      code: "06",
      title: "FINAL SALE POLICY",
      intro: "SECTOR MADNESS does not offer returns, item exchanges, or monetary refunds for orders that have been successfully confirmed. All purchases are final.",
      listIntro: "Before completing a purchase, users are strictly responsible for ensuring:",
      bullets: [
        "Selected product is correct",
        "Garment sizing is appropriate",
        "Product quantity is correct",
        "Recipient information is accurate",
        "Shipping address is correct",
        "Contact phone number is accurate",
      ],
      outro: [
        "Because all orders are final, users are strongly advised to double check all order details before completing payment.",
      ],
    },
    {
      code: "07",
      title: "INTELLECTUAL PROPERTY",
      listIntro: "All content available on the SECTOR MADNESS website, including but not limited to:",
      bullets: [
        "SECTOR MADNESS brand name",
        "Official logos",
        "Product photography",
        "Editorial photography",
        "Videography",
        "Visual design assets",
        "Written content & copy",
        "Graphics & diagrams",
        "Website layout & design elements",
      ],
      outro: [
        "remains the exclusive property of SECTOR MADNESS or is used under appropriate rights. Content may not be copied, modified, distributed, republished, or commercially used without explicit written authorization from SECTOR MADNESS.",
      ],
    },
    {
      code: "08",
      title: "PLATFORM USAGE & SECURITY",
      intro: "Users are permitted to use the SECTOR MADNESS website for legitimate purposes, including browsing products and completing purchases.",
      listIntro: "Users are strictly prohibited from using the website to:",
      bullets: [
        "Engage in illegal activities",
        "Attempt unauthorized access",
        "Interfere with website security or operation",
        "Harm other parties using website systems",
        "Copy or scrape website content without authorization",
      ],
      outro: [
        "SECTOR MADNESS reserves the right to restrict or terminate user access if activities violating website terms are detected.",
      ],
    },
    {
      code: "09",
      title: "PRIVACY & DATA HANDLING",
      listIntro: "SECTOR MADNESS processes information provided by users for essential operational purposes, including:",
      bullets: [
        "Account creation & management",
        "Order processing",
        "Payment verification",
        "Logistics & shipping dispatch",
        "Order related communication",
        "Customer support services",
      ],
      outro: [
        "The collection and protection of user data is further explained in our Privacy Policy. Users are encouraged to review the Privacy Policy prior to using our website services.",
      ],
    },
    {
      code: "10",
      title: "POLICY REVISIONS",
      paragraphs: [
        "SECTOR MADNESS reserves the right to update or revise these Terms & Conditions at any time to align with website, service, or operational developments.",
        "Any revisions will be updated directly on this page with the revised date displayed at the top.",
        "Users are advised to review these Terms & Conditions periodically.",
      ],
    },
  ];

  return (
    <main
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#B6A47E] selection:text-[#0A0A0A] overflow-x-hidden"
    >
      <Navbar mode="dark" />

      {/* ── PAGE HEADER INTRO ── */}
      <section
        style={{
          paddingTop: "clamp(120px, 8vw, 144px)",
          paddingBottom: "clamp(36px, 4vw, 52px)",
        }}
        className="relative border-b border-[#222222]"
      >
        <div
          style={{
            paddingLeft: "clamp(32px, 6vw, 80px)",
            paddingRight: "clamp(32px, 6vw, 80px)",
          }}
          className="max-w-[1500px] mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-start max-w-5xl"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
              <span
                style={{ fontSize: "11px", letterSpacing: "0.28em" }}
                className="font-semibold uppercase text-[#8A8A8A] block leading-snug"
              >
                LEGAL &amp; GOVERNANCE PROTOCOL
              </span>
              <span className="hidden md:inline-block text-[#333333] text-xs">//</span>
              <span className="text-xs font-mono text-[#B6A47E] whitespace-nowrap mt-1 md:mt-0">
                Last updated: August 2, 2026
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
                lineHeight: "1.15",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className="uppercase text-[#FFFFFF] tracking-tight mb-6 whitespace-normal md:whitespace-nowrap"
            >
              TERMS &amp; CONDITIONS
            </h1>

            <p
              style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)", fontWeight: 300 }}
              className="text-[#999999] leading-relaxed max-w-3xl"
            >
              By accessing and using the SECTOR MADNESS platform, you acknowledge that you have read, understood, and agreed to be bound by these Terms &amp; Conditions governing website usage, ordering, payments, and fulfillment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN TERMS CONTENT ── */}
      <section
        style={{
          paddingTop: "clamp(48px, 5.5vw, 76px)",
          paddingBottom: "clamp(64px, 7.5vw, 96px)",
          paddingLeft: "clamp(32px, 6vw, 80px)",
          paddingRight: "clamp(32px, 6vw, 80px)",
        }}
        className="max-w-[1500px] mx-auto w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-start">
          
          {/* LEFT: TERMS CLAUSES (8 COLS) */}
          <div className="lg:col-span-8 space-y-12">
            {sections.map((sec, index) => (
              <motion.div
                key={sec.code}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                style={{
                  marginTop: index > 0 ? "28px" : "0px",
                  paddingTop: index > 0 ? "28px" : "0px",
                  paddingBottom: "28px",
                }}
                className="border-b border-[#333333]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#B6A47E] uppercase block">
                    {sec.code}
                  </span>
                  <span className="text-[#333333] text-xs">//</span>
                  <h2 className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-[#FFFFFF]">
                    {sec.title}
                  </h2>
                </div>

                <div className="space-y-4 pt-1">
                  {sec.intro && (
                    <p className="text-xs md:text-sm text-[#A0A0A0] font-light leading-relaxed">
                      {sec.intro}
                    </p>
                  )}

                  {sec.paragraphs &&
                    sec.paragraphs.map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-xs md:text-sm text-[#A0A0A0] font-light leading-relaxed"
                      >
                        {paragraph}
                      </p>
                    ))}

                  {sec.listIntro && (
                    <p className="text-xs md:text-sm text-[#E0E0E0] font-medium leading-relaxed pt-1">
                      {sec.listIntro}
                    </p>
                  )}

                  {sec.bullets && (
                    <ul className="space-y-3 pl-1 my-3">
                      {sec.bullets.map((bullet, bIdx) => (
                        <li
                          key={bIdx}
                          className="flex items-center gap-3 text-xs md:text-sm text-[#C0C0C0] font-light leading-relaxed"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B6A47E] shrink-0" />
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.outro &&
                    sec.outro.map((paragraph, oIdx) => (
                      <p
                        key={oIdx}
                        className="text-xs md:text-sm text-[#A0A0A0] font-light leading-relaxed pt-1"
                      >
                        {paragraph}
                      </p>
                    ))}
                </div>
              </motion.div>
            ))}

            {/* 11 / CONTACT US CLAUSE */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                marginTop: "28px",
                paddingTop: "28px",
                paddingBottom: "28px",
              }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#B6A47E] uppercase block">
                  11
                </span>
                <span className="text-[#333333] text-xs">//</span>
                <h2 className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-[#FFFFFF]">
                  INQUIRIES &amp; CONTACT
                </h2>
              </div>

              <p className="text-xs md:text-sm text-[#A0A0A0] font-light leading-relaxed">
                Should you have any questions regarding these Terms &amp; Conditions, order status, or platform governance, please contact our support team directly.
              </p>

              <div className="pt-3">
                <Link
                  href="/contact"
                  className="group inline-flex items-center text-xs md:text-sm tracking-[0.25em] uppercase font-medium text-[#F5F5F5] opacity-90 hover:opacity-100 hover:text-[#B6A47E] transition-all duration-300 ease-out"
                >
                  <span className="relative pb-1 border-b border-[#F5F5F5]/30 group-hover:border-[#B6A47E] transition-colors duration-300">
                    CONTACT SUPPORT
                  </span>
                  <span className="ml-3 transition-transform duration-300 ease-out group-hover:translate-x-2">
                    →
                  </span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: NAVIGATION SIDEBAR (4 COLS - SPACIOUS CARD) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div
              style={{
                padding: "clamp(32px, 4vw, 48px)",
              }}
              className="bg-[#121212] border border-[#222222] flex flex-col justify-between"
            >
              <div className="space-y-6">
                <span className="text-[11px] font-semibold tracking-[0.28em] text-[#B6A47E] uppercase block mb-3">
                  GOVERNANCE SUMMARY
                </span>

                <h3
                  style={{
                    fontSize: "clamp(1.35rem, 2vw, 1.75rem)",
                    lineHeight: "1.25",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                  className="text-[#FFFFFF] uppercase mb-4"
                >
                  TRANSACTION &amp; USAGE POLICIES
                </h3>

                <p className="text-[13.5px] md:text-[14px] text-[#A0A0A0] font-light leading-[1.75]">
                  All transactions conducted on the SECTOR MADNESS platform are subject to our verified terms of fulfillment and final sale policy.
                </p>
              </div>

              {/* SPACIOUS SEPARATOR AND LINK LIST */}
              <div className="border-t border-[#222222] mt-8 pt-8 space-y-5 text-xs tracking-wider uppercase">
                <Link
                  href="/shipping"
                  className="block text-[#8A8A8A] hover:text-[#FFFFFF] hover:translate-x-1 transition-all duration-300"
                >
                  → SHIPPING PROTOCOL
                </Link>
                <Link
                  href="/size-guide"
                  className="block text-[#8A8A8A] hover:text-[#FFFFFF] hover:translate-x-1 transition-all duration-300"
                >
                  → SIZE GUIDE SPECIFICATIONS
                </Link>
                <Link
                  href="/faq"
                  className="block text-[#8A8A8A] hover:text-[#FFFFFF] hover:translate-x-1 transition-all duration-300"
                >
                  → FREQUENTLY ASKED QUESTIONS
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
