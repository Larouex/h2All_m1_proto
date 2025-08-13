"use client";

import Image from "next/image";
import { Button } from "react-bootstrap";
import { useState } from "react";
import { useRouter } from "next/navigation";
import VersionFooter from "@/app/components/VersionFooter";
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
    <div className="bg-white d-flex flex-column align-items-center px-3">
      <StickyHeader />

      {/* Main Content Container with Mobile Width */}
      <div className={styles.mainContent}>
        {/* Main Image Card - Full Width */}
        <div className="position-relative mb-3">
          <div className="position-relative overflow-hidden rounded">
            <Image
              src="/h2all-proto-children.png"
              alt="Two smiling children with arms around each other"
              width={400}
              height={500}
              className="w-100 h-auto object-fit-cover rounded-4 m-1"
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
            Track your impact in real time, as each bottle provides access to
            clean and safe water.
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
