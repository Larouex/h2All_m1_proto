"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "react-bootstrap";

interface MyImpactPublicProps {
  campaignId?: string;
  className?: string;
}

interface ImpactData {
  claimedBottles: number;
  totalContribution: number;
  waterFunded: number; // in liters
  campaignName?: string;
  lastRedemptionDate?: string;
  lastClaimDate?: string;
  hasData?: boolean;
  email?: string;
}

interface ImpactMetric {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  unit?: string;
}

export default function MyImpactPublic({
  campaignId,
  className = "",
}: MyImpactPublicProps) {
  const [impactData, setImpactData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to prevent duplicate API calls and track current request
  const isCurrentlyFetching = useRef(false);
  const lastFetchKey = useRef<string>("");

  // Fetch user impact data
  useEffect(() => {
    const fetchImpactData = async () => {
      // Check if user has an email stored from email claim flow
      const userEmail = localStorage.getItem("userEmail");

      // Create a unique key for this fetch based on dependencies
      const fetchKey = `${userEmail || "no-email"}-${
        campaignId || "no-campaign"
      }`;

      // Prevent duplicate calls with the same parameters or while already fetching
      if (isCurrentlyFetching.current || lastFetchKey.current === fetchKey) {
        console.log(
          "MyImpactPublic: Skipping duplicate fetch call for key:",
          fetchKey,
          "isCurrentlyFetching:",
          isCurrentlyFetching.current
        );
        return;
      }

      isCurrentlyFetching.current = true;
      lastFetchKey.current = fetchKey;
      try {
        setLoading(true);
        setError(null);

        if (!userEmail) {
          // No user email - set default values
          setImpactData({
            claimedBottles: 0,
            totalContribution: 0,
            waterFunded: 0,
          });
          setLoading(false);
          return;
        }

        // Use email-based impact API
        const params = new URLSearchParams();
        params.append("email", userEmail);
        const apiUrl = `/api/user/email-impact?${params}`;
        const logContext = `Email: ${userEmail}`;

        console.log("MyImpactPublic: Fetching impact data from:", apiUrl);
        console.log("MyImpactPublic: Context:", logContext);

        const response = await fetch(apiUrl);
        console.log("MyImpactPublic: Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("MyImpactPublic: Received data:", data);
          setImpactData(data);
        } else if (response.status === 404) {
          console.log("MyImpactPublic: No impact data found (404)");
          // No impact data found - set default values
          setImpactData({
            claimedBottles: 0,
            totalContribution: 0,
            waterFunded: 0,
          });
        } else {
          const errorData = await response.json();
          console.error("MyImpactPublic: API error:", errorData);
          setError(errorData.error || "Failed to fetch impact data");
        }
      } catch (err) {
        console.error("MyImpactPublic: Network error:", err);
        setError("Network error while fetching impact data");
      } finally {
        setLoading(false);
        isCurrentlyFetching.current = false; // Reset fetching flag
      }
    };

    fetchImpactData();
  }, [campaignId]); // Only depend on campaignId

  // Format impact metrics for display
  const getImpactMetrics = (): ImpactMetric[] => {
    if (!impactData) return [];

    return [
      {
        icon: "bi-cup-straw",
        iconColor: "text-primary",
        label: "Claimed Bottles",
        value: impactData.claimedBottles.toString(),
      },
      {
        icon: "bi-currency-dollar",
        iconColor: "text-success",
        label: "Contribution",
        value: `$${impactData.totalContribution.toFixed(2)}`,
      },
    ];
  };

  const metrics = getImpactMetrics();

  // Show loading state
  if (loading) {
    return (
      <Card className={`shadow ${className}`}>
        <Card.Body className="p-3">
          <h3 className="fs-5 fw-bold text-black mb-3">My Impact</h3>
          <div className="d-flex justify-content-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className={`shadow ${className}`}>
        <Card.Body className="p-3">
          <h3 className="fs-5 fw-bold text-black mb-3">My Impact</h3>
          <div className="text-center text-muted py-3">
            <i className="bi bi-exclamation-circle fs-1 mb-2"></i>
            <p className="mb-0">{error}</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Show impact data
  return (
    <Card className={`shadow ${className}`}>
      <Card.Body className="p-3">
        <h3 className="fs-5 fw-bold text-black mb-3">My Impact</h3>

        {metrics.length > 0 ? (
          <div className="d-flex justify-content-between align-items-center bg-light rounded p-3">
            {metrics.map((metric, index) => (
              <div key={index} className="d-flex align-items-center gap-2">
                <i className={`${metric.icon} ${metric.iconColor} fs-4`}></i>
                <div>
                  <div className="small text-muted mb-0">{metric.label}</div>
                  <div className="fw-bold text-black">{metric.value}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-3">
            <i className="bi bi-cup-straw fs-1 mb-2"></i>
            <p className="mb-0">No bottles claimed yet</p>
            <small>Claim your first bottle to see your impact!</small>
          </div>
        )}

        {impactData?.lastClaimDate && (
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted">
              Last claim:{" "}
              {new Date(impactData.lastClaimDate).toLocaleDateString()}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
