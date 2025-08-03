"use client";

import { Button, Card, Container } from "react-bootstrap";
import ProgressBar from "@/components/ProgressBar";
import Footer from "@/components/Footer";
import styles from "./Share.module.css";

export default function SharePage() {
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "H2ALL WATER - Making an Impact",
          text: "I'm making a difference with clean water access! Join me in supporting this important cause.",
          url: window.location.origin,
        })
        .catch((error) => console.log("Error sharing:", error));
    } else {
      // Fallback for browsers that don't support Web Share API
      const url = encodeURIComponent(window.location.origin);
      const text = encodeURIComponent(
        "I'm making a difference with clean water access! Join me in supporting this important cause."
      );
      const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <div
      className={`${styles.shareContainer} bg-light d-flex flex-column align-items-center px-3 py-4`}
    >
      <Container className="d-flex flex-column align-items-center">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="fs-3 fw-bold text-dark mb-0">
            H2<span className="text-primary">ALL</span> WATER
          </h1>
        </div>

        {/* Progress Indicator */}
        <ProgressBar totalSteps={5} currentStep={5} />

        {/* Star Icon with Green Circle Background */}
        <div className="position-relative mb-5">
          <div
            className={`${styles.starContainer} d-flex align-items-center justify-content-center rounded-circle`}
          >
            <i className={`${styles.starIcon} bi bi-star-fill`}></i>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${styles.mainContent} text-center mb-4`}>
          <h2 className="display-6 fw-bold text-dark mb-3 lh-sm">
            You&apos;re making an impact.
            <br />
            Share it.
          </h2>
          <p className="text-muted fs-5 lh-base">
            Spread the word and inspire others to join the movement for clean
            water.
          </p>
        </div>

        {/* Share Button */}
        <Button
          className={`${styles.shareButton} w-100 mb-5 py-3 rounded-pill fs-5 fw-medium`}
          variant="primary"
          onClick={handleShare}
        >
          <i className="bi bi-share me-2"></i>
          Share with Friends
        </Button>

        {/* Impact Stats Card */}
        <Card className={`${styles.impactCard} w-100 shadow-sm`}>
          <Card.Body className="p-4">
            <h3 className="fs-4 fw-bold text-dark mb-4 text-center">
              Your Impact Today
            </h3>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Bottles Claimed</span>
                <span className="text-primary fw-bold fs-5">1</span>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Clean Water Funded</span>
                <span className="text-primary fw-bold fs-5">10L</span>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Contribution</span>
                <span className="text-primary fw-bold fs-5">$0.05</span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <Footer />
    </div>
  );
}
