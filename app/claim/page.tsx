"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StickyHeader from "@/app/components/StickyHeader";
import GoogleAnalytics from "../components/analytics/GoogleAnalytics";
import styles from "./Claim.module.css";

export default function ClaimPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClaimBottle = async () => {
    setIsLoading(true);

    // Use Next.js router for faster navigation
    router.push("/emailclaim");
  };

  return (
    <div className="bg-white d-flex flex-column align-items-center">
      <StickyHeader />

      {/* Full Width Hero Section with Background Image */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroTextContainer}>
            <h2 className={styles.heroTitle}>
              Your water bottle just changed a life.
            </h2>
          </div>
        </div>
      </div>

      {/* Main Content Container with Mobile Width */}
      <div className={`${styles.mainContent} px-3`}>
        {/* Call to Action Button */}
        <div className="mb-4">
          <button
            type="button"
            className={`btn btn-primary btn-lg btn-block ${styles.claimButton}`}
            onClick={handleClaimBottle}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Claiming Your Bottle...
              </>
            ) : (
              "Select to Claim Your Bottle"
            )}
          </button>
        </div>

        {/* Message Text */}
        <div className="text-center mb-4">
          <p
            className="text-dark mb-0"
            style={{ fontSize: "24px", fontWeight: 900 }}
          >
            Millions lack clean, safe water. Your bottle helps change that.
          </p>
        </div>

        {/* Funding Information */}
        <div className="text-center mb-4">
          <p className="fw-medium text-dark mb-0" style={{ fontSize: "18px" }}>
            Track your impact in real time, as each bottle provides access to
            clean and safe water.
          </p>
        </div>
      </div>
      {/* Google Analytics (production only) */}
      <GoogleAnalytics />
    </div>
  );
}
