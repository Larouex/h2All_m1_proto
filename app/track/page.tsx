"use client";

import Image from "next/image";
import CampaignWithImpactPublic from "@/app/components/CampaignWithImpactPublic";
import VersionFooter from "@/app/components/VersionFooter";
import GoogleAnalytics from "@/app/components/analytics/GoogleAnalytics";
import StickyHeader from "@/app/components/StickyHeader";
import { ImpactProvider } from "@/app/components/ImpactContext";
import styles from "./Track.module.css";

export default function TrackPage() {
  return (
    <ImpactProvider>
      <div className="bg-white d-flex flex-column align-items-center px-3">
        <GoogleAnalytics />
        <StickyHeader />

        {/* Main Content Container with Mobile Width */}
        <div className={styles.mainContent}>
          {/* Success Message */}
          <div className="bg-primary bg-opacity-25 px-3 py-3 d-flex align-items-center gap-2 mb-3 rounded">
            <i className="bi bi-star-fill text-black"></i>
            <span className="text-black fw-medium">
              Your bottle has been claimed!
            </span>
          </div>
          {/* Hero Section */}
          <div className="position-relative mb-3 rounded overflow-hidden">
            <Image
              src="/track-top-81525.png"
              alt="People in Kodema Village working to access clean water"
              width={700}
              height={525}
              className="w-100 h-auto"
              style={{ objectFit: "contain" }}
            />
            <div
              className="position-absolute top-0 start-0 w-100 d-flex justify-content-center"
              style={{ paddingTop: "20px" }}
            >
              <h2
                className="text-white text-center"
                style={{
                  fontWeight: 900,
                  fontStyle: "normal",
                  fontSize: "32px",
                  lineHeight: "38px",
                  letterSpacing: "0%",
                  margin: 0,
                  padding: "0 20px",
                }}
              >
                Thanks for your help to bring clean water to Kodema Village.
              </h2>
            </div>
          </div>

          {/* CampaignWithImpactPublic Component - Below image with responsive negative margin */}
          <CampaignWithImpactPublic
            className={`mb-3 ${styles.campaignWithImpactResponsive}`}
          />

          {/* About Section */}
          <div className="mb-4">
            <h3 className="fs-4 fw-bold text-black mb-3">
              About Kodema Village
            </h3>

            <div className="text-dark lh-base">
              <p className="small mb-2">
                Kodema Village, located in the Busia District of Uganda, is home
                to over 5,000 people. Today, the only available water source in
                Kodema is a shallow, unprotected well—a place where animals and
                humans share the same water.
              </p>
              <p className="small">
                This contaminated source is causing widespread waterborne
                illnesses, affecting children, families, and the future of the
                community.
              </p>
            </div>

            {/* Bottom Image removed from About section */}
          </div>
          {/* Bottom Image moved to very bottom */}
          <div className="mt-4 rounded overflow-hidden">
            <Image
              src="/track-bottom-81525..png"
              alt="People collecting water from contaminated source in Kodema Village"
              width={700}
              height={525}
              className={`${styles.bottomImage} w-100 h-auto`}
              style={{ objectFit: "contain" }}
            />
          </div>
          {/* Version Footer */}
          <VersionFooter />
        </div>
      </div>
    </ImpactProvider>
  );
}
