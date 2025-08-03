"use client";

import { Button, Card, Container } from "react-bootstrap";
import ProgressBar from "@/components/ProgressBar";
import Footer from "@/components/Footer";
import styles from "./Campaign.module.css";

export default function ClaimedPage() {
  const handleLearnMore = () => {
    console.log("Learn more about Bukonko campaign");
    // Add logic to navigate to campaign details or open modal
  };

  return (
    <div
      className={`${styles.campaignContainer} bg-light d-flex flex-column align-items-center px-3 py-4`}
    >
      <Container className="d-flex flex-column align-items-center">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="fs-3 fw-bold text-dark mb-0">
            H2<span className="text-primary">ALL</span> WATER
          </h1>
        </div>

        {/* Progress Indicator - 3 out of 5 steps completed */}
        <ProgressBar totalSteps={5} currentStep={3} />

        {/* Main Content */}
        <div className={`${styles.mainContent} text-center mb-4`}>
          <h2 className="display-6 fw-bold text-dark mb-3 lh-sm">
            Thanks for claiming your bottle!
          </h2>
          <p className="text-muted fs-5">
            You&apos;re now part of the Bukonko well campaign.
          </p>
        </div>

        {/* Campaign Progress Card */}
        <Card className={`${styles.campaignCard} w-100 shadow-sm mb-4`}>
          <Card.Body className="p-4">
            <h3 className="fs-4 fw-bold text-dark mb-4 text-center">
              Campaign Progress
            </h3>

            <div className="text-center mb-3">
              <div className="d-flex align-items-baseline justify-content-center gap-2 mb-2">
                <span className="display-6 fw-bold text-primary">$412</span>
                <span className="text-muted fs-5">of $5,000 raised</span>
              </div>
            </div>

            <div className="mb-2">
              <div className={styles.progressBar}>
                <div className={styles.progressFill}></div>
              </div>
            </div>

            <div className="text-center">
              <span className="text-muted small">8% funded</span>
            </div>
          </Card.Body>
        </Card>

        {/* Impact Information */}
        <div className={`${styles.mainContent} text-center mb-4`}>
          <div className="mb-3">
            <i
              className={`${styles.dropletIcon} bi bi-droplet-fill mx-auto d-block`}
            ></i>
          </div>

          <h3 className="fs-4 fw-bold text-dark mb-3">
            Every $1 = 200L of clean water
          </h3>

          <p className="text-muted lh-base">
            Your contribution helps provide life-changing access to clean water
          </p>
        </div>

        {/* Learn More Button */}
        <Button
          className={`${styles.learnMoreButton} w-100 py-3 rounded-pill fs-5 fw-medium`}
          variant="primary"
          onClick={handleLearnMore}
        >
          Learn more about Bukonko
        </Button>
      </Container>

      <Footer />
    </div>
  );
}
