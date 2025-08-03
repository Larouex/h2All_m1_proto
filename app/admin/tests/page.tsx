"use client";

import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function TestsIndexPage() {
  const router = useRouter();

  const testPages = [
    {
      title: "Progress Bar Component",
      description:
        "Test the ProgressBar component with different step configurations",
      path: "/admin/tests/progress",
      icon: "bi-bar-chart-steps",
      category: "Components",
    },
    {
      title: "Campaign Info Component",
      description:
        "Test different campaign states and authentication scenarios",
      path: "/admin/tests/campaign-info",
      icon: "bi-clipboard-check",
      category: "Components",
    },
    {
      title: "Cookie Tests",
      description: "Test cookie functionality and session management",
      path: "/admin/test-cookies",
      icon: "bi-cookie",
      category: "Authentication",
    },
    {
      title: "Redemption URLs",
      description: "Test redemption URL generation and validation",
      path: "/admin/test-redemption-urls",
      icon: "bi-link-45deg",
      category: "Redemption",
    },
    {
      title: "Redemption Flow",
      description: "Test the complete redemption process flow",
      path: "/admin/test-redemption-flow",
      icon: "bi-arrow-right-circle",
      category: "Redemption",
    },
  ];

  const categories = [...new Set(testPages.map((page) => page.category))];

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fs-3 fw-bold text-dark mb-0">
          H2<span className="text-primary">ALL</span> WATER
        </h1>
      </div>

      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h2 className="mb-3">
              <i className="bi bi-flask me-2"></i>
              Test Suite
            </h2>
            <p className="text-muted">
              Component and functionality testing pages for development and QA
            </p>
          </div>
        </Col>
      </Row>

      {categories.map((category) => (
        <div key={category} className="mb-5">
          <h3 className="mb-3 text-primary">
            <i className="bi bi-folder2-open me-2"></i>
            {category} Tests
          </h3>

          <Row>
            {testPages
              .filter((page) => page.category === category)
              .map((page, index) => (
                <Col key={index} md={6} lg={4} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body className="d-flex flex-column">
                      <div className="text-center mb-3">
                        <i className={`${page.icon} fs-1 text-primary`}></i>
                      </div>

                      <Card.Title className="text-center mb-3">
                        {page.title}
                      </Card.Title>

                      <Card.Text className="text-muted small flex-grow-1">
                        {page.description}
                      </Card.Text>

                      <Button
                        variant="outline-primary"
                        onClick={() => router.push(page.path)}
                        className="mt-auto"
                      >
                        <i className="bi bi-play me-2"></i>
                        Run Test
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </div>
      ))}

      <Row className="mt-5">
        <Col>
          <Card className="bg-light border-0">
            <Card.Body>
              <div className="d-flex align-items-center">
                <i className="bi bi-info-circle fs-4 text-info me-3"></i>
                <div>
                  <h6 className="mb-1">About Test Pages</h6>
                  <small className="text-muted">
                    These test pages are for development and QA purposes. They
                    allow testing of individual components and system
                    functionality in isolation.
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
