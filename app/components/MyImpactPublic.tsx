"use client";

import { Card } from "react-bootstrap";
import { useImpact } from "@/app/components/ImpactContext";

interface MyImpactPublicProps {
  campaignId?: string;
  className?: string;
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
  // Use shared impact context to avoid duplicate API calls
  const { impactData, loading, error } = useImpact();

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
