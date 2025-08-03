"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Button,
  Badge,
} from "react-bootstrap";
import { useRouter } from "next/navigation";

interface RedemptionResult {
  success: boolean;
  message: string;
  campaignName?: string;
  redemptionValue?: number;
  userBalance?: number;
  error?: string;
}

export default function RedeemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<RedemptionResult | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const campaign = searchParams.get("campaign_id");
    const redemptionCode = searchParams.get("code");

    setCampaignId(campaign);
    setCode(redemptionCode);

    if (campaign && redemptionCode) {
      handleRedemption(campaign, redemptionCode);
    } else {
      setLoading(false);
      setResult({
        success: false,
        message: "Invalid redemption URL. Missing campaign ID or code.",
        error: "INVALID_URL",
      });
    }
  }, [searchParams]);

  const handleRedemption = async (campaignId: string, code: string) => {
    try {
      setLoading(true);

      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          code: code, // Fixed: API expects 'code', not 'uniqueCode'
          userEmail: "anonymous@example.com", // Fixed: API expects 'userEmail', not 'userId'
          redemptionUrl: window.location.href, // Optional: track the full URL for analytics
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Redemption successful!",
          campaignName: data.campaignName,
          redemptionValue: data.redemptionValue,
          userBalance: data.userBalance,
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Redemption failed",
          error: data.error,
        });
      }
    } catch (error) {
      console.error("Redemption error:", error);
      setResult({
        success: false,
        message: "An error occurred during redemption. Please try again.",
        error: "NETWORK_ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card>
              <Card.Body>
                <Spinner animation="border" role="status" className="mb-3">
                  <span className="visually-hidden">Processing...</span>
                </Spinner>
                <h4>Processing Redemption</h4>
                <p className="text-muted">
                  Please wait while we process your redemption...
                </p>
                {campaignId && (
                  <div className="mt-3">
                    <small className="text-muted">
                      Campaign: {campaignId}
                      <br />
                      Code: {code}
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="text-center p-4">
              {result?.success ? (
                <>
                  <div className="text-success mb-3">
                    <span className="display-1">✅</span>
                  </div>
                  <h2 className="text-success">Redemption Successful! 🎉</h2>
                  <p className="lead">{result.message}</p>

                  {result.campaignName && (
                    <Alert variant="info" className="mt-3">
                      <strong>Campaign:</strong> {result.campaignName}
                    </Alert>
                  )}

                  {result.redemptionValue && (
                    <Alert variant="success" className="mt-3">
                      <strong>Value Redeemed:</strong> ${result.redemptionValue}
                    </Alert>
                  )}

                  {result.userBalance && (
                    <Alert variant="primary" className="mt-3">
                      <strong>Your Balance:</strong> ${result.userBalance}
                    </Alert>
                  )}

                  <div className="mt-4">
                    <Badge bg="success" className="me-2">
                      ✅ Code Redeemed
                    </Badge>
                    <Badge bg="info">
                      📅 {new Date().toLocaleDateString()}
                    </Badge>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-danger mb-3">
                    <span className="display-1">❌</span>
                  </div>
                  <h2 className="text-danger">Redemption Failed</h2>
                  <p className="lead">{result?.message}</p>

                  <Alert variant="danger" className="mt-3">
                    {result?.error === "INVALID_URL" && (
                      <>
                        <strong>Invalid URL:</strong> This redemption link is
                        not valid. Please check the URL and try again.
                      </>
                    )}
                    {result?.error === "CODE_ALREADY_USED" && (
                      <>
                        <strong>Code Already Used:</strong> This redemption code
                        has already been used.
                      </>
                    )}
                    {result?.error === "CODE_NOT_FOUND" && (
                      <>
                        <strong>Code Not Found:</strong> This redemption code is
                        not valid or has expired.
                      </>
                    )}
                    {result?.error === "CAMPAIGN_NOT_FOUND" && (
                      <>
                        <strong>Campaign Not Found:</strong> The campaign
                        associated with this code is not active.
                      </>
                    )}
                    {result?.error === "NETWORK_ERROR" && (
                      <>
                        <strong>Network Error:</strong> Please check your
                        internet connection and try again.
                      </>
                    )}
                    {!result?.error?.match(
                      /INVALID_URL|CODE_ALREADY_USED|CODE_NOT_FOUND|CAMPAIGN_NOT_FOUND|NETWORK_ERROR/
                    ) && (
                      <>
                        <strong>Error:</strong> {result?.message}
                      </>
                    )}
                  </Alert>

                  {campaignId && code && (
                    <div className="mt-3">
                      <small className="text-muted">
                        Campaign: {campaignId}
                        <br />
                        Code: {code}
                      </small>
                    </div>
                  )}
                </>
              )}

              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={() => router.push("/")}
                  className="me-2"
                >
                  Go to Home
                </Button>
                {!result?.success && campaignId && code && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleRedemption(campaignId, code)}
                  >
                    Try Again
                  </Button>
                )}
              </div>

              <div className="mt-4 text-muted">
                <small>
                  Having issues? Contact support or visit our help center.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
