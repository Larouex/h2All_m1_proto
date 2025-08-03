"use client";

import { useState } from "react";
import { Container, Form } from "react-bootstrap";
import ProgressBar from "@/components/ProgressBar";
import Footer from "@/components/Footer";
import styles from "./EmailClaim.module.css";

export default function EmailClaimPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email submitted:", email);
    // Add logic to handle email submission
  };

  return (
    <div
      className={`${styles.emailClaimContainer} bg-light d-flex flex-column align-items-center px-3 py-4`}
    >
      <Container className="d-flex flex-column align-items-center">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="fs-3 fw-bold text-dark mb-0">
            H2<span className="text-primary">ALL</span> WATER
          </h1>
        </div>

        {/* Progress Indicator - 2 out of 5 steps completed */}
        <ProgressBar totalSteps={5} currentStep={2} />

        {/* Main Content */}
        <div className={`${styles.mainContent} text-center mb-5`}>
          <h2 className="display-6 fw-bold text-dark mb-4 lh-sm">
            Enter your email and see your impact?
          </h2>

          {/* Email Icon */}
          <div
            className={`${styles.emailIconContainer} d-flex align-items-center justify-content-center mx-auto mb-4`}
          >
            <i className={`${styles.emailIcon} bi bi-envelope`}></i>
          </div>

          {/* Email Input Form */}
          <Form onSubmit={handleSubmit}>
            <div className={`${styles.emailInputContainer} mb-3`}>
              <Form.Control
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.emailInput}
                required
              />
              <div className={styles.inputIcon}>
                <i className={`${styles.chartIcon} bi bi-bar-chart`}></i>
              </div>
            </div>
          </Form>

          {/* Subtext */}
          <p className="text-muted">
            We&apos;ll contact you with updates about this campaign.
          </p>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
