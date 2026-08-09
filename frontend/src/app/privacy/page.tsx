"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SubGroup {
  subTitle: string;
  bullets: string[];
}

interface PrivacySection {
  code: string;
  title: string;
  intro?: string;
  paragraphs?: string[];
  subGroups?: SubGroup[];
  listIntro?: string;
  bullets?: string[];
  outro?: string[];
}

export default function PrivacyPolicyPage() {
  const sections: PrivacySection[] = [
    {
      code: "01",
      title: "INFORMATION WE COLLECT",
      intro: "We may collect essential personal information provided by users when accessing the SECTOR MADNESS platform, including:",
      subGroups: [
        {
          subTitle: "ACCOUNT INFORMATION",
          bullets: [
            "Account name & credentials",
            "Email address",
            "System encrypted passwords",
            "Date of birth, when requested or provided",
          ],
        },
        {
          subTitle: "CONTACT & DELIVERY INFORMATION",
          bullets: [
            "Contact phone number",
            "Delivery shipping address",
            "City",
            "Province",
            "Postal code",
            "Essential logistics dispatch details",
          ],
        },
        {
          subTitle: "ORDER & TRANSACTION INFORMATION",
          bullets: [
            "Purchased product items",
            "Garment size specifications",
            "Product quantities",
            "Order identification numbers",
            "Order status updates",
            "Logistics dispatch & tracking waybill numbers",
          ],
        },
      ],
      outro: [
        "We only collect information strictly required to operate platform functionalities and process user requests.",
      ],
    },
    {
      code: "02",
      title: "HOW WE UTILIZE INFORMATION",
      listIntro: "User information may be processed for essential operational purposes, including:",
      bullets: [
        "Creating and managing user account profiles",
        "Processing order transactions",
        "Verifying payment confirmation",
        "Executing shipping and logistics dispatch",
        "Providing real time order status updates",
        "Issuing courier tracking waybill numbers",
        "Responding to user inquiries",
        "Delivering dedicated customer support",
        "Enhancing platform security & fraud prevention",
        "Optimizing user browsing experience",
        "Operating and maintaining SECTOR MADNESS services",
      ],
      outro: [
        "User information is never utilized for unrelated third party purposes without lawful basis or consent.",
      ],
    },
    {
      code: "03",
      title: "PAYMENT INFORMATION",
      paragraphs: [
        "For transaction authorization, SECTOR MADNESS utilizes authorized third party payment gateways (including Midtrans API).",
        "Payment credentials are processed securely through certified payment service providers.",
        "SECTOR MADNESS does not directly store credit card numbers or sensitive banking credentials on our servers when processed via gateway providers.",
        "Detailed payment processing data is governed by PCI DSS security standards and the privacy policies of our authorized payment providers.",
      ],
    },
    {
      code: "04",
      title: "SHIPPING & LOGISTICS DISPATCH",
      intro: "To fulfill orders, shipping information is transmitted to authorized courier logistics partners, including:",
      bullets: [
        "JNE",
        "J&T",
        "Integrated logistics aggregators within our system (Biteship API)",
      ],
      outro: [
        "Transmitted details include recipient name, contact phone number, and shipping address to ensure accurate dispatch to your destination.",
      ],
    },
    {
      code: "05",
      title: "DATA STORAGE & RETENTION",
      paragraphs: [
        "User data is stored for as long as necessary to operate SECTOR MADNESS services, fulfill transactional obligations, maintain security, or comply with legal requirements.",
        "We employ reasonable technical safeguards to protect information against unauthorized access, improper use, unauthorized modification, loss, or disclosure.",
        "However, users acknowledge that no digital storage or internet transmission method can be guaranteed 100% immune to all security risks.",
      ],
    },
    {
      code: "06",
      title: "ACCOUNT SECURITY PROTOCOL",
      intro: "Registered account holders are responsible for maintaining the confidentiality of their authentication credentials.",
      listIntro: "Users are strongly advised never to share:",
      bullets: [
        "Account passwords",
        "Login credentials",
        "Personal account access details",
      ],
      outro: [
        "If you suspect or detect unauthorized access to your account, please contact SECTOR MADNESS support immediately.",
      ],
    },
    {
      code: "07",
      title: "COOKIES & TRACKING TECHNOLOGIES",
      intro: "The SECTOR MADNESS platform utilizes cookies and similar technologies to ensure optimal website functionality and analyze user interactions.",
      listIntro: "Cookies are utilized to:",
      bullets: [
        "Maintain active user login sessions",
        "Store user browsing preferences",
        "Support shopping bag/cart functionality",
        "Improve overall user browsing experience",
        "Analyze website usage metrics and performance",
      ],
      outro: [
        "If analytics tools or third party tracking services are implemented, specific usage guidelines will be updated within this policy.",
      ],
    },
    {
      code: "08",
      title: "THIRD PARTY SERVICE PROVIDERS",
      listIntro: "SECTOR MADNESS may engage verified third party service providers to support platform operations, including but not limited to:",
      bullets: [
        "Payment authorization gateways",
        "Logistics & courier dispatch partners",
        "Cloud hosting & server infrastructure",
        "Transactional email dispatch services",
        "Analytics & technical diagnostic tools",
      ],
      outro: [
        "Third party providers only receive data essential to perform their specified functions and operate under their respective privacy policies.",
      ],
    },
    {
      code: "09",
      title: "TRANSACTIONAL COMMUNICATIONS",
      listIntro: "SECTOR MADNESS processes contact details to deliver service related communications, including:",
      bullets: [
        "Order receipts & confirmations",
        "Payment verifications",
        "Dispatch & shipping tracking updates",
        "Order status modifications",
        "Account security notices",
        "Customer support responses",
      ],
      outro: [
        "If promotional communications or newsletters are offered, users will be provided with explicit options to opt in or unsubscribe.",
      ],
    },
    {
      code: "10",
      title: "USER DATA RIGHTS",
      listIntro: "Users hold specific rights regarding their personal data under applicable regulations, including the right to:",
      bullets: [
        "Inspect personal data processed by SECTOR MADNESS",
        "Update inaccurate or outdated information",
        "Request data corrections",
        "Request account & data erasure under specific conditions",
        "Inquire about data processing methods",
        "Withdraw consent where processing relies on consent",
      ],
      outro: [
        "Requests regarding personal data can be submitted via the Contact page and may require identity verification for security.",
      ],
    },
    {
      code: "11",
      title: "MINORS & CHILDREN PRIVACY",
      paragraphs: [
        "The SECTOR MADNESS platform is not directed specifically toward children.",
        "We do not knowingly collect personal data from minors.",
        "If a parent or guardian discovers that a child has provided personal information without consent, please contact SECTOR MADNESS to review and remove the data.",
      ],
    },
    {
      code: "12",
      title: "THIRD PARTY HYPERLINKS",
      paragraphs: [
        "The SECTOR MADNESS website may contain links to external third party websites or services.",
        "SECTOR MADNESS is not responsible for the privacy practices, security protocols, or content of third party websites.",
        "Users are encouraged to inspect third party privacy policies before submitting personal data.",
      ],
    },
    {
      code: "13",
      title: "POLICY REVISIONS",
      paragraphs: [
        "SECTOR MADNESS reserves the right to update this Privacy Policy periodically to reflect service adjustments, system updates, third party integrations, operational needs, or legal requirements.",
        "The latest version will be published directly on this page with the revised date displayed at the top.",
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
                DATA GOVERNANCE &amp; PRIVACY PROTOCOL
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
              PRIVACY POLICY
            </h1>

            <p
              style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)", fontWeight: 300 }}
              className="text-[#999999] leading-relaxed max-w-3xl"
            >
              SECTOR MADNESS respects user privacy. This Privacy Policy outlines how we collect, utilize, store, and safeguard your personal information when accessing our platform, registering an account, making a purchase, or using our services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── MAIN PRIVACY CONTENT ── */}
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
          
          {/* LEFT: PRIVACY CLAUSES (8 COLS) */}
          <div className="lg:col-span-8 space-y-12">
            {sections.map((sec, index) => (
              <motion.div
                key={sec.code}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.04 }}
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

                  {/* Sub Groups for Section 01 */}
                  {sec.subGroups &&
                    sec.subGroups.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        style={{ marginTop: sIdx > 0 ? "24px" : "12px" }}
                        className="space-y-2 pt-2"
                      >
                        <h3 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-[0.15em] mb-2">
                          {sub.subTitle}
                        </h3>
                        <ul className="space-y-3 pl-1 my-2">
                          {sub.bullets.map((bullet, bIdx) => (
                            <li
                              key={bIdx}
                              className="flex items-center gap-3 text-xs md:text-sm text-[#C0C0C0] font-light leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B6A47E] shrink-0" />
                              <span className="leading-relaxed">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
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

            {/* 14 / CONTACT US CLAUSE */}
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
                  14
                </span>
                <span className="text-[#333333] text-xs">//</span>
                <h2 className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-[#FFFFFF]">
                  INQUIRIES &amp; CONTACT
                </h2>
              </div>

              <p className="text-xs md:text-sm text-[#A0A0A0] font-light leading-relaxed">
                If you have questions regarding this Privacy Policy, personal data protection, or wish to submit a data access request, please contact our team via the Contact page.
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
                  PRIVACY PROTOCOL
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
                  DATA PROTECTION &amp; GOVERNANCE
                </h3>

                <p className="text-[13.5px] md:text-[14px] text-[#A0A0A0] font-light leading-[1.75]">
                  SECTOR MADNESS complies with strict data protection standards to safeguard your transactions, account details, and browsing security.
                </p>
              </div>

              {/* SPACIOUS SEPARATOR AND LINK LIST */}
              <div className="border-t border-[#222222] mt-8 pt-8 space-y-5 text-xs tracking-wider uppercase">
                <Link
                  href="/terms"
                  className="block text-[#8A8A8A] hover:text-[#FFFFFF] hover:translate-x-1 transition-all duration-300"
                >
                  → TERMS &amp; CONDITIONS
                </Link>
                <Link
                  href="/shipping"
                  className="block text-[#8A8A8A] hover:text-[#FFFFFF] hover:translate-x-1 transition-all duration-300"
                >
                  → SHIPPING PROTOCOL
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
