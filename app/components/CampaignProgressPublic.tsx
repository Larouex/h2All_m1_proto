"use client";

import { Card, ProgressBar } from "react-bootstrap";

interface CampaignProgressPublicProps {
  className?: string;
  campaignData?: CampaignData; // Make campaignData optional prop
}

interface CampaignData {
  id: string;
  name: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  totalRedemptionValue: number;
  isActive: boolean;
}

export default function CampaignProgressPublic({
  className = "",
  campaignData: propCampaignData,
}: CampaignProgressPublicProps) {
  // Use prop data if provided, otherwise fall back to static placeholder data
  const campaignData: CampaignData = propCampaignData || {
    id: "kodema-village",
    name: "Campaign Progress",
    description:
      "Our goal: clean water within 5 minutes of every home in Kodema Village.",
    fundingGoal: 5000,
    currentFunding: 1250.5,
    totalRedemptionValue: 1250.5,
    isActive: true,
  };

  // Use the totalRedemptionValue directly since it's already calculated correctly
  const currentFunding = campaignData.totalRedemptionValue || 0;
  const fundingGoal = campaignData.fundingGoal || 5000;
  const progressPercentage = (currentFunding / fundingGoal) * 100;

  return (
    <Card className={`shadow ${className}`}>
      <Card.Body className="p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h3 className="fs-5 fw-bold text-black mb-0">{campaignData.name}</h3>
        </div>

        <p className="text-muted mb-3 small">{campaignData.description}</p>

        <div className="mb-3">
          <div className="d-flex align-items-baseline gap-2 mb-2">
            <span className="fs-3 fw-bold text-black">
              ${currentFunding.toFixed(2)}
            </span>
            <span className="text-muted small">
              of ${fundingGoal.toLocaleString()} raised
            </span>
          </div>
          <ProgressBar
            now={progressPercentage}
            className="mb-0"
            variant="primary"
            style={{ height: "8px" }}
          />
        </div>
      </Card.Body>
    </Card>
  );
}
