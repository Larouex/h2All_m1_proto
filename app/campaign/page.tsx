"use client";

import { Container, Row, Col, Card } from "react-bootstrap";

export default function CampaignPage() {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h1>Campaign Management</h1>
            </Card.Header>
            <Card.Body>
              <p>Campaign management functionality will be implemented here.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
