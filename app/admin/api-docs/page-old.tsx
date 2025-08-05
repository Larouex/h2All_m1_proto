"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
} from "react-bootstrap";
import { useRouter } from "next/navigation";

interface SwaggerPath {
  [method: string]: unknown;
}

interface SwaggerSpec {
  paths?: {
    [path: string]: SwaggerPath;
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
                <Button
                  variant="primary"
                  onClick={() => window.open("/swagger.json", "_blank")}
                  size="sm"
                >
                  🧪 View OpenAPI Spec
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
            <Card>
              <Card.Header>
                <h5>API Documentation</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted mb-3">
                  The API specification has been loaded successfully. You can:
                </p>
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      const blob = new Blob(
                        [JSON.stringify(swaggerSpec, null, 2)],
                        {
                          type: "application/json",
                        }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "h2all-api-spec.json";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    size="sm"
                  >
                    📥 Download API Spec
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      const swaggerUrl = `https://editor.swagger.io/?url=${encodeURIComponent(
                        window.location.origin + "/swagger.json"
                      )}`;
                      window.open(swaggerUrl, "_blank");
                    }}
                    size="sm"
                  >
                    🔗 Open in Swagger Editor
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => window.open("/swagger.json", "_blank")}
                    size="sm"
                  >
                    📄 View Raw JSON
                  </Button>
                </div>

                <Alert variant="info">
                  <Alert.Heading>Using the API Documentation</Alert.Heading>
                  <ul className="mb-0">
                    <li>
                      Click &quot;Open in Swagger Editor&quot; to use the
                      interactive API explorer
                    </li>
                    <li>
                      Use the test buttons above to run pre-built API tests
                    </li>
                    <li>
                      Download the API spec to import into tools like Postman or
                      Insomnia
                    </li>
                  </ul>
                </Alert>

                <details className="mt-3">
                  <summary className="fw-bold">API Endpoints Summary</summary>
                  <div className="mt-2">
                    {swaggerSpec.paths &&
                      Object.keys(swaggerSpec.paths).map((path) => (
                        <div key={path} className="mb-2">
                          <code className="text-primary">{path}</code>
                          <div className="ms-3 small text-muted">
                            {swaggerSpec.paths &&
                              Object.keys(swaggerSpec.paths[path] || {}).map(
                                (method) => (
                                  <Badge
                                    key={method}
                                    bg="secondary"
                                    className="me-1"
                                  >
                                    {method.toUpperCase()}
                                  </Badge>
                                )
                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                </details>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}
