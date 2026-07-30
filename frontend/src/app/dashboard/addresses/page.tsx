"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getShippingAddresses,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  type ShippingAddress,
} from "@/utils/api";

export default function AddressBookPage() {
  const [addressesList, setAddressesList] = useState<ShippingAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Rumah",
    receiver_name: "",
    phone_number: "",
    province: "",
    city: "",
    district: "",
    postal_code: "",
    street_address: "",
    is_default: false,
  });

  useEffect(() => {
    getShippingAddresses()
      .then((data) => setAddressesList(data || []))
      .catch(() => setAddressesList([]));
  }, []);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: "Rumah",
      receiver_name: "",
      phone_number: "",
      province: "",
      city: "",
      district: "",
      postal_code: "",
      street_address: "",
      is_default: addressesList.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: ShippingAddress) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      receiver_name: addr.receiver_name,
      phone_number: addr.phone_number,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      postal_code: addr.postal_code,
      street_address: addr.street_address,
      is_default: addr.is_default,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await updateShippingAddress({ id: editingAddress.id, ...addressForm });
      } else {
        await addShippingAddress(addressForm);
      }
      const updatedList = await getShippingAddresses();
      setAddressesList(updatedList);
    } catch {
      if (editingAddress) {
        setAddressesList((prev) =>
          prev.map((item) => (item.id === editingAddress.id ? { ...item, ...addressForm } : item.is_default && addressForm.is_default ? { ...item, is_default: false } : item))
        );
      } else {
        const newAddr: ShippingAddress = {
          id: Date.now(),
          ...addressForm,
        };
        setAddressesList((prev) => (addressForm.is_default ? [newAddr, ...prev.map((a) => ({ ...a, is_default: false }))] : [...prev, newAddr]));
      }
    } finally {
      setIsAddressModalOpen(false);
    }
  };

  const handleDeleteAddressItem = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus alamat ini?")) return;
    try {
      await deleteShippingAddress(id);
      const updatedList = await getShippingAddresses();
      setAddressesList(updatedList);
    } catch {
      setAddressesList((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSetDefaultAddressItem = async (addr: ShippingAddress) => {
    try {
      await updateShippingAddress({ ...addr, is_default: true });
      const updatedList = await getShippingAddresses();
      setAddressesList(updatedList);
    } catch {
      setAddressesList((prev) => prev.map((a) => ({ ...a, is_default: a.id === addr.id })));
    }
  };

  return (
    <div className="bg-[#141414] border border-white/[0.08] p-8 md:p-10 lg:p-12 space-y-8 shadow-2xl">
      <div className="border-b border-white/[0.08] pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#F5F5F5]">ADDRESS BOOK</h2>
          <p className="text-xs text-[#8A8A8A] mt-1 font-mono">Kelola daftar alamat pengiriman pesanan Anda</p>
        </div>
        <button
          onClick={handleOpenAddAddress}
          className="px-6 py-3.5 bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer shadow-lg"
        >
          + Tambah Alamat
        </button>
      </div>

      {addressesList.length === 0 ? (
        <div className="py-24 text-center space-y-6">
          <p className="text-sm text-[#8A8A8A] font-mono uppercase tracking-widest">Belum Ada Alamat Tersimpan</p>
          <button
            onClick={handleOpenAddAddress}
            className="px-10 py-4 bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs uppercase font-bold tracking-[0.25em] hover:bg-white transition-colors shadow-lg cursor-pointer"
          >
            Tambah Alamat Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addressesList.map((addr) => (
            <div
              key={addr.id}
              className={`bg-[#0A0A0A] border p-6 md:p-8 space-y-4 relative flex flex-col justify-between ${
                addr.is_default ? "border-[#B6A47E]" : "border-white/[0.08]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#F5F5F5] uppercase tracking-wider bg-white/[0.08] px-3 py-1">
                    {addr.label}
                  </span>
                  {addr.is_default && (
                    <span className="font-mono text-[10px] font-bold text-[#0A0A0A] bg-[#B6A47E] px-3 py-1 uppercase tracking-widest">
                      DEFAULT
                    </span>
                  )}
                </div>

                <h4 className="text-base font-extrabold text-[#F5F5F5] uppercase">{addr.receiver_name}</h4>
                <p className="text-xs font-mono text-[#8A8A8A] mt-1">{addr.phone_number}</p>
                <p className="text-xs font-mono text-[#8A8A8A] mt-3 leading-relaxed">
                  {addr.street_address}, {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                </p>
              </div>

              <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between gap-2 font-mono text-xs">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefaultAddressItem(addr)}
                    className="text-[#B6A47E] hover:underline uppercase text-[11px] font-bold cursor-pointer"
                  >
                    Set as Default
                  </button>
                )}
                <div className="flex items-center gap-4 ml-auto">
                  <button
                    onClick={() => handleOpenEditAddress(addr)}
                    className="text-[#8A8A8A] hover:text-[#F5F5F5] uppercase text-[11px] font-bold cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddressItem(addr.id)}
                    className="text-[#8A8A8A] hover:text-[#FF6666] uppercase text-[11px] font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADDRESS FORM MODAL */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141414] border border-white/[0.1] text-[#F5F5F5] w-full max-w-xl p-8 md:p-10 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="absolute top-6 right-6 text-[#8A8A8A] hover:text-[#F5F5F5] transition-colors p-2 cursor-pointer"
                aria-label="Close Address Form"
              >
                ✕
              </button>

              <div className="border-b border-white/[0.08] pb-5">
                <h3 className="text-xl font-extrabold uppercase tracking-wider text-[#F5F5F5]">
                  {editingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}
                </h3>
                <p className="text-xs text-[#8A8A8A] mt-1 font-mono">Lengkapi informasi alamat pengiriman pesanan Anda</p>
              </div>

              <form onSubmit={handleSaveAddressSubmit} className="space-y-5 text-xs font-mono">
                <div>
                  <label className="text-[#8A8A8A] uppercase block mb-1.5 font-bold">Label Alamat (e.g. Rumah, Kantor)</label>
                  <input
                    type="text"
                    required
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-[#F5F5F5] outline-none focus:border-[#B6A47E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[#8A8A8A] uppercase block mb-1.5 font-bold">Nama Penerima *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.receiver_name}
                      onChange={(e) => setAddressForm({ ...addressForm, receiver_name: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-[#F5F5F5] outline-none focus:border-[#B6A47E]"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A8A8A] uppercase block mb-1.5 font-bold">Nomor Telepon *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.phone_number}
                      onChange={(e) => setAddressForm({ ...addressForm, phone_number: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-[#F5F5F5] outline-none focus:border-[#B6A47E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[#8A8A8A] uppercase block mb-1.5 font-bold">Provinsi *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.province}
                      onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                      placeholder="e.g. Jawa Barat"
                      className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-[#F5F5F5] outline-none focus:border-[#B6A47E]"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A8A8A] uppercase block mb-1.5 font-bold">Kota / Kabupaten *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="e.g. Bandung"
                      className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-[#F5F5F5] outline-none focus:border-[#B6A47E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[#8A8A8A] uppercase block mb-1.5 font-bold">Kecamatan *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.district}
                      onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                      placeholder="e.g. Coblong"
                      className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-[#F5F5F5] outline-none focus:border-[#B6A47E]"
                    />
                  </div>
                  <div>
                    <label className="text-[#8A8A8A] uppercase block mb-1.5 font-bold">Kode Pos *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.postal_code}
                      onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                      placeholder="e.g. 40132"
                      className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-[#F5F5F5] outline-none focus:border-[#B6A47E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#8A8A8A] uppercase block mb-1.5 font-bold">Alamat Lengkap *</label>
                  <textarea
                    rows={3}
                    required
                    value={addressForm.street_address}
                    onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                    placeholder="Nama jalan, nomor rumah, RT/RW"
                    className="w-full bg-[#0A0A0A] border border-white/[0.08] p-4 text-[#F5F5F5] outline-none focus:border-[#B6A47E]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_default_check"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                    className="h-4 w-4 accent-[#B6A47E] cursor-pointer"
                  />
                  <label htmlFor="is_default_check" className="text-[#F5F5F5] cursor-pointer">
                    Jadikan sebagai Alamat Utama (Default)
                  </label>
                </div>

                <div className="pt-6 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="px-6 py-3.5 border border-white/[0.08] text-[#8A8A8A] hover:text-[#F5F5F5] uppercase tracking-wider font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#B6A47E] text-[#0A0A0A] font-bold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer shadow-lg"
                  >
                    Simpan Alamat
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
