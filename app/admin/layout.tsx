"use client";

import { AuthProvider } from "../lib/auth-context";
import AdminRouteGuard from "../lib/AdminRouteGuard";
import AdminNavBar from "../components/AdminNavBar";
import Footer from "../components/Footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminRouteGuard>
        <div className="admin-layout">
          <AdminNavBar />
          <div className="admin-content">{children}</div>
          <Footer />
        </div>
        <style jsx>{`
          .admin-layout {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .admin-content {
            padding-top: 76px;
            flex: 1;
          }
        `}</style>
      </AdminRouteGuard>
    </AuthProvider>
  );
}
