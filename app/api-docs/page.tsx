"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";

export default function ApiDocsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin API docs after a short delay
    const timer = setTimeout(() => {
      router.push("/admin/api-docs");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirectNow = () => {
    router.push("/admin/api-docs");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body className="text-center">
              <Alert variant="info">
                <Alert.Heading>API Documentation Moved</Alert.Heading>
                <p>
                  The API documentation has been moved to the admin area for
                  better organization. You will be redirected automatically in a
                  few seconds.
                </p>
              </Alert>

              <h3 className="mb-4">🔧 Developer Resources Relocated</h3>
              <p className="text-muted mb-4">
                All API documentation, testing tools, and database management
                features are now available in the dedicated admin dashboard.
              </p>

              <div className="d-flex gap-2 justify-content-center">
                <Button variant="primary" onClick={handleRedirectNow}>
                  Go to Admin API Docs
                </Button>
                <Button variant="outline-secondary" onClick={handleGoHome}>
                  Return to Home
                </Button>
              </div>

              <div className="mt-4">
                <small className="text-muted">
                  Redirecting automatically in 3 seconds...
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
