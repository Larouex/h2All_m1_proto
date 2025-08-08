import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import Link from "next/link";
import "../admin.css";
import { ApiDocsContent } from "./client";

// Server-side authentication check
async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token.value);
    return payload;
  } catch {
    return null;
  }
}

export default async function AdminApiDocsPage() {
  // Check authentication on server-side
  const auth = await checkAdminAuth();

  // Redirect if not authenticated
  if (!auth) {
    redirect("/auth?redirect=%2Fadmin%2Fapi-docs");
  }

  // Redirect if not admin
  if (!auth.isAdmin) {
    redirect("/?error=admin-required");
  }

  // Now render the API documentation directly on server-side
  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="admin-page-title">
                <i className="bi bi-code-square text-primary me-3"></i>
                API Documentation
              </h1>
              <p className="text-muted">
                Comprehensive API reference for H2All platform integration
              </p>
            </div>
            <Link href="/admin" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Admin
            </Link>
          </div>

          {/* Client component with all interactive features */}
          <ApiDocsContent />
        </Col>
      </Row>
    </Container>
  );
}
