"use client";

import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  Card,
} from "react-bootstrap";
import CampaignInfo, {
  Campaign,
  CampaignState,
} from "@/components/CampaignInfo";

// Mock campaign data
const mockCampaign: Campaign = {
  id: "1754169423931-test",
  name: "Summer 2025 Promotion",
  description:
    "Get $25 off your next purchase and help fund clean water projects.",
  redemptionValue: 25,
  isActive: true,
  startDate: "2025-06-01T00:00:00.000Z",
  endDate: "2025-08-31T23:59:59.999Z",
  maxRedemptions: 1000,
  currentRedemptions: 250,
};

const expiredCampaign: Campaign = {
  ...mockCampaign,
  name: "Expired Campaign",
  endDate: "2025-01-31T23:59:59.999Z",
};

const inactiveCampaign: Campaign = {
  ...mockCampaign,
  name: "Inactive Campaign",
  isActive: false,
};

const maxedOutCampaign: Campaign = {
  ...mockCampaign,
  name: "Fully Redeemed Campaign",
  currentRedemptions: 1000,
};

export default function CampaignInfoTest() {
  const [selectedState, setSelectedState] = useState<CampaignState>("valid");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeem = () => {
    setIsRedeeming(true);
    // Simulate redemption process
    setTimeout(() => {
      setIsRedeeming(false);
      alert("Redemption successful!");
    }, 2000);
  };

  const getCampaignForState = (state: CampaignState): Campaign | undefined => {
    switch (state) {
      case "loading":
      case "invalid":
        return undefined;
      case "expired":
        return expiredCampaign;
      case "inactive":
        return inactiveCampaign;
      case "max-redemptions-reached":
        return maxedOutCampaign;
      default:
        return mockCampaign;
    }
  };

  const getErrorForState = (state: CampaignState): string | undefined => {
    switch (state) {
      case "invalid":
        return "The campaign ID or redemption code you entered is not valid.";
      default:
        return undefined;
    }
  };

  const stateButtons: {
    state: CampaignState;
    label: string;
    variant: string;
  }[] = [
    { state: "loading", label: "Loading", variant: "secondary" },
    { state: "valid", label: "Valid", variant: "success" },
    { state: "invalid", label: "Invalid", variant: "danger" },
    { state: "expired", label: "Expired", variant: "warning" },
    { state: "already-used", label: "Already Used", variant: "warning" },
    { state: "max-redemptions-reached", label: "Max Reached", variant: "info" },
    { state: "inactive", label: "Inactive", variant: "secondary" },
  ];

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center mb-4">
            <i className="bi bi-clipboard-check me-2"></i>
            Campaign Info Component Test
          </h1>
          <p className="text-center text-muted">
            Test different campaign states and authentication scenarios
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                Test Controls
              </h5>
            </Card.Header>
            <Card.Body>
              {/* Authentication Toggle */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Authentication Status:</strong>
                </label>
                <div>
                  <ButtonGroup>
                    <Button
                      variant={isAuthenticated ? "outline-primary" : "primary"}
                      onClick={() => setIsAuthenticated(false)}
                    >
                      <i className="bi bi-person-x me-1"></i>
                      Not Logged In
                    </Button>
                    <Button
                      variant={isAuthenticated ? "primary" : "outline-primary"}
                      onClick={() => setIsAuthenticated(true)}
                    >
                      <i className="bi bi-person-check me-1"></i>
                      Logged In
                    </Button>
                  </ButtonGroup>
                </div>
              </div>

              {/* State Selection */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Campaign State:</strong>
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {stateButtons.map(({ state, label, variant }) => (
                    <Button
                      key={state}
                      variant={
                        selectedState === state ? variant : `outline-${variant}`
                      }
                      size="sm"
                      onClick={() => setSelectedState(state)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Configuration Display */}
              <div className="bg-light p-3 rounded">
                <h6>Current Configuration:</h6>
                <ul className="mb-0">
                  <li>
                    <strong>State:</strong> {selectedState}
                  </li>
                  <li>
                    <strong>Authenticated:</strong>{" "}
                    {isAuthenticated ? "Yes" : "No"}
                  </li>
                  {isAuthenticated && (
                    <li>
                      <strong>User:</strong> test@example.com
                    </li>
                  )}
                  <li>
                    <strong>Code:</strong> TEST123ABC
                  </li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8} className="mx-auto">
          <h3 className="mb-3 text-center">Campaign Component Preview</h3>

          <CampaignInfo
            campaign={getCampaignForState(selectedState)}
            state={selectedState}
            isAuthenticated={isAuthenticated}
            userEmail={isAuthenticated ? "test@example.com" : undefined}
            code="TEST123ABC"
            error={getErrorForState(selectedState)}
            onRedeem={handleRedeem}
            isRedeeming={isRedeeming}
          />
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                State Descriptions
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="row">
                {stateButtons.map(({ state, label }) => (
                  <div key={state} className="col-md-6 col-lg-4 mb-3">
                    <div className="border p-3 rounded h-100">
                      <h6 className="text-primary">{label}</h6>
                      <small className="text-muted">
                        {(() => {
                          switch (state) {
                            case "loading":
                              return "Campaign data is being validated";
                            case "valid":
                              return "Campaign is active and code can be redeemed";
                            case "invalid":
                              return "Campaign or code not found";
                            case "expired":
                              return "Campaign end date has passed";
                            case "already-used":
                              return "Redemption code has been used";
                            case "max-redemptions-reached":
                              return "Campaign has reached maximum redemptions";
                            case "inactive":
                              return "Campaign is temporarily disabled";
                            default:
                              return "Unknown state";
                          }
                        })()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-check2-square me-2"></i>
                Test Scenarios
              </h5>
            </Card.Header>
            <Card.Body>
              <h6>Recommended Test Cases:</h6>
              <ol>
                <li>
                  <strong>Unauthenticated + Valid:</strong> Should show
                  login/register buttons
                </li>
                <li>
                  <strong>Authenticated + Valid:</strong> Should show redeem
                  button
                </li>
                <li>
                  <strong>Loading State:</strong> Should show spinner and
                  loading message
                </li>
                <li>
                  <strong>Invalid Campaign:</strong> Should show error message
                </li>
                <li>
                  <strong>Expired Campaign:</strong> Should show expiration
                  notice
                </li>
                <li>
                  <strong>Already Used Code:</strong> Should show warning
                  message
                </li>
                <li>
                  <strong>Inactive Campaign:</strong> Should show inactive
                  status
                </li>
                <li>
                  <strong>Max Redemptions:</strong> Should show campaign is full
                </li>
                <li>
                  <strong>Redemption Process:</strong> Click redeem to test
                  loading state
                </li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
