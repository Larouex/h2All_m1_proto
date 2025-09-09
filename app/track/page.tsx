"use client";

import CleanWaterProject from "@/app/components/CleanWaterProject";
import ShareH2All from "@/app/components/ShareH2All";
import CleanWaterImpact from "@/app/components/CleanWaterImpact";
import ClaimedBottleSuccess from "@/app/components/ClaimedBottleSuccess";
import GoogleAnalytics from "@/app/components/analytics/GoogleAnalytics";
import StickyHeader from "@/app/components/StickyHeader";
import { ImpactProvider } from "@/app/components/ImpactContext";

export default function TrackPage() {
  return (
    <ImpactProvider>
      <div className="bg-white d-flex flex-column align-items-center px-3">
        <GoogleAnalytics />
        <StickyHeader />
      </div>
      <ClaimedBottleSuccess />
      <CleanWaterProject />
      <ShareH2All />
      <CleanWaterImpact />
    </ImpactProvider>
  );
}