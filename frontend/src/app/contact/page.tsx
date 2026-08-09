"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveMap from "@/components/InteractiveMap";
import { getContactSettings, formatWhatsAppUrl, formatMailtoUrl, ContactSettingItem } from "@/utils/api";

export default function ContactPage() {
  const [channels, setChannels] = useState<ContactSettingItem[]>([]);
  const [warehouse, setWarehouse] = useState<ContactSettingItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const data = await getContactSettings();
      if (data && data.length > 0) {
        const channelList = data.filter((item) => item.type === "channel");
        const warehouseItem = data.find((item) => item.type === "warehouse") || null;
        setChannels(channelList);
        setWarehouse(warehouseItem);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const mapLat = warehouse?.latitude ? Number(warehouse.latitude) : -6.3117;
  const mapLng = warehouse?.longitude ? Number(warehouse.longitude) : 107.3015;
  const warehouseTitle = warehouse?.title || "CENTRAL FULFILLMENT DOCK";
  const warehouseSubtitle = warehouse?.subtitle || "OUR WAREHOUSE";
  const warehouseAddressLines = warehouse?.value ? warehouse.value.split("\n") : [];

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
            <span
              style={{ fontSize: "11px", letterSpacing: "0.28em" }}
              className="font-semibold uppercase text-[#8A8A8A] block mb-3"
            >
              DIRECT CHANNELS &amp; FULFILLMENT PROTOCOL
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
              CONTACT
            </h1>

            <p
              style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)", fontWeight: 300 }}
              className="text-[#999999] leading-relaxed max-w-2xl"
            >
              For questions, orders, size consultations, or general inquiries, reach out to SECTOR MADNESS.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT INFORMATION & LOCATION SECTION ── */}
      <section
        style={{
          paddingTop: "clamp(48px, 5.5vw, 76px)",
          paddingBottom: "clamp(64px, 7.5vw, 96px)",
          paddingLeft: "clamp(32px, 6vw, 80px)",
          paddingRight: "clamp(32px, 6vw, 80px)",
        }}
        className="max-w-[1500px] mx-auto w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          
          {/* LEFT: DYNAMIC DIRECT CONTACT CHANNELS (6 COLS) */}
          <div className="lg:col-span-6 space-y-6">
            {isLoading ? (
              <div className="py-12 text-[#8A8A8A] text-xs font-mono tracking-widest uppercase animate-pulse">
                Loading Contact Protocol...
              </div>
            ) : (
              channels.map((item, index) => {
                const isLast = index === channels.length - 1;
                const valueLines = item.value ? item.value.split("\n") : [];

                return (
                  <div
                    key={item.id || index}
                    style={{
                      marginTop: index > 0 ? "24px" : "0px",
                      paddingTop: index > 0 ? "20px" : "0px",
                      paddingBottom: isLast ? "0px" : "24px",
                    }}
                    className={`${isLast ? "" : "border-b border-[#333333] mb-6 md:mb-8"} space-y-3`}
                  >
                    <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#B6A47E] uppercase block mb-2">
                      {item.title}
                    </span>
                    {item.subtitle && item.subtitle !== item.title && (
                      <h2 className="text-sm md:text-base font-bold tracking-[0.2em] uppercase text-[#FFFFFF]">
                        {item.subtitle}
                      </h2>
                    )}

                    {/* Value rendering: Link vs Generated WhatsApp / Text */}
                    {(() => {
                      const isEmailChannel = item.code === "01" || item.type === "email" || item.title.toLowerCase().includes("email") || item.value.includes("@") || (item.link && item.link.startsWith("mailto:"));
                      const isPhoneChannel = item.code === "02" || item.title.toLowerCase().includes("messaging") || item.title.toLowerCase().includes("whatsapp") || item.title.toLowerCase().includes("phone");

                      let hrefUrl: string | null = null;
                      if (isEmailChannel) {
                        const baseEmail = item.link || item.value;
                        const subjectText = `INQUIRY - ${item.title.toUpperCase()}`;
                        hrefUrl = formatMailtoUrl(baseEmail, subjectText);
                      } else if (item.link) {
                        hrefUrl = item.link;
                      } else if (isPhoneChannel) {
                        hrefUrl = formatWhatsAppUrl(item.value, "Halo SECTOR MADNESS, saya ingin bertanya mengenai produk dan layanan.");
                      }

                      if (hrefUrl) {
                        return (
                          <a
                            href={hrefUrl}
                            target={hrefUrl.startsWith("http") ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className="group inline-flex items-center text-base md:text-lg text-[#F5F5F5] font-light hover:text-[#B6A47E] transition-colors tracking-wide"
                          >
                            <span>{item.value}</span>
                            <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                              {hrefUrl.startsWith("mailto") ? "→" : "↗"}
                            </span>
                          </a>
                        );
                      }

                      const isWarehouse = item.type === "warehouse" || item.type === "address" || item.code === "05" || item.code === "W1";
                      const isSchedule = item.type === "schedule" || item.code === "03" || item.title.toLowerCase().includes("operational") || item.title.toLowerCase().includes("schedule");

                      if (isSchedule) {
                        let daysText = item.value;
                        let hoursText = "";

                        if (item.value.includes("\n")) {
                          const parts = item.value.split("\n");
                          daysText = parts[0].trim();
                          hoursText = parts.slice(1).join(" ").trim();
                        } else if (item.value.includes(",")) {
                          const parts = item.value.split(",");
                          daysText = parts[0].trim();
                          hoursText = parts.slice(1).join(" ").trim();
                        }

                        return (
                          <div className="space-y-1 mt-1">
                            <div className="text-sm md:text-base font-semibold text-[#F5F5F5]">
                              {daysText}
                            </div>
                            {hoursText && (
                              <div className="text-xs font-mono text-[#A0A0A0] tracking-wide">
                                {hoursText}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const cleanLines = Array.from(new Set(valueLines.map(l => l.trim()).filter(l => {
                        if (!l) return false;
                        const low = l.toLowerCase();
                        if (isWarehouse && (low.includes("sector madness central warehouse") || low === item.title.toLowerCase())) return false;
                        return true;
                      })));

                      return (
                        <div className="text-sm md:text-base text-[#F5F5F5] font-light space-y-1">
                          {cleanLines.map((line, lIdx) => (
                            <div
                              key={lIdx}
                              className={lIdx > 0 ? "text-[#A0A0A0] text-xs font-mono" : ""}
                            >
                              {line}
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {item.note && (
                      <p className="text-xs text-[#8A8A8A] font-light">
                        {item.note}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: DYNAMIC LOCATION & COMPACT INTERACTIVE MAP (6 COLS) */}
          <div className="lg:col-span-6 space-y-6 max-w-[560px]">
            
            {/* LOCATION DETAILS HEADER */}
            <div
              style={{ paddingBottom: "20px" }}
              className="border-b border-[#333333] mb-6 space-y-3"
            >
              <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#B6A47E] uppercase block mb-1">
                {warehouseTitle}
              </span>
              <h2 className="text-base md:text-lg font-bold tracking-[0.15em] uppercase text-[#FFFFFF]">
                {warehouseSubtitle}
              </h2>
              <div className="text-xs md:text-sm text-[#A0A0A0] font-light leading-relaxed space-y-1">
                {warehouseAddressLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={idx === 0 ? "text-[#FFFFFF] font-medium uppercase tracking-wider" : ""}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* REAL COMPACT INTERACTIVE MAP COMPONENT */}
            <div className="space-y-3">
              <InteractiveMap
                lat={mapLat}
                lng={mapLng}
                zoom={14}
                title={warehouseAddressLines[0] || "SECTOR MADNESS CENTRAL WAREHOUSE"}
                subtitle={warehouseAddressLines[1] || "Karawang Barat, Indonesia"}
              />
              <div className="flex items-center justify-between text-[11px] text-[#666666] font-mono tracking-wider pt-1">
                {/* MOBILE & TABLET LAYOUT */}
                <div className="lg:hidden flex flex-col w-full gap-1">
                  <div className="flex items-center justify-between w-full">
                    <span>LAT: {mapLat}° S</span>
                    <a
                      href={`https://www.google.com/maps?q=${mapLat},${mapLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#B6A47E] hover:underline font-bold flex items-center gap-1 uppercase tracking-wider whitespace-nowrap"
                    >
                      <span>Open in Google Maps</span>

                    </a>
                  </div>
                  <span>LNG: {mapLng}° E</span>
                </div>

                {/* DESKTOP LAYOUT */}
                <span className="hidden lg:inline">LAT: {mapLat}° S, LNG: {mapLng}° E</span>
                <a
                  href={`https://www.google.com/maps?q=${mapLat},${mapLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:flex text-[#B6A47E] hover:underline font-bold items-center gap-1 uppercase tracking-wider whitespace-nowrap"
                >
                  <span>Open in Google Maps</span>
                  <span>↗</span>
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
