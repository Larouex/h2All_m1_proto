"use client";

import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Track() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // API response is successful, navigate to impact page
        router.push("/impact");
      } else {
        console.error("Failed to subscribe:", await response.text());
      }
    } catch (error) {
      console.error("Error submitting email:", error);
    }
  };
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
                <strong>Step 2 of 3:</strong> Email Collection - Customers
                provide their email to track their purchase and receive impact
                updates.
              </Card.Text>
            </Card.Body>
          </Card>

          <h1 className="text-center mb-4">Track Your Purchase</h1>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-center">
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
