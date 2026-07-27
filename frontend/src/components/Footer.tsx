export default function Footer() {
  return (
    <footer
      style={{ paddingTop: "48px" }}
      className="w-full bg-[#0A0A0A] text-[#F5F5F5] pb-4 border-t border-[#222222]"
    >
      {/* Upper Content Container */}
      <div className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20">
        {/* 12-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16">
          {/* Column 1: Newsletter Subscribe */}
          <div className="lg:col-span-6 flex flex-col justify-between pr-0 lg:pr-16">
            <div style={{ paddingLeft: "60px" }}>
              <h3 className="font-[family-name:var(--font-display)] text-[22px] md:text-[26px] lg:text-[28px] font-bold tracking-[0.05em] uppercase text-[#F5F5F5] leading-[1.25] mb-6">
                SUBSCRIBE TO THE<br />NEWSLETTER
              </h3>
              <p
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-[11px] md:text-[12px] tracking-[0.12em] uppercase text-[#8A8A8A] font-normal leading-[1.8] mb-8 max-w-md"
              >
                CREATE AN ACCOUNT AND GET ACCESS TO EXCLUSIVE CONTENT, PREVIEWS AND SPECIAL OFFERS.
              </p>
            </div>
            <div style={{ paddingLeft: "60px" }}>
              <button
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="bg-[#F5F5F5] text-[#0A0A0A] px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase font-bold hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 cursor-pointer"
              >
                SIGN UP
              </button>
            </div>
          </div>

          {/* Column 2: ABOUT */}
          <div className="lg:col-span-2 pt-1">
            <h4
              style={{ fontFamily: "'Inter', sans-serif", marginBottom: "20px" }}
              className="text-[11px] tracking-[0.18em] uppercase font-bold text-[#F5F5F5] whitespace-nowrap block"
            >
              ABOUT
            </h4>
            <ul className="space-y-4 md:space-y-5">
              {["OUR STORY", "VENTILE®", "OUR PEOPLE"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="text-[11px] tracking-[0.18em] uppercase text-[#F5F5F5] font-bold hover:text-[#B6A47E] transition-colors cursor-pointer whitespace-nowrap block"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: LEGAL AREA */}
          <div className="lg:col-span-2 pt-1">
            <h4
              style={{ fontFamily: "'Inter', sans-serif", marginBottom: "20px" }}
              className="text-[11px] tracking-[0.18em] uppercase font-bold text-[#F5F5F5] whitespace-nowrap block"
            >
              LEGAL AREA
            </h4>
            <ul className="space-y-4 md:space-y-5">
              {["RETURNS & REFUNDS", "PRIVACY POLICY"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="text-[11px] tracking-[0.18em] uppercase text-[#F5F5F5] font-bold hover:text-[#B6A47E] transition-colors cursor-pointer whitespace-nowrap block"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: CUSTOMER CARE */}
          <div className="lg:col-span-2 flex flex-col justify-between pt-1">
            <div>
              <h4
                style={{ fontFamily: "'Inter', sans-serif", marginBottom: "20px" }}
                className="text-[11px] tracking-[0.18em] uppercase font-bold text-[#F5F5F5] whitespace-nowrap block"
              >
                CUSTOMER CARE
              </h4>
              <ul className="space-y-4 md:space-y-5">
                {["HOW TO ORDER", "FAQ", "CONTACT US"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="text-[11px] tracking-[0.18em] uppercase text-[#F5F5F5] font-bold hover:text-[#B6A47E] transition-colors cursor-pointer whitespace-nowrap block"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 100% Full Screen Width Copyright Line with Tight 6px Clearance */}
      <div
        style={{ marginTop: "48px", marginBottom: "6px" }}
        className="w-full h-[1px] bg-[#222222]"
      />

      {/* Copyright Bar */}
      <div className="max-w-[1480px] mx-auto px-8 md:px-14 lg:px-20">
        <div className="flex flex-col md:flex-row items-center justify-center text-center">
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-[#8A8A8A] font-[family-name:var(--font-body)]"
          >
            SECTOR MADNESS ® 2026. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
