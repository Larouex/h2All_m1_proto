"use client";

import { Container, Card, Row, Col } from "react-bootstrap";
import ProgressBar from "@/components/ProgressBar";

export default function TestProgressPage() {
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
          <h2 className="text-center mb-4">ProgressBar Component Demo</h2>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>3 Steps - Currently on Step 1</Card.Title>
              <ProgressBar totalSteps={3} currentStep={1} />
              <small className="text-muted">
                Code: &lt;ProgressBar totalSteps={3} currentStep={1} /&gt;
              </small>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>3 Steps - Currently on Step 2</Card.Title>
              <ProgressBar totalSteps={3} currentStep={2} />
              <small className="text-muted">
                Code: &lt;ProgressBar totalSteps={3} currentStep={2} /&gt;
              </small>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>3 Steps - Completed (Step 3)</Card.Title>
              <ProgressBar totalSteps={3} currentStep={3} />
              <small className="text-muted">
                Code: &lt;ProgressBar totalSteps={3} currentStep={3} /&gt;
              </small>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>5 Steps - Currently on Step 3</Card.Title>
              <ProgressBar totalSteps={5} currentStep={3} />
              <small className="text-muted">
                Code: &lt;ProgressBar totalSteps={5} currentStep={3} /&gt;
              </small>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>7 Steps - Currently on Step 1</Card.Title>
              <ProgressBar totalSteps={7} currentStep={1} />
              <small className="text-muted">
                Code: &lt;ProgressBar totalSteps={7} currentStep={1} /&gt;
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
