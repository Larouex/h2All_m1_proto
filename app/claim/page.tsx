"use client";

import Image from "next/image";
import { Button } from "react-bootstrap";
import { useState } from "react";
import VersionFooter from "@/app/components/VersionFooter";
import GoogleAnalytics from "../components/analytics/GoogleAnalytics";
import styles from "./Claim.module.css";

export default function ClaimPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClaimBottle = async () => {
    setIsLoading(true);
    // Simulate claim process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to emailclaim page after successful claim
    window.location.href = "/emailclaim";
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
      <div className={styles.mainContent}>
        {/* Main Image Card - Full Width */}
        <div className="position-relative mb-3">
          <div className="position-relative overflow-hidden">
            <Image
              src="/h2all-proto-children.png"
              alt="Two smiling children with arms around each other"
              width={400}
              height={500}
              className="w-100 h-auto object-fit-cover"
              priority
            />
            {/* Overlay Text */}
            <div className="position-absolute bottom-0 start-0 end-0 p-3">
              <h2 className="text-white fs-1 fw-bold mb-0 text-center">
                Your water bottle just changed a life.
              </h2>
            </div>
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="d-grid gap-2 mb-4">
          <Button
            variant="warning"
            size="lg"
            className={`py-3 fw-bold fs-5 text-white ${styles.claimButton}`}
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

        {/* Message Text */}
        <div className="text-center mb-4">
          <p className="fs-2 fw-medium text-dark mb-0">
            Millions lack clean, safe water. Your bottle helps change that.
          </p>
        </div>

        {/* Funding Information */}
        <div className="text-center mb-4">
          <p className="fs-5 fw-medium text-dark mb-0">
            Your bottle gives 5¢ to fund a clean water well in Uganda.
          </p>
        </div>

        {/* Version Footer */}
        <VersionFooter />
      </div>
      {/* Google Analytics (production only) */}
      <GoogleAnalytics />
    </div>
  );
}
