"use client";

import { Container, Row, Col } from "react-bootstrap";
import { APP_VERSION, BUILD_DATE, BUILD_TIME } from "@/lib/version";
import styles from "./Footer.module.css";

export default function Footer() {
  // Format the build info
  const buildInfo = `${BUILD_DATE} - ${BUILD_TIME}`;

  const handleSocialLink = (platform: string) => {
    let url = "";
    switch (platform) {
      case "instagram":
        url = "https://www.instagram.com/h2allofficial";
        break;
      case "tiktok":
        url = "https://www.tiktok.com/@H2ALL%20official";
        break;
      case "twitter":
        url = "https://www.x.com/h2allofficial";
        break;
      default:
        return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className={`${styles.footer} bg-dark text-light py-4 mt-5`}>
      <Container>
        <Row className="align-items-center">
          {/* Left side - H2All Branding */}
          <Col
            xs={12}
            md={4}
            className="text-center text-md-start mb-3 mb-md-0"
          >
            <h5 className="mb-2">
              H2<span className="text-primary">ALL</span>
            </h5>
            <small className="text-muted">
              Transparency in giving to create real change
            </small>
          </Col>

          {/* Center - Social Media Icons */}
          <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
            <div className="d-flex justify-content-center gap-3">
              <button
                className={`${styles.socialButton} btn btn-link p-2`}
                onClick={() => handleSocialLink("instagram")}
                aria-label="Follow us on Instagram"
                title="Instagram"
              >
                <i className="bi bi-instagram text-light fs-5"></i>
              </button>
              <button
                className={`${styles.socialButton} btn btn-link p-2`}
                onClick={() => handleSocialLink("tiktok")}
                aria-label="Follow us on TikTok"
                title="TikTok"
              >
                <i className="bi bi-tiktok text-light fs-5"></i>
              </button>
              <button
                className={`${styles.socialButton} btn btn-link p-2`}
                onClick={() => handleSocialLink("twitter")}
                aria-label="Follow us on X (Twitter)"
                title="X (Twitter)"
              >
                <i className="bi bi-twitter-x text-light fs-5"></i>
              </button>
            </div>
          </Col>

          {/* Right side - Copyright and Legal */}
          <Col xs={12} md={4} className="text-center text-md-end">
            <div className="mb-2">
              <small className="text-muted">
                © 2025 H2ALL - ALL RIGHTS RESERVED
              </small>
            </div>
            <div className="d-flex justify-content-center justify-content-md-end gap-3 mb-2">
              <a
                href="/privacy"
                className="text-muted text-decoration-none small"
              >
                PRIVACY
              </a>
              <a
                href="/terms"
                className="text-muted text-decoration-none small"
              >
                TERMS
              </a>
            </div>
            <small className="text-muted">
              v{APP_VERSION} | {buildInfo}
            </small>
          </Col>
        </Row>

        {/* Bottom row - Additional info */}
        <Row className="mt-3 pt-3 border-top border-secondary">
          <Col className="text-center">
            <small className="text-muted">
              Designed by{" "}
              <span className="fw-medium text-light">
                Jackalope Productions
              </span>
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
