"use client";

import { useAuth } from "./auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminRouteGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export function AdminRouteGuard({
  children,
  fallbackPath = "/",
}: AdminRouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Not authenticated, redirect to auth page
      router.push("/auth");
    } else if (!isLoading && isAuthenticated && user && !user.isAdmin) {
      // Authenticated but not admin, redirect to fallback
      router.push(fallbackPath);
    }
  }, [isLoading, isAuthenticated, user, router, fallbackPath]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4>Authentication Required</h4>
          <p>You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  // Show error if not admin
  if (!user?.isAdmin) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>
            You don&apos;t have administrator privileges to access this page.
          </p>
          <p>
            If you believe this is an error, please contact your system
            administrator.
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin, render children
  return <>{children}</>;
}

export default AdminRouteGuard;
