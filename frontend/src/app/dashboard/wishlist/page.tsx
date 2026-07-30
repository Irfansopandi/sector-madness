"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProducts, type Product } from "@/utils/api";

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("sector_madness_wishlist");
      if (savedWishlist) {
        setWishlistProducts(JSON.parse(savedWishlist));
      } else {
        getProducts().then((allProds) => {
          if (allProds && allProds.length > 0) {
            setWishlistProducts(allProds.slice(0, 2));
          }
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleMoveWishlistItemToBag = async (product: Product) => {
    const updatedWishlist = wishlistProducts.filter((p) => p.id !== product.id);
    setWishlistProducts(updatedWishlist);
    localStorage.setItem("sector_madness_wishlist", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("sector_bag_change"));
    setWishlistFeedback(`Produk ${product.name} berhasil dipindahkan ke Bag.`);
    setTimeout(() => setWishlistFeedback(null), 3500);
  };

  const handleRemoveWishlistItem = (productId: number | string) => {
    const updatedWishlist = wishlistProducts.filter((p) => p.id !== productId);
    setWishlistProducts(updatedWishlist);
    localStorage.setItem("sector_madness_wishlist", JSON.stringify(updatedWishlist));
  };

  return (
    <div className="bg-[#141414] border border-white/[0.08] p-8 md:p-10 lg:p-12 space-y-8 shadow-2xl">
      <div className="border-b border-white/[0.08] pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-[#F5F5F5]">WISHLIST</h2>
          <p className="text-xs text-[#8A8A8A] mt-1 font-mono">Koleksi produk favorit yang Anda simpan</p>
        </div>
        <span className="text-xs font-mono text-[#B6A47E] font-bold tracking-widest">{wishlistProducts.length} ITEMS</span>
      </div>

      {wishlistFeedback && (
        <div className="p-4 bg-[#B6A47E]/10 border border-[#B6A47E]/30 text-[#B6A47E] text-xs font-mono font-bold">
          ✓ {wishlistFeedback}
        </div>
      )}

      {wishlistProducts.length === 0 ? (
        <div className="py-24 text-center space-y-6">
          <p className="text-sm text-[#8A8A8A] font-mono uppercase tracking-widest">Wishlist Anda Kosong</p>
          <Link
            href="/shop"
            className="inline-block px-10 py-4 bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs uppercase font-bold tracking-[0.25em] hover:bg-white transition-colors shadow-lg"
          >
            Jelajahi Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlistProducts.map((prod) => (
            <div key={prod.id} className="bg-[#0A0A0A] border border-white/[0.08] overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="relative aspect-[3/4] bg-[#161616] overflow-hidden">
                  <Image
                    src={prod.image || "/images/campaign/campaign-1.png"}
                    alt={prod.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <Link href={`/product/${prod.slug || prod.id}`} className="text-xs font-extrabold text-[#F5F5F5] uppercase tracking-wide hover:text-[#B6A47E] transition-colors line-clamp-1 block">
                    {prod.name}
                  </Link>
                  <p className="text-sm font-mono text-[#B6A47E] font-bold">
                    Rp {(prod.price || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-2.5">
                <button
                  onClick={() => handleMoveWishlistItemToBag(prod)}
                  className="w-full py-3 bg-[#B6A47E] text-[#0A0A0A] font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
                >
                  Move to Bag
                </button>
                <button
                  onClick={() => handleRemoveWishlistItem(prod.id)}
                  className="w-full py-2.5 border border-white/[0.08] text-[#8A8A8A] hover:text-[#FF6666] font-mono text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
