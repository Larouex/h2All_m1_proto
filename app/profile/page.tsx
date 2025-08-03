"use client";

import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Alert,
} from "react-bootstrap";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth?redirect=/profile");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fs-3 fw-bold text-dark mb-0">
          H2<span className="text-primary">ALL</span> WATER
        </h1>
      </div>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h2 className="mb-0">User Profile</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>Personal Information</h5>
                  <p>
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Country:</strong> {user.country}
                  </p>
                  <p>
                    <strong>Account Status:</strong>{" "}
                    <Badge bg={user.isActive ? "success" : "danger"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </p>
                  {user.isAdmin && (
                    <p>
                      <strong>Access Level:</strong>{" "}
                      <Badge bg="warning" text="dark">
                        Administrator
                      </Badge>
                    </p>
                  )}
                </Col>
                <Col md={6}>
                  <h5>Account Summary</h5>
                  <p>
                    <strong>Balance:</strong> ${user.balance.toFixed(2)}
                  </p>
                  <p>
                    <strong>Total Redemptions:</strong> {user.totalRedemptions}
                  </p>
                  <p>
                    <strong>Total Redeemed Value:</strong> $
                    {user.totalRedemptionValue.toFixed(2)}
                  </p>
                  {user.lastLoginAt && (
                    <p>
                      <strong>Last Login:</strong>{" "}
                      {new Date(user.lastLoginAt).toLocaleDateString()}
                    </p>
                  )}
                </Col>
              </Row>

              <hr />

              <div className="d-flex gap-3">
                <Button
                  variant="primary"
                  onClick={() => router.push("/redeem")}
                >
                  View Redemptions
                </Button>
                {user.isAdmin && (
                  <Button
                    variant="outline-warning"
                    onClick={() => router.push("/admin")}
                  >
                    Admin Panel
                  </Button>
                )}
              </div>

              {user.balance > 0 && (
                <Alert variant="success" className="mt-3">
                  <Alert.Heading>💰 Available Balance</Alert.Heading>
                  You have ${user.balance.toFixed(2)} available for redemption!
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
