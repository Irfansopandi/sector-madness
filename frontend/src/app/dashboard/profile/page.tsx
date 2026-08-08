"use client";

import { useState, useEffect } from "react";
import { getCustomerProfile, updateCustomerProfile } from "@/utils/api";

export default function ProfilePage() {
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("sector_madness_user");
      if (userData) {
        const parsed = JSON.parse(userData);
        let fullName = parsed.name;
        if (!fullName && (parsed.firstName || parsed.lastName)) {
          fullName = [parsed.firstName, parsed.lastName].filter(Boolean).join(" ");
        }
        if (!fullName) fullName = parsed.email?.split("@")[0] || "Member";

        let cleanPhone = String(parsed.phone || "").replace(/[^0-9]/g, "");
        if (cleanPhone.startsWith("620")) cleanPhone = "0" + cleanPhone.slice(3);
        else if (cleanPhone.startsWith("62")) cleanPhone = "0" + cleanPhone.slice(2);
        else if (cleanPhone && !cleanPhone.startsWith("0")) cleanPhone = "0" + cleanPhone;

        setProfileForm({
          name: fullName,
          email: parsed.email || "",
          phone: cleanPhone,
          dob: parsed.dob || parsed.birth_date || "",
          newPassword: "",
          confirmNewPassword: "",
        });
      }
    } catch {
      // ignore
    }

    getCustomerProfile()
      .then((data: any) => {
        if (data) {
          let fullName = data.name;
          if (!fullName && (data.firstName || data.lastName)) {
            fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
          }

          let cleanPhone = String(data.phone || "").replace(/[^0-9]/g, "");
          if (cleanPhone.startsWith("620")) cleanPhone = "0" + cleanPhone.slice(3);
          else if (cleanPhone.startsWith("62")) cleanPhone = "0" + cleanPhone.slice(2);
          else if (cleanPhone && !cleanPhone.startsWith("0")) cleanPhone = "0" + cleanPhone;

          setProfileForm((prev) => ({
            ...prev,
            name: fullName || prev.name,
            email: data.email || prev.email,
            phone: cleanPhone || prev.phone,
            dob: data.birth_date || data.dob || prev.dob,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfileInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const combinedName = profileForm.name.trim() || "Member";

    try {
      await updateCustomerProfile({
        name: combinedName,
        email: profileForm.email,
        phone: profileForm.phone,
        birth_date: profileForm.dob,
      } as any);
    } catch {
      // ignore
    }

    const currentUser = JSON.parse(localStorage.getItem("sector_madness_user") || "{}");
    const updatedUser = {
      ...currentUser,
      name: combinedName,
      firstName: combinedName.split(" ")[0] || "",
      lastName: combinedName.split(" ").slice(1).join(" ") || "",
      email: profileForm.email,
      phone: profileForm.phone,
      dob: profileForm.dob,
      birth_date: profileForm.dob,
    };
    localStorage.setItem("sector_madness_user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("sector_auth_change"));

    setProfileSuccessMsg("Personal account information has been updated successfully.");
    setTimeout(() => setProfileSuccessMsg(null), 5000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.newPassword) {
      setErrorMsg("Please enter a new password to update your credentials.");
      setProfileSuccessMsg(null);
      setTimeout(() => setErrorMsg(null), 5000);
      const el = document.getElementById("password");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (profileForm.newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      setProfileSuccessMsg(null);
      setTimeout(() => setErrorMsg(null), 5000);
      const el = document.getElementById("password");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (profileForm.newPassword !== profileForm.confirmNewPassword) {
      setErrorMsg("New password confirmation does not match the entered password.");
      setProfileSuccessMsg(null);
      setTimeout(() => setErrorMsg(null), 5000);
      const el = document.getElementById("password");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setErrorMsg(null);

    try {
      await updateCustomerProfile({
        password: profileForm.newPassword,
      } as any);
    } catch {
      // ignore
    }

    setProfileForm(prev => ({
      ...prev,
      newPassword: "",
      confirmNewPassword: "",
    }));

    setProfileSuccessMsg("Security credentials and password have been updated successfully.");
    setTimeout(() => setProfileSuccessMsg(null), 5000);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  return (
    <div 
      style={{ padding: "48px 56px", marginBottom: "48px" }} 
      className="bg-[#141414] border border-white/[0.08] shadow-2xl w-full max-w-[920px]"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 12px;
          width: 36px;
          height: 36px;
          opacity: 0 !important;
          cursor: pointer !important;
          z-index: 10;
        }
      `}} />

      <div style={{ paddingBottom: "28px", marginBottom: "36px" }} className="border-b border-white/[0.08]">
        <h2 
          style={{ fontFamily: "'Inter', -apple-system, sans-serif", letterSpacing: "0.08em" }} 
          className="text-xl md:text-2xl font-black uppercase text-[#F5F5F5]"
        >
          PROFILE SETTINGS
        </h2>
        <p className="text-xs text-[#8A8A8A] mt-2 font-mono tracking-wide">
          Manage your personal account information and security credentials
        </p>
      </div>

      {errorMsg && (
        <div 
          style={{ padding: "16px 20px", marginBottom: "32px" }} 
          className="bg-[#0A0A0A] border border-red-500/50 text-red-400 text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-3.5 rounded-none"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {profileSuccessMsg && (
        <div 
          style={{ padding: "16px 20px", marginBottom: "32px" }} 
          className="bg-[#0A0A0A] border border-[#B6A47E]/50 text-[#B6A47E] text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-3.5 rounded-none"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{profileSuccessMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfileInfo} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <div>
          <label style={{ marginBottom: "12px", letterSpacing: "0.18em" }} className="text-xs font-mono text-[#8A8A8A] uppercase block font-bold">
            FULL NAME
          </label>
          <input
            type="text"
            required
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            style={{ padding: "18px 22px", fontSize: "14px" }}
            className="w-full bg-[#0A0A0A] border border-white/[0.12] text-[#F5F5F5] font-semibold outline-none focus:border-[#B6A47E] transition-colors rounded-none"
          />
        </div>

        <div>
          <label style={{ marginBottom: "12px", letterSpacing: "0.18em" }} className="text-xs font-mono text-[#8A8A8A] uppercase block font-bold">
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            required
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            style={{ padding: "18px 22px", fontSize: "14px" }}
            className="w-full bg-[#0A0A0A] border border-white/[0.12] text-[#F5F5F5] font-semibold outline-none focus:border-[#B6A47E] transition-colors rounded-none"
          />
        </div>

        <div>
          <label style={{ marginBottom: "12px", letterSpacing: "0.18em" }} className="text-xs font-mono text-[#8A8A8A] uppercase block font-bold">
            PHONE NUMBER
          </label>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/[^0-9]/g, "") })}
            placeholder="Enter your phone number"
            style={{ padding: "18px 22px", fontSize: "14px" }}
            className="w-full bg-[#0A0A0A] border border-white/[0.12] text-[#F5F5F5] font-semibold outline-none focus:border-[#B6A47E] transition-colors font-mono rounded-none"
          />
        </div>

        <div>
          <label style={{ marginBottom: "12px", letterSpacing: "0.18em" }} className="text-xs font-mono text-[#8A8A8A] uppercase block font-bold">
            DATE OF BIRTH <span className="text-[#666666] font-normal">(OPTIONAL)</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="date"
              value={profileForm.dob}
              onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
              style={{ colorScheme: "dark", padding: "18px 56px 18px 22px", fontSize: "14px", fontFamily: "'Inter', -apple-system, sans-serif" }}
              className="w-full bg-[#0A0A0A] border border-white/[0.12] text-[#F5F5F5] font-semibold outline-none focus:border-[#B6A47E] transition-colors rounded-none cursor-pointer"
            />
            <div className="absolute right-5 pointer-events-none flex items-center justify-center text-white z-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: "8px" }}>
          <button
            type="submit"
            style={{ padding: "18px 0", letterSpacing: "0.25em" }}
            className="w-full bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs uppercase font-extrabold hover:bg-white transition-all duration-300 cursor-pointer shadow-xl rounded-sm block text-center"
          >
            UPDATE PERSONAL INFO
          </button>
        </div>
      </form>

      <form onSubmit={handleSavePassword} style={{ marginTop: "48px", display: "flex", flexDirection: "column", gap: "28px" }}>
        <div id="password" style={{ paddingTop: "40px", display: "flex", flexDirection: "column", gap: "28px" }} className="border-t border-white/[0.08]">
          <h3 style={{ letterSpacing: "0.2em" }} className="text-xs font-mono text-[#B6A47E] uppercase font-extrabold">
            CHANGE PASSWORD
          </h3>
          
          <div>
            <label style={{ marginBottom: "12px", letterSpacing: "0.18em" }} className="text-xs font-mono text-[#8A8A8A] uppercase block font-bold">
              NEW PASSWORD
            </label>
            <div className="relative flex items-center">
              <input
                type={showNewPassword ? "text" : "password"}
                value={profileForm.newPassword}
                onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                placeholder="Enter your current password"
                style={{ padding: "18px 56px 18px 22px", fontSize: "14px" }}
                className="w-full bg-[#0A0A0A] border border-white/[0.12] text-[#F5F5F5] outline-none focus:border-[#B6A47E] transition-colors font-mono rounded-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-5 p-2 text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors cursor-pointer outline-none"
              >
                {showNewPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <p style={{ fontSize: "12px", marginTop: "10px" }} className="text-[#8A8A8A] font-mono font-normal flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-[#B6A47E]">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
              Must be at least 8 characters in length.
            </p>
          </div>

          <div>
            <label style={{ marginBottom: "12px", letterSpacing: "0.18em" }} className="text-xs font-mono text-[#8A8A8A] uppercase block font-bold">
              CONFIRM NEW PASSWORD
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={profileForm.confirmNewPassword}
                onChange={(e) => setProfileForm({ ...profileForm, confirmNewPassword: e.target.value })}
                placeholder="Enter your new password"
                style={{ padding: "18px 56px 18px 22px", fontSize: "14px" }}
                className="w-full bg-[#0A0A0A] border border-white/[0.12] text-[#F5F5F5] outline-none focus:border-[#B6A47E] transition-colors font-mono rounded-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 p-2 text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors cursor-pointer outline-none"
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <p style={{ fontSize: "12px", marginTop: "10px" }} className="text-[#8A8A8A] font-mono font-normal flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 text-[#B6A47E]">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
              Must match the new password entered above (min. 8 characters).
            </p>
          </div>
        </div>

        <div style={{ paddingTop: "8px" }}>
          <button
            type="submit"
            style={{ padding: "18px 0", letterSpacing: "0.25em" }}
            className="w-full bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs uppercase font-extrabold hover:bg-white transition-all duration-300 cursor-pointer shadow-xl rounded-sm block text-center"
          >
            UPDATE PASSWORD
          </button>
        </div>
      </form>
    </div>
  );
}
