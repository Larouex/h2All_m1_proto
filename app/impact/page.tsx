"use client";

import { Container, Row, Col, Card } from "react-bootstrap";

export default function Impact() {
  return (
    <Container className="py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fs-3 fw-bold text-dark mb-0">
          H2<span className="text-primary">ALL</span> WATER
        </h1>
      </div>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Text className="text-muted small">
                <strong>Step 3 of 3:</strong> Impact Confirmation - Customers
                see the positive impact of their purchase and feel connected to
                the cause.
              </Card.Text>
            </Card.Body>
          </Card>

          <h2 className="text-center mb-4">Thank You!</h2>
          <p className="text-center">
            Because of you, we are one step closer to funding a new well.
          </p>
        </Col>
      </Row>
    </Container>
  );
}
