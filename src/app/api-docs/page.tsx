import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import Link from "next/link";
import { ApiDocsContent } from "../admin/api-docs/client";

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

export default async function ApiDocsPage() {
  // Check authentication on server-side
  const auth = await checkAdminAuth();

  // Redirect if not authenticated
  if (!auth) {
    redirect("/auth?redirect=%2Fapi-docs");
  }

  // Redirect if not admin
  if (!auth.isAdmin) {
    redirect("/?error=admin-required");
  }

  // Now render the API documentation directly on server-side
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>H2All API Documentation</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <Container fluid className="py-4">
          <Row>
            <Col md={12}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h1 className="text-primary">
                    <i className="bi bi-code-square me-3"></i>
                    H2All API Documentation
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
      </body>
    </html>
  );
}
