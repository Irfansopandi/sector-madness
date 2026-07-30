"use client";

import { useState, useEffect } from "react";
import { getCustomerProfile, updateCustomerProfile } from "@/utils/api";

export default function ProfilePage() {
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("sector_madness_user");
      if (userData) {
        const parsed = JSON.parse(userData);
        const fullName =
          [parsed.firstName, parsed.lastName].filter(Boolean).join(" ") ||
          parsed.name ||
          parsed.email?.split("@")[0] ||
          "Member";
        setProfileForm({
          name: fullName,
          email: parsed.email || "",
          phone: parsed.phone || "",
          newPassword: "",
          confirmNewPassword: "",
        });
      }
    } catch {
      // ignore
    }

    getCustomerProfile()
      .then((data) => {
        if (data) {
          setProfileForm((prev) => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveProfileForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmNewPassword) {
      alert("Konfirmasi password baru tidak cocok.");
      return;
    }

    try {
      await updateCustomerProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
      });
    } catch {
      // ignore
    }

    const currentUser = JSON.parse(localStorage.getItem("sector_madness_user") || "{}");
    const updatedUser = {
      ...currentUser,
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
    };
    localStorage.setItem("sector_madness_user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("sector_auth_change"));

    setProfileSuccessMsg("Perubahan informasi akun berhasil disimpan.");
    setTimeout(() => setProfileSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-[#141414] border border-white/[0.08] p-8 md:p-10 lg:p-12 space-y-8 shadow-2xl">
      <div className="border-b border-white/[0.08] pb-6">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#F5F5F5]">PROFILE SETTINGS</h2>
        <p className="text-xs text-[#8A8A8A] mt-1 font-mono">Kelola informasi pribadi dan kata sandi akun Anda</p>
      </div>

      {profileSuccessMsg && (
        <div className="p-4 bg-[#B6A47E]/10 border border-[#B6A47E]/30 text-[#B6A47E] text-xs font-mono font-bold">
          ✓ {profileSuccessMsg}
        </div>
      )}

      <form onSubmit={handleSaveProfileForm} className="space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest block font-bold">
            Nama Lengkap
          </label>
          <input
            type="text"
            required
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-sm text-[#F5F5F5] outline-none focus:border-[#B6A47E] transition-colors"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest block font-bold">
            Email Address
          </label>
          <input
            type="email"
            required
            value={profileForm.email}
            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-sm text-[#F5F5F5] outline-none focus:border-[#B6A47E] transition-colors"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest block font-bold">
            Nomor Telepon
          </label>
          <input
            type="text"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            placeholder="+62 812-3456-7890"
            className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-sm text-[#F5F5F5] outline-none focus:border-[#B6A47E] transition-colors font-mono"
          />
        </div>

        <div id="password" className="border-t border-white/[0.08] pt-8 space-y-6">
          <h3 className="text-xs font-mono text-[#B6A47E] uppercase tracking-widest font-bold">
            Ubah Password
          </h3>
          
          <div className="space-y-3">
            <label className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest block font-bold">
              Password Baru
            </label>
            <input
              type="password"
              value={profileForm.newPassword}
              onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-sm text-[#F5F5F5] outline-none focus:border-[#B6A47E] transition-colors font-mono"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest block font-bold">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={profileForm.confirmNewPassword}
              onChange={(e) => setProfileForm({ ...profileForm, confirmNewPassword: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-sm text-[#F5F5F5] outline-none focus:border-[#B6A47E] transition-colors font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs uppercase font-bold tracking-[0.25em] hover:bg-white transition-colors cursor-pointer shadow-lg mt-4"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
