"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authApiRegister, updateCustomerProfile } from "@/utils/api";

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

const InlineError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div style={{ marginTop: "6px", fontSize: "12.5px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="flex items-center gap-1.5 text-[#D92323] font-semibold transition-all duration-200">
      <span className="text-[11px]">❌</span>
      <span>{message}</span>
    </div>
  );
};

export default function RegisterPage() {
  const router = useRouter();

  // Registration Form States
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [countryCode, setCountryCode] = useState("ID");
  const [phoneCountry, setPhoneCountry] = useState("+62");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  
  // Inline Validation Errors State
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const clearError = (field: "fullName" | "email" | "phone" | "password" | "confirmPassword") => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const scrollToFirstError = (errObj: Record<string, any>) => {
    setTimeout(() => {
      const firstKey = Object.keys(errObj).find((k) => !!errObj[k]);
      if (firstKey) {
        const el = document.getElementById(`field-${firstKey}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const input = el.tagName === "INPUT" ? (el as HTMLInputElement) : el.querySelector("input");
          if (input && typeof input.focus === "function") {
            input.focus({ preventScroll: true });
          }
        }
      }
    }, 50);
  };

  // ── AUTH CHECK & REDIRECT ──
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || "/";

      const userData = localStorage.getItem("sector_madness_user");
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed?.loggedIn && localStorage.getItem("sector_madness_token")) {
          router.replace(redirectUrl);
        }
      }
    } catch {
      // ignore
    }
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    }

    if (!regEmail.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!phoneNumber.trim()) {
      newErrors.phone = "Phone Number is required.";
    } else if (phoneNumber.trim().length < 8) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (!regPassword) {
      newErrors.password = "Password is required.";
    } else if (regPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (regPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToFirstError(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    let cleanPhone = `${phoneCountry}${phoneNumber}`.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("620")) cleanPhone = "0" + cleanPhone.slice(3);
    else if (cleanPhone.startsWith("62")) cleanPhone = "0" + cleanPhone.slice(2);
    else if (cleanPhone && !cleanPhone.startsWith("0")) cleanPhone = "0" + cleanPhone;

    try {
      const res = await authApiRegister({
        name: fullName.trim() || regEmail.split("@")[0],
        email: regEmail.trim(),
        password: regPassword,
        phone: cleanPhone,
        birth_date: dateOfBirth || undefined,
      });

      if (res.status && res.token && res.user) {
        localStorage.setItem("sector_madness_token", res.token);
        
        const userObj = {
          id: res.user.id,
          email: res.user.email,
          name: res.user.name,
          phone: res.user.phone || cleanPhone,
          dob: res.user.birth_date || dateOfBirth || "",
          loggedIn: true,
          token: res.token,
          joinedAt: res.user.created_at || new Date().toISOString(),
        };
        localStorage.setItem("sector_madness_user", JSON.stringify(userObj));

        try {
          await updateCustomerProfile({
            name: userObj.name,
            email: userObj.email,
            phone: userObj.phone,
            birth_date: userObj.dob,
          } as any);
        } catch {}

        window.dispatchEvent(new Event("sector_auth_change"));

        const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/";
        router.push(redirectUrl);
      } else {
        const errObj = { email: "Email already exists." };
        setErrors(errObj);
        scrollToFirstError(errObj);
      }
    } catch (err: any) {
      let errObj: Record<string, string> = {};
      if (err.response?.data?.errors?.email) {
        errObj = { email: "Email already exists." };
      } else if (err.response?.data?.message?.toLowerCase().includes("email") || err.response?.data?.message?.toLowerCase().includes("taken")) {
        errObj = { email: "Email already exists." };
      } else {
        errObj = { email: "Registration failed. Please check your inputs and try again." };
      }
      setErrors(errObj);
      scrollToFirstError(errObj);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      className="min-h-screen bg-white text-[#0A0A0A] flex flex-col selection:bg-[#B6A47E] selection:text-[#0A0A0A]"
    >
      <Navbar mode="light" />

      {/* ── REGISTER SPLIT SCREEN ── */}
      <div style={{ paddingTop: "100px" }} className="flex-1 w-full max-w-[1920px] mx-auto bg-white text-[#0A0A0A]">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-100px)] border-b border-[#E5E5E5]">
          
          {/* ── EDITORIAL CAMPAIGN PHOTOGRAPH COLUMN ── */}
          <div className="hidden lg:flex lg:col-span-6 relative bg-[#0A0A0A] overflow-hidden lg:min-h-full flex-col justify-end lg:order-2 border-l border-[#E5E5E5]">
            <Image
              src="/images/login/register.webp"
              alt="SECTOR MADNESS // TECHNICAL GARMENT"
              fill
              priority
              sizes="(max-w-[1024px]) 100vw, 50vw"
              className="object-cover object-top transition-all duration-700 ease-in-out"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/20 to-transparent pointer-events-none" />

            <div
              style={{
                paddingLeft: "clamp(15px, 5vw, 25px)",
                paddingRight: "clamp(15px, 5vw, 25px)",
                paddingTop: "15px",
                paddingBottom: "15px",
              }}
              className="relative z-10 border-t border-[#FFFFFF]/15 flex items-end justify-between gap-4"
            >
              <div>
                <p style={{ fontSize: "11px", letterSpacing: "0.25em", fontWeight: 700, marginBottom: "6px" }} className="uppercase text-[#FFFFFF] font-mono">
                  [SM//2026 ARCHIVE LABS]
                </p>
                <p style={{ fontSize: "12px", letterSpacing: "0.12em" }} className="uppercase text-[#A0A0A0] font-mono">
                  MEMBER REGISTRATION // PROTOCOL 02
                </p>
              </div>
              <div className="hidden sm:block">
                <span className="inline-block px-3 py-1.5 bg-white/10 text-[#FFFFFF] text-[10px] uppercase tracking-[0.2em] backdrop-blur-md border border-white/20 font-mono">
                  LAB TESTED CERTIFIED
                </span>
              </div>
            </div>
          </div>

          {/* ── FORM COLUMN ── */}
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
            className="lg:col-span-6 w-full lg:order-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-[500px]"
            >
              <div
                style={{ fontSize: "28px", letterSpacing: "0.06em", fontWeight: 800, marginBottom: "36px", lineHeight: "1.2", fontFamily: "'Inter', -apple-system, sans-serif" }}
                className="uppercase text-[#0A0A0A]"
              >
                CREATE YOUR ACCOUNT
              </div>

              <form onSubmit={handleRegister} noValidate>
                <div id="field-fullName" style={{ marginBottom: "24px" }}>
                  <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                    FULL NAME <span className="text-[#D92323]">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearError("fullName");
                    }}
                    placeholder="Enter your name"
                    style={{ fontSize: "15px", padding: "16px 18px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                    className={`w-full text-[#0A0A0A] font-medium border outline-none transition-all duration-200 rounded-none ${
                      errors.fullName ? "bg-[#FFF5F5] border-[#D92323] focus:border-[#D92323]" : "bg-[#F3F6F9] border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF]"
                    }`}
                  />
                  <InlineError message={errors.fullName} />
                </div>

                <div id="field-email" style={{ marginBottom: "24px" }}>
                  <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                    EMAIL ADDRESS <span className="text-[#D92323]">*</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      clearError("email");
                    }}
                    placeholder="Enter your email"
                    style={{ fontSize: "15px", padding: "16px 18px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                    className={`w-full text-[#0A0A0A] font-medium border outline-none transition-all duration-200 rounded-none ${
                      errors.email ? "bg-[#FFF5F5] border-[#D92323] focus:border-[#D92323]" : "bg-[#F3F6F9] border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF]"
                    }`}
                  />
                  <InlineError message={errors.email} />
                </div>

                <div id="field-phone" style={{ marginBottom: "24px" }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                      COUNTRY / REGION <span className="text-[#D92323]">*</span>
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                        style={{ fontSize: "14px", padding: "16px 18px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className="w-full bg-[#F3F6F9] text-[#0A0A0A] font-medium border border-[#E0E6ED] outline-none cursor-pointer flex items-center justify-between transition-all duration-200 rounded-none hover:border-[#0A0A0A]"
                      >
                        <span className="truncate">
                          {countryOptions.find(c => c.code === countryCode)?.name} ({countryOptions.find(c => c.code === countryCode)?.dial})
                        </span>
                        <span className="text-[#0A0A0A] font-bold text-sm pointer-events-none transition-transform duration-200 ml-2" style={{ transform: isCountryDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                          ▼
                        </span>
                      </div>

                      {isCountryDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsCountryDropdownOpen(false)} 
                          />
                          <div className="absolute top-full left-0 w-full mt-1 bg-[#FFFFFF] border border-[#E0E6ED] z-50 shadow-lg max-h-[250px] overflow-y-auto py-2">
                            {countryOptions.map((c) => (
                              <div
                                key={c.code}
                                onClick={() => {
                                  setCountryCode(c.code);
                                  setPhoneCountry(c.dial);
                                  setIsCountryDropdownOpen(false);
                                }}
                                style={{ padding: "10px 18px" }}
                                className={`cursor-pointer text-[14px] font-medium transition-colors ${
                                  countryCode === c.code 
                                    ? "bg-[#F3F6F9] text-[#0A0A0A]" 
                                    : "text-[#555555] hover:bg-[#F9FAFB] hover:text-[#0A0A0A]"
                                }`}
                              >
                                {c.name} ({c.dial})
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                      PHONE NUMBER <span className="text-[#D92323]">*</span>
                    </label>
                    <div className="flex">
                      <span style={{ fontSize: "14px", padding: "16px 14px" }} className={`text-[#0A0A0A] font-mono font-semibold border border-r-0 flex items-center transition-all duration-200 ${errors.phone ? "bg-[#FFE0E0] border-[#D92323]" : "bg-[#E5E9EE] border-[#E0E6ED]"}`}>
                        {phoneCountry}
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""));
                          clearError("phone");
                        }}
                        placeholder="Enter your phone number"
                        style={{ fontSize: "15px", padding: "16px 18px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                        className={`w-full text-[#0A0A0A] font-medium border outline-none transition-all duration-200 rounded-none font-mono ${
                          errors.phone ? "bg-[#FFF5F5] border-[#D92323] focus:border-[#D92323]" : "bg-[#F3F6F9] border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF]"
                        }`}
                      />
                    </div>
                    <InlineError message={errors.phone} />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                    DATE OF BIRTH <span className="text-[#888888] font-normal">(OPTIONAL)</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    style={{ fontSize: "14px", padding: "16px 18px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                    className="w-full bg-[#F3F6F9] text-[#0A0A0A] font-medium border border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF] outline-none transition-all duration-200 rounded-none"
                  />
                </div>

                <div id="field-password" style={{ marginBottom: "24px" }}>
                  <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                    CREATE PASSWORD <span className="text-[#D92323]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        clearError("password");
                      }}
                      placeholder="Enter your password"
                      style={{ fontSize: "15px", padding: "16px 18px" }}
                      className={`w-full text-[#0A0A0A] pr-12 font-medium border outline-none transition-all duration-200 rounded-none font-mono ${
                        errors.password ? "bg-[#FFF5F5] border-[#D92323] focus:border-[#D92323]" : "bg-[#F3F6F9] border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#0A0A0A] transition-colors focus:outline-none cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showRegPassword ? (
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
                  {errors.password ? (
                    <InlineError message={errors.password} />
                  ) : (
                    <p style={{ fontSize: "12px", marginTop: "8px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="text-[#666666] font-normal flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-[#888888]">
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                      </svg>
                      Must be at least 8 characters in length.
                    </p>
                  )}
                </div>

                <div id="field-confirmPassword" style={{ marginBottom: "32px" }}>
                  <label style={{ fontSize: "11px", letterSpacing: "0.18em", fontWeight: 700, marginBottom: "10px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                    CONFIRM PASSWORD <span className="text-[#D92323]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearError("confirmPassword");
                      }}
                      placeholder="Enter your password again"
                      style={{ fontSize: "15px", padding: "16px 18px" }}
                      className={`w-full text-[#0A0A0A] pr-12 font-medium border outline-none transition-all duration-200 rounded-none font-mono ${
                        errors.confirmPassword ? "bg-[#FFF5F5] border-[#D92323] focus:border-[#D92323]" : "bg-[#F3F6F9] border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#0A0A0A] transition-colors focus:outline-none cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? (
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
                  {errors.confirmPassword ? (
                    <InlineError message={errors.confirmPassword} />
                  ) : (
                    <p style={{ fontSize: "12px", marginTop: "8px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="text-[#666666] font-normal flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-[#888888]">
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                      </svg>
                      Must match the password entered above (min. 8 characters).
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: "36px" }}>
                  <label className="flex items-start gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 mt-0.5 rounded-none border border-[#CCCCCC] appearance-none checked:bg-[#0A0A0A] bg-[#FFFFFF] cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[11px] checked:after:font-bold checked:after:left-[3px] checked:after:top-[-1px] transition-all flex-shrink-0"
                    />
                    <span style={{ fontSize: "13.5px", lineHeight: "1.7", fontFamily: "'Inter', -apple-system, sans-serif" }} className="text-[#666666] group-hover:text-[#0A0A0A] transition-colors font-normal">
                      I wish to subscribe to the newsletter for exclusive previews, new arrivals and collection archive stories.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ fontSize: "13px", letterSpacing: "0.3em", fontWeight: 700, padding: "20px 0", fontFamily: "'Inter', -apple-system, sans-serif" }}
                  className="w-full bg-[#0A0A0A] text-[#FFFFFF] uppercase rounded-none hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 cursor-pointer block disabled:opacity-50"
                >
                  {isLoading ? "PROCESING..." : "CREATE ACCOUNT"}
                </button>
              </form>

              <div style={{ marginTop: "32px", paddingTop: "28px", borderTop: "1px solid #E6EBEE" }}>
                <p style={{ fontSize: "13.5px", marginBottom: "16px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="text-[#666666] font-normal">
                  Already have a personal account?
                </p>
                <Link
                  href="/login"
                  style={{ fontSize: "13px", letterSpacing: "0.28em", fontWeight: 700, padding: "20px 0", fontFamily: "'Inter', -apple-system, sans-serif" }}
                  className="w-full bg-[#FFFFFF] text-[#0A0A0A] border-2 border-[#0A0A0A] uppercase rounded-none hover:bg-[#0A0A0A] hover:text-[#FFFFFF] transition-all duration-300 cursor-pointer block text-center"
                >
                  LOG IN TO YOUR ACCOUNT
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
