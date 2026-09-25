"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SectionItem {
  code: string;
  title: string;
  intro?: React.ReactNode;
  paragraphs?: React.ReactNode[];
  listIntro?: React.ReactNode;
  bullets?: React.ReactNode[];
  outro?: React.ReactNode[];
}

export default function TermsPage() {
  const sections: SectionItem[] = [
    {
      code: "01",
      title: "GENERAL",
      paragraphs: [
        <>By placing an order with <strong className="font-medium text-white">Sector Madness</strong>, you agree to the following Terms & Conditions. These terms apply to all purchases made through our official website and sales channels.</>,
      ],
    },
    {
      code: "02",
      title: "ORDERS",
      paragraphs: [
        "Once an order has been placed and payment has been confirmed, it is considered final.",
        "Customers are responsible for providing accurate information, including name, phone number, shipping address, size, color, and quantity.",
        "Sector Madness reserves the right to cancel an order in the event of incorrect pricing, stock issues, system errors, or other circumstances that prevent the order from being processed.",
      ],
    },
    {
      code: "03",
      title: "PRICE & PAYMENT",
      paragraphs: [
        <>All prices are listed in <strong className="font-medium text-white">Indonesian Rupiah (IDR)</strong> unless otherwise stated.</>,
        "Prices may change without prior notice.",
        "Orders must be paid within the specified payment period. Unpaid orders may be cancelled automatically.",
        "Additional costs, such as shipping fees, will be displayed or communicated before payment is completed.",
      ],
    },
    {
      code: "04",
      title: "PRE-ORDER",
      paragraphs: [
        <>Some Sector Madness products may be available through a <strong className="font-medium text-white">Pre-Order</strong> system.</>,
        "Production will begin after the Pre-Order period has ended. Estimated production and delivery times will be stated when the product is released.",
        "Production or delivery times may change due to production, material availability, or shipping circumstances.",
        "By placing a Pre-Order, customers agree to the stated production timeline and terms.",
      ],
    },
    {
      code: "05",
      title: "DELIVERY",
      paragraphs: [
        "Orders will be shipped after payment has been confirmed.",
        "Delivery times depend on the shipping provider and destination.",
        "Sector Madness is not responsible for delays caused by shipping providers, weather, holidays, or circumstances beyond our control.",
        "Customers are responsible for providing a complete and correct shipping address.",
      ],
    },
    {
      code: "06",
      title: "RETURNS & EXCHANGES",
      listIntro: "We only accept returns or exchanges for:",
      bullets: [
        "Defective products;",
        "Incorrect products;",
        "Damaged products received before use;",
        "Missing items.",
      ],
      outro: [
        <>Claims must be submitted within <strong className="font-medium text-white">3 × 24 hours of receiving the order.</strong></>,
        "Customers may be required to provide photos, videos, order details, and other information for verification.",
        "Products must be unused, unwashed, and unmodified.",
        "Size exchanges are only available when specifically stated and subject to product availability.",
        <><strong className="font-medium text-white">SALE, CLEARANCE, CUSTOM, and FINAL SALE</strong> items may not be eligible for returns or exchanges.</>,
      ],
    },
    {
      code: "07",
      title: "PRODUCT INFORMATION",
      paragraphs: [
        "Product colors may vary slightly depending on the customer's screen or device.",
        "Minor differences in measurements, printing, embroidery, washing, or finishing may occur as a result of the production process.",
        "Sector Madness reserves the right to make reasonable changes to product specifications without changing the overall design or character of the product.",
      ],
    },
    {
      code: "08",
      title: "PROMOTIONS",
      paragraphs: [
        "Promotional offers and discount codes are subject to their respective terms and validity periods.",
        "Discount codes cannot be combined unless stated otherwise.",
        "Sector Madness reserves the right to modify or end any promotion without prior notice.",
      ],
    },
    {
      code: "09",
      title: "INTELLECTUAL PROPERTY",
      paragraphs: [
        "All Sector Madness logos, designs, images, graphics, product photography, written content, packaging, and other creative materials are protected and remain the property of Sector Madness or their respective rights holders.",
        "No content may be copied, reproduced, distributed, or used commercially without prior written permission.",
      ],
    },
    {
      code: "10",
      title: "FORCE MAJEURE",
      paragraphs: [
        "Sector Madness shall not be responsible for delays or failure to fulfil an order caused by circumstances beyond our reasonable control, including natural disasters, transportation disruptions, system failures, government restrictions, or other unforeseen circumstances.",
      ],
    },
    {
      code: "11",
      title: "CHANGES TO TERMS",
      paragraphs: [
        "Sector Madness reserves the right to update or change these Terms & Conditions at any time.",
        "The latest version will apply from the date of publication.",
      ],
    },
  ];

  return (
    <main
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#FFFFFF] selection:text-[#0A0A0A] overflow-x-hidden"
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
              <span className="text-xs font-mono text-[#FFFFFF] whitespace-nowrap mt-1 md:mt-0">
                Last updated: August 2, 2026
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
                lineHeight: "1.15",
                fontWeight: 500,
                letterSpacing: "-0.03em",
                fontFamily: "'Roboto', sans-serif",
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
                  <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#FFFFFF] uppercase block">
                    {sec.code}
                  </span>
                  <span className="text-[#333333] text-xs">//</span>
                  <h2 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500 }} className="text-sm md:text-base tracking-[0.2em] uppercase text-[#FFFFFF]">
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
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] shrink-0" />
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

            {/* 12 / CONTACT US CLAUSE */}
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
                <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#FFFFFF] uppercase block">
                  12
                </span>
                <span className="text-[#333333] text-xs">//</span>
                <h2 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500 }} className="text-sm md:text-base tracking-[0.2em] uppercase text-[#FFFFFF]">
                  CONTACT
                </h2>
              </div>

              <div className="text-xs md:text-sm text-[#A0A0A0] font-light leading-relaxed space-y-4">
                <p>
                  For questions regarding orders, products, shipping, returns, or these Terms &amp; Conditions, please contact us:
                </p>
                
                <div>
                  <p className="font-bold text-[#FFFFFF]">SECTOR MADNESS</p>
                  <p>Email: sectormadnessid@gmail.com</p>
                  <p>Instagram: @sectormadness.id</p>
                </div>
                
                <div className="pt-2">
                  <p className="font-bold text-[#FFFFFF]">SECTOR MADNESS</p>
                  <p className="italic text-[#C0C0C0]">We Trust Quality.</p>
                  <p className="italic text-[#C0C0C0]">Built from Experience. Made for Every Story.</p>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/contact"
                  className="group inline-flex items-center text-xs md:text-sm tracking-[0.25em] uppercase font-medium text-[#F5F5F5] opacity-90 hover:opacity-100 hover:text-[#FFFFFF] transition-all duration-300 ease-out"
                >
                  <span className="relative pb-1 border-b border-[#F5F5F5]/30 group-hover:border-[#FFFFFF] transition-colors duration-300">
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
                <span className="text-[11px] font-semibold tracking-[0.28em] text-[#FFFFFF] uppercase block mb-3">
                  GOVERNANCE SUMMARY
                </span>

                <h3
                  style={{
                    fontSize: "clamp(1.35rem, 2vw, 1.75rem)",
                    lineHeight: "1.25",
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    fontFamily: "'Roboto', sans-serif",
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
