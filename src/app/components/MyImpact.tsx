"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "react-bootstrap";
import { useAuth } from "@/app/lib/auth-context";

interface MyImpactProps {
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

export default function MyImpact({
  campaignId,
  className = "",
}: MyImpactProps) {
  const { user, isAuthenticated } = useAuth();
  const [impactData, setImpactData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user impact data
  const fetchImpactData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user has an email stored from email claim flow
      const userEmail = localStorage.getItem("userEmail");

      let apiUrl: string;
      let logContext: string;

      if (userEmail) {
        // Use email-based impact API
        const params = new URLSearchParams();
        params.append("email", userEmail);
        apiUrl = `/api/user/email-impact?${params}`;
        logContext = `Email: ${userEmail}`;
      } else if (isAuthenticated && user) {
        // Use user-based impact API (existing functionality)
        const params = new URLSearchParams();
        params.append("userId", user.id);
        if (campaignId) {
          params.append("campaignId", campaignId);
        }
        apiUrl = `/api/user/impact?${params}`;
        logContext = `User ID: ${user.id}, Campaign ID: ${
          campaignId || "ALL CAMPAIGNS"
        }`;
      } else {
        // No user email or authentication
        setLoading(false);
        setError("Please log in or claim a bottle to view your impact");
        return;
      }

      console.log("MyImpact: Fetching impact data from:", apiUrl);
      console.log("MyImpact: Context:", logContext);

      const response = await fetch(apiUrl);
      console.log("MyImpact: Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("MyImpact: Received data:", data);
        setImpactData(data);
      } else if (response.status === 404) {
        console.log("MyImpact: No impact data found (404)");
        // No impact data found - set default values
        setImpactData({
          claimedBottles: 0,
          totalContribution: 0,
          waterFunded: 0,
        });
      } else {
        const errorData = await response.json();
        console.error("MyImpact: API error:", errorData);
        setError(errorData.error || "Failed to fetch impact data");
      }
    } catch (err) {
      console.error("MyImpact: Network error:", err);
      setError("Network error while fetching impact data");
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, campaignId]);

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

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
        label: "Total Contribution",
        value: `$${impactData.totalContribution.toFixed(2)}`,
      },
    ];
  };

  if (loading) {
    return (
      <Card className={`shadow ${className}`}>
        <Card.Body className="p-3 text-center">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2 mb-0 small">Loading your impact...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`shadow ${className}`}>
        <Card.Body className="p-3">
          <h3 className="fs-5 fw-bold text-black mb-3">My Impact</h3>
          <div className="text-center text-muted">
            <i className="bi bi-exclamation-circle fs-3 d-block mb-2"></i>
            <p className="small mb-0">{error}</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (!isAuthenticated && !localStorage.getItem("userEmail")) {
    return (
      <Card className={`shadow ${className}`}>
        <Card.Body className="p-3">
          <h3 className="fs-5 fw-bold text-black mb-3">My Impact</h3>
          <div className="text-center text-muted">
            <i className="bi bi-person-circle fs-3 d-block mb-2"></i>
            <p className="small mb-2">
              Sign in or claim a bottle to track your impact
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => (window.location.href = "/auth")}
            >
              Sign In
            </button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  const metrics = getImpactMetrics();

  return (
    <Card className={`shadow ${className}`}>
      <Card.Body className="p-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 className="fs-5 fw-bold text-black mb-0">My Impact</h3>
          {campaignId && impactData?.campaignName && (
            <small className="text-muted">{impactData.campaignName}</small>
          )}
        </div>

        {metrics.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="d-flex align-items-center justify-content-between"
              >
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${metric.icon} ${metric.iconColor}`}></i>
                  <span className="text-muted small">{metric.label}</span>
                </div>
                <span className="fw-bold text-black">
                  {metric.value}
                  {metric.unit && metric.unit}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-3">
            <i className="bi bi-heart fs-3 d-block mb-2"></i>
            <p className="small mb-2">Start making an impact!</p>
            <p className="small text-muted">
              Redeem bottles to track your contribution to clean water projects.
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
