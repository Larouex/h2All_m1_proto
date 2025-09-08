"use client";

import React from "react";
import { useImpact } from "@/app/components/ImpactContext";
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

export default function CampaignWithImpactPublic({ className = "" }) {
  // Get impact data including total redeems from shared context
  const { impactData, loading, error } = useImpact();
  const totalRedeems = impactData?.totalRedeems || 0;

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

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.campaignProgressNoBottomRadius}>
        <h2>Campaign: {campaignData.name}</h2>
        <p>{campaignData.description}</p>
        <p>Goal: ${campaignData.fundingGoal}</p>
        <p>Current: ${campaignData.totalRedemptionValue.toFixed(2)}</p>
      </div>
      <div className={styles.impactSection}>
        {impactData && (
          <>
            <h3>Your Impact</h3>
            <p>Bottles Claimed: {impactData.claimedBottles}</p>
            <p>Water Funded: {impactData.waterFunded}oz</p>
          </>
        )}
      </div>
    </div>
  );
}
