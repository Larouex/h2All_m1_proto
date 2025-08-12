"use client";

import React from "react";
import CampaignProgress from "@/app/components/CampaignProgress";
import MyImpact from "@/app/components/MyImpact";
import { useTotalRedeems } from "@/app/hooks/useTotalRedeems";
import styles from "./CampaignWithImpact.module.css";

// Define the CampaignData interface locally
interface CampaignData {
  id: string;
  name: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  totalRedemptionValue: number;
  isActive: boolean;
}

export default function CampaignWithImpact({ className = "" }) {
  // Fetch total redeems count from API (no auto-refresh to prevent unnecessary calls)
  const { totalRedeems, loading, error } = useTotalRedeems(false);

  // Calculate total redemption value: base funding + (claims * $0.05 per claim)
  const baseFunding = 1250;
  const perClaimValue = 0.05;
  const calculatedRedemptionValue =
    baseFunding + (totalRedeems || 0) * perClaimValue;

  // Create campaign data object with the specified values
  const campaignData: CampaignData = {
    id: "1",
    name: "Kodema Village",
    description:
      "Our goal: Access to safe and clean water eliminating waterborne illness.",
    fundingGoal: 5000,
    currentFunding: baseFunding,
    totalRedemptionValue: calculatedRedemptionValue, // Current funding + (claims * $0.05)
    isActive: true,
  };

  // Log the value to console for testing (only when totalRedeems changes)
  React.useEffect(() => {
    console.log("CampaignWithImpact - API data update:", {
      totalRedeems,
      loading,
      error,
      baseFunding,
      perClaimValue,
      calculatedRedemptionValue,
      campaignDataTotalRedemptionValue: calculatedRedemptionValue,
      timestamp: new Date().toISOString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalRedeems, loading, calculatedRedemptionValue]); // Log when totalRedeems, loading, or calculated value changes

  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={styles.campaignProgressNoBottomRadius}
        style={{ marginBottom: 0, paddingBottom: 0 }}
      >
        <CampaignProgress campaignData={campaignData} />
      </div>
      <div
        className={styles.impactSection}
        style={{ marginTop: 0, paddingTop: 0 }}
      >
        <MyImpact />
      </div>
    </div>
  );
}
