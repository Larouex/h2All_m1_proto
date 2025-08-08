"use client";

import { Container, Row, Col, Card, Alert } from "react-bootstrap";

export default function Claim3Page() {
  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h2>Claim 3</h2>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                This page is under development.
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}