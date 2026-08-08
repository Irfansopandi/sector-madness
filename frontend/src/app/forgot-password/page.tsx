"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Clock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authApiSendOtp, authApiVerifyOtp, authApiResetPassword } from "@/utils/api";

const InlineError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div style={{ marginTop: "6px", fontSize: "12.5px", fontFamily: "'Inter', -apple-system, sans-serif" }} className="flex items-center gap-1.5 text-[#D92323] font-semibold transition-all duration-200">
      <X size={12} strokeWidth={3} />
      <span>{message}</span>
    </div>
  );
};

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Steps: 1 = Email, 2 = OTP, 3 = Reset Password
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Step 1 State
  const [email, setEmail] = useState("");

  // Step 2 State (OTP)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState(0);

  // Step 3 State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer Effect for Resend OTP
  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // --- Handlers ---
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setErrors({ email: "Email is required." });
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: "Please enter a valid email address." });
      return;
    }

    setErrors({});
    setIsLoading(true);
    setSuccessMessage("");

    try {
      await authApiSendOtp({ email: email.trim() });
      setStep(2);
      setCooldown(60);
      setSuccessMessage(`Verification code sent to ${email}`);
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors({ email: "Email not registered in our system." });
      } else {
        setErrors({ email: err.response?.data?.message || "Failed to send OTP. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    clearError("otp");

    // Auto-advance
    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-verify when all 6 digits are filled
    if (value !== "" && index === 5 && newOtp.every((digit) => digit !== "")) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      clearError("otp");
      
      const nextIndex = Math.min(pastedData.length, 5);
      otpRefs.current[nextIndex]?.focus();

      if (pastedData.length === 6) {
        handleVerifyOtp(pastedData);
      }
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalOtp = codeToVerify || otp.join("");
    if (finalOtp.length < 6) {
      setErrors({ otp: "Please enter all 6 digits." });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await authApiVerifyOtp({ email: email.trim(), otp: finalOtp });
      setStep(3);
      setSuccessMessage("OTP verified successfully. Create your new password.");
    } catch (err: any) {
      setErrors({ otp: err.response?.data?.message || "Invalid OTP code." });
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await authApiResetPassword({
        email: email.trim(),
        otp: otp.join(""),
        password,
        password_confirmation: confirmPassword
      });
      setSuccessMessage("Password reset successfully. Redirecting to login...");
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err: any) {
      setErrors({ password: err.response?.data?.message || "Failed to reset password." });
      setIsLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: "'Inter', -apple-system, sans-serif" }} className="min-h-screen bg-white text-[#0A0A0A] flex flex-col">
      <Navbar mode="light" />

      <div style={{ paddingTop: "100px" }} className="flex-1 w-full max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-100px)] border-b border-[#E5E5E5]">
          
          {/* ── IMAGE COLUMN ── */}
          <div className="hidden lg:flex lg:col-span-6 relative bg-[#0A0A0A] overflow-hidden lg:min-h-full flex-col justify-end lg:order-1 border-r border-[#E5E5E5]">
            <Image
              src="/images/login/forgot.webp" // using a different aesthetic image if available, fallback handled in CSS if missing, but standard Next.js Image needs existing path. Using campaign-1 just to be safe if campaign-2 doesn't exist, wait, they have /images/campaign/campaign-1.png and /images/hero/hero-2.png
              alt="SECTOR MADNESS // RESET ARCHIVE"
              fill
              priority
              sizes="(max-w-[1024px]) 100vw, 50vw"
              className="object-cover object-top transition-all duration-700 ease-in-out opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/40 to-transparent pointer-events-none" />
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
                  PASSWORD RECOVERY // PROTOCOL 03
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
            <div className="w-full max-w-[480px]">
              
              <AnimatePresence mode="wait">
                {/* STEP 1: REQUEST OTP */}
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <h1 style={{ fontSize: "28px", letterSpacing: "0.06em", fontWeight: 800, marginBottom: "16px", lineHeight: "1.2" }} className="uppercase text-[#0A0A0A]">
                      FORGOT PASSWORD
                    </h1>
                    <p style={{ fontSize: "13.5px", lineHeight: "1.7", marginBottom: "36px", color: "#666666" }}>
                      Enter your registered email address. We will send you a 6-digit verification code to reset your password.
                    </p>

                    <form onSubmit={handleRequestOtp} noValidate>
                      <div style={{ marginBottom: "28px" }}>
                        <label style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: 700, marginBottom: "12px" }} className="block uppercase text-[#0A0A0A]">
                          EMAIL ADDRESS <span className="text-[#D92323]">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                          placeholder="name@example.com"
                          style={{ fontSize: "15px", padding: "18px 20px" }}
                          className={`w-full font-medium border focus:outline-none transition-all duration-200 rounded-none ${
                            errors.email ? "bg-[#FFF5F5] border-[#D92323] focus:border-[#D92323]" : "bg-[#F3F6F9] border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF]"
                          }`}
                        />
                        <InlineError message={errors.email} />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        style={{ fontSize: "13px", letterSpacing: "0.3em", fontWeight: 700, padding: "20px 0" }}
                        className="w-full bg-[#0A0A0A] text-[#FFFFFF] uppercase rounded-none hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? "SENDING CODE..." : "SEND VERIFICATION CODE"}
                      </button>
                      
                      <div className="mt-8 text-center border-t border-[#E6EBEE] pt-6">
                        <Link
                          href="/login"
                          style={{ fontSize: "12px", letterSpacing: "0.15em", fontWeight: 700 }}
                          className="group inline-flex items-center gap-2 uppercase text-[#555555] hover:text-[#B6A47E] transition-colors duration-200"
                        >
                          <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1.5" />
                          <span>RETURN TO LOGIN</span>
                        </Link>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* STEP 2: VERIFY OTP */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <h1 style={{ fontSize: "28px", letterSpacing: "0.06em", fontWeight: 800, marginBottom: "16px", lineHeight: "1.2" }} className="uppercase text-[#0A0A0A]">
                      ENTER OTP CODE
                    </h1>
                    <p style={{ fontSize: "13.5px", lineHeight: "1.7", marginBottom: "36px", color: "#666666" }}>
                      We have sent a 6-digit code to <strong className="text-[#0A0A0A]">{email}</strong>. Please enter the code below to verify your identity.
                    </p>

                    <div style={{ marginBottom: "36px" }}>
                      <div className="flex gap-2 sm:gap-3 justify-center" style={{ marginBottom: "24px" }}>
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => { otpRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={handleOtpPaste}
                            style={{ width: "clamp(40px, 12vw, 56px)", height: "clamp(50px, 14vw, 70px)", fontSize: "24px", fontFamily: "monospace", fontWeight: 700 }}
                            className={`text-center border outline-none transition-all duration-200 rounded-none bg-[#F3F6F9] focus:bg-[#FFFFFF] ${
                              errors.otp ? "border-[#D92323] text-[#D92323]" : "border-[#E0E6ED] focus:border-[#B6A47E] focus:ring-1 focus:ring-[#B6A47E] text-[#0A0A0A]"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-center">
                        <InlineError message={errors.otp} />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyOtp()}
                      disabled={isLoading || otp.some(d => d === "")}
                      style={{ fontSize: "13px", letterSpacing: "0.3em", fontWeight: 700, padding: "20px 0" }}
                      className="w-full bg-[#0A0A0A] text-[#FFFFFF] uppercase rounded-none hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 cursor-pointer disabled:opacity-50 mb-6"
                    >
                      {isLoading ? "VERIFYING..." : "VERIFY CODE"}
                    </button>

                    <div className="text-center border-t border-[#E6EBEE] pt-6 flex flex-col gap-4">
                      <p style={{ fontSize: "12.5px" }} className="text-[#666666]">
                        Didn't receive the code?
                      </p>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={cooldown > 0 || isLoading}
                        style={{ fontSize: "12px", letterSpacing: "0.15em", fontWeight: 700 }}
                        className="uppercase text-[#0A0A0A] disabled:text-[#AAAAAA] transition-colors cursor-pointer flex items-center justify-center gap-2 mx-auto"
                      >
                        {cooldown > 0 ? (
                          <>
                            <Clock size={14} />
                            <span>RESEND CODE IN 00:{cooldown < 10 ? `0${cooldown}` : cooldown}</span>
                          </>
                        ) : (
                          <span className="underline">RESEND CODE</span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: RESET PASSWORD */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <h1 style={{ fontSize: "28px", letterSpacing: "0.06em", fontWeight: 800, marginBottom: "16px", lineHeight: "1.2" }} className="uppercase text-[#0A0A0A]">
                      CREATE NEW PASSWORD
                    </h1>
                    {successMessage && !isLoading ? (
                       <div style={{ marginBottom: "36px" }} className="bg-[#0A0A0A] text-[#FFFFFF] p-3 md:p-5 flex items-center gap-2 md:gap-4 border-l-4 border-[#B6A47E] overflow-hidden">
                         <CheckCircle2 className="text-[#B6A47E] w-4 h-4 md:w-6 md:h-6 shrink-0" /> 
                         <span className="text-[8.5px] min-[390px]:text-[9.5px] sm:text-[11px] md:text-[12.5px] tracking-normal md:tracking-[0.1em] leading-[1.5] font-mono uppercase whitespace-nowrap truncate">{successMessage}</span>
                       </div>
                    ) : (
                      <p style={{ fontSize: "13.5px", lineHeight: "1.7", marginBottom: "36px", color: "#666666" }}>
                        Identity verified. Please enter your new password below. Make sure it's at least 8 characters long.
                      </p>
                    )}

                    <form onSubmit={handleResetPassword} noValidate>
                      <div style={{ marginBottom: "24px" }}>
                        <label style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: 700, marginBottom: "12px" }} className="block uppercase text-[#0A0A0A]">
                          NEW PASSWORD <span className="text-[#D92323]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                            placeholder="Enter new password"
                            style={{ fontSize: "15px", padding: "18px 20px" }}
                            className={`w-full font-mono pr-12 border focus:outline-none transition-all duration-200 rounded-none ${
                              errors.password ? "bg-[#FFF5F5] border-[#D92323] focus:border-[#D92323]" : "bg-[#F3F6F9] border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF]"
                            }`}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#0A0A0A] transition-colors focus:outline-none cursor-pointer">
                            {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                          </button>
                        </div>
                        <div style={{ marginTop: "10px", fontSize: "12px", fontWeight: 500 }} className={`flex items-center gap-1.5 transition-colors ${password.length >= 8 ? "text-[#27A163]" : password.length > 0 ? "text-[#D92323]" : "text-[#777777]"}`}>
                          {password.length >= 8 ? (
                             <CheckCircle2 size={13} strokeWidth={3} />
                          ) : (
                             <div className="w-1 h-1 rounded-full bg-current" />
                          )}
                          {password.length === 0 
                            ? "Minimum length is 8 characters." 
                            : password.length < 8 
                              ? `Too short! Needs ${8 - password.length} more characters.`
                              : "Password length is valid."}
                        </div>
                        <InlineError message={errors.password} />
                      </div>

                      <div style={{ marginBottom: "36px" }}>
                        <label style={{ fontSize: "11px", letterSpacing: "0.2em", fontWeight: 700, marginBottom: "12px" }} className="block uppercase text-[#0A0A0A]">
                          CONFIRM NEW PASSWORD <span className="text-[#D92323]">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                            placeholder="Re-enter new password"
                            style={{ fontSize: "15px", padding: "18px 20px" }}
                            className={`w-full font-mono pr-12 border focus:outline-none transition-all duration-200 rounded-none ${
                              errors.confirmPassword ? "bg-[#FFF5F5] border-[#D92323] focus:border-[#D92323]" : "bg-[#F3F6F9] border-[#E0E6ED] focus:border-[#0A0A0A] focus:bg-[#FFFFFF]"
                            }`}
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-[#0A0A0A] transition-colors focus:outline-none cursor-pointer">
                            {showConfirmPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                          </button>
                        </div>
                        <div style={{ marginTop: "10px", fontSize: "12px", fontWeight: 500 }} className={`flex items-center gap-1.5 transition-colors ${confirmPassword.length > 0 && confirmPassword === password ? "text-[#27A163]" : confirmPassword.length > 0 ? "text-[#D92323]" : "text-[#777777]"}`}>
                          {confirmPassword.length > 0 && confirmPassword === password ? (
                            <CheckCircle2 size={13} strokeWidth={3} />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-current" />
                          )}
                          {confirmPassword.length === 0
                            ? "Must exactly match the password above."
                            : confirmPassword !== password
                              ? "Passwords do not match."
                              : "Passwords match perfectly."}
                        </div>
                        <InlineError message={errors.confirmPassword} />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || successMessage.includes("Redirecting")}
                        style={{ fontSize: "13px", letterSpacing: "0.3em", fontWeight: 700, padding: "20px 0" }}
                        className="w-full bg-[#0A0A0A] text-[#FFFFFF] uppercase rounded-none hover:bg-[#B6A47E] hover:text-[#0A0A0A] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:bg-[#d4cdbd] disabled:text-[#888888]"
                      >
                        {isLoading ? "SAVING..." : "UPDATE PASSWORD"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
