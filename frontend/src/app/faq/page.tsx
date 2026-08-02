"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getFaqs } from "@/utils/api";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  code: string;
  category: string;
  items: FAQItem[];
}

export default function FAQPage() {
  // Default seeded FAQ fallback items to guarantee zero empty states
  const defaultFaqData: FAQCategory[] = [
    {
      id: "general",
      code: "01",
      category: "GENERAL",
      items: [
        {
          id: "gen-1",
          question: "What is SECTOR MADNESS?",
          answer:
            "SECTOR MADNESS is an independent contemporary fashion brand based in Indonesia, crafted for individuals who define their own direction. We combine Quiet Luxury visual codes with uncompromising craftsmanship and raw streetwear attitude.",
        },
        {
          id: "gen-2",
          question: "Where is SECTOR MADNESS based?",
          answer:
            "Our central studio and fulfillment atelier are based in Karawang, West Java, Indonesia. All items are quality-inspected and dispatched directly from our headquarters.",
        },
        {
          id: "gen-3",
          question: "How can I contact Customer Support?",
          answer:
            "You can reach out directly to our dedicated support team via WhatsApp at +62 859-4665-3103 or through our official Instagram (@sectormadness.id).",
        },
      ],
    },
    {
      id: "orders",
      code: "02",
      category: "ORDERS",
      items: [
        {
          id: "ord-1",
          question: "How can I place an order?",
          answer:
            "Browse our collection online, select your size, and add the product to your bag. Proceed to checkout to enter your delivery address and complete payment.",
        },
        {
          id: "ord-2",
          question: "Can I modify or cancel my order after checkout?",
          answer:
            "Once an order is confirmed, our fulfillment team begins processing immediately. If you need to make urgent changes to your address or item size, please contact us via WhatsApp immediately after placing your order.",
        },
        {
          id: "ord-3",
          question: "How can I check my order status?",
          answer:
            "Real-time status notifications and order progression are displayed directly in your SECTOR MADNESS website account order history under your profile.",
        },
      ],
    },
    {
      id: "shipping",
      code: "03",
      category: "SHIPPING",
      items: [
        {
          id: "shp-1",
          question: "Which shipping services are available?",
          answer:
            "We partner with JNE and J&T express delivery services to ensure safe and reliable nationwide shipping across Indonesia.",
        },
        {
          id: "shp-2",
          question: "How long does shipping take?",
          answer:
            "Orders are processed within 1 to 2 business days. Estimated delivery times depend on your destination city (typically 1–3 business days for Java, 2–5 business days for outer islands).",
        },
        {
          id: "shp-3",
          question: "How can I track my order?",
          answer:
            "You can track your package progress from payment confirmation up to final delivery directly on our website inside your account dashboard, or use your tracking code on the official JNE or J&T website.",
        },
      ],
    },
    {
      id: "payments",
      code: "04",
      category: "PAYMENTS",
      items: [
        {
          id: "pay-1",
          question: "Which payment methods are accepted?",
          answer:
            "We accept Bank Transfers (BCA, Mandiri, BNI, BRI) and automated online payment gateways available during the checkout process.",
        },
        {
          id: "pay-2",
          question: "When is my payment confirmed?",
          answer:
            "Automated payment confirmations are processed instantly upon completion. Manual bank transfers are verified within 1 to 12 hours of upload.",
        },
      ],
    },
  ];

  const [faqData, setFaqData] = useState<FAQCategory[]>(defaultFaqData);
  const [loading, setLoading] = useState<boolean>(true);

  // Store open item IDs (supports opening multiple or single)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "gen-1": true,
  });

  // Fetch dynamic FAQs from Laravel backend API
  useEffect(() => {
    async function loadFaqs() {
      try {
        const data = await getFaqs();
        if (Array.isArray(data) && data.length > 0) {
          setFaqData(data);
          // Open first item of first category by default if available
          if (data[0]?.items[0]?.id) {
            setOpenItems({ [data[0].items[0].id]: true });
          }
        }
      } catch (err) {
        console.warn("Using default FAQ dataset fallback:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFaqs();
  }, []);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
            className="flex flex-col items-start max-w-5xl"
          >
            <span
              style={{ fontSize: "11px", letterSpacing: "0.28em" }}
              className="font-semibold uppercase text-[#8A8A8A] block mb-3"
            >
              CUSTOMER CARE &amp; SUPPORT
            </span>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
                lineHeight: "1.1",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                fontFamily: "'Inter', -apple-system, sans-serif",
              }}
              className="uppercase text-[#FFFFFF] tracking-tight mb-4 whitespace-normal md:whitespace-nowrap"
            >
              FREQUENTLY ASKED QUESTIONS
            </h1>

            <p
              style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)", fontWeight: 300 }}
              className="text-[#999999] leading-relaxed max-w-2xl"
            >
              Answers to common questions about SECTOR MADNESS products, ordering, shipping, and services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ MAIN CONTENT AREA ── */}
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
          
          {/* LEFT: ACCORDION LIST */}
          <div className="lg:col-span-8">
            {faqData.map((catGroup, catIdx) => (
              <div
                key={catGroup.id || catGroup.category}
                style={{
                  marginTop: catIdx > 0 ? "clamp(48px, 5.5vw, 76px)" : "0px",
                }}
                className="w-full"
              >
                {/* Category Header */}
                <div className="border-b border-[#333333] mb-8 md:mb-10">
                  <div className="flex items-center gap-4 pb-5 md:pb-6">
                    <span className="text-sm md:text-base font-mono font-bold tracking-[0.25em] text-[#B6A47E]">
                      {catGroup.code}
                    </span>
                    <h2 className="text-sm md:text-base lg:text-lg font-bold tracking-[0.25em] uppercase text-[#FFFFFF]">
                      {catGroup.category}
                    </h2>
                  </div>
                </div>

                {/* Category Questions List (Pure Clean Rows - No Lines Between Questions) */}
                <div className="space-y-1">
                  {catGroup.items.map((item) => {
                    const isOpen = !!openItems[item.id];
                    return (
                      <div key={item.id} className="w-full">
                        {/* Question Button Header */}
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full py-4 md:py-5 flex items-center justify-between text-left group transition-colors duration-200"
                          aria-expanded={isOpen}
                        >
                          <span
                            style={{
                              fontSize: "clamp(0.98rem, 1.3vw, 1.15rem)",
                              fontWeight: 500,
                              letterSpacing: "-0.01em",
                            }}
                            className={`transition-colors duration-200 pr-6 ${
                              isOpen ? "text-[#B6A47E]" : "text-[#FFFFFF] group-hover:text-[#B6A47E]"
                            }`}
                          >
                            {item.question}
                          </span>

                          <span className="shrink-0 w-8 h-8 flex items-center justify-center text-[#B6A47E] text-lg font-light select-none transition-transform duration-300">
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>

                        {/* Answer Collapse Panel */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              key="content"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pb-5 md:pb-6 pr-6 md:pr-12">
                                <p
                                  style={{
                                    fontSize: "clamp(0.92rem, 1.1vw, 1.02rem)",
                                    lineHeight: "1.85",
                                    fontWeight: 300,
                                  }}
                                  className="text-[#A0A0A0] leading-relaxed max-w-2xl"
                                >
                                  {item.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: EDITORIAL STILL NEED HELP? SIDEBAR */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div
              style={{
                padding: "clamp(28px, 4vw, 44px)",
              }}
              className="bg-[#121212] border border-[#222222] flex flex-col justify-between space-y-8"
            >
              <div className="space-y-4">
                <span className="text-[11px] font-semibold tracking-[0.28em] text-[#B6A47E] uppercase block">
                  DIRECT SUPPORT
                </span>

                <h3
                  style={{
                    fontSize: "clamp(1.35rem, 2vw, 1.75rem)",
                    lineHeight: "1.15",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                  className="text-[#FFFFFF] uppercase"
                >
                  STILL NEED HELP?
                </h3>

                <p className="text-[14px] text-[#A0A0A0] font-light leading-relaxed">
                  If you can’t find the answer you’re looking for, our customer assistance team is available directly via WhatsApp.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/6285946653103?text=Halo%20SECTOR%20MADNESS%2C%20saya%20ingin%20bertanya%20mecanai%20FAQ."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center text-[12px] md:text-[13px] tracking-[0.28em] uppercase font-medium text-[#F5F5F5] opacity-90 hover:opacity-100 hover:text-[#B6A47E] transition-all duration-300 ease-out"
                >
                  <span className="relative pb-2 border-b border-[#F5F5F5]/30 group-hover:border-[#B6A47E] transition-colors duration-300">
                    CHAT ON WHATSAPP
                  </span>
                  <span className="ml-4 transition-transform duration-300 ease-out group-hover:translate-x-2">
                    →
                  </span>
                </a>
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
