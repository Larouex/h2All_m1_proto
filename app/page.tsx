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
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Text className="text-muted small">
                <strong>Step 1 of 3:</strong> Value Proposition - This is where
                customers learn about the impact of their purchase and begin
                their tracking journey.
              </Card.Text>
            </Card.Body>
          </Card>

          <h1 className="text-center mb-4">Your Purchase Creates Change.</h1>
          <div className="d-flex justify-content-center gap-3">
            <Button variant="primary" size="lg" onClick={handleTrackPurchase}>
              Track Purchase
            </Button>
            <Button variant="success" size="lg" onClick={handleRedeem}>
              Redeem Rewards
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
