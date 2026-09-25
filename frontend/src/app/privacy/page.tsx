"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SubGroup {
  subTitle: string;
  bullets: React.ReactNode[];
}

interface PrivacySection {
  code: string;
  title: string;
  intro?: React.ReactNode;
  paragraphs?: React.ReactNode[];
  subGroups?: SubGroup[];
  listIntro?: React.ReactNode;
  bullets?: React.ReactNode[];
  outro?: React.ReactNode[];
}

export default function PrivacyPolicyPage() {
  const sections: PrivacySection[] = [
    {
      code: "01",
      title: "INFORMATION WE COLLECT",
      intro: "When you visit the Sector Madness website, we may automatically collect certain information about the device you use, including:",
      bullets: [
        "Device type and operating system",
        "Browser type and version",
        "IP address",
        "Time zone",
        "Pages or products you visit",
        "Time and duration of your visit",
        "The source that referred you to our website",
        "Information about how you interact with our website",
      ],
      outro: [
        "This information may be collected through technologies such as cookies, log files, web beacons, pixels, or similar technologies.",
      ],
      subGroups: [
        {
          subTitle: "COOKIES",
          bullets: [
            "Cookies are small files stored on your device when you visit a website. Cookies help us recognize your device, remember certain preferences, and understand how visitors use our website.",
            "You can manage or disable cookies through your browser settings. However, disabling certain cookies may affect the functionality or user experience of our website.",
          ],
        },
      ],
    },
    {
      code: "02",
      title: "ORDER INFORMATION",
      intro: "When you place or attempt to place an order through the Sector Madness website, we may collect information necessary to process your order, including:",
      bullets: [
        "Full name",
        "Phone number",
        "Email address",
        "Shipping address",
        "Billing address, when required",
        "Details of the products ordered",
        "Product sizes and quantities",
        "Payment information required to process the transaction",
        "Other information you provide during the ordering process",
      ],
      outro: [
        "We refer to this information as Order Information.",
        "Sector Madness does not store complete payment card information when payments are processed through third-party payment service providers. Payment information is processed in accordance with the security systems and policies of the payment provider used.",
      ],
    },
    {
      code: "03",
      title: "HOW WE USE YOUR PERSONAL INFORMATION",
      listIntro: "The information we collect may be used for Sector Madness' operational purposes, including:",
      bullets: [
        "Processing and fulfilling your orders",
        "Processing payments",
        "Arranging product delivery",
        "Sending order confirmations and order-related information",
        "Contacting you regarding your orders or our services",
        "Providing customer support",
        "Preventing and detecting suspicious transactions, fraud, or misuse of our website",
        "Improving the quality of Sector Madness products and services",
        "Analyzing website usage to improve the user experience",
        "Sending information about products, promotions, or Sector Madness activities when you have given your consent or where permitted by applicable law",
      ],
      outro: [
        "Information collected automatically through our website may also be used to help us understand how visitors use our website and to improve its performance and security.",
      ],
    },
    {
      code: "04",
      title: "SHARING INFORMATION WITH THIRD PARTIES",
      paragraphs: [
        "Sector Madness may use third-party services that help us operate our website and conduct our business.",
      ],
      listIntro: "These third parties may include:",
      bullets: [
        "Website hosting or e-commerce platform providers",
        "Payment service providers",
        "Shipping and delivery services",
        "Website analytics providers",
        "Technology and security service providers",
        "Other service providers necessary for the operation of Sector Madness",
      ],
      outro: [
        "We only provide third parties with the information necessary to perform services related to our business operations.",
        "We may also disclose personal information when required by applicable law, regulations, legal proceedings, or an official request from an authorized authority.",
      ],
    },
    {
      code: "05",
      title: "INFORMATION SECURITY",
      paragraphs: [
        "Sector Madness takes reasonable measures to protect the personal information we hold and to prevent unauthorized access, use, alteration, or disclosure.",
        "However, no method of data storage or transmission over the internet can be guaranteed to be completely secure. Therefore, we cannot guarantee the absolute security of your information.",
      ],
    },
    {
      code: "06",
      title: "MARKETING COMMUNICATIONS",
      listIntro: "If you have given your consent to receive communications from Sector Madness, we may contact you regarding:",
      bullets: [
        "New products",
        "Restocks",
        "Pre-orders",
        "Promotions or special offers",
        "Brand-related information",
        "Sector Madness activities or campaigns",
      ],
      outro: [
        "You may request to stop receiving marketing communications from us at any time by contacting us through the information provided in the Contact Us section.",
      ],
    },
    {
      code: "07",
      title: "GOOGLE ANALYTICS AND ANALYTICS TECHNOLOGIES",
      paragraphs: [
        "The Sector Madness website may use third-party analytics services to help us understand how visitors use our website.",
        "Information collected through analytics services may include device information, pages visited, visit duration, and interactions with the website.",
        "This information is used to analyze and improve the performance and user experience of the Sector Madness website.",
      ],
    },
    {
      code: "08",
      title: "YOUR RIGHTS REGARDING PERSONAL INFORMATION",
      listIntro: "You may contact Sector Madness if you wish to:",
      bullets: [
        "Know what personal information we hold about you",
        "Correct inaccurate information",
        "Update your personal information",
        "Request the deletion of certain personal information, where permitted by applicable law and where such deletion does not conflict with our data retention obligations",
        "Submit questions or complaints regarding how your personal information is used",
      ],
      outro: [
        "For requests relating to personal information, we may ask for additional information to verify that the request is being made by the relevant data subject.",
      ],
    },
    {
      code: "09",
      title: "DATA RETENTION",
      listIntro: "Sector Madness retains personal information for as long as necessary to fulfill the purposes for which it was collected, including to:",
      bullets: [
        "Fulfill orders",
        "Provide customer support",
        "Complete transactions",
        "Comply with legal or administrative obligations",
        "Resolve disputes when necessary",
      ],
      outro: [
        "When information is no longer required, it may be deleted or retained in a form that no longer allows individuals to be identified, as necessary and in accordance with applicable requirements.",
      ],
    },
    {
      code: "10",
      title: "CHILDREN'S PRIVACY",
      paragraphs: [
        "The Sector Madness website is intended for the general public and is not specifically directed toward children.",
        "We do not knowingly collect personal information from children without parental or guardian consent where such consent is required by law.",
        "If you become aware that a child has provided us with personal information without the required consent, please contact us so that we can take appropriate action.",
      ],
    },
    {
      code: "11",
      title: "LINKS TO THIRD-PARTY WEBSITES",
      paragraphs: [
        "The Sector Madness website may contain links to third-party websites or services, including marketplaces, social media platforms, payment services, or shipping providers.",
        "Sector Madness is not responsible for the privacy practices or content of these third party websites or services. We recommend that you review the privacy policies of each third party before providing them with your personal information.",
      ],
    },
    {
      code: "12",
      title: "CHANGES TO THIS PRIVACY POLICY",
      paragraphs: [
        "Sector Madness may update this Privacy Policy from time to time to reflect changes to our services, technology, business practices, or applicable laws and regulations.",
        "Any changes will be posted on the Privacy Policy page of the Sector Madness website. The date of the latest update will be displayed at the top of this page.",
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
                DATA GOVERNANCE &amp; PRIVACY PROTOCOL
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

                  {/* Sub Groups for Section 01 */}
                  {sec.subGroups &&
                    sec.subGroups.map((sub, sIdx) => (
                      <div
                        key={sIdx}
                        style={{ marginTop: sIdx > 0 ? "24px" : "12px" }}
                        className="space-y-2 pt-2"
                      >
                        <h3 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500 }} className="text-xs text-[#FFFFFF] uppercase tracking-[0.15em] mb-2">
                          {sub.subTitle}
                        </h3>
                        <ul className="space-y-3 pl-1 my-2">
                          {sub.bullets.map((bullet, bIdx) => (
                            <li
                              key={bIdx}
                              className="flex items-center gap-3 text-xs md:text-sm text-[#C0C0C0] font-light leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] shrink-0" />
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

            {/* 13 / CONTACT US CLAUSE */}
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
                  13
                </span>
                <span className="text-[#333333] text-xs">//</span>
                <h2 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 500 }} className="text-sm md:text-base tracking-[0.2em] uppercase text-[#FFFFFF]">
                  CONTACT US
                </h2>
              </div>

              <div className="text-xs md:text-sm text-[#A0A0A0] font-light leading-relaxed space-y-4">
                <p>
                  If you have any questions, requests, or complaints regarding this Privacy Policy or how Sector Madness handles your personal information, you may contact us through:
                </p>
                
                <div>
                  <p className="font-bold text-[#FFFFFF]">Sector Madness</p>
                  <p>Email: sectormadnessid@gmail.com</p>
                  <p>Website: www.sectormadness.com</p>
                  <p>Instagram: @sectormadness.id</p>
                </div>
                
                <div className="pt-2">
                  <p>© 2026 Sector Madness. All Rights Reserved.</p>
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
                  PRIVACY PROTOCOL
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
