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

  // Create campaign data object with the specified values
  const campaignData: CampaignData = {
    id: "1",
    name: "Kodema Village",
    description:
      "Our goal: Access to safe and clean water eliminating waterborne illness.",
    fundingGoal: 5000,
    currentFunding: 1250,
    totalRedemptionValue: totalRedeems || 0, // Use totalRedeems from API
    isActive: true,
  };

  // Log the value to console for testing (only when totalRedeems changes)
  React.useEffect(() => {
    console.log("CampaignWithImpact - API data update:", {
      totalRedeems,
      loading,
      error,
      campaignDataTotalRedemptionValue: totalRedeems || 0,
      timestamp: new Date().toISOString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalRedeems, loading]); // Log when totalRedeems or loading changes

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
