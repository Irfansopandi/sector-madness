"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const countryOptions = [
  { code: "ID", dial: "+62", name: "Indonesia" },
  { code: "US", dial: "+1", name: "United States / Canada" },
  { code: "UK", dial: "+44", name: "United Kingdom" },
  { code: "JP", dial: "+81", name: "Japan" },
  { code: "SG", dial: "+65", name: "Singapore" },
  { code: "AU", dial: "+61", name: "Australia" },
  { code: "KR", dial: "+82", name: "South Korea" },
  { code: "MY", dial: "+60", name: "Malaysia" },
  { code: "IT", dial: "+39", name: "Italy" },
  { code: "DE", dial: "+49", name: "Germany" },
  { code: "FR", dial: "+33", name: "France" },
  { code: "NL", dial: "+31", name: "Netherlands" },
];

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Login Form States
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Registration Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [countryCode, setCountryCode] = useState("ID");
  const [phoneCountry, setPhoneCountry] = useState("+62");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "register") {
        setIsRegistering(true);
      }
      const redirectUrl = params.get("redirect");

      const userData = localStorage.getItem("sector_madness_user");
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed?.loggedIn) {
          setIsLoggedIn(true);
          if (parsed.email) setUserEmail(parsed.email);
          if (redirectUrl) {
            router.push(redirectUrl);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailToSave = userEmail || "member@sectormadness.com";
    localStorage.setItem("sector_madness_user", JSON.stringify({ email: emailToSave, loggedIn: true }));
    window.dispatchEvent(new Event("sector_auth_change"));
    setIsLoggedIn(true);
    const redirectUrl = new URLSearchParams(window.location.search).get("redirect");
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 8) {
      alert("Error: Protocol validation failed. Password must be at least 8 characters long.");
      return;
    }
    if (regPassword !== confirmPassword) {
      alert("Error: Protocol validation failed. Password and Confirm Password must match exactly.");
      return;
    }
    const emailToSave = regEmail || "member@sectormadness.com";
    localStorage.setItem(
      "sector_madness_user",
      JSON.stringify({
        email: emailToSave,
        loggedIn: true,
        firstName,
        lastName,
        phone: `${phoneCountry} ${phoneNumber}`,
        dob: dateOfBirth,
      })
    );
    window.dispatchEvent(new Event("sector_auth_change"));
    setUserEmail(emailToSave);
    setIsLoggedIn(true);
    const redirectUrl = new URLSearchParams(window.location.search).get("redirect");
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sector_madness_user");
    window.dispatchEvent(new Event("sector_auth_change"));
    setIsLoggedIn(false);
  };

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] flex flex-col selection:bg-[#0A0A0A] selection:text-white"
    >
      {/* Light Navbar Mode */}
      <Navbar mode="light" />

      {/* Main Container with 100px top clearance for Navbar */}
      <div style={{ paddingTop: "100px" }} className="flex-1 w-full max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-100px)] border-b border-[#E5E5E5]">
          
          {/* ── EDITORIAL CAMPAIGN PHOTOGRAPH COLUMN ──
              In Login Mode: sits on the LEFT (order-1). 
              In Register Mode: gracefully shifts to the RIGHT (order-2). */}
          <div
            className={`lg:col-span-6 relative bg-[#0A0A0A] overflow-hidden min-h-[580px] lg:min-h-full flex flex-col justify-end ${
              isRegistering ? "lg:order-2 border-l border-[#E5E5E5]" : "lg:order-1 border-r border-[#E5E5E5]"
            }`}
          >
            <Image
              src={isRegistering ? "/images/hero/hero-2.png" : "/images/campaign/campaign-1.png"}
              alt="SECTOR MADNESS // TECHNICAL GARMENT"
              fill
              priority
              sizes="(max-w-[1024px]) 100vw, 50vw"
              className="object-cover object-top transition-all duration-700 ease-in-out"
            />
            
            {/* Subtle dark gradient overlay at bottom for tag readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/20 to-transparent pointer-events-none" />

            {/* Technical Spec Stamp in Bottom Corner */}
            <div className="relative z-10 p-8 md:p-12 border-t border-[#FFFFFF]/15 flex items-end justify-between gap-4">
              <div>
                <p style={{ fontSize: "11px", letterSpacing: "0.25em", fontWeight: 700, marginBottom: "6px" }} className="uppercase text-[#FFFFFF] font-mono">
                  [SM//2026 ARCHIVE LABS]
                </p>
                <p style={{ fontSize: "12px", letterSpacing: "0.12em" }} className="uppercase text-[#A0A0A0] font-mono">
                  {isRegistering ? "CREDENTIAL REGISTRATION // PROTOCOL 02" : "MEMBER ACCESS // PROTOCOL 01"}
                </p>
              </div>
              <div className="hidden sm:block">
                <span className="inline-block px-3 py-1.5 bg-white/10 text-[#FFFFFF] text-[10px] uppercase tracking-[0.2em] backdrop-blur-md border border-white/20 font-mono">
                  LAB TESTED CERTIFIED
                </span>
              </div>
            </div>
          </div>

          {/* ── FORM COLUMN ──
              In Login Mode: sits on the RIGHT (order-2). 
              In Register Mode: gracefully shifts to the LEFT (order-1). */}
          <div
            style={{
              paddingLeft: "clamp(40px, 9vw, 150px)",
              paddingRight: "clamp(40px, 9vw, 150px)",
              paddingTop: "80px",
              paddingBottom: "120px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
            }}
            className={`lg:col-span-6 w-full ${isRegistering ? "lg:order-1" : "lg:order-2"}`}
          >
            <AnimatePresence mode="wait">
              {isLoggedIn ? (
                /* ── LOGGED IN MEMBER PROFILE STATE ── */
                <motion.div
                  key="logged-in-profile"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full max-w-[480px]"
                >
                  <div style={{ marginBottom: "32px", paddingBottom: "20px", borderBottom: "2px solid #0A0A0A" }} className="flex items-center justify-between">
                    <div style={{ fontSize: "24px", letterSpacing: "0.08em", fontWeight: 800, fontFamily: "'Inter', -apple-system, sans-serif" }} className="uppercase text-[#0A0A0A]">
                      MEMBER ACCOUNT
                    </div>
                    <span className="h-3 w-3 rounded-none bg-[#0A0A0A] animate-pulse" title="Active Account" />
                  </div>

                  <p style={{ fontSize: "11px", letterSpacing: "0.22em", fontWeight: 700, marginBottom: "6px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="uppercase text-[#777777]">
                    AUTHENTICATED AS
                  </p>
                  <p style={{ fontSize: "16px", letterSpacing: "0.03em", fontWeight: 600, marginBottom: "32px" }} className="text-[#0A0A0A] font-mono">
                    {userEmail}
                  </p>

                  <div style={{ marginBottom: "36px", padding: "24px" }} className="border border-[#E0E6ED] bg-[#F4F7FB] space-y-4">
                    <div className="flex justify-between items-center text-[12px] uppercase tracking-[0.15em] border-b border-[#E2E8F0] pb-3">
                      <span className="text-[#666666]">ACCESS STATUS</span>
                      <span className="font-bold text-[#0A0A0A]">ARCHIVE TIER 1</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] uppercase tracking-[0.15em] border-b border-[#E2E8F0] pb-3">
                      <span className="text-[#666666]">MEMBER ID</span>
                      <span className="font-bold text-[#0A0A0A] font-mono">SM-9482-EXP</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] uppercase tracking-[0.15em]">
                      <span className="text-[#666666]">PRIVATE DROPS</span>
                      <span className="font-bold text-[#0A0A0A]">UNLOCKED</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Link
                      href="/shop"
                      style={{ fontSize: "13px", letterSpacing: "0.28em", fontWeight: 700, padding: "18px 0", fontFamily: "'Inter', -apple-system, sans-serif" }}
                      className="w-full block text-center bg-[#0A0A0A] text-white uppercase hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 cursor-pointer rounded-none"
                    >
                      ENTER PRODUCT ARCHIVE →
                    </Link>

                    <button
                      onClick={handleLogout}
                      style={{ fontSize: "13px", letterSpacing: "0.25em", fontWeight: 700, padding: "18px 0", fontFamily: "'Inter', -apple-system, sans-serif" }}
                      className="w-full block bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] uppercase hover:bg-[#0A0A0A] hover:text-white transition-all duration-300 cursor-pointer rounded-none"
                    >
                      LOG OUT OF ACCOUNT
                    </button>
                  </div>
                </motion.div>
              ) : !isRegistering ? (
                /* ── LOG IN STATE (FORM ON RIGHT) ── */
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full max-w-[480px]"
                >
                  <div
                    style={{ fontSize: "28px", letterSpacing: "0.06em", fontWeight: 800, marginBottom: "40px", lineHeight: "1.2", fontFamily: "'Inter', -apple-system, sans-serif" }}
                    className="uppercase text-[#0A0A0A]"
                  >
                    LOG IN TO YOUR ACCOUNT
                  </div>

                  <form onSubmit={handleLogin}>
                    {/* Email Input Block */}
                    <div style={{ marginBottom: "28px" }}>
                      <label style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: 700, marginBottom: "12px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                        EMAIL ADDRESS <span className="text-[#D92323]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="name@example.com"
                        style={{ fontSize: "15px", padding: "18px 20px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className="w-full bg-[#F3F6F9] text-[#0A0A0A] font-medium border border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF] outline-none transition-all duration-200 rounded-none"
                      />
                    </div>

                    {/* Password Input Block with Eye SVG Icon */}
                    <div style={{ marginBottom: "24px" }}>
                      <label style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: 700, marginBottom: "12px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                        PASSWORD <span className="text-[#D92323]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          style={{ fontSize: "15px", padding: "18px 20px" }}
                          className="w-full bg-[#F3F6F9] text-[#0A0A0A] pr-12 font-medium border border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF] outline-none transition-all duration-200 rounded-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#0A0A0A] transition-colors focus:outline-none cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember me & Forgot password */}
                    <div style={{ marginTop: "12px", marginBottom: "36px" }} className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded-none border border-[#CCCCCC] appearance-none checked:bg-[#0A0A0A] bg-[#FFFFFF] cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[11px] checked:after:font-bold checked:after:left-[3px] checked:after:top-[-1px] transition-all"
                        />
                        <span style={{ fontSize: "13.5px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="text-[#555555] group-hover:text-[#0A0A0A] transition-colors font-normal">
                          Remember me
                        </span>
                      </label>

                      <Link
                        href="/forgot-password"
                        onClick={(e) => { e.preventDefault(); alert("Password reset protocol initiated via support archive."); }}
                        style={{ fontSize: "12px", letterSpacing: "0.14em", fontWeight: 700, fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className="uppercase text-[#0A0A0A] underline hover:opacity-60 transition-opacity"
                      >
                        FORGOT PASSWORD?
                      </Link>
                    </div>

                    {/* Primary Submit Button */}
                    <button
                      type="submit"
                      style={{ fontSize: "13px", letterSpacing: "0.3em", fontWeight: 700, padding: "20px 0", fontFamily: "'Inter', -apple-system, sans-serif" }}
                      className="w-full bg-[#0A0A0A] text-[#FFFFFF] uppercase rounded-none hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 cursor-pointer shadow-none block"
                    >
                      LOGIN
                    </button>
                  </form>

                  {/* ── SEPARATION TO REGISTRATION ARCHIVE ── */}
                  <div style={{ marginTop: "64px", paddingTop: "48px", borderTop: "1px solid #E6EBEE" }}>
                    <div
                      style={{ fontSize: "16px", letterSpacing: "0.14em", fontWeight: 700, marginBottom: "14px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                      className="uppercase text-[#0A0A0A]"
                    >
                      DO NOT HAVE AN ACCOUNT?
                    </div>
                    <p style={{ fontSize: "13.5px", lineHeight: "1.75", marginBottom: "36px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="text-[#666666] font-normal">
                      By creating a personal account, you will be able to checkout faster, save your shipping addresses, view and track your orders in your account and more.
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      style={{ fontSize: "13px", letterSpacing: "0.28em", fontWeight: 700, padding: "20px 0", fontFamily: "'Inter', -apple-system, sans-serif" }}
                      className="w-full bg-[#FFFFFF] text-[#0A0A0A] border-2 border-[#0A0A0A] uppercase rounded-none hover:bg-[#0A0A0A] hover:text-[#FFFFFF] transition-all duration-300 cursor-pointer block"
                    >
                      CREATE AN ACCOUNT
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* ── REGISTER STATE (FORM ON LEFT, PICTURE ON RIGHT) ── */
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full max-w-[500px]"
                >
                  <div
                    style={{ fontSize: "28px", letterSpacing: "0.06em", fontWeight: 800, marginBottom: "36px", lineHeight: "1.2", fontFamily: "'Inter', -apple-system, sans-serif" }}
                    className="uppercase text-[#0A0A0A]"
                  >
                    CREATE YOUR ACCOUNT
                  </div>

                  <form onSubmit={handleRegister}>
                    {/* First & Last Name side by side with requested placeholders */}
                    <div style={{ marginBottom: "24px", gap: "20px" }} className="grid grid-cols-1 sm:grid-cols-2">
                      <div>
                        <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                          FIRST NAME <span className="text-[#D92323]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Enter first name"
                          style={{ fontSize: "15px", padding: "16px 18px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                          className="w-full bg-[#F3F6F9] text-[#0A0A0A] font-medium border border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF] outline-none transition-all duration-200 rounded-none"
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                          LAST NAME <span className="text-[#D92323]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Enter last name"
                          style={{ fontSize: "15px", padding: "16px 18px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                          className="w-full bg-[#F3F6F9] text-[#0A0A0A] font-medium border border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF] outline-none transition-all duration-200 rounded-none"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div style={{ marginBottom: "24px" }}>
                      <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                        EMAIL ADDRESS <span className="text-[#D92323]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="name@example.com"
                        style={{ fontSize: "15px", padding: "16px 18px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className="w-full bg-[#F3F6F9] text-[#0A0A0A] font-medium border border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF] outline-none transition-all duration-200 rounded-none"
                      />
                    </div>

                    {/* Phone Number with Country Code Dropdown (Gen-spec generous padding so +62 never touches border) */}
                    <div style={{ marginBottom: "24px" }}>
                      <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                        PHONE NUMBER <span className="text-[#D92323]">*</span>
                      </label>
                      <div className="flex w-full border border-[#E0E6ED] focus-within:border-[#0A0A0A] transition-all duration-200 bg-[#F3F6F9]">
                        {/* Country Code Selector block with generous inline padding & min-width */}
                        <div
                          style={{
                            paddingLeft: "22px",
                            paddingRight: "28px",
                            minWidth: "145px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          className="relative bg-[#E9EEF3] border-r border-[#D5DCE4] select-none cursor-pointer flex-shrink-0"
                        >
                          <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: "'Inter', sans-serif" }} className="text-[#0A0A0A] flex items-center gap-2.5">
                            <span>{countryCode}</span>
                            <span style={{ fontSize: "9px" }} className="text-[#666666]">▼</span>
                            <span style={{ marginLeft: "2px" }} className="text-[#0A0A0A] font-mono font-bold">{phoneCountry}</span>
                          </span>
                          <select
                            value={countryCode}
                            onChange={(e) => {
                              const selected = countryOptions.find((c) => c.code === e.target.value);
                              if (selected) {
                                setCountryCode(selected.code);
                                setPhoneCountry(selected.dial);
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            aria-label="Select Country Code"
                          >
                            {countryOptions.map((item) => (
                              <option key={item.code} value={item.code}>
                                {item.code} ({item.dial}) - {item.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Number / Digital input box */}
                        <input
                          type="number"
                          inputMode="numeric"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="812-345-678"
                          style={{ fontSize: "15px", padding: "16px 18px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                          className="w-full bg-[#F3F6F9] text-[#0A0A0A] font-medium focus:bg-[#FFFFFF] outline-none rounded-none border-0 font-mono [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                        />
                      </div>
                    </div>

                    {/* Date of Birth Input */}
                    <div style={{ marginBottom: "24px" }}>
                      <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                        DATE OF BIRTH <span className="text-[#D92323]">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        style={{ fontSize: "15px", padding: "16px 18px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className="w-full bg-[#F3F6F9] text-[#0A0A0A] font-medium border border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF] outline-none transition-all duration-200 rounded-none uppercase cursor-pointer"
                      />
                    </div>

                    {/* Password & Confirm Password grid with Eye SVG Icons */}
                    <div style={{ marginBottom: "16px", gap: "20px" }} className="grid grid-cols-1 sm:grid-cols-2">
                      {/* Password */}
                      <div>
                        <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                          PASSWORD <span className="text-[#D92323]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? "text" : "password"}
                            required
                            minLength={8}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ fontSize: "15px", padding: "16px 18px" }}
                            className="w-full bg-[#F3F6F9] text-[#0A0A0A] pr-11 font-medium border border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF] outline-none transition-all duration-200 rounded-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#0A0A0A] transition-colors focus:outline-none cursor-pointer"
                            aria-label="Toggle password visibility"
                          >
                            {showRegPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                          CONFIRM PASSWORD <span className="text-[#D92323]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            minLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ fontSize: "15px", padding: "16px 18px" }}
                            className="w-full bg-[#F3F6F9] text-[#0A0A0A] pr-11 font-medium border border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF] outline-none transition-all duration-200 rounded-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#0A0A0A] transition-colors focus:outline-none cursor-pointer"
                            aria-label="Toggle confirm password visibility"
                          >
                            {showConfirmPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Security Requirement Spec Block */}
                    <div style={{ marginBottom: "28px", padding: "16px" }} className="bg-[#F4F7FB] border border-[#E0E6ED] rounded-none flex flex-col gap-2.5">
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                        <span style={{ fontSize: "10.5px", letterSpacing: "0.15em", fontWeight: 700 }} className="uppercase text-[#0A0A0A] font-mono">
                          [SECURITY PROTOCOL SPEC]
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 700 }} className={regPassword.length >= 8 ? "text-[#10B981]" : "text-[#777777]"}>
                          {regPassword.length >= 8 ? "✓ PROTOCOL SATISFIED" : "MIN. 8 CHARACTERS REQUIRED"}
                        </span>
                      </div>
                      <p style={{ fontSize: "12.5px", lineHeight: "1.6", fontFamily: "'Inter', -apple-system, sans-serif" }} className="text-[#555555]">
                        To authenticate for Archive Member access, your password must be at least <strong className="text-[#0A0A0A]">8 characters in length</strong>.
                      </p>
                      <div className="flex flex-wrap items-center gap-5 mt-0.5 text-[11.5px] text-[#666666] font-medium">
                        <span className={`flex items-center gap-1.5 transition-colors duration-200 ${regPassword.length >= 8 ? "text-[#0A0A0A] font-bold" : ""}`}>
                          <span className={regPassword.length >= 8 ? "text-[#10B981] font-bold" : "text-[#CCCCCC]"}>●</span> Minimum 8 characters
                        </span>
                        <span className={`flex items-center gap-1.5 transition-colors duration-200 ${/[0-9]/.test(regPassword) ? "text-[#0A0A0A] font-bold" : ""}`}>
                          <span className={/[0-9]/.test(regPassword) ? "text-[#10B981] font-bold" : "text-[#CCCCCC]"} >●</span> Includes at least 1 number
                        </span>
                      </div>
                    </div>

                    {/* Newsletter Checkbox */}
                    <div style={{ marginBottom: "36px", marginTop: "10px" }}>
                      <label className="flex items-start gap-3 cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-1 h-4 w-4 rounded-none border border-[#CCCCCC] appearance-none checked:bg-[#0A0A0A] bg-[#FFFFFF] cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[11px] checked:after:font-bold checked:after:left-[3px] checked:after:top-[-1px] transition-all flex-shrink-0"
                        />
                        <span style={{ fontSize: "13.5px", lineHeight: "1.7", fontFamily: "'Inter', -apple-system, sans-serif" }} className="text-[#666666] group-hover:text-[#0A0A0A] transition-colors font-normal">
                          I wish to subscribe to the newsletter for exclusive previews, new arrivals and collection archive stories.
                        </span>
                      </label>
                    </div>

                    {/* Primary Submit Button */}
                    <button
                      type="submit"
                      style={{ fontSize: "13px", letterSpacing: "0.3em", fontWeight: 700, padding: "20px 0", fontFamily: "'Inter', -apple-system, sans-serif" }}
                      className="w-full bg-[#0A0A0A] text-[#FFFFFF] uppercase rounded-none hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 cursor-pointer block"
                    >
                      CREATE ACCOUNT
                    </button>
                  </form>

                  {/* ── BACK TO LOGIN OPTION ── */}
                  <div style={{ marginTop: "52px", paddingTop: "40px", borderTop: "1px solid #E6EBEE" }}>
                    <p style={{ fontSize: "13.5px", marginBottom: "16px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="text-[#666666] font-normal">
                      Already have a personal account?
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      style={{ fontSize: "13px", letterSpacing: "0.28em", fontWeight: 700, padding: "20px 0", fontFamily: "'Inter', -apple-system, sans-serif" }}
                      className="w-full bg-[#FFFFFF] text-[#0A0A0A] border-2 border-[#0A0A0A] uppercase rounded-none hover:bg-[#0A0A0A] hover:text-[#FFFFFF] transition-all duration-300 cursor-pointer block"
                    >
                      LOG IN TO YOUR ACCOUNT
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
