import type { Metadata } from "next";
import AdminClientGuard from "./components/AdminClientGuard";

export const metadata: Metadata = {
  title: "Sector Madness - Admin Panel",
  description: "Admin Panel for Sector Madness",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminClientGuard>{children}</AdminClientGuard>;
}
