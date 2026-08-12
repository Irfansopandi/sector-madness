"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getContactSettings, formatWhatsAppUrl } from "@/utils/api";

export default function ShippingPage() {
  const [waLink, setWaLink] = useState<string>("https://wa.me/6285946653103?text=Halo%20SECTOR%20MADNESS%2C%20saya%20ingin%20bertanya%20mengenai%20pengiriman%20pesanan%20saya.");

  useEffect(() => {
    async function fetchContact() {
      const contacts = await getContactSettings();
      const whatsapp = contacts.find(
        (c) => c.code === "02" || c.title.toLowerCase().includes("messaging") || c.title.toLowerCase().includes("whatsapp") || c.title.toLowerCase().includes("phone")
      );
      if (whatsapp) {
        setWaLink(formatWhatsAppUrl(whatsapp.value, "Halo SECTOR MADNESS, saya ingin bertanya mengenai pengiriman pesanan saya."));
      }
    }
    fetchContact();
  }, []);
  const steps = [
    {
      id: "placed",
      title: "ORDER PLACED",
      icon: (
        <svg
          className="w-6 h-6 text-[#B6A47E]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
      ),
    },
    {
      id: "payment",
      title: "PAYMENT CONFIRMED",
      icon: (
        <svg
          className="w-6 h-6 text-[#B6A47E]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: "processing",
      title: "ORDER PROCESSING",
      icon: (
        <svg
          className="w-6 h-6 text-[#B6A47E]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      id: "shipped",
      title: "SHIPPED",
      icon: (
        <svg
          className="w-6 h-6 text-[#B6A47E]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      id: "delivered",
      title: "DELIVERED",
      icon: (
        <svg
          className="w-6 h-6 text-[#B6A47E]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
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

      {/* ── 01. PAGE INTRO ── */}
      <section
        style={{
          paddingTop: "clamp(120px, 8.5vw, 144px)",
          paddingBottom: "clamp(32px, 3.5vw, 44px)",
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
            className="flex flex-col items-start max-w-3xl"
          >
            <span
              style={{ fontSize: "11px", letterSpacing: "0.28em" }}
              className="font-semibold uppercase text-[#8A8A8A] block mb-3"
            >
              CUSTOMER CARE
            </span>

            <h1
              style={{
                fontSize: "clamp(3.5rem, 8.5vw, 8rem)",
                lineHeight: "0.95",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className="uppercase text-[#FFFFFF] tracking-tighter mb-4"
            >
              SHIPPING
            </h1>

            <p
              style={{ fontSize: "clamp(1.05rem, 2vw, 1.35rem)", fontWeight: 300 }}
              className="text-[#999999] leading-relaxed"
            >
              Information about delivery services and order shipment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CAMPAIGN GALLERY STYLE 50/50 SPLIT SECTIONS ── */}
      <div className="w-full bg-[#0A0A0A]">
        {/* ROW 1: Section 01 SHIPPING INFORMATION (Text 50% | Image 50%) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 border-b border-[#222222]">
          {/* Left Text Banner */}
          <div
            style={{
              paddingLeft: "clamp(32px, 6vw, 80px)",
              paddingRight: "clamp(32px, 6vw, 80px)",
              paddingTop: "clamp(52px, 6vw, 80px)",
              paddingBottom: "clamp(52px, 6vw, 80px)",
            }}
            className="flex flex-col justify-center bg-[#0A0A0A] w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B6A47E] font-semibold block mb-4">
                01 / ORIGIN
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                  lineHeight: "1.1",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
                className="text-[#F5F5F5] uppercase mb-5 md:mb-6"
              >
                SHIPPING INFORMATION
              </h2>
              <div className="space-y-4 max-w-md">
                <p className="text-[15px] md:text-[16px] text-[#A0A0A0] font-light leading-relaxed">
                  All SECTOR MADNESS orders are carefully inspected, packaged, and
                  dispatched directly from our central atelier in Karawang, Indonesia.
                </p>
                <p className="text-[15px] md:text-[16px] text-[#A0A0A0] font-light leading-relaxed">
                  Orders placed Monday through Friday are processed within 1 to 2
                  business days. Processing times may vary during new collection drops
                  and peak seasonal periods.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[460px] w-full bg-[#161616] overflow-hidden"
          >
            <Image
              src="/images/shiping/shiping.webp"
              alt="SECTOR MADNESS Shipping Information"
              fill
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
          </motion.div>
        </div>

        {/* ROW 2: Section 02 DELIVERY SERVICES (Image 50% | Text 50%) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 border-b border-[#222222]">
          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[460px] w-full bg-[#161616] overflow-hidden order-2 lg:order-1"
          >
            <Image
              src="/images/shiping/shiping1.webp"
              alt="SECTOR MADNESS Delivery Services"
              fill
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
          </motion.div>

          {/* Right Text Banner */}
          <div
            style={{
              paddingLeft: "clamp(32px, 6vw, 80px)",
              paddingRight: "clamp(32px, 6vw, 80px)",
              paddingTop: "clamp(52px, 6vw, 80px)",
              paddingBottom: "clamp(52px, 6vw, 80px)",
            }}
            className="flex flex-col justify-center bg-[#0A0A0A] w-full order-1 lg:order-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B6A47E] font-semibold block mb-4">
                02 / LOGISTICS
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                  lineHeight: "1.1",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
                className="text-[#F5F5F5] uppercase mb-8 md:mb-10"
              >
                DELIVERY SERVICES
              </h2>

              <div className="space-y-6 max-w-md">
                {/* JNE WITH ARROW */}
                <div className="border-b border-[#222222] pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[#B6A47E] font-sans text-lg select-none">
                      →
                    </span>
                    <h3 className="text-[#FFFFFF] text-xl font-bold tracking-wider uppercase">
                      JNE
                    </h3>
                  </div>
                  <p className="text-[14px] md:text-[15px] text-[#A0A0A0] font-light leading-relaxed pl-7">
                    Shipping via JNE. Delivery time depends on the destination.
                  </p>
                </div>

                {/* J&T WITH ARROW */}
                <div className="border-b border-[#222222] pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[#B6A47E] font-sans text-lg select-none">
                      →
                    </span>
                    <h3 className="text-[#FFFFFF] text-xl font-bold tracking-wider uppercase">
                      J&amp;T
                    </h3>
                  </div>
                  <p className="text-[14px] md:text-[15px] text-[#A0A0A0] font-light leading-relaxed pl-7">
                    Shipping via J&amp;T. Delivery time depends on the destination.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ROW 3: Section 03 SHIPPING COST (Text 50% | Image 50%) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 border-b border-[#222222]">
          {/* Left Text Banner */}
          <div
            style={{
              paddingLeft: "clamp(32px, 6vw, 80px)",
              paddingRight: "clamp(32px, 6vw, 80px)",
              paddingTop: "clamp(52px, 6vw, 80px)",
              paddingBottom: "clamp(52px, 6vw, 80px)",
            }}
            className="flex flex-col justify-center bg-[#0A0A0A] w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="text-[11px] tracking-[0.3em] uppercase text-[#B6A47E] font-semibold block mb-4">
                03 / CALCULATION
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                  lineHeight: "1.1",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
                className="text-[#F5F5F5] uppercase mb-5 md:mb-6"
              >
                SHIPPING COST
              </h2>
              <div className="space-y-3 max-w-md">
                <p className="text-[15px] md:text-[16px] text-[#A0A0A0] font-light leading-relaxed">
                  Shipping costs are calculated based on the delivery address and
                  available shipping service.
                </p>
                <p className="text-[15px] md:text-[16px] text-[#A0A0A0] font-light leading-relaxed">
                  The final shipping cost is shown at checkout.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Image */} 
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative min-h-[320px] sm:min-h-[400px] lg:min-h-[460px] w-full bg-[#161616] overflow-hidden"
          >
            <Image
              src="/images/shiping/BRAND_VALUES.webp"
              alt="SECTOR MADNESS Shipping Cost"
              fill
              className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
          </motion.div>
        </div>
      </div>

      {/* ── 04. ORDER PROCESS (IDEAL PERFECT TITLE-TO-CONTENT MARGIN) ── */}
      <section
        style={{
          paddingTop: "clamp(48px, 5.5vw, 76px)",
          paddingBottom: "clamp(48px, 5.5vw, 76px)",
        }}
        className="border-b border-[#222222] w-full bg-[#0A0A0A]"
      >
        <div
          style={{
            paddingLeft: "clamp(32px, 6vw, 80px)",
            paddingRight: "clamp(32px, 6vw, 80px)",
          }}
          className="max-w-[1500px] mx-auto w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{ marginBottom: "clamp(20px, 3vw, 30px)" }}
            className="max-w-3xl"
          >
            <span className="text-[11px] font-semibold tracking-[0.28em] text-[#B6A47E] uppercase block mb-3 md:mb-4">
              04 / WORKFLOW
            </span>

            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                lineHeight: "1.1",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
              className="text-[#FFFFFF] uppercase"
            >
              ORDER PROCESS
            </h2>
          </motion.div>

          {/* ICON STEPS WITH EQUALIZED BALANCED SPACING */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:gap-4 lg:gap-6 items-start pt-2">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="flex flex-col border-t border-[#222222]/50 md:border-t-0"
              >
                <div className="block md:hidden" style={{ height: "20px" }} />
                <div>
                  {/* Top Header: Pure Icon & Centered Arrow */}
                  <div className="flex items-center justify-between mb-4 md:mb-5 pr-2 md:pr-4">
                    {/* Pure Vector Icon */}
                    <div className="text-[#B6A47E] flex items-center justify-center">
                      {step.icon}
                    </div>

                    {/* Uniform Centered Arrow */}
                    {idx < steps.length - 1 && (
                      <span className="hidden md:inline-flex items-center text-[#B6A47E] opacity-60 ml-auto mr-auto">
                        <svg
                          className="w-7 h-4"
                          viewBox="0 0 28 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0 6H26M26 6L20 1M26 6L20 11"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </div>

                  {/* Step Title with Added Clearance */}
                  <h3 className="text-[#FFFFFF] text-xs md:text-sm font-semibold tracking-[0.22em] uppercase leading-relaxed">
                    {step.title}
                  </h3>
                </div>
                <div className="block md:hidden" style={{ height: "20px" }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05. TRACKING (UP TO DELIVERY STATUS COPY) ── */}
      <section
        style={{
          paddingTop: "clamp(48px, 5.5vw, 76px)",
          paddingBottom: "clamp(48px, 5.5vw, 76px)",
        }}
        className="border-b border-[#222222] w-full bg-[#0A0A0A]"
      >
        <div
          style={{
            paddingLeft: "clamp(32px, 6vw, 80px)",
            paddingRight: "clamp(32px, 6vw, 80px)",
          }}
          className="max-w-[1500px] mx-auto w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="text-[11px] font-semibold tracking-[0.28em] text-[#B6A47E] uppercase block mb-3 md:mb-4">
              05 / FULFILLMENT
            </span>

            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                lineHeight: "1.1",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
              className="text-[#FFFFFF] uppercase mb-4 md:mb-5"
            >
              TRACKING
            </h2>

            <div className="space-y-4 max-w-2xl">
              <p
                style={{
                  fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
                  lineHeight: "1.85",
                  fontWeight: 300,
                }}
                className="text-[#A3A3A3]"
              >
                You can track the progress of your order directly on our website from payment confirmation up until final delivery.
              </p>

              <p
                style={{
                  fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
                  lineHeight: "1.85",
                  fontWeight: 300,
                }}
                className="text-[#A3A3A3]"
              >
                Real-time status updates and notifications are displayed in your account order history as your package moves through each stage of fulfillment.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 06. CONTACT CTA (DIRECT WHATSAPP LINK WITH PRE-FILLED CHAT TEMPLATE) ── */}
      <section
        style={{
          paddingTop: "clamp(56px, 6.5vw, 84px)",
          paddingBottom: "clamp(56px, 6.5vw, 84px)",
        }}
        className="w-full bg-[#0A0A0A]"
      >
        <div
          style={{
            paddingLeft: "clamp(32px, 6vw, 80px)",
            paddingRight: "clamp(32px, 6vw, 80px)",
          }}
          className="max-w-[1500px] mx-auto w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl space-y-5 md:space-y-6"
          >
            <span className="text-[11px] font-semibold tracking-[0.28em] text-[#B6A47E] uppercase block">
              INQUIRIES
            </span>

            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                lineHeight: "1.05",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
              className="text-[#FFFFFF] uppercase"
            >
              NEED HELP?
            </h2>

            <p
              style={{
                fontSize: "clamp(1.05rem, 1.7vw, 1.28rem)",
                lineHeight: "1.85",
                fontWeight: 300,
              }}
              className="text-[#A3A3A3]"
            >
              For questions about your order or delivery, get in touch with us directly via WhatsApp.
            </p>

            <div className="pt-3 md:pt-4">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center text-[12px] md:text-[13px] tracking-[0.28em] uppercase font-medium text-[#F5F5F5] opacity-90 hover:opacity-100 hover:text-[#B6A47E] transition-all duration-300 ease-out"
              >
                <span className="relative pb-2 border-b border-[#F5F5F5]/30 group-hover:border-[#B6A47E] transition-colors duration-300">
                  CONTACT US 
                </span>
                <span className="ml-4 transition-transform duration-300 ease-out group-hover:translate-x-2">
                  →
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
