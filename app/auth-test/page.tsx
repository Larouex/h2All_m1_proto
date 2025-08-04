"use client";

import { useEffect, useState } from "react";
import { Container, Card, Button, Alert, Badge } from "react-bootstrap";

interface UserInfo {
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    balance: number;
  };
  authenticated: boolean;
}

export default function AuthTest() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setUserInfo(data);
      } else {
        setError(data.error || "Failed to fetch user info");
      }
    } catch (err) {
      setError("Network error");
      console.error("Auth test error:", err);
    } finally {
      setLoading(false);
    }
  };

  const testAdminAccess = async () => {
    try {
      const response = await fetch("/admin", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        alert("✅ Admin access granted!");
        window.location.href = "/admin";
      } else {
        alert(
          `❌ Admin access denied: ${response.status} ${response.statusText}`
        );
      }
    } catch (err) {
      alert(`❌ Admin access failed: ${err}`);
    }
  };

  const promoteUser = async () => {
    const email = prompt("Enter email address to promote to admin:");
    if (!email) return;

    try {
      const response = await fetch("/api/admin/promote-user", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ User ${email} promoted to admin successfully!`);
      } else {
        alert(`❌ Failed to promote user: ${data.error}`);
      }
    } catch (err) {
      alert(`❌ Promote user failed: ${err}`);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUserInfo(null);
      window.location.href = "/auth";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <Container className="py-5">
      <Card>
        <Card.Header>
          <h2>🔐 Authentication Test Page</h2>
        </Card.Header>
        <Card.Body>
          {loading && <p>Loading...</p>}

          {error && (
            <Alert variant="danger">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {userInfo && userInfo.authenticated && (
            <div>
              <Alert variant="success">
                <strong>✅ Authenticated!</strong>
              </Alert>

              <h4>User Information:</h4>
              <ul>
                <li>
                  <strong>ID:</strong> {userInfo.user?.id}
                </li>
                <li>
                  <strong>Email:</strong> {userInfo.user?.email}
                </li>
                <li>
                  <strong>Name:</strong> {userInfo.user?.firstName}{" "}
                  {userInfo.user?.lastName}
                </li>
                <li>
                  <strong>Balance:</strong> ${userInfo.user?.balance || 0}
                </li>
                <li>
                  <strong>Admin Status:</strong>{" "}
                  {userInfo.user?.isAdmin ? (
                    <Badge bg="success">Admin User</Badge>
                  ) : (
                    <Badge bg="secondary">Regular User</Badge>
                  )}
                </li>
              </ul>

              <div className="d-flex gap-2 mt-3">
                <Button onClick={fetchUserInfo} variant="primary">
                  🔄 Refresh User Info
                </Button>
                <Button onClick={testAdminAccess} variant="warning">
                  🛡️ Test Admin Access
                </Button>
                {userInfo.user?.isAdmin && (
                  <Button onClick={promoteUser} variant="info">
                    👑 Promote User to Admin
                  </Button>
                )}
                <Button onClick={logout} variant="danger">
                  🚪 Logout
                </Button>
              </div>
            </div>
          )}

          {userInfo && !userInfo.authenticated && (
            <div>
              <Alert variant="warning">
                <strong>❌ Not Authenticated</strong>
              </Alert>
              <Button href="/auth" variant="primary">
                Go to Login
              </Button>
            </div>
          )}

          <hr />

          <h4>Quick Links:</h4>
          <div className="d-flex gap-2">
            <Button href="/auth" variant="outline-primary" size="sm">
              Login/Register
            </Button>
            <Button href="/admin" variant="outline-warning" size="sm">
              Admin Dashboard
            </Button>
            <Button href="/" variant="outline-secondary" size="sm">
              Home
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
