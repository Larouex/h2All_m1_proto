"use client";

import Image from "next/image";
import { Button } from "react-bootstrap";
import { useState } from "react";
import styles from "./Claim3.module.css";

export default function Claim3Page() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClaimBottle = async () => {
    setIsLoading(true);
    // Simulate claim process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to claimed2 page after successful claim
    window.location.href = "/claimed2";
  };

  return (
    <div className="min-vh-100 bg-white">
      {/* Header */}
      <header className="bg-white px-3 py-3 border-bottom">
        <h1 className="fs-3 fw-bold text-black mb-0">
          H2<span className="text-primary">ALL</span> WATER
        </h1>
      </header>

      {/* Main Content - Mobile First Container */}
      <div className="d-flex justify-content-center px-3 py-4">
        <div className={`w-100 ${styles.contentContainer}`}>
          {/* Main Image Card */}
          <div className="position-relative mb-4">
            <div
              className={`position-relative overflow-hidden ${styles.imageCard}`}
            >
              <Image
                src="/children-image.jpg"
                alt="Two smiling children with arms around each other"
                width={400}
                height={500}
                className="w-100 h-auto object-fit-cover"
                priority
              />

              {/* Overlay Text */}
              <div
                className={`position-absolute bottom-0 start-0 end-0 p-4 ${styles.overlayGradient}`}
              >
                <h2 className="text-white fs-2 fw-bold lh-sm mb-0">
                  Your water bottle just changed a life.
                </h2>
              </div>
            </div>
          </div>

          {/* Impact Message */}
          <div className="mb-4">
            <h3 className="fs-4 fw-bold text-black lh-sm mb-3">
              Millions lack clean, safe water. Your bottle helps change that.
            </h3>

            <p className="text-muted fs-6 mb-0">
              Your bottle gives 5¢ to fund a clean water well in Uganda.
            </p>
          </div>

          {/* Call to Action Button */}
          <div className="d-grid gap-2">
            <Button
              variant="warning"
              size="lg"
              className={`py-3 fw-semibold fs-5 ${styles.claimButton}`}
              onClick={handleClaimBottle}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Claiming...
                </>
              ) : (
                "Claim My Bottle"
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <small className="text-muted">
              By claiming this bottle, you&apos;re joining thousands of people
              making clean water accessible.
            </small>
          </div>

          {/* Impact Preview */}
          <div className="mt-4 p-3 bg-light rounded">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <i className="bi bi-droplet-fill text-primary me-2"></i>
                <span className="small text-muted">Your Impact</span>
              </div>
              <span className="fw-bold text-success">+$0.05</span>
            </div>
            <div className="mt-2">
              <small className="text-muted">
                Contributes to clean water infrastructure in Kodema Village,
                Uganda
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
