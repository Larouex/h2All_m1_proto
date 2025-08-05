"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import SwaggerUI from "@/app/components/SwaggerUI";
import "@/app/styles/swagger-ui.css";

interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: {
    [path: string]: {
      [method: string]: unknown;
    };
  };
  [key: string]: unknown;
}

export default function AdminApiDocs() {
  const router = useRouter();
  const [swaggerSpec, setSwaggerSpec] = useState<SwaggerSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSwaggerSpec();
  }, []);

  const fetchSwaggerSpec = async () => {
    try {
      setLoading(true);
      setError(null);
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

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p>Loading API documentation...</p>
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
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Card.Title className="h4">
                    {swaggerSpec?.info?.title || "H2All M1 API Documentation"}
                  </Card.Title>
                  <Card.Text className="text-muted">
                    {swaggerSpec?.info?.description ||
                      "Complete API documentation for the H2All M1 campaign and redemption code system. Test all endpoints directly in your browser."}
                  </Card.Text>
                  {swaggerSpec?.info?.version && (
                    <small className="text-muted">
                      Version: {swaggerSpec.info.version}
                    </small>
                  )}
                </div>
                <Button
                  variant="outline-secondary"
                  onClick={() => router.push("/admin")}
                  size="sm"
                >
                  ← Back to Admin
                </Button>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="outline-primary"
                  href="/api/test"
                  target="_blank"
                  size="sm"
                >
                  🧪 Database Tests
                </Button>
                <Button
                  variant="outline-info"
                  href="/test-campaign-api.html"
                  target="_blank"
                  size="sm"
                >
                  📊 Campaign Tests
                </Button>
                <Button
                  variant="outline-success"
                  href="/test-redemption-api.html"
                  target="_blank"
                  size="sm"
                >
                  🎫 Redemption Tests
                </Button>
                <Button
                  variant="outline-warning"
                  href="/api/swagger"
                  target="_blank"
                  size="sm"
                >
                  📄 Raw JSON
                </Button>
              </div>
            </Card.Body>
          </Card>

          {swaggerSpec && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">🚀 Interactive API Explorer</h5>
                <small className="text-muted">
                  Click any endpoint below to expand it, then use &quot;Try it
                  out&quot; to test your APIs directly
                </small>
              </Card.Header>
              <Card.Body className="p-0">
                <SwaggerUI spec={swaggerSpec} />
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}
