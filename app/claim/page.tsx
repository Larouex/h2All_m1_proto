"use client";

import { Button, Card, Container } from "react-bootstrap";
import ProgressBar from "@/components/ProgressBar";
import Footer from "@/components/Footer";
import styles from "./Claim.module.css";

export default function ClaimPage() {
  const handleClaim = () => {
    // Add claim logic here - could redirect to auth or redemption flow
    console.log("Claiming bottle...");
    // For now, let's redirect to the auth page or show a success message
    window.location.href = "/auth";
  };

  return (
    <div
      className={`${styles.claimContainer} bg-light d-flex flex-column align-items-center px-3 py-4`}
    >
      <Container className="d-flex flex-column align-items-center">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="fs-3 fw-bold text-dark mb-0">
            H2<span className="text-primary">ALL</span> WATER
          </h1>
        </div>

        {/* Progress Indicator */}
        <ProgressBar totalSteps={5} currentStep={1} />

        {/* Water Bottle Card */}
        <Card className={`${styles.waterBottleCard} w-100 shadow-lg mb-4`}>
          <Card.Body className="p-4">
            <div
              className={`${styles.bottleIconContainer} d-flex justify-content-center align-items-center`}
            >
              <i className={`${styles.bottleIcon} bi bi-droplet-fill`}></i>
            </div>
          </Card.Body>
        </Card>

        {/* Main Content */}
        <div className={`${styles.mainContent} text-center mb-4`}>
          <h2 className="display-5 fw-bold text-dark mb-4 lh-sm">
            Buy Water.
            <br />
            Fund Water.
          </h2>
          <p className="text-muted fs-5 lh-base">
            5¢ from this bottle helps fund a real well campaign in Uganda,
            Africa.
          </p>
        </div>

        {/* Claim Button */}
        <Button
          className={`${styles.claimButton} w-100 mb-5 py-3 rounded-pill fs-5 fw-medium`}
          variant="primary"
          onClick={handleClaim}
        >
          Claim this bottle now
        </Button>

        {/* Features List */}
        <div className={`${styles.featuresList} w-100`}>
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className={`${styles.featureDot} rounded-circle flex-shrink-0`}
              ></div>
              <span className="text-muted">
                100% transparent impact tracking
              </span>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div
                className={`${styles.featureDot} rounded-circle flex-shrink-0`}
              ></div>
              <span className="text-muted">
                Direct funding to verified projects
              </span>
            </div>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
