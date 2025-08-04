"use client";

import { Container, Row, Col, Card } from "react-bootstrap";

export default function TestProgressPage() {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h1>Test Progress</h1>
            </Card.Header>
            <Card.Body>
              <p>Test progress functionality will be implemented here.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
