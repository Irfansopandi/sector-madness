import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

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
  metadataBase: new URL("https://www.sectormadness.com"),
  title: "SECTOR MADNESS",
  description:
    "We trust quality. Sector Madness is not just clothing, but a movement and identity. Each collection represents a different sector of creativity, mindset, and expression.",
  icons: {
    icon: "/images/tab-icon.png",
    shortcut: "/images/tab-icon.png",
    apple: "/images/tab-icon.png",
  },
  keywords: [
    "sector madness",
    "sectormadness",
    "streetwear indonesia",
    "brand lokal indonesia",
    "local pride indonesia",
    "oversized t-shirt",
    "clothing brand",
    "We trust quality",
    "Premium fashion",
    "independent fashion",
    "designer clothing",
  ],
  openGraph: {
    title: "SECTOR MADNESS",
    description:
      "We trust quality. Sector Madness official archive and store.",
    type: "website",
    url: "https://www.sectormadness.com",
    siteName: "SECTOR MADNESS",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
