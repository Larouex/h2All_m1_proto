"use client";

import { useAuth } from "./auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert, Container, Spinner } from "react-bootstrap";

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
      // Not authenticated, redirect to login
      router.push("/login");
    } else if (!isLoading && isAuthenticated && user && !user.isAdmin) {
      // Authenticated but not admin, redirect to fallback
      router.push(fallbackPath);
    }
  }, [isLoading, isAuthenticated, user, router, fallbackPath]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Checking access permissions...</p>
        </div>
      </Container>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Authentication Required</Alert.Heading>
          <p>You need to be logged in to access this page.</p>
        </Alert>
      </Container>
    );
  }

  // Show error if not admin
  if (!user?.isAdmin) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Access Denied</Alert.Heading>
          <p>
            You don&apos;t have administrator privileges to access this page.
          </p>
          <p>
            If you believe this is an error, please contact your system
            administrator.
          </p>
        </Alert>
      </Container>
    );
  }

  // User is authenticated and is admin, render children
  return <>{children}</>;
}

export default AdminRouteGuard;
