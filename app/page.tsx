"use client";

import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleTrackPurchase = () => {
    router.push("/track");
  };

  const handleRedeem = () => {
    router.push("/redeem");
  };

  return (
    <>
      {/* Hero Section */}
      <div className="bg-light py-5 mb-5">
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="pe-lg-4">
                <h1 className="display-4 fw-bold text-dark mb-4">
                  Your Purchase.
                  <br />
                  <span className="text-primary">Your Impact.</span>
                </h1>
                <p className="fs-5 text-muted mb-4 lh-base">
                  Welcome to the future of impact-driven consumption. Track your
                  purchases, see your real-world impact, and be part of creating
                  meaningful change in communities worldwide.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleTrackPurchase}
                    className="px-4 py-3 fw-semibold"
                  >
                    <i className="bi bi-search me-2"></i>
                    Track Your Purchase
                  </Button>
                  <Button
                    variant="outline-success"
                    size="lg"
                    onClick={handleRedeem}
                    className="px-4 py-3 fw-semibold"
                  >
                    <i className="bi bi-gift me-2"></i>
                    Redeem Rewards
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <div className="position-relative">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center hero-logo-circle">
                    <h2 className="text-white fw-bold fs-1 mb-0">
                      H2<span className="text-warning">ALL</span>
                    </h2>
                  </div>
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                    <div className="text-center text-white">
                      <small className="d-block opacity-75">
                        IMPACT TRACKING
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* How It Works Section */}
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fs-2 fw-bold text-dark mb-3">How It Works</h2>
            <p className="fs-6 text-muted">
              Simple steps to track your impact and create change
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-circle">
                  <i className="bi bi-cart-check text-white fs-4"></i>
                </div>
                <h5 className="fw-bold mb-3">1. Make Your Purchase</h5>
                <p className="text-muted mb-0">
                  Buy H2All products and receive your unique tracking code with
                  every purchase.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-circle">
                  <i className="bi bi-search text-white fs-4"></i>
                </div>
                <h5 className="fw-bold mb-3">2. Track Your Impact</h5>
                <p className="text-muted mb-0">
                  Enter your code to see exactly how your purchase is creating
                  positive change.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="bg-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-circle">
                  <i className="bi bi-heart text-white fs-4"></i>
                </div>
                <h5 className="fw-bold mb-3">3. See Real Change</h5>
                <p className="text-muted mb-0">
                  Watch your cumulative impact grow and earn rewards for your
                  continued support.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Impact Stats Section */}
      <div className="bg-primary py-5 my-5">
        <Container>
          <Row className="text-center text-white">
            <Col md={3} className="mb-3 mb-md-0">
              <h3 className="fw-bold fs-2 mb-1">10K+</h3>
              <p className="mb-0 opacity-75">Products Tracked</p>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <h3 className="fw-bold fs-2 mb-1">$50K+</h3>
              <p className="mb-0 opacity-75">Impact Generated</p>
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <h3 className="fw-bold fs-2 mb-1">25+</h3>
              <p className="mb-0 opacity-75">Communities Helped</p>
            </Col>
            <Col md={3}>
              <h3 className="fw-bold fs-2 mb-1">100%</h3>
              <p className="mb-0 opacity-75">Transparency</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Call to Action Section */}
      <Container className="py-5">
        <Row className="text-center">
          <Col lg={8} className="mx-auto">
            <h2 className="fs-2 fw-bold text-dark mb-3">
              Ready to Make a Difference?
            </h2>
            <p className="fs-6 text-muted mb-4">
              Join thousands of customers who are tracking their impact and
              creating positive change in communities worldwide.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleTrackPurchase}
                className="px-5 py-3 fw-semibold"
              >
                Get Started Now
              </Button>
              <Button
                variant="outline-primary"
                size="lg"
                className="px-5 py-3 fw-semibold"
              >
                Learn More
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Beta Notice */}
      <div className="bg-light py-3">
        <Container>
          <Row className="text-center">
            <Col>
              <small className="text-muted">
                <i className="bi bi-info-circle me-2"></i>
                We are in beta phase—testing transparency in giving to create
                real change.
              </small>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
