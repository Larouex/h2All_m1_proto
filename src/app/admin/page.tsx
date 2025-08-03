"use client";

import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const handleApiDocs = () => {
    router.push("/admin/api-docs");
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Alert variant="warning" className="mb-4">
            <Alert.Heading>🔧 Admin Dashboard</Alert.Heading>
            <p>
              This area contains developer tools, API testing, and database
              management. For production use, access should be restricted to
              authorized personnel only.
            </p>
          </Alert>

          <h1 className="text-center mb-5">H2All M1 Admin Dashboard</h1>

          <Row>
            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>📚 API Documentation</Card.Title>
                  <Card.Text>
                    Interactive Swagger documentation for all campaign and
                    redemption code endpoints. Test API calls and view response
                    schemas.
                  </Card.Text>
                  <Button variant="primary" onClick={handleApiDocs}>
                    Open API Docs
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>🧪 Campaign API Testing</Card.Title>
                  <Card.Text>
                    Interactive test page for campaign CRUD operations. Create,
                    read, update, and delete campaigns with real-time feedback.
                  </Card.Text>
                  <Button
                    variant="outline-primary"
                    onClick={() =>
                      window.open("/test-campaign-api.html", "_blank")
                    }
                  >
                    Open Test Page
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>⚡ Database Operations</Card.Title>
                  <Card.Text>
                    Automated database testing and validation. Test Azure Data
                    Tables operations and data integrity checks.
                  </Card.Text>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      variant="outline-success"
                      onClick={() => window.open("/api/test", "_blank")}
                    >
                      Run Database Tests
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        window.open("/test-validation-api.html", "_blank")
                      }
                    >
                      Test Validation API
                    </Button>
                    <Button
                      variant="outline-warning"
                      onClick={() =>
                        window.open("/test-redemption-api.html", "_blank")
                      }
                    >
                      Test Redemption API
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>📊 Data Management</Card.Title>
                  <Card.Text>
                    Browse and manage campaigns, redemption codes, and user
                    data. Add test records and view system statistics.
                  </Card.Text>
                  <Button
                    variant="outline-info"
                    onClick={() => router.push("/admin/data")}
                  >
                    Manage Data
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100 border-primary">
                <Card.Body>
                  <Card.Title>🔐 Secure Code Generation</Card.Title>
                  <Card.Text>
                    Advanced redemption code management with cryptographically
                    secure generation, bulk operations, and real-time
                    validation. Features 1M+ codes/second performance.
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => router.push("/admin/codes")}
                  >
                    Manage Codes
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100 border-info">
                <Card.Body>
                  <Card.Title>🍪 Cookie Utilities Testing</Card.Title>
                  <Card.Text>
                    Comprehensive testing suite for campaign cookie management.
                    Test setting, retrieving, expiration handling, and UTM
                    parameter management with real-time validation.
                  </Card.Text>
                  <Button
                    variant="info"
                    onClick={() => router.push("/admin/test-cookies")}
                  >
                    Test Cookie Utils
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="mt-4">
            <Card.Body>
              <Card.Title>🚀 Quick Actions</Card.Title>
              <Card.Text>
                Common administrative tasks and shortcuts for development and
                testing.
              </Card.Text>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => router.push("/admin/campaigns")}
                >
                  Campaign Manager
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => router.push("/admin/codes")}
                >
                  🔐 Redemption Codes
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => router.push("/admin/users")}
                >
                  User Management
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => router.push("/admin/test-cookies")}
                >
                  🍪 Cookie Tests
                </Button>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() =>
                    window.open("/test-validation-api.html", "_blank")
                  }
                >
                  ✅ Validation API
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    window.open("/test-redemption-api.html", "_blank")
                  }
                >
                  🎯 Redemption API
                </Button>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => window.open("/api/health", "_blank")}
                >
                  System Health
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Body>
              <Card.Title>📋 System Information</Card.Title>
              <Card.Text>
                Current system status and configuration details.
              </Card.Text>
              <ul className="mb-0">
                <li>
                  <strong>Environment:</strong> Development
                </li>
                <li>
                  <strong>API Version:</strong> 1.0.0
                </li>
                <li>
                  <strong>Database:</strong> Azure Data Tables
                </li>
                <li>
                  <strong>Documentation:</strong> OpenAPI 3.0 / Swagger
                </li>
              </ul>
            </Card.Body>
          </Card>

          <div className="text-center mt-4">
            <Button variant="secondary" onClick={() => router.push("/")}>
              ← Back to Home
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
