"use client";

import { useState, useEffect } from "react";
import CleanWaterProject from "@/app/components/CleanWaterProject";
import MyContribution from "@/app/components/MyContribution";
import ShareH2All from "@/app/components/ShareH2All";
import CleanWaterImpact from "@/app/components/CleanWaterImpact";
import ClaimedBottleSuccess from "@/app/components/ClaimedBottleSuccess";
import GoogleAnalytics from "@/app/components/analytics/GoogleAnalytics";
import StickyHeader from "@/app/components/StickyHeader";
import { ImpactProvider } from "@/app/components/ImpactContext";

export default function TrackPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve email from localStorage
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  return (
    <ImpactProvider>
      <div className="bg-white d-flex flex-column align-items-center px-3">
        <GoogleAnalytics />
        <StickyHeader />
      </div>
      <ClaimedBottleSuccess />
      <CleanWaterProject />
      <MyContribution email={userEmail || undefined} />
      <ShareH2All />
      <CleanWaterImpact />
    </ImpactProvider>
  );
}