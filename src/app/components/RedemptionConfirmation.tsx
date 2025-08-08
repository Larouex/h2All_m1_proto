"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
  Modal,
} from "react-bootstrap";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "../lib/utils/dateUtils";

interface Campaign {
  id: string;
  name: string;
  description: string;
  redemptionValue: number;
  isActive: boolean;
  expiryDate?: string;
}

interface RedemptionConfirmationProps {
  campaignId: string;
  redemptionCode: string;
  onRedemptionComplete?: (success: boolean, newBalance?: number) => void;
  onCancel?: () => void;
}

interface RedemptionResult {
  success: boolean;
  message: string;
  campaignName?: string;
  redemptionValue?: number;
  userBalance?: number;
  error?: string;
}

export default function RedemptionConfirmation({
  campaignId,
  redemptionCode,
  onRedemptionComplete,
  onCancel,
}: RedemptionConfirmationProps) {
  const { user, refreshUser } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [result, setResult] = useState<RedemptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadCampaignDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Loading campaign details for ID: ${campaignId}`);

      const response = await fetch(`/api/campaigns?id=${campaignId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: Failed to load campaign`
        );
      }

      const campaignData = await response.json();
      console.log("Campaign data loaded:", campaignData);

      setCampaign(campaignData);
    } catch (err) {
      console.error("Error loading campaign:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load campaign details"
      );
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  // Load campaign details
  useEffect(() => {
    loadCampaignDetails();
  }, [loadCampaignDetails]);

  const handleConfirmRedemption = () => {
    setShowConfirmModal(true);
  };

  const handleRedemption = async () => {
    if (!campaign || !user) return;

    try {
      setRedeeming(true);
      setError(null);
      setShowConfirmModal(false);

      console.log(
        `Processing redemption for campaign: ${campaignId}, code: ${redemptionCode}`
      );

      const response = await fetch("/api/campaigns/redeem", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          unique_code: redemptionCode,
          userEmail: user.email,
        }),
      });

      const redemptionResult: RedemptionResult = await response.json();
      console.log("Redemption result:", redemptionResult);

      if (response.ok && redemptionResult.success) {
        // Successful redemption
        setResult(redemptionResult);

        // Clear campaign cookies
        clearCampaignCookies();

        // Refresh user data to get updated balance
        await refreshUser();

        // Notify parent component
        onRedemptionComplete?.(true, redemptionResult.userBalance);
      } else {
        // Failed redemption
        setError(
          redemptionResult.error ||
            redemptionResult.message ||
            "Redemption failed"
        );
        onRedemptionComplete?.(false);
      }
    } catch (err) {
      console.error("Error during redemption:", err);
      setError(
        err instanceof Error ? err.message : "Network error during redemption"
      );
      onRedemptionComplete?.(false);
    } finally {
      setRedeeming(false);
    }
  };

  const clearCampaignCookies = () => {
    try {
      // Clear campaign-related cookies
      document.cookie = `campaign_${campaignId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `redemption_code_${campaignId}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `campaign_context=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      console.log("Campaign cookies cleared");
    } catch (err) {
      console.warn("Failed to clear campaign cookies:", err);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Success state
  if (result && result.success) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-success">
              <Card.Header className="bg-success text-white text-center">
                <h4 className="mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  Redemption Successful!
                </h4>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="mb-4">
                  <h5 className="text-success">{result.campaignName}</h5>
                  <p className="text-muted mb-3">{result.message}</p>

                  <div className="row text-center mb-4">
                    <div className="col-6">
                      <div className="stat-card">
                        <div className="stat-value text-success">
                          {formatCurrency(result.redemptionValue || 0)}
                        </div>
                        <div className="stat-label">Redeemed Value</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat-card">
                        <div className="stat-value text-primary">
                          {formatCurrency(result.userBalance || 0)}
                        </div>
                        <div className="stat-label">New Balance</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert variant="success" className="mb-4">
                  <strong>Congratulations!</strong> Your redemption has been
                  processed successfully. The value has been added to your
                  account balance.
                </Alert>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => (window.location.href = "/admin")}
                  >
                    Continue to Dashboard
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => (window.location.href = "/admin/campaigns")}
                  >
                    View More Campaigns
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card>
              <Card.Body className="text-center py-5">
                <Spinner animation="border" className="mb-3" />
                <p>Loading campaign details...</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Error state
  if (error && !campaign) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="border-danger">
              <Card.Header className="bg-danger text-white">
                <h4 className="mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Error Loading Campaign
                </h4>
              </Card.Header>
              <Card.Body>
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={loadCampaignDetails}>
                    Try Again
                  </Button>
                  <Button variant="outline-secondary" onClick={onCancel}>
                    Cancel
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Main confirmation interface
  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Header className="text-center">
              <h4 className="mb-0">
                <i className="bi bi-gift me-2"></i>
                Confirm Redemption
              </h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-4">
                  <strong>Redemption Error:</strong> {error}
                </Alert>
              )}

              {campaign && (
                <div className="mb-4">
                  <div className="text-center mb-4">
                    <h5 className="text-primary">{campaign.name}</h5>
                    <p className="text-muted">{campaign.description}</p>

                    <div className="user-balance mb-3">
                      <h2 className="mb-1">
                        {formatCurrency(campaign.redemptionValue)}
                      </h2>
                      <small>Redemption Value</small>
                    </div>
                  </div>

                  <div className="campaign-details mb-4">
                    <Row>
                      <Col sm={6}>
                        <strong>Campaign Status:</strong>
                        <br />
                        <Badge bg={campaign.isActive ? "success" : "danger"}>
                          {campaign.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Col>
                      <Col sm={6}>
                        <strong>Your Current Balance:</strong>
                        <br />
                        <span className="text-primary fw-bold">
                          {formatCurrency(user?.balance || 0)}
                        </span>
                      </Col>
                    </Row>

                    {campaign.expiryDate && (
                      <Row className="mt-3">
                        <Col>
                          <strong>Expires:</strong>
                          <br />
                          <span className="text-warning">
                            {formatDate(campaign.expiryDate)}
                          </span>
                        </Col>
                      </Row>
                    )}
                  </div>

                  <div className="balance-preview mb-4 p-3 bg-light rounded">
                    <h6 className="mb-2">After Redemption:</h6>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Current Balance:</span>
                      <span className="fw-bold">
                        {formatCurrency(user?.balance || 0)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Redemption Value:</span>
                      <span className="text-success fw-bold">
                        +{formatCurrency(campaign.redemptionValue)}
                      </span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">New Balance:</span>
                      <span className="fw-bold text-primary">
                        {formatCurrency(
                          (user?.balance || 0) + campaign.redemptionValue
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="redemption-code mb-4 p-3 bg-info bg-opacity-10 rounded">
                    <h6 className="mb-2">Redemption Code:</h6>
                    <code className="fs-6">{redemptionCode}</code>
                  </div>
                </div>
              )}

              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleConfirmRedemption}
                  disabled={redeeming || !campaign?.isActive}
                >
                  {redeeming ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Processing Redemption...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Confirm Redemption
                    </>
                  )}
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={onCancel}
                  disabled={redeeming}
                >
                  Cancel
                </Button>
              </div>

              <div className="text-center mt-3">
                <small className="text-muted">
                  By confirming, you agree to redeem this campaign code and add
                  the value to your account balance.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-question-circle me-2"></i>
            Confirm Redemption
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to redeem this campaign?</p>
          {campaign && (
            <div className="bg-light p-3 rounded">
              <strong>{campaign.name}</strong>
              <br />
              <span className="text-success">
                Value: {formatCurrency(campaign.redemptionValue)}
              </span>
              <br />
              <small className="text-muted">Code: {redemptionCode}</small>
            </div>
          )}
          <p className="mt-3 mb-0">
            <small className="text-warning">
              <i className="bi bi-exclamation-triangle me-1"></i>
              This action cannot be undone.
            </small>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={handleRedemption}>
            <i className="bi bi-check-lg me-2"></i>
            Yes, Redeem Now
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
