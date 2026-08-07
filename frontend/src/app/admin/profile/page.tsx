"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminClientGuard from "../components/AdminClientGuard";
import { getAdminProfile, updateAdminProfile, AdminProfileData } from "@/utils/api";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  Clock,
  Loader2,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminProfilePage() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sector_madness_admin_theme");
      return saved === null ? true : saved === "dark";
    }
    return true;
  });

  useEffect(() => {
    const handleThemeEvent = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sector_madness_admin_theme");
        setIsDarkMode(saved === null ? true : saved === "dark");
      }
    };
    window.addEventListener("sector_theme_change", handleThemeEvent);
    return () => window.removeEventListener("sector_theme_change", handleThemeEvent);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("sector_madness_admin_theme", next ? "dark" : "light");
      setTimeout(() => {
        window.dispatchEvent(new Event("sector_theme_change"));
      }, 0);
    }
  };

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<AdminProfileData | null>(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password Visibility States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // First try local storage prefill
      if (typeof window !== "undefined") {
        const userDataStr = localStorage.getItem("sector_madness_user");
        if (userDataStr) {
          const parsed = JSON.parse(userDataStr);
          setName(parsed.name || "");
          setEmail(parsed.email || "");
        }
      }

      const res = await getAdminProfile();
      if (res.status && res.data) {
        setProfileData(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
      }
    } catch {
      // Fallback silent handle
    } finally {
      setLoading(false);
    }
  };

  const getSwalThemeOptions = () => ({
    background: isDarkMode ? "#18181C" : "#FFFFFF",
    color: isDarkMode ? "#F5F5F5" : "#0A0A0A",
    confirmButtonColor: "#B6A47E",
    customClass: {
      popup: isDarkMode
        ? "border border-white/10 rounded-[12px] shadow-2xl font-mono text-sm"
        : "border border-gray-200 rounded-[12px] shadow-2xl font-mono text-sm",
      title: "font-mono font-bold tracking-wider text-base uppercase",
      htmlContainer: "font-mono text-xs opacity-90",
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire({
        ...getSwalThemeOptions(),
        icon: "warning",
        title: "NAMA LENGKAP WAJIB DIISI",
        text: "Silakan masukkan nama lengkap akun admin Anda.",
      });
      return;
    }

    if (!email.trim()) {
      Swal.fire({
        ...getSwalThemeOptions(),
        icon: "warning",
        title: "EMAIL WAJIB DIISI",
        text: "Silakan masukkan alamat email akun admin Anda.",
      });
      return;
    }

    // Password validation if attempting to change
    if (newPassword || confirmPassword || currentPassword) {
      if (newPassword !== confirmPassword) {
        Swal.fire({
          ...getSwalThemeOptions(),
          icon: "error",
          title: "KONFIRMASI PASSWORD TIDAK COCOK",
          text: "Password baru dan konfirmasi password baru tidak sama.",
          confirmButtonColor: "#E53E3E",
        });
        return;
      }

      if (newPassword.length < 6) {
        Swal.fire({
          ...getSwalThemeOptions(),
          icon: "warning",
          title: "PASSWORD TERLALU PENDEK",
          text: "Password baru minimal terdiri dari 6 karakter.",
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: {
        name: string;
        email: string;
        current_password?: string;
        new_password?: string;
      } = {
        name: name.trim(),
        email: email.trim(),
      };

      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await updateAdminProfile(payload);

      if (res.status && res.data) {
        // Update localStorage user data
        if (typeof window !== "undefined") {
          const existingUser = localStorage.getItem("sector_madness_user");
          const parsedUser = existingUser ? JSON.parse(existingUser) : {};
          const updatedUser = {
            ...parsedUser,
            name: res.data.name,
            email: res.data.email,
          };
          localStorage.setItem("sector_madness_user", JSON.stringify(updatedUser));
          window.dispatchEvent(new Event("sector_auth_change"));
        }

        setProfileData(res.data);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        Swal.fire({
          ...getSwalThemeOptions(),
          icon: "success",
          title: "PROFIL BERHASIL DIPERBARUI",
          text: "Data nama, email, dan keamanan profil admin berhasil disimpan.",
        });
      } else {
        Swal.fire({
          ...getSwalThemeOptions(),
          icon: "error",
          title: "GAGAL MEMPERBARUI PROFIL",
          text: res.message || "Terjadi kesalahan saat memperbarui profil admin.",
          confirmButtonColor: "#E53E3E",
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : "Gagal menghubungkan ke server.");

      Swal.fire({
        ...getSwalThemeOptions(),
        icon: "error",
        title: "GAGAL DISIMPAN",
        text: msg,
        confirmButtonColor: "#E53E3E",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminClientGuard>
      <div
        suppressHydrationWarning
        className={`flex flex-col md:flex-row min-h-screen font-[family-name:var(--font-body)] ${
          isDarkMode ? "bg-[#121214] text-[#F5F5F5]" : "bg-[#F4F4F6] text-[#0A0A0A]"
        }`}
      >
        {/* Sidebar */}
        <div className="print:hidden">
          <AdminSidebar activeTab="profile" isDarkMode={isDarkMode} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="sticky top-0 z-30 shrink-0 print:hidden">
            <AdminHeader
              title="PROFIL ADMIN"
              subtitle="Kelola Data Pengguna, Email, dan Password Akun Administrator"
              isDarkMode={isDarkMode}
              onToggleTheme={toggleTheme}
            />
          </div>

          <main
            style={{
              paddingTop: "48px",
              paddingBottom: "96px",
              paddingLeft: "48px",
              paddingRight: "48px",
              maxWidth: "1440px",
              marginLeft: "auto",
              marginRight: "auto",
              width: "100%",
            }}
            className="flex-1 min-w-0"
          >
            {/* Header Title Section */}
            <div style={{ marginBottom: "32px" }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2
                  style={{ fontSize: "11px", letterSpacing: "0.22em", fontWeight: 700 }}
                  className={`uppercase ${isDarkMode ? "text-[#8A8A8A]" : "text-[#4B5563]"}`}
                >
                  PENGATURAN AKUN ADMINISTRATOR
                </h2>
                <h1 style={{ fontSize: "22px", fontWeight: 800 }} className="uppercase tracking-wider mt-1">
                  PROFIL & KEAMANAN AKUN
                </h1>
              </div>

              <div
                style={{ padding: "8px 16px", borderRadius: "20px" }}
                className={`inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider self-start sm:self-auto border ${
                  isDarkMode ? "bg-[#18181C] border-[#B6A47E]/30 text-[#B6A47E]" : "bg-white border-[#B6A47E]/40 text-[#856D3B] shadow-xs"
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> ROLE: ADMINISTRATOR
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "80px 0" }} className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#B6A47E]" />
                <p style={{ fontSize: "12px" }} className="font-mono text-[#8A8A8A]">
                  MEMUAT PROFIL ADMIN...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {/* Section 1: Informasi Profil Utama */}
                <div
                  style={{ padding: "28px", borderRadius: "12px" }}
                  className={`border shadow-sm ${
                    isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
                  }`}
                >
                  <div style={{ paddingBottom: "20px", marginBottom: "28px" }} className="flex items-center gap-3.5 border-b border-inherit">
                    <div className="w-10 h-10 rounded-xl bg-[#B6A47E]/15 border border-[#B6A47E]/30 flex items-center justify-center text-[#B6A47E] shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 700 }} className="uppercase tracking-wider">
                        DATA INFORMASI ADMIN
                      </h3>
                      <p style={{ fontSize: "12px", marginTop: "4px" }} className="text-[#8A8A8A] font-mono">
                        Perbarui nama lengkap dan alamat email aktif akun Anda
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama Lengkap */}
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }} className={`uppercase ${isDarkMode ? "text-[#AAAAAA]" : "text-[#374151]"}`}>
                        NAMA LENGKAP ADMIN *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Masukkan Nama Lengkap Admin"
                          style={{
                            paddingLeft: "42px",
                            paddingRight: "16px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            fontSize: "13px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            outline: "none",
                            width: "100%",
                            backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                            color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                          }}
                          className="font-mono focus:border-[#B6A47E] transition-colors"
                        />
                        <User className="w-4 h-4 text-[#B6A47E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }} className={`uppercase ${isDarkMode ? "text-[#AAAAAA]" : "text-[#374151]"}`}>
                        ALAMAT EMAIL ADMIN *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@sectormadness.com"
                          style={{
                            paddingLeft: "42px",
                            paddingRight: "16px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            fontSize: "13px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            outline: "none",
                            width: "100%",
                            backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                            color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                          }}
                          className="font-mono focus:border-[#B6A47E] transition-colors"
                        />
                        <Mail className="w-4 h-4 text-[#B6A47E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Info Metadata */}
                  {profileData?.last_login_at && (
                    <div style={{ marginTop: "24px" }} className="flex items-center gap-2 text-xs font-mono text-[#8A8A8A]">
                      <Clock className="w-3.5 h-3.5 text-[#B6A47E]" />
                      <span>LOGIN TERAKHIR: <strong>{profileData.last_login_at}</strong></span>
                    </div>
                  )}
                </div>

                {/* Section 2: Ganti Password */}
                <div
                  style={{ padding: "28px", borderRadius: "12px" }}
                  className={`border shadow-sm ${
                    isDarkMode ? "bg-[#18181C] border-white/10" : "bg-white border-[#D1D5DB]"
                  }`}
                >
                  <div style={{ paddingBottom: "20px", marginBottom: "28px" }} className="flex items-center gap-3.5 border-b border-inherit">
                    <div className="w-10 h-10 rounded-xl bg-[#B6A47E]/15 border border-[#B6A47E]/30 flex items-center justify-center text-[#B6A47E] shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 700 }} className="uppercase tracking-wider">
                        GANTI PASSWORD AKUN
                      </h3>
                      <p style={{ fontSize: "12px", marginTop: "4px" }} className="text-[#8A8A8A] font-mono">
                        Kosongkan bagian password jika tidak ingin mengubah password lama Anda
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Password Lama */}
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }} className={`uppercase ${isDarkMode ? "text-[#AAAAAA]" : "text-[#374151]"}`}>
                        PASSWORD LAMA
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Masukkan Password Lama"
                          style={{
                            paddingLeft: "42px",
                            paddingRight: "42px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            fontSize: "13px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            outline: "none",
                            width: "100%",
                            backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                            color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                          }}
                          className="font-mono focus:border-[#B6A47E] transition-colors"
                        />
                        <Lock className="w-4 h-4 text-[#B6A47E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Baru */}
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }} className={`uppercase ${isDarkMode ? "text-[#AAAAAA]" : "text-[#374151]"}`}>
                        PASSWORD BARU
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 6 Karakter"
                          style={{
                            paddingLeft: "42px",
                            paddingRight: "42px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            fontSize: "13px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            outline: "none",
                            width: "100%",
                            backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                            color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                          }}
                          className="font-mono focus:border-[#B6A47E] transition-colors"
                        />
                        <Lock className="w-4 h-4 text-[#B6A47E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Konfirmasi Password Baru */}
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em" }} className={`uppercase ${isDarkMode ? "text-[#AAAAAA]" : "text-[#374151]"}`}>
                        KONFIRMASI PASSWORD BARU
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi Password Baru"
                          style={{
                            paddingLeft: "42px",
                            paddingRight: "42px",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                            fontSize: "13px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            outline: "none",
                            width: "100%",
                            backgroundColor: isDarkMode ? "#121214" : "#F9FAFB",
                            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid #D1D5DB",
                            color: isDarkMode ? "#FFFFFF" : "#0A0A0A",
                          }}
                          className="font-mono focus:border-[#B6A47E] transition-colors"
                        />
                        <Lock className="w-4 h-4 text-[#B6A47E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Security Helper Info */}
                  <div style={{ marginTop: "24px" }} className="flex items-center gap-2.5 text-xs font-mono text-[#8A8A8A]">
                    <AlertCircle className="w-4 h-4 text-[#B6A47E] shrink-0" />
                    <span>
                      INFORMASI KEAMANAN: Password baru <strong>minimal 6 karakter</strong>. Disarankan mengombinasikan huruf kapital, angka, dan simbol khusus untuk perlindungan akun optimal.
                    </span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <div className="flex items-center justify-end gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "12px 32px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      backgroundColor: "#B6A47E",
                      color: "#0A0A0A",
                      border: "none",
                      cursor: submitting ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      opacity: submitting ? 0.8 : 1,
                    }}
                    className="hover:bg-[#a3926c] transition-all shadow-md active:scale-95 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]" />
                        MENYIMPAN...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        SIMPAN PERUBAHAN PROFIL
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </AdminClientGuard>
  );
}
