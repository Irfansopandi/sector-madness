"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authApiLogin } from "@/utils/api";

const InlineError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div style={{ marginTop: "6px", fontSize: "12.5px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="flex items-center gap-1.5 text-[#D92323] font-semibold transition-all duration-200">
      <span className="text-[11px]">❌</span>
      <span>{message}</span>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();

  // Login Form States
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Inline Validation Errors State
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const clearError = (field: "email" | "password") => {
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

      if (params.get("mode") === "register") {
        router.replace(`/register?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }

      const userData = localStorage.getItem("sector_madness_user");
      const token = localStorage.getItem("sector_madness_token");
      if (userData && token) {
        const parsed = JSON.parse(userData);
        if (parsed?.loggedIn) {
          router.replace(redirectUrl);
        }
      }
    } catch {
      // ignore
    }
  }, [router]);

  // ── AUTHENTICATION HANDLERS ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!userEmail.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToFirstError(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const res = await authApiLogin({ email: userEmail.trim(), password });
      
      if (res.status && res.token && res.user) {
        localStorage.setItem("sector_madness_token", res.token);
        
        const isAdmin = !!res.is_admin || !!res.user?.is_admin || res.user?.role === "admin" || res.role === "admin" || res.user?.role === "administrator";
        const userObj = {
          id: res.user.id,
          email: res.user.email,
          name: res.user.name || userEmail.split("@")[0],
          phone: res.user.phone || "",
          dob: res.user.birth_date || res.user.dob || "",
          role: res.user.role || (isAdmin ? "admin" : "customer"),
          loggedIn: true,
          isAdmin: isAdmin,
          token: res.token,
          joinedAt: res.user.created_at || new Date().toISOString(),
        };
        localStorage.setItem("sector_madness_user", JSON.stringify(userObj));
        window.dispatchEvent(new Event("sector_auth_change"));
        window.dispatchEvent(new Event("sector_bag_update"));

        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = isAdmin
          ? "/admin"
          : (urlParams.get("redirect") || "/");

        router.push(redirectUrl);
      } else {
        const errObj = { password: "Invalid email or password." };
        setErrors(errObj);
        scrollToFirstError(errObj);
      }
    } catch (err: any) {
      let errObj: { email?: string; password?: string } = {};
      if (err.response?.data?.error_type === "email_not_found") {
        errObj = { email: "Email address is not registered in our system." };
      } else if (err.response?.data?.error_type === "wrong_password") {
        errObj = { password: "Incorrect password. Please check and try again." };
      } else if (err.response?.data?.message === "Validation Error") {
        const apiErrs = err.response.data.errors || {};
        errObj = {
          email: apiErrs.email?.[0] ? "Please enter a valid email address." : undefined,
          password: apiErrs.password?.[0] ? "Password is required." : undefined,
        };
      } else {
        errObj = { password: "Invalid email or password." };
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

      {/* ── LOGIN SPLIT SCREEN ── */}
      <div style={{ paddingTop: "100px" }} className="flex-1 w-full max-w-[1920px] mx-auto bg-white text-[#0A0A0A]">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-100px)] border-b border-[#E5E5E5]">
          
          {/* ── EDITORIAL CAMPAIGN PHOTOGRAPH COLUMN ── */}
          <div className="lg:col-span-6 relative bg-[#0A0A0A] overflow-hidden min-h-[580px] lg:min-h-full flex flex-col justify-end lg:order-1 border-r border-[#E5E5E5]">
            <Image
              src="/images/campaign/campaign-1.png"
              alt="SECTOR MADNESS // TECHNICAL GARMENT"
              fill
              priority
              sizes="(max-w-[1024px]) 100vw, 50vw"
              className="object-cover object-top transition-all duration-700 ease-in-out"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/85 via-[#0A0A0A]/20 to-transparent pointer-events-none" />

            <div className="relative z-10 p-8 md:p-12 border-t border-[#FFFFFF]/15 flex items-end justify-between gap-4">
              <div>
                <p style={{ fontSize: "11px", letterSpacing: "0.25em", fontWeight: 700, marginBottom: "6px" }} className="uppercase text-[#FFFFFF] font-mono">
                  [SM//2026 ARCHIVE LABS]
                </p>
                <p style={{ fontSize: "12px", letterSpacing: "0.12em" }} className="uppercase text-[#A0A0A0] font-mono">
                  MEMBER ACCESS // PROTOCOL 01
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
            className="lg:col-span-6 w-full lg:order-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-[480px]"
            >
              <div
                style={{ fontSize: "28px", letterSpacing: "0.06em", fontWeight: 800, marginBottom: "36px", lineHeight: "1.2", fontFamily: "'Inter', -apple-system, sans-serif" }}
                className="uppercase text-[#0A0A0A]"
              >
                LOG IN TO YOUR ACCOUNT
              </div>

              <form onSubmit={handleLogin} noValidate>
                <div id="field-email" style={{ marginBottom: "28px" }}>
                  <label style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: 700, marginBottom: "12px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                    EMAIL ADDRESS <span className="text-[#D92323]">*</span>
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => {
                      setUserEmail(e.target.value);
                      clearError("email");
                    }}
                    placeholder="name@example.com"
                    style={{ fontSize: "15px", padding: "18px 20px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                    className={`w-full text-[#0A0A0A] font-medium border focus:outline-none transition-all duration-200 rounded-none ${
                      errors.email ? "bg-[#FFF5F5] border-[#D92323] focus:border-[#D92323]" : "bg-[#F3F6F9] border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF]"
                    }`}
                  />
                  <InlineError message={errors.email} />
                </div>

                <div id="field-password" style={{ marginBottom: "24px" }}>
                  <label style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: 700, marginBottom: "12px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="block uppercase text-[#0A0A0A]">
                    PASSWORD <span className="text-[#D92323]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError("password");
                      }}
                      placeholder="••••••••"
                      style={{ fontSize: "15px", padding: "18px 20px" }}
                      className={`w-full text-[#0A0A0A] pr-12 font-medium border focus:outline-none transition-all duration-200 rounded-none font-mono ${
                        errors.password ? "bg-[#FFF5F5] border-[#D92323] focus:border-[#D92323]" : "bg-[#F3F6F9] border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF]"
                      }`}
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
                  <InlineError message={errors.password} />
                </div>

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
                    style={{ fontSize: "12px", letterSpacing: "0.14em", fontWeight: 700, fontFamily: "'Inter', -apple-system, sans-serif" }}
                    className="uppercase text-[#0A0A0A] underline hover:opacity-60 transition-opacity"
                  >
                    FORGOT PASSWORD?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ fontSize: "13px", letterSpacing: "0.3em", fontWeight: 700, padding: "20px 0", fontFamily: "'Inter', -apple-system, sans-serif" }}
                  className="w-full bg-[#0A0A0A] text-[#FFFFFF] uppercase rounded-none hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 cursor-pointer shadow-none block disabled:opacity-50"
                >
                  {isLoading ? "VERIFYING..." : "LOGIN"}
                </button>
              </form>

              <div style={{ marginTop: "32px", paddingTop: "28px", borderTop: "1px solid #E6EBEE" }}>
                <div
                  style={{ fontSize: "16px", letterSpacing: "0.14em", fontWeight: 700, marginBottom: "12px", fontFamily: "'Inter', -apple-system, sans-serif" }}
                  className="uppercase text-[#0A0A0A]"
                >
                  DO NOT HAVE AN ACCOUNT?
                </div>
                <p style={{ fontSize: "13.5px", lineHeight: "1.7", marginBottom: "24px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="text-[#666666] font-normal">
                  By creating a personal account, you will be able to checkout faster, save your shipping addresses, view and track your orders in your account and more.
                </p>

                <Link
                  href="/register"
                  style={{ fontSize: "13px", letterSpacing: "0.28em", fontWeight: 700, padding: "20px 0", fontFamily: "'Inter', -apple-system, sans-serif" }}
                  className="w-full bg-[#FFFFFF] text-[#0A0A0A] border-2 border-[#0A0A0A] uppercase rounded-none hover:bg-[#0A0A0A] hover:text-[#FFFFFF] transition-all duration-300 cursor-pointer block text-center"
                >
                  CREATE AN ACCOUNT
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
