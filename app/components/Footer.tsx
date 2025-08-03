"use client";

import { Container, Row, Col } from "react-bootstrap";
import { APP_VERSION, BUILD_DATE, BUILD_TIME } from "@/lib/version";
import styles from "./Footer.module.css";

export default function Footer() {
  // Format the build info
  const buildInfo = `${BUILD_DATE} - ${BUILD_TIME}`;

  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.origin);
    const text = encodeURIComponent(
      "Making a difference with clean water access through H2ALL WATER"
    );

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <footer className={`${styles.footer} bg-light border-top mt-auto py-3`}>
      <Container>
        <Row className="align-items-center">
          {/* Left side - Credits */}
          <Col
            xs={12}
            md={4}
            className="text-center text-md-start mb-2 mb-md-0"
          >
            <small className="text-muted">
              Designed by{" "}
              <span className="fw-medium">Jackalope Productions</span>
            </small>
          </Col>

          {/* Center - Social Media Icons */}
          <Col xs={12} md={4} className="text-center mb-2 mb-md-0">
            <div className="d-flex justify-content-center gap-3">
              <button
                className={`${styles.socialButton} btn btn-link p-0`}
                onClick={() => handleSocialShare("twitter")}
                aria-label="Share on Twitter"
              >
                <i className="bi bi-twitter text-muted"></i>
              </button>
              <button
                className={`${styles.socialButton} btn btn-link p-0`}
                onClick={() => handleSocialShare("facebook")}
                aria-label="Share on Facebook"
              >
                <i className="bi bi-facebook text-muted"></i>
              </button>
              <button
                className={`${styles.socialButton} btn btn-link p-0`}
                onClick={() => handleSocialShare("linkedin")}
                aria-label="Share on LinkedIn"
              >
                <i className="bi bi-linkedin text-muted"></i>
              </button>
            </div>
          </Col>

          {/* Right side - Version and Build Date */}
          <Col xs={12} md={4} className="text-center text-md-end">
            <small className="text-muted">
              <div>v{APP_VERSION}</div>
              <div className="small">{buildInfo}</div>
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
