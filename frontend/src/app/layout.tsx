import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SECTOR MADNESS — Premium Luxury Streetwear",
  description:
    "Sector Madness is not just clothing, but a movement and identity. Each collection represents a different sector of creativity, mindset, and expression. Designed for those who move differently.",
  keywords: [
    "sector madness",
    "luxury streetwear",
    "premium fashion",
    "independent fashion",
    "designer clothing",
  ],
  openGraph: {
    title: "SECTOR MADNESS — Premium Luxury Streetwear",
    description:
      "Designed for those who move differently. Premium luxury streetwear by Sector Madness.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
