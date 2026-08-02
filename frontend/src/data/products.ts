export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  collection: string;
  collectionCode: string;
  tagline: string;
  description: string;
  material: string;
  weight: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  discountExpiresAt?: string;
  isFlashSale?: boolean;
  image: string;
  gallery: string[];
  colors: ProductColor[];
  sizes: string[];
  details: string[];
  story: string;
  limited: boolean;
}

export function getVariantStock(slug: string, colorName: string | null, sizeName: string | null): number {
  const prod = products.find((p) => p.slug === slug);
  const colorStr = colorName || (prod?.colors[0]?.name ?? "default");
  const sizeStr = sizeName || (prod?.sizes[0] ?? "M");
  
  let seed = 0;
  const str = `${slug}-${colorStr}-${sizeStr}`;
  for (let i = 0; i < str.length; i++) {
    seed = (seed + str.charCodeAt(i) * (i + 1)) % 100;
  }
  return (seed % 12) + 3; // Returns 3 to 14 units per variant
}

export function getTotalStock(slug: string): number {
  const prod = products.find((p) => p.slug === slug);
  if (!prod) return 45;
  
  let total = 0;
  const colors = prod.colors && prod.colors.length > 0 ? prod.colors : [{ name: "Default", hex: "#000" }];
  for (const c of colors) {
    for (const s of prod.sizes) {
      total += getVariantStock(slug, c.name, s);
    }
  }
  return total;
}

export function getSizeStock(slug: string, sizeName: string, selectedColorName?: string | null): number {
  const prod = products.find((p) => p.slug === slug);
  if (!prod) return 8;
  
  if (selectedColorName) {
    return getVariantStock(slug, selectedColorName, sizeName);
  }
  
  let total = 0;
  const colors = prod.colors && prod.colors.length > 0 ? prod.colors : [{ name: "Default", hex: "#000" }];
  for (const c of colors) {
    total += getVariantStock(slug, c.name, sizeName);
  }
  return total;
}

