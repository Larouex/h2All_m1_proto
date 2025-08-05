"use client";

import { Container, Row, Col, Card } from "react-bootstrap";

export default function Terms() {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Body className="p-5">
              <h1 className="mb-4">Terms and Conditions</h1>

              <p className="text-muted mb-4">
                <strong>Effective Date:</strong> August 5, 2025
              </p>

              <section className="mb-4">
                <h3>Acceptance of Terms</h3>
                <p>
                  By using H2All&apos;s impact tracking platform, you agree to
                  be bound by these Terms and Conditions. If you do not agree to
                  these terms, please do not use our services.
                </p>
              </section>

              <section className="mb-4">
                <h3>Service Description</h3>
                <p>
                  H2All provides a platform for tracking the environmental and
                  social impact of your purchases. Our service includes
                  redemption code validation, impact tracking, and reward
                  management.
                </p>
              </section>

              <section className="mb-4">
                <h3>User Responsibilities</h3>
                <ul>
                  <li>Provide accurate information when using our services</li>
                  <li>Use redemption codes only for legitimate purchases</li>
                  <li>Respect the privacy and rights of other users</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section className="mb-4">
                <h3>Beta Service Notice</h3>
                <p>
                  H2All is currently in beta phase. Services may be modified,
                  interrupted, or discontinued without notice. We are testing
                  transparency in giving to create real change.
                </p>
              </section>

              <section className="mb-4">
                <h3>Intellectual Property</h3>
                <p>
                  All content, trademarks, and intellectual property on this
                  platform are owned by H2All or our licensors. Users may not
                  reproduce, distribute, or create derivative works without
                  permission.
                </p>
              </section>

              <section className="mb-4">
                <h3>Limitation of Liability</h3>
                <p>
                  H2All provides services &quot;as is&quot; without warranties.
                  We are not liable for any indirect, incidental, or
                  consequential damages arising from your use of our services.
                </p>
              </section>

              <section className="mb-4">
                <h3>Modifications</h3>
                <p>
                  We may modify these terms at any time. Continued use of our
                  services constitutes acceptance of any changes.
                </p>
              </section>

              <section className="mb-4">
                <h3>Contact Information</h3>
                <p>
                  For questions about these Terms and Conditions, please contact
                  us through our official channels.
                </p>
              </section>

              <div className="bg-light p-3 rounded">
                <small className="text-muted">
                  This is a simplified terms of service for demonstration
                  purposes. A production application would require comprehensive
                  legal review and terms specific to your business model and
                  jurisdiction.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
