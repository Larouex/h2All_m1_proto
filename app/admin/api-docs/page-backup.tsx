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
  Badge,
  ListGroup,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import SwaggerUI from "@/app/components/SwaggerUI";

interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: {
    [path: string]: {
      [method: string]: {
        tags?: string[];
        summary?: string;
      };
    };
  };
  tags?: Array<{
    name: string;
    description: string;
  }>;
  [key: string]: unknown;
}

interface ApiStats {
  totalEndpoints: number;
  byCategory: { [key: string]: number };
  byMethod: { [key: string]: number };
}

export default function AdminApiDocs() {
  const router = useRouter();
  const [swaggerSpec, setSwaggerSpec] = useState<SwaggerSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [apiStats, setApiStats] = useState<ApiStats | null>(null);

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
        calculateApiStats(spec);
      } else {
        setError("Failed to load API documentation");
      }
    } catch (err) {
      console.error("Error fetching swagger spec:", err);
      setError("Error loading API documentation");
    } finally {
      setLoading(false);
    }
  };

  const calculateApiStats = (spec: SwaggerSpec) => {
    const stats: ApiStats = {
      totalEndpoints: 0,
      byCategory: {},
      byMethod: {}
    };

    Object.entries(spec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, details]) => {
        stats.totalEndpoints++;
        
        // Count by method
        const methodUpper = method.toUpperCase();
        stats.byMethod[methodUpper] = (stats.byMethod[methodUpper] || 0) + 1;
        
        // Count by category (tags)
        if (details.tags && details.tags.length > 0) {
          const category = details.tags[0];
          stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
        } else {
          stats.byCategory['Uncategorized'] = (stats.byCategory['Uncategorized'] || 0) + 1;
        }
      });
    });

    setApiStats(stats);
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get': return 'primary';
      case 'post': return 'success';
      case 'put': return 'warning';
      case 'delete': return 'danger';
      case 'patch': return 'info';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading API Documentation...</p>
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
              <hr />
              <div className="d-flex gap-2">
                <Button variant="outline-danger" onClick={fetchSwaggerSpec}>
                  Retry
                </Button>
                <Button variant="outline-secondary" onClick={() => router.push("/admin")}>
                  Back to Admin
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1>🔧 API Documentation</h1>
              <p className="text-muted">
                Complete H2All M1 Proto API Reference - {swaggerSpec?.info?.version}
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-info" 
                size="sm" 
                onClick={() => setShowStats(!showStats)}
              >
                {showStats ? 'Hide' : 'Show'} Stats
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={() => router.push("/admin")}>
                Back to Admin
              </Button>
            </div>
          </div>

          {showStats && apiStats && (
            <Row className="mb-4">
              <Col md={12}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">📊 API Statistics</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <div className="text-center">
                          <h3 className="text-primary">{apiStats.totalEndpoints}</h3>
                          <small className="text-muted">Total Endpoints</small>
                        </div>
                      </Col>
                      <Col md={4}>
                        <h6>By HTTP Method</h6>
                        <div className="d-flex flex-wrap gap-1">
                          {Object.entries(apiStats.byMethod).map(([method, count]) => (
                            <Badge 
                              key={method} 
                              bg={getMethodBadgeColor(method)}
                              className="d-flex align-items-center gap-1"
                            >
                              {method} <span className="badge bg-light text-dark">{count}</span>
                            </Badge>
                          ))}
                        </div>
                      </Col>
                      <Col md={5}>
                        <h6>By Category</h6>
                        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                          <ListGroup variant="flush" className="small">
                            {Object.entries(apiStats.byCategory)
                              .sort(([,a], [,b]) => b - a)
                              .map(([category, count]) => (
                                <ListGroup.Item 
                                  key={category} 
                                  className="d-flex justify-content-between align-items-center py-1 px-2"
                                >
                                  <span>{category}</span>
                                  <Badge bg="secondary">{count}</Badge>
                                </ListGroup.Item>
                              ))}
                          </ListGroup>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">📋 Interactive API Documentation</h5>
                    <small className="text-muted">
                      {swaggerSpec?.tags?.length || 0} categories • OpenAPI 3.0
                    </small>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  {swaggerSpec && (
                    <div style={{ minHeight: "600px" }}>
                      <SwaggerUI spec={swaggerSpec} />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={12}>
              <Alert variant="info">
                <Alert.Heading>🚀 API Documentation Features</Alert.Heading>
                <Row>
                  <Col md={6}>
                    <ul className="mb-0">
                      <li><strong>Complete Coverage:</strong> All {apiStats?.totalEndpoints} endpoints documented</li>
                      <li><strong>Interactive Testing:</strong> Try endpoints directly from the docs</li>
                      <li><strong>Security Information:</strong> Authentication requirements clearly marked</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <ul className="mb-0">
                      <li><strong>Request/Response Examples:</strong> Full schema definitions</li>
                      <li><strong>Categorized Organization:</strong> Grouped by functionality</li>
                      <li><strong>Development Ready:</strong> Copy-paste code examples</li>
                    </ul>
                  </Col>
                </Row>
              </Alert>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
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
