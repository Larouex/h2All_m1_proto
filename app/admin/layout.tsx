"use client";

import { AuthProvider } from "../lib/auth-context";
import AdminRouteGuard from "../lib/AdminRouteGuard";
import AdminNavBar from "../components/AdminNavBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminRouteGuard>
        <AdminNavBar />
        <div className="admin-content">{children}</div>
        <style jsx>{`
          .admin-content {
            padding-top: 76px;
          }
        `}</style>
      </AdminRouteGuard>
    </AuthProvider>
  );
}
