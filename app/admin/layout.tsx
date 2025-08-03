"use client";

import { AuthProvider } from "../lib/auth-context";
import AdminRouteGuard from "../lib/AdminRouteGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminRouteGuard>{children}</AdminRouteGuard>
    </AuthProvider>
  );
}
