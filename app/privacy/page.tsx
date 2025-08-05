"use client";

import { Container, Row, Col, Card } from "react-bootstrap";

export default function Privacy() {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Body className="p-5">
              <h1 className="mb-4">Privacy Policy</h1>

              <p className="text-muted mb-4">
                <strong>Effective Date:</strong> August 5, 2025
              </p>

              <section className="mb-4">
                <h3>Information We Collect</h3>
                <p>
                  At H2All, we collect information necessary to provide our
                  impact tracking services, including purchase codes, redemption
                  data, and basic user information for account management.
                </p>
              </section>

              <section className="mb-4">
                <h3>How We Use Your Information</h3>
                <ul>
                  <li>To track and display your environmental impact</li>
                  <li>To provide redemption code validation</li>
                  <li>To improve our services and user experience</li>
                  <li>To communicate about your impact and rewards</li>
                </ul>
              </section>

              <section className="mb-4">
                <h3>Information Sharing</h3>
                <p>
                  We do not sell, trade, or share your personal information with
                  third parties except as necessary to provide our services or
                  as required by law.
                </p>
              </section>

              <section className="mb-4">
                <h3>Data Security</h3>
                <p>
                  We implement appropriate security measures to protect your
                  information against unauthorized access, alteration,
                  disclosure, or destruction.
                </p>
              </section>

              <section className="mb-4">
                <h3>Your Rights</h3>
                <p>
                  You have the right to access, update, or delete your personal
                  information. Contact us to exercise these rights.
                </p>
              </section>

              <section className="mb-4">
                <h3>Contact Us</h3>
                <p>
                  If you have questions about this Privacy Policy, please
                  contact us through our official channels or the contact
                  information provided on our website.
                </p>
              </section>

              <div className="bg-light p-3 rounded">
                <small className="text-muted">
                  This is a simplified privacy policy for demonstration
                  purposes. A production application would require a
                  comprehensive legal review and detailed privacy policy
                  specific to your jurisdiction and practices.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
