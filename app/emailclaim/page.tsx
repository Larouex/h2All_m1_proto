"use client";

import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Image from "next/image";
import { useRouter } from "next/navigation";
import VersionFooter from "@/app/components/VersionFooter";
import StickyHeader from "@/app/components/StickyHeader";
import GoogleAnalytics from "../components/analytics/GoogleAnalytics";
import styles from "./EmailClaim.module.css";

export default function EmailClaimPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  // Fix: Use hardcoded API key for dev

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
          "x-api-key": "dev_api_key_change_in_production",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Store email in localStorage for tracking page
        localStorage.setItem("userEmail", email);

        // Use Next.js router for faster navigation
        router.push("/track");
      } else {
        alert("Failed to process email claim. Please try again.");
      }
    } catch (error) {
      // Minimal error handling without verbose logging
      if (error instanceof TypeError && error.message.includes("fetch")) {
        alert(
          "Cannot connect to server. Please check your connection and try again."
        );
      } else if (
        error instanceof SyntaxError &&
        error.message.includes("JSON")
      ) {
        alert("Server returned invalid data. Please try again.");
      } else {
        alert("Network error. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white d-flex flex-column align-items-center px-3">
      <StickyHeader />

      {/* Main Content Container with Mobile Width */}
      <div className={`${styles.mainContent} text-center mb-5`}>
        {/* Header Image */}
        <div className="w-100 d-flex justify-content-center mb-4 mt-1">
          <Image
            src="/h2all-emailclaim-815-woman-header.png"
            alt="H2All Email Claim Header"
            width={500}
            height={300}
            className="img-fluid rounded-4"
            priority
          />
        </div>
        <h2 className={`display-6 fw-bold text-dark lh-sm pt-2 mb-0`}>
          Enter email. See impact.
        </h2>

        {/* Email Instructions */}
        <p className={`fs-5 text-dark pb-2 emailInstructions`}>
          View your contribution.
        </p>

        {/* Email Input Form */}
        <Form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={`${styles.emailInputContainer} mb-3`}>
            <label className={`${styles.emailLabel} text-start mb-1 d-block`}>
              Email
            </label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
              required
              suppressHydrationWarning
            />
          </div>

          <div className={styles.buttonContainer}>
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
          </div>
        </Form>

        {/* Subtext */}
        <p className="text-muted subtext">
          By entering your email, you agree to receive updates about this
          campaign and messages about future H2ALL initiatives.{" "}
          <a href="/privacy" className="text-decoration-underline text-primary">
            Privacy Policy
          </a>
        </p>

        {/* Version Footer */}
        <VersionFooter />
      </div>
      {/* Google Analytics (production only) */}
      <GoogleAnalytics />
    </div>
  );
}
