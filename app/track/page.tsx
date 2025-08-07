"use client";

import Image from "next/image";
import CampaignProgress from "@/app/components/CampaignProgress";
import MyImpact from "@/app/components/MyImpact";
import VersionFooter from "@/app/components/VersionFooter";
import styles from "./Track.module.css";

export default function TrackPage() {
  return (
    <div className="bg-white d-flex flex-column align-items-center px-3">
      {/* Header */}
      <div className="text-center pt-3 mb-3">
        <h1 className="fs-3 fw-bold text-black mb-0">
          H2<span className="text-primary">ALL</span> WATER
        </h1>
      </div>

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
        <div className="position-relative mb-3">
          <div
            className={`position-relative overflow-hidden rounded ${styles.heroSection}`}
          >
            <Image
              src="/village.png"
              alt="People in Kodema Village working to access clean water"
              fill
              className="object-fit-cover"
              priority
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"></div>
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3">
              <h2 className="text-white fs-4 fw-bold text-center lh-sm">
                Thanks for your help to bring clean water to Kodema Village.
              </h2>
            </div>
          </div>
        </div>

        {/* Campaign Progress Component */}
        <CampaignProgress campaignId="kodema-village" className="mb-3" />

        {/* Total Impact Component - Shows ALL campaigns */}
        <div className="mb-3">
          <h4 className="fs-5 fw-bold text-black mb-2">Your Total Impact</h4>
          <MyImpact className="mb-3" />
        </div>

        {/* Campaign-Specific Impact Component */}
        <div className="mb-3">
          <h4 className="fs-5 fw-bold text-black mb-2">
            Your Kodema Village Impact
          </h4>
          <MyImpact campaignId="kodema-village" />
        </div>

        {/* About Section */}
        <div className="mb-4">
          <h3 className="fs-4 fw-bold text-black mb-3">About Kodema Village</h3>

          <div className="d-flex flex-column gap-3 text-dark lh-base">
            <p className="small">
              Kodema Village, located in the Busia District of Uganda, is home
              to over 5,000 people. Today, the only available water source in
              Kodema is a shallow, unprotected well—a place where animals and
              humans share the same water.
            </p>

            <p className="small">
              This contaminated source is causing widespread waterborne
              illnesses, affecting children, families, and the future of the
              community.{" "}
              <span
                className={`text-primary text-decoration-underline ${styles.clickableLink}`}
              >
                Get to Know Kodema Village
              </span>
            </p>
          </div>

          {/* Bottom Image */}
          <div className="mt-3 rounded overflow-hidden">
            <Image
              src="/village.png"
              alt="People collecting water from contaminated source in Kodema Village"
              width={350}
              height={300}
              className={`w-100 object-fit-cover ${styles.bottomImage}`}
            />
          </div>
        </div>

        {/* Version Footer */}
        <VersionFooter />
      </div>
    </div>
  );
}
