"use client";

import { Button, Card, Container, Row, Col } from "react-bootstrap";
import Image from "next/image";
import ProgressBar from "@/components/ProgressBar";
import Footer from "@/components/Footer";
import styles from "./Project.module.css";

export default function ProjectPage() {
  const handleFollowProgress = () => {
    console.log("Follow progress clicked");
    // Add navigation logic here
  };

  const handleHelp = () => {
    console.log("Help clicked");
    // Add help modal or navigation logic here
  };

  return (
    <div
      className={`${styles.projectContainer} bg-light min-vh-100 d-flex flex-column align-items-center px-3 py-4`}
    >
      <Container className="d-flex flex-column align-items-center">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="fs-3 fw-bold text-dark mb-0">
            H2<span className="text-primary">ALL</span> WATER
          </h1>
        </div>

        {/* Progress Indicator - 4 out of 5 steps completed */}
        <ProgressBar totalSteps={5} currentStep={4} />

        {/* Campaign Image */}
        <div className={`${styles.imageContainer} w-100 mb-4`}>
          <Image
            src="/village.png"
            alt="Aerial view of Bukonko village with traditional buildings"
            width={400}
            height={200}
            className={`${styles.campaignImage} w-100 rounded-3`}
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Description */}
        <div className="w-100 mb-4">
          <Card className={`${styles.descriptionCard} border-0`}>
            <Card.Body className="p-4">
              <p className="text-muted mb-0 lh-base">
                Bukonko is a rural community in Uganda. Your bottle helps bring
                clean water to families who need it most.
              </p>
            </Card.Body>
          </Card>
        </div>

        {/* Statistics */}
        <div className="w-100 mb-4">
          <Row className="g-4">
            <Col xs={6}>
              <div className="text-center">
                <div className="display-5 fw-bold text-primary mb-1">2,500</div>
                <div className="text-muted small">People Served</div>
              </div>
            </Col>
            <Col xs={6}>
              <div className="text-center">
                <div className="display-5 fw-bold text-primary mb-1">45min</div>
                <div className="text-muted small">Current Walk to Water</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Our Goal Card */}
        <Card className={`${styles.goalCard} w-100 bg-primary text-white mb-4`}>
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-bullseye text-white"></i>
              <h3 className="fs-5 fw-semibold mb-0">Our Goal</h3>
            </div>
            <p className="text-white-50 lh-base mb-0">
              Build a well that provides clean, safe water within 5 minutes of
              every home in Bukonko Village.
            </p>
          </Card.Body>
        </Card>

        {/* Follow Progress Button */}
        <Button
          className={`${styles.followButton} w-100 py-3 rounded-pill fs-5 fw-medium`}
          variant="success"
          onClick={handleFollowProgress}
        >
          Follow Our Progress
        </Button>

        {/* Help Button */}
        <div className={`${styles.helpButton} position-fixed`}>
          <Button
            variant="dark"
            className="rounded-circle p-3"
            onClick={handleHelp}
            aria-label="Help"
          >
            <i className="bi bi-question-circle text-white"></i>
          </Button>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
