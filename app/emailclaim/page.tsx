"use client";

import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import VersionFooter from "@/app/components/VersionFooter";
import StickyHeader from "@/app/components/StickyHeader";
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
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({ email }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get("content-type"));

      if (response.ok) {
        // Check if response has content before parsing JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("Email claim successful:", data);

          // Store email in localStorage for tracking page
          localStorage.setItem("userEmail", email);

          // Redirect to track page after successful email submission
          window.location.href = "/track";
        } else {
          console.error("Response is not JSON:", await response.text());
          alert("Invalid response format from server.");
        }
      } else {
        // Check if error response has content before parsing JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          console.error("Email claim failed:", errorData);
          alert("Failed to process email claim. Please try again.");
        } else {
          const errorText = await response.text();
          console.error("Non-JSON error response:", errorText);
          alert(`Server error: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Network error details:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof TypeError && error.message.includes("fetch")) {
        alert(
          "Cannot connect to server. Please check if the server is running and try again."
        );
      } else if (
        error instanceof SyntaxError &&
        error.message.includes("JSON")
      ) {
        alert("Server returned invalid data. Please try again.");
      } else {
        alert("Network error. Please check your connection and try again.");
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
        <h2 className={`display-6 fw-bold text-dark lh-sm pt-5 mb-0`}>
          See your impact.
        </h2>

        {/* Email Instructions */}
        <p className={`fs-5 text-dark pb-5 emailInstructions`}>
          Enter email to track contribution.
        </p>

        {/* Email Input Form */}
        <Form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={`${styles.emailInputContainer} mb-3`}>
            <Form.Control
              type="email"
              placeholder="your.email@example.com"
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
