"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Edit3, Trash2, CheckCircle2 } from "lucide-react";
import {
  getShippingAddresses,
  getCustomerProfile,
  updateShippingAddress,
  deleteShippingAddress,
  type ShippingAddress,
} from "@/utils/api";
import AddressModal from "@/components/AddressModal";
import AddressDeleteConfirmModal from "@/components/AddressDeleteConfirmModal";

export default function AddressBookPage() {
  const [addressesList, setAddressesList] = useState<ShippingAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);
  const [userProfile, setUserProfile] = useState<{ name?: string; phone?: string } | null>(null);
  
  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sector_madness_user");
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    } catch {}

    getCustomerProfile()
      .then((data) => {
        if (data) {
          setUserProfile({ name: data.name, phone: data.phone });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("sector_madness_addresses");
      if (cached) {
        setAddressesList(JSON.parse(cached));
      }
    } catch {}

    getShippingAddresses()
      .then((data) => {
        if (data) {
          setAddressesList(data);
          try {
            localStorage.setItem("sector_madness_addresses", JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: ShippingAddress) => {
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const promptDeleteAddress = (id: number) => {
    setDeleteTargetId(id);
  };

  const confirmDeleteAddress = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteShippingAddress(deleteTargetId);
      const updatedList = await getShippingAddresses();
      setAddressesList(updatedList);
    } catch {
      setAddressesList((prev) => prev.filter((a) => a.id !== deleteTargetId));
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handleSetDefaultAddressItem = async (addr: ShippingAddress) => {
    // Instant optimistic update: move gold border immediately without swapping card positions
    setAddressesList((prev) => prev.map((a) => ({ ...a, is_default: a.id === addr.id })));
    try {
      await updateShippingAddress({ ...addr, is_default: true });
      const updatedList = await getShippingAddresses();
      if (updatedList && updatedList.length > 0) {
        setAddressesList(updatedList);
      }
    } catch {
      // Optimistic update fallback retains user selection
    }
  };

  return (
    <div className="bg-[#141414] border border-white/[0.08] p-8 md:p-10 lg:p-12 space-y-8 shadow-2xl">
      {/* Header — Without white background button and without bottom line border */}
      <div style={{ paddingTop: "24px", paddingBottom: "24px", paddingLeft: "28px", paddingRight: "28px" }} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#F5F5F5]">ADDRESSES</h2>
          <p className="text-xs text-[#8A8A8A] mt-1 font-mono">Manage your saved delivery destinations</p>
        </div>
        <button
          onClick={handleOpenAddAddress}
          className="group flex items-center gap-2 text-[#8A8A8A] hover:text-[#F5F5F5] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90 text-[#8A8A8A] group-hover:text-[#F5F5F5]" />
          <span>ADD ADDRESS</span>
        </button>
      </div>

      {addressesList.length === 0 ? (
        <div style={{ padding: "72px 24px 88px 24px" }} className="w-full flex flex-col items-center justify-center text-center">
          <div style={{ marginBottom: "28px" }} className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-[#B6A47E] shadow-sm">
            <MapPin className="w-8 h-8 text-[#B6A47E]" />
          </div>
          <p style={{ marginBottom: "18px" }} className="text-sm font-mono uppercase tracking-[0.2em] text-[#8A8A8A] font-bold">No Addresses Saved Yet</p>
          <button
            onClick={handleOpenAddAddress}
            style={{ padding: "16px 36px" }}
            className="inline-block bg-white text-[#0A0A0A] font-mono text-xs uppercase font-black tracking-[0.25em] hover:bg-[#B6A47E] transition-all shadow-xl rounded-sm cursor-pointer"
          >
            ADD YOUR FIRST ADDRESS
          </button>
        </div>
      ) : (
        /* Centered & Balanced Address Cards */
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {addressesList.map((addr) => {
              const fullAddressStr = [
                addr.street_address,
                addr.district,
                addr.city,
                addr.province,
                addr.postal_code,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={addr.id}
                  style={{
                    padding: "32px 28px",
                    boxSizing: "border-box",
                    backgroundColor: "#0D0D0D",
                    border: addr.is_default ? "1px solid #B6A47E" : "1px solid #222222",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  className="transition-all duration-300 shadow-xl relative group"
                >
                  {/* Top Bar: Tag Label + Default Badge */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                        paddingBottom: "16px",
                        borderBottom: "1px solid #1E1E1E",
                      }}
                    >
                      <span
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "#1C1C1C",
                          border: "1px solid #333333",
                          color: "#E5E5E5",
                          fontFamily: "monospace",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                        }}
                      >
                        {addr.label || "RUMAH"}
                      </span>

                      {addr.is_default && (
                        <span
                          style={{
                            padding: "5px 12px",
                            backgroundColor: "#B6A47E",
                            color: "#0A0A0A",
                            fontFamily: "monospace",
                            fontSize: "10px",
                            fontWeight: 800,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                          DEFAULT
                        </span>
                      )}
                    </div>

                    {/* Receiver Info */}
                    <div style={{ marginBottom: "20px" }}>
                      <h4
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "18px",
                          fontWeight: 800,
                          color: "#FFFFFF",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "4px",
                        }}
                      >
                        {addr.receiver_name}
                      </h4>
                      <p
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#B6A47E",
                          fontWeight: 500,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {addr.phone_number}
                      </p>
                    </div>

                    {/* Address Detail Box */}
                    <div
                      style={{
                        backgroundColor: "#121212",
                        border: "1px solid #222222",
                        padding: "18px 20px",
                        marginBottom: "24px",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontFamily: "monospace",
                          fontSize: "10px",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "#666666",
                          fontWeight: 600,
                          marginBottom: "8px",
                        }}
                      >
                        DELIVERY DESTINATION
                      </span>
                      <p
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#CCCCCC",
                          lineHeight: "1.8",
                          fontWeight: 300,
                        }}
                      >
                        {fullAddressStr}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer with Enhanced Hover */}
                  <div
                    style={{
                      paddingTop: "16px",
                      borderTop: "1px solid #1E1E1E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      fontFamily: "monospace",
                      fontSize: "11px",
                    }}
                  >
                    {!addr.is_default ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddressItem(addr)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#B6A47E",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          transition: "color 0.2s",
                        }}
                        className="hover:text-white"
                      >
                        SET AS DEFAULT
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#666666",
                        }}
                      >
                        PRIMARY DESTINATION
                      </span>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginLeft: "auto" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="flex items-center gap-1.5 text-[#8A8A8A] hover:text-white uppercase font-mono text-[11px] font-bold tracking-wider transition-colors duration-200 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        EDIT
                      </button>

                      <button
                        type="button"
                        onClick={() => promptDeleteAddress(addr.id)}
                        className="flex items-center gap-1.5 text-[#8A8A8A] hover:text-[#FF4D4D] uppercase font-mono text-[11px] font-bold tracking-wider transition-colors duration-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADDRESS FORM MODAL COMPONENT */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        editingAddress={editingAddress}
        defaultValues={{
          receiver_name: userProfile?.name || "",
          phone_number: userProfile?.phone || "",
          is_default: addressesList.length === 0,
        }}
        onSuccess={async () => {
          setIsAddressModalOpen(false);
          const updatedList = await getShippingAddresses().catch(() => []);
          if (updatedList && updatedList.length > 0) {
            setAddressesList(updatedList);
          } else {
            getShippingAddresses().then(setAddressesList);
          }
        }}
      />

      {/* ADDRESS DELETE CONFIRMATION MODAL */}
      <AddressDeleteConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteAddress}
        isLoading={isDeleting}
      />
    </div>
  );
}
