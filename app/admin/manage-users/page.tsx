"use client";

import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
} from "react-bootstrap";
import { AuthProvider } from "../../lib/auth-context";
import AdminRouteGuard from "../../lib/AdminRouteGuard";

interface ManageUserResult {
  success: boolean;
  message?: string;
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
  };
  error?: string;
}

function ManageUserContent() {
  const [email, setEmail] = useState("");
  const [adminStatus, setAdminStatus] = useState("");
  const [result, setResult] = useState<ManageUserResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/manage-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          isAdmin: adminStatus === "true",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          user: data.user,
        });
        setEmail("");
        setAdminStatus("");
      } else {
        setResult({
          success: false,
          error: data.error,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Request failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const makeAdmin = async (userEmail: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/manage-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail, isAdmin: true }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          user: data.user,
        });
      } else {
        setResult({
          success: false,
          error: data.error,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Request failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h2 className="mb-0">Manage User Admin Status</h2>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Use this tool to grant or revoke admin access for users.
              </p>

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>User Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter user email"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Admin Status</Form.Label>
                      <Form.Select
                        value={adminStatus}
                        onChange={(e) => setAdminStatus(e.target.value)}
                        aria-label="Admin status selection"
                        required
                      >
                        <option value="">Select status</option>
                        <option value="true">Grant Admin Access</option>
                        <option value="false">Revoke Admin Access</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>&nbsp;</Form.Label>
                      <Button
                        type="submit"
                        className="w-100"
                        disabled={isLoading}
                      >
                        {isLoading ? "Updating..." : "Update"}
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>

              <hr />

              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5>Quick Setup</h5>
                  <p className="text-muted mb-0">
                    Make your account an admin for testing
                  </p>
                </div>
                <Button
                  variant="outline-primary"
                  onClick={() => makeAdmin("larouex@larouex.com")}
                  disabled={isLoading}
                >
                  Make larouex@larouex.com Admin
                </Button>
              </div>

              {result && (
                <Alert
                  variant={result.success ? "success" : "danger"}
                  className="mt-4"
                >
                  {result.success ? (
                    <>
                      <Alert.Heading>✅ Success!</Alert.Heading>
                      {result.user && (
                        <div>
                          <p>
                            <strong>User:</strong> {result.user.firstName}{" "}
                            {result.user.lastName} ({result.user.email})
                          </p>
                          <p>
                            <strong>Admin Status:</strong>{" "}
                            <Badge
                              bg={result.user.isAdmin ? "success" : "secondary"}
                            >
                              {result.user.isAdmin
                                ? "Admin Access Granted"
                                : "Admin Access Revoked"}
                            </Badge>
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Alert.Heading>❌ Error</Alert.Heading>
                      <p>
                        <strong>Error:</strong> {result.error}
                      </p>
                    </>
                  )}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default function ManageUserPage() {
  return (
    <AuthProvider>
      <AdminRouteGuard>
        <ManageUserContent />
      </AdminRouteGuard>
    </AuthProvider>
  );
}
