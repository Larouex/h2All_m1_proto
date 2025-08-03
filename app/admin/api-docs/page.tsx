"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function AdminApiDocs() {
  const router = useRouter();
  const [swaggerSpec, setSwaggerSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSwaggerSpec();
  }, []);

  const fetchSwaggerSpec = async () => {
    try {
      const response = await fetch("/api/swagger");
      if (response.ok) {
        const spec = await response.json();
        setSwaggerSpec(spec);
      } else {
        setError("Failed to load API documentation");
      }
    } catch (err) {
      setError("Error loading API documentation");
      console.error("Swagger spec error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openTestPage = () => {
    window.open("/test-campaign-api.html", "_blank");
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading API documentation...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <Alert.Heading>Error Loading API Documentation</Alert.Heading>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={fetchSwaggerSpec}>
                Try Again
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <Card.Title>H2All M1 API Documentation</Card.Title>
                  <Card.Text>
                    Complete API documentation for the H2All M1 campaign and
                    redemption code system. Use this documentation to understand
                    available endpoints, request/response formats, and test API
                    functionality.
                  </Card.Text>
                </div>
                <Button
                  variant="outline-secondary"
                  onClick={() => router.push("/admin")}
                >
                  ← Back to Admin
                </Button>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Button variant="primary" onClick={openTestPage} size="sm">
                  🧪 Open Interactive Test Page
                </Button>
                <Button
                  variant="outline-secondary"
                  href="/api/test"
                  target="_blank"
                  size="sm"
                >
                  ⚡ Run Database Tests
                </Button>
                <Button
                  variant="outline-info"
                  href="/test-campaign-api.html"
                  target="_blank"
                  size="sm"
                >
                  📊 Campaign API Tests
                </Button>
                <Button
                  variant="outline-success"
                  href="/test-redemption-api.html"
                  target="_blank"
                  size="sm"
                >
                  🎫 Redemption API Tests
                </Button>
                <Button
                  variant="outline-warning"
                  href="/test-validation-api.html"
                  target="_blank"
                  size="sm"
                >
                  ✅ Validation API Tests
                </Button>
              </div>
            </Card.Body>
          </Card>

          {swaggerSpec && (
            <div className="swagger-container">
              <SwaggerUI
                spec={swaggerSpec}
                deepLinking={true}
                displayOperationId={false}
                defaultModelsExpandDepth={1}
                defaultModelExpandDepth={1}
                docExpansion="none"
                persistAuthorization={true}
                tryItOutEnabled={true}
              />
            </div>
          )}
        </Col>
      </Row>

      <style jsx>{`
        .swagger-container {
          min-height: 600px;
        }
      `}</style>
    </Container>
  );
}
