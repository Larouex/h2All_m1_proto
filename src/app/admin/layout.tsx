"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth-context";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Skip AuthProvider for API docs page since it handles auth server-side
  if (pathname === "/admin/api-docs") {
    return <>{children}</>;
  }

  return <AuthProvider>{children}</AuthProvider>;
}