export const products: Product[] = [
  {
    id: "001",
    slug: "sector-001-hoodie",
    name: "Sector 001 Hoodie",
    collection: "The Origin Collection",
    collectionCode: "SECTOR 001",
    tagline: "A study of structure, comfort, and identity.",
    description:
      "The foundational piece of Sector Madness. Built from 480 GSM premium heavy cotton, the Sector 001 Hoodie represents the intersection of comfort and intention. Every seam, every stitch is deliberate.",
    material: "100% Premium Heavy Cotton",
    weight: "480 GSM",
    price: 285,
    image: "/images/products/product-1.png",
    gallery: [
      "/images/products/product-1.png",
      "/images/campaign/campaign-1.png",
      "/images/campaign/campaign-3.png",
    ],
    colors: [
      { name: "Obsidian Black", hex: "#0A0A0A" },
      { name: "Charcoal Grey", hex: "#262626" },
      { name: "Raw Washed Bone", hex: "#D6D3CC" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    details: [
      "Oversized silhouette",
      "Reinforced rib-knit cuffs and hem",
      "Kangaroo pocket with hidden interior pocket",
      "Woven label at back neck",
      "Embossed logo at left chest",
      "Made in Portugal",
    ],
    story:
      "The 001 Hoodie was the first piece conceived for Sector Madness — designed before the brand had a name. It began as a study in weight and proportion.",
    limited: true,
  },
  {
    id: "002",
    slug: "sector-001-bomber",
    name: "Sector 001 Bomber",
    collection: "The Origin Collection",
    collectionCode: "SECTOR 001",
    tagline: "Engineered for presence.",
    description:
      "A structured bomber jacket that commands attention through proportion and material. Built with a water-resistant technical shell and premium cotton lining.",
    material: "Technical Shell / Cotton Lining",
    weight: "360 GSM Shell",
    price: 425,
    image: "/images/products/product-2.png",
    gallery: [
      "/images/products/product-2.png",
      "/images/campaign/campaign-2.png",
      "/images/campaign/campaign-4.png",
    ],
    colors: [
      { name: "Pitch Black", hex: "#0A0A0A" },
      { name: "Tactical Olive", hex: "#353B31" },
      { name: "Slate Grey", hex: "#4A4E54" },
    ],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "Oversized structured fit",
      "Water-resistant outer shell",
      "Premium cotton interior lining",
      "YKK zippers throughout",
      "Made in Portugal",
    ],
    story:
      "The Sector 001 Bomber bridges technical outerwear and luxury streetwear.",
    limited: true,
  },
  {
    id: "003",
    slug: "sector-001-tee",
    name: "Sector 001 Essential Tee",
    collection: "The Origin Collection",
    collectionCode: "SECTOR 001",
    tagline: "The foundation of every statement.",
    description:
      "A heavyweight essential tee that elevates the everyday. Cut from 300 GSM premium cotton with a relaxed, dropped shoulder silhouette.",
    material: "100% Premium Cotton",
    weight: "300 GSM",
    price: 145,
    image: "/images/products/product-3.png",
    gallery: [
      "/images/products/product-3.png",
      "/images/hero/hero-3.png",
    ],
    colors: [
      { name: "Deep Black", hex: "#0A0A0A" },
      { name: "Soft White", hex: "#F5F5F5" },
      { name: "Muted Taupe", hex: "#8C8275" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    details: [
      "Relaxed dropped-shoulder fit",
      "Reinforced collar seam",
      "Side-seam construction",
      "Made in Portugal",
    ],
    story:
      "There is nothing ordinary about a perfect t-shirt. The Sector 001 Essential Tee took eighteen prototypes to finalize.",
    limited: false,
  },
  {
    id: "004",
    slug: "sector-001-cargo",
    name: "Sector 001 Cargo",
    collection: "The Origin Collection",
    collectionCode: "SECTOR 001",
    tagline: "Built for movement. Designed for intent.",
    description:
      "Structured cargo pants with a modern tapered silhouette. Utility-driven design meets premium construction.",
    material: "Cotton Twill / Ripstop",
    weight: "320 GSM",
    price: 345,
    image: "/images/products/product-4.png",
    gallery: [
      "/images/products/product-4.png",
      "/images/campaign/campaign-4.png",
    ],
    colors: [
      { name: "Stealth Black", hex: "#0A0A0A" },
      { name: "Military Green", hex: "#3B4236" },
      { name: "Washed Grey", hex: "#4D5157" },
    ],
    sizes: ["28", "30", "32", "34", "36"],
    details: [
      "Modern tapered fit",
      "Six-pocket utility design",
      "Adjustable ankle cuffs",
      "Made in Portugal",
    ],
    story:
      "The Sector 001 Cargo reimagines utility wear for the modern wardrobe.",
    limited: true,
  },
  {
    id: "005",
    slug: "sector-002-trench",
    name: "Sector 002 Oversized Trench",
    collection: "The Atelier Series",
    collectionCode: "SECTOR 002",
    tagline: "Architectural proportions for cold weather.",
    description:
      "An oversized double-breasted trench coat with storm flap detailing and structured shoulders.",
    material: "Heavyweight Gabardine",
    weight: "420 GSM",
    price: 520,
    image: "/images/products/product-5.png",
    gallery: ["/images/products/product-5.png"],
    colors: [
      { name: "Midnight Navy", hex: "#0E1525" },
      { name: "Obsidian Black", hex: "#0A0A0A" },
    ],
    sizes: ["S", "M", "L", "XL"],
    details: ["Double-breasted closure", "Belted waist and cuffs", "Made in Portugal"],
    story: "Designed as an architectural outer shield against urban climate elements.",
    limited: true,
  },
  {
    id: "006",
    slug: "sector-002-knit",
    name: "Sector 002 Heavyweight Knit",
    collection: "The Atelier Series",
    collectionCode: "SECTOR 002",
    tagline: "Tactile depth and relaxed warmth.",
    description:
      "A chunky rib-knit sweater crafted from 100% merino wool with exaggerated dropped shoulder seams.",
    material: "100% Merino Wool",
    weight: "550 GSM",
    price: 310,
    image: "/images/products/product-6.png",
    gallery: ["/images/products/product-6.png"],
    colors: [
      { name: "Raw Washed Bone", hex: "#D6D3CC" },
      { name: "Pitch Black", hex: "#0A0A0A" },
    ],
    sizes: ["S", "M", "L", "XL"],
    details: ["Chunk rib knit", "Seamless shoulder transition", "Made in Italy"],
    story: "Explores raw tactile textures with heavy wool density.",
    limited: true,
  },
  {
    id: "007",
    slug: "sector-002-anorak",
    name: "Sector 002 Technical Anorak",
    collection: "The Atelier Series",
    collectionCode: "SECTOR 002",
    tagline: "Weatherproof utility with minimal form.",
    description:
      "A half-zip pullover anorak with storm hood, front kangaroo pocket, and waterproof seam taping.",
    material: "3-Layer Nylon Ripstop",
    weight: "280 GSM",
    price: 550,
    image: "/images/products/product-7.png",
    gallery: ["/images/products/product-7.png"],
    colors: [
      { name: "Tactical Olive", hex: "#353B31" },
      { name: "Stealth Black", hex: "#0A0A0A" },
    ],
    sizes: ["S", "M", "L", "XL"],
    details: ["3-layer membrane", "Taped waterproof seams", "Made in Portugal"],
    story: "A lightweight protective shell engineered for uncompromised mobility.",
    limited: true,
  },
  {
    id: "008",
    slug: "sector-002-vest",
    name: "Sector 002 Utility Vest",
    collection: "The Atelier Series",
    collectionCode: "SECTOR 002",
    tagline: "Layered function for transitional climate.",
    description:
      "A modular padded tactical vest featuring 3D chest pockets and heavy-duty front zip fastening.",
    material: "Technical Cordura Nylon",
    weight: "340 GSM",
    price: 260,
    image: "/images/products/product-8.png",
    gallery: ["/images/products/product-8.png"],
    colors: [
      { name: "Obsidian Black", hex: "#0A0A0A" },
      { name: "Charcoal Grey", hex: "#262626" },
    ],
    sizes: ["S", "M", "L", "XL"],
    details: ["Modular 3D pockets", "Padded interior layer", "Made in Portugal"],
    story: "Functionality stripped down to its core essentials.",
    limited: true,
  },
  {
    id: "009",
    slug: "sector-002-trousers",
    name: "Sector 002 Pleated Trousers",
    collection: "The Atelier Series",
    collectionCode: "SECTOR 002",
    tagline: "Tailored elegance in relaxed drape.",
    description:
      "Wide-leg pleated trousers with front pintucks and hidden drawstrings for a relaxed drape.",
    material: "Wool Blend Twill",
    weight: "310 GSM",
    price: 295,
    image: "/images/products/product-9.png",
    gallery: ["/images/products/product-9.png"],
    colors: [
      { name: "Pitch Black", hex: "#0A0A0A" },
      { name: "Muted Taupe", hex: "#8C8275" },
    ],
    sizes: ["28", "30", "32", "34", "36"],
    details: ["Front double pleats", "Wide fluid drape", "Made in Portugal"],
    story: "Bridging formal tailoring with relaxed modern streetwear proportions.",
    limited: false,
  },
  {
    id: "010",
    slug: "sector-002-zip-hoodie",
    name: "Sector 002 Tactical Zip Hoodie",
    collection: "The Atelier Series",
    collectionCode: "SECTOR 002",
    tagline: "Full-zip structural comfort.",
    description:
      "A heavy full-zip hoodie with double-headed metal zipper and high-coverage funnel neck hood.",
    material: "500 GSM Brushed Heavy Cotton",
    weight: "500 GSM",
    price: 320,
    image: "/images/products/product-10.png",
    gallery: ["/images/products/product-10.png"],
    colors: [
      { name: "Deep Black", hex: "#0A0A0A" },
      { name: "Washed Slate", hex: "#4A4E54" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    details: ["500 GSM heavy fleece", "Double YKK zip closure", "Made in Portugal"],
    story: "Maximum warmth and structural presence in a zip silhouette.",
    limited: true,
  },
];
