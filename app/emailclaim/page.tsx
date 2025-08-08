"use client";

import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import VersionFooter from "@/app/components/VersionFooter";
import GoogleAnalytics from "../components/analytics/GoogleAnalytics";
import styles from "./EmailClaim.module.css";

export default function EmailClaimPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/emailclaim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Email claim successful:", data);

        // Store email in localStorage for tracking page
        localStorage.setItem("userEmail", email);

        // Redirect to track page after successful email submission
        window.location.href = "/track";
      } else {
        const errorData = await response.json();
        console.error("Email claim failed:", errorData);
        alert("Failed to process email claim. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white d-flex flex-column align-items-center px-3">
      {/* Header */}
      <div className="text-center pt-3 mb-4">
        <h1 className="fs-3 fw-bold text-dark mb-0">
          H2<span className="text-primary">ALL</span> WATER
        </h1>
      </div>

      {/* Main Content Container with Mobile Width */}
      <div className={`${styles.mainContent} text-center mb-5`}>
        <h2 className="display-6 fw-bold text-dark mb-4 lh-sm">
          See the impact you&apos;re making
        </h2>

        {/* Email Instructions */}
        <p className="fs-5 text-dark mb-4">
          Enter your email to track your bottle&apos;s contribution.
        </p>

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

          {/* Claim Button */}
          <div className="d-grid gap-2 mb-4">
            <Button
              variant="warning"
              size="lg"
              className={`py-3 fw-bold fs-5 text-white ${styles.claimButton}`}
              type="submit"
              disabled={!isValidEmail(email) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </>
              ) : (
                "Claim My Bottle"
              )}
            </Button>
          </div>
        </Form>

        {/* Subtext */}
        <p className="text-muted">
          By entering your email, you agree to receive updates about this
          campaign and messages about future H2ALL initiatives.
        </p>

        {/* Version Footer */}
        <VersionFooter />
      </div>
      {/* Google Analytics (production only) */}
      <GoogleAnalytics />
    </div>
  );
}
