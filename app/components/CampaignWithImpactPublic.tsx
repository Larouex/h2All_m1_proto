"use client";

import React from "react";
import CampaignProgressPublic from "@/app/components/CampaignProgressPublic";
import MyImpactPublic from "@/app/components/MyImpactPublic";
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
      <div
        className={styles.campaignProgressNoBottomRadius}
        style={{ marginBottom: 0, paddingBottom: 0 }}
      >
        <CampaignProgressPublic campaignData={campaignData} />
      </div>
      <div
        className={styles.impactSection}
        style={{ marginTop: 0, paddingTop: 0 }}
      >
        <MyImpactPublic />
      </div>
    </div>
  );
}
