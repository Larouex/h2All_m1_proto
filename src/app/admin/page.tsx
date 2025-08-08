"use client";

import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import "./admin.css";

export default function AdminHomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="admin-loading-container">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5>Loading Admin Panel...</h5>
          </div>
        </div>
      </Container>
    );
  }

  // Redirect if not authenticated (middleware should handle this, but adding as fallback)
  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger text-center">
          <h4>Authentication Required</h4>
          <p>Please log in to access the admin panel.</p>
          <Link href="/auth" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </Container>
    );
  }

  // Check if user has admin access
  if (!user?.isAdmin) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning text-center">
          <h4>Admin Access Required</h4>
          <p>You don&apos;t have permission to access the admin panel.</p>
          <p>
            Please contact an administrator if you believe this is an error.
          </p>
          <Link href="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h1 className="text-primary">H2ALL Admin Panel</h1>
        <p className="text-muted">
          Welcome back, {user.firstName}! Manage your H2ALL platform from here.
        </p>
      </div>

      <Row className="g-4">
        <Col md={6} lg={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi-graph-up text-primary admin-icon-large"></i>
              </div>
              <Card.Title>Analytics Dashboard</Card.Title>
              <Card.Text>
                View comprehensive analytics, charts, and reports for campaigns,
                users, and platform performance.
              </Card.Text>
              <Link href="/admin/analytics" className="btn btn-primary">
                <i className="bi-arrow-right me-2"></i>
                Open Analytics
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi-people text-success admin-icon-large"></i>
              </div>
              <Card.Title>User Management</Card.Title>
              <Card.Text>
                Manage user accounts, permissions, and view user activity across
                the platform.
              </Card.Text>
              <Link href="/admin/users" className="btn btn-success">
                <i className="bi-arrow-right me-2"></i>
                Manage Users
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi-megaphone text-warning admin-icon-large"></i>
              </div>
              <Card.Title>Campaign Management</Card.Title>
              <Card.Text>
                Create, edit, and monitor crowdfunding campaigns and their
                performance metrics.
              </Card.Text>
              <Link href="/admin/campaigns" className="btn btn-warning">
                <i className="bi-arrow-right me-2"></i>
                Manage Campaigns
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi-database text-info admin-icon-large"></i>
              </div>
              <Card.Title>Data Management</Card.Title>
              <Card.Text>
                Access and manage platform data, exports, and database
                operations.
              </Card.Text>
              <Link href="/admin/data" className="btn btn-info">
                <i className="bi-arrow-right me-2"></i>
                Manage Data
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi-ticket text-danger admin-icon-large"></i>
              </div>
              <Card.Title>Redemption Codes</Card.Title>
              <Card.Text>
                Generate, manage, and track redemption codes for platform
                rewards.
              </Card.Text>
              <Link href="/admin/codes" className="btn btn-danger">
                <i className="bi-arrow-right me-2"></i>
                Manage Codes
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4}>
          <Card className="h-100">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi-gear text-secondary admin-icon-large"></i>
              </div>
              <Card.Title>API Documentation</Card.Title>
              <Card.Text>
                View API documentation, endpoints, and integration guides for
                developers.
              </Card.Text>
              <Link href="/admin/api-docs" className="btn btn-secondary">
                <i className="bi-arrow-right me-2"></i>
                View API Docs
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <Card className="bg-light">
            <Card.Body>
              <h5>Quick Stats</h5>
              <Row className="text-center">
                <Col>
                  <div className="fw-bold text-primary fs-4">1,250,000</div>
                  <small className="text-muted">Total Revenue</small>
                </Col>
                <Col>
                  <div className="fw-bold text-success fs-4">25</div>
                  <small className="text-muted">Active Campaigns</small>
                </Col>
                <Col>
                  <div className="fw-bold text-info fs-4">5,420</div>
                  <small className="text-muted">Total Users</small>
                </Col>
                <Col>
                  <div className="fw-bold text-warning fs-4">89%</div>
                  <small className="text-muted">Platform Health</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
