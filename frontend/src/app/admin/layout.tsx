import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sector Madness - Admin Panel",
  description: "Admin Panel for Sector Madness",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
