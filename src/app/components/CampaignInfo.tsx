"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  ProgressBar,
  Badge,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { formatDateSimple } from "../lib/utils/dateUtils";
import Link from "next/link";
import styles from "./CampaignInfo.module.css";

export interface Campaign {
  id: string;
  name: string;
  description: string;
  redemptionValue: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  maxRedemptions: number;
  currentRedemptions: number;
}

export type CampaignState =
  | "loading"
  | "valid"
  | "invalid"
  | "expired"
  | "already-used"
  | "max-redemptions-reached"
  | "inactive";

interface CampaignInfoProps {
  campaign?: Campaign;
  state: CampaignState;
  isAuthenticated: boolean;
  userEmail?: string;
  code?: string;
  error?: string;
  onRedeem?: () => void;
  isRedeeming?: boolean;
  className?: string;
}

export default function CampaignInfo({
  campaign,
  state,
  isAuthenticated,
  userEmail,
  code,
  error,
  onRedeem,
  isRedeeming = false,
  className = "",
}: CampaignInfoProps) {
  // Helper function to get state-specific styling
  const getStateVariant = (): string => {
    switch (state) {
      case "valid":
        return "success";
      case "invalid":
      case "expired":
      case "inactive":
      case "max-redemptions-reached":
        return "danger";
      case "already-used":
        return "warning";
      default:
        return "light";
    }
  };

  // Helper function to get state message
  const getStateMessage = (): string => {
    switch (state) {
      case "loading":
        return "Validating campaign and code...";
      case "valid":
        return isAuthenticated
          ? "Ready to redeem!"
          : "Please log in to redeem this code.";
      case "invalid":
        return error || "Invalid campaign or redemption code.";
      case "expired":
        return "This campaign has expired.";
      case "already-used":
        return "This redemption code has already been used.";
      case "max-redemptions-reached":
        return "This campaign has reached its maximum number of redemptions.";
      case "inactive":
        return "This campaign is currently inactive.";
      default:
        return "Unknown state";
    }
  };

  // Helper function to check if campaign is redeemable
  const isRedeemable = (): boolean => {
    return state === "valid" && isAuthenticated && !isRedeeming;
  };

  // Loading state
  if (state === "loading") {
    return (
      <Card
        className={`${styles["campaign-info"]} ${className}`}
        border="light"
      >
        <Card.Body className="text-center py-5">
          <Spinner
            animation="border"
            variant="primary"
            className={`mb-3 ${styles["loading-spinner"]}`}
          />
          <h5 className="text-muted">{getStateMessage()}</h5>
        </Card.Body>
      </Card>
    );
  }

  // Error states without campaign data
  if (!campaign && (state === "invalid" || error)) {
    return (
      <Card
        className={`${styles["campaign-info"]} ${className}`}
        border="danger"
      >
        <Card.Body className="text-center">
          <Alert variant="danger" className="mb-0">
            <Alert.Heading>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Campaign Not Found
            </Alert.Heading>
            <p className="mb-0">{getStateMessage()}</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  // Calculate progress percentage
  const progressPercentage =
    campaign && campaign.maxRedemptions > 0
      ? (campaign.currentRedemptions / campaign.maxRedemptions) * 100
      : 0;

  // Main campaign display
  return (
    <Card
      className={`${styles["campaign-info"]} ${className}`}
      border={getStateVariant()}
    >
      <Card.Header className={`bg-${getStateVariant()} text-white`}>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="bi bi-gift me-2"></i>
            {campaign?.name || "Campaign Information"}
          </h4>
          <Badge bg="light" text="dark" className="fs-6">
            ${campaign?.redemptionValue || 0}
          </Badge>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Campaign Description */}
        {campaign?.description && (
          <Card.Text className="text-muted mb-3">
            {campaign.description}
          </Card.Text>
        )}

        {/* Campaign Details */}
        {campaign && (
          <div className="row mb-3">
            <div className="col-md-6">
              <strong>Redemption Value:</strong>
              <div
                className={`text-success fs-4 ${styles["redemption-value"]}`}
              >
                ${campaign.redemptionValue}
              </div>
            </div>
            <div className="col-md-6">
              <strong>Campaign Status:</strong>
              <div>
                <Badge bg={campaign.isActive ? "success" : "secondary"}>
                  {campaign.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Redemption Progress */}
        {campaign && campaign.maxRedemptions > 0 && (
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <small>
                <strong>Redemptions:</strong>
              </small>
              <small>
                {campaign.currentRedemptions} / {campaign.maxRedemptions}
              </small>
            </div>
            <div
              className="progress"
              style={
                {
                  "--progress-width": progressPercentage,
                } as React.CSSProperties
              }
            >
              <div
                className={`progress-bar bg-info ${styles["progress-bar"]}`}
                role="progressbar"
                title={`${campaign.currentRedemptions} of ${campaign.maxRedemptions} redemptions used`}
                aria-label={`Campaign progress: ${campaign.currentRedemptions} of ${campaign.maxRedemptions} redemptions used`}
              />
            </div>
          </div>
        )}

        {/* Code Information */}
        {code && (
          <div className="mb-3">
            <strong>Redemption Code:</strong>
            <div className={styles["code-display"]}>{code}</div>
          </div>
        )}

        {/* State Message */}
        <Alert variant={getStateVariant()} className="mb-3">
          <div className="d-flex align-items-center">
            <i
              className={`bi ${
                state === "valid"
                  ? "bi-check-circle"
                  : "bi-exclamation-triangle"
              } me-2`}
            ></i>
            {getStateMessage()}
          </div>
        </Alert>

        {/* User Information */}
        {isAuthenticated && userEmail && (
          <div className="mb-3">
            <small className="text-muted">
              <i className="bi bi-person me-1"></i>
              Signed in as: <strong>{userEmail}</strong>
            </small>
          </div>
        )}

        {/* Action Buttons */}
        <div className="d-grid gap-2">
          {isAuthenticated ? (
            /* Authenticated User Actions */
            <>
              {isRedeemable() && (
                <Button
                  variant="success"
                  size="lg"
                  onClick={onRedeem}
                  disabled={isRedeeming}
                >
                  {isRedeeming ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing Redemption...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-gift me-2"></i>
                      Redeem ${campaign?.redemptionValue} Credit
                    </>
                  )}
                </Button>
              )}

              {state === "valid" && !isRedeemable() && (
                <Button variant="secondary" disabled>
                  <i className="bi bi-info-circle me-2"></i>
                  Cannot Redeem at This Time
                </Button>
              )}
            </>
          ) : (
            /* Unauthenticated User Actions */
            state === "valid" && (
              <div className="row g-2">
                <div className="col-md-6">
                  <Link href="/auth" className="btn btn-primary w-100">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Sign In
                  </Link>
                </div>
                <div className="col-md-6">
                  <Link
                    href="/register"
                    className="btn btn-outline-primary w-100"
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Register
                  </Link>
                </div>
              </div>
            )
          )}

          {/* Additional Actions */}
          {(state === "invalid" || state === "expired") && (
            <Link href="/" className="btn btn-outline-secondary">
              <i className="bi bi-house me-2"></i>
              Back to Home
            </Link>
          )}
        </div>
      </Card.Body>

      {/* Campaign Dates Footer */}
      {campaign && (
        <Card.Footer className="text-muted">
          <div className="row">
            <div className="col-md-6">
              <small>
                <i className="bi bi-calendar-event me-1"></i>
                <strong>Start:</strong> {formatDateSimple(campaign.startDate)}
              </small>
            </div>
            <div className="col-md-6">
              <small>
                <i className="bi bi-calendar-x me-1"></i>
                <strong>End:</strong> {formatDateSimple(campaign.endDate)}
              </small>
            </div>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
}

// Export types for use in other components
export type { CampaignInfoProps };
