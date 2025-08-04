"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Button,
  Spinner,
  Badge,
} from "react-bootstrap";
import { parseCampaignUrl, validateCampaignUrl } from "@/lib/utils/urlParser";
import {
  setCampaignCookie,
  getCampaignCookie,
  clearCampaignCookie,
} from "@/lib/utils/cookies";

interface CampaignData {
  id: string;
  name: string;
  description: string;
  redemptionValue: number;
  isActive: boolean;
  expiresAt: string;
}

interface User {
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
}

interface RedemptionResult {
  success: boolean;
  message: string;
  redemption?: {
    code: string;
    redemptionValue: number;
    campaign: {
      name: string;
    };
  };
}

interface ParsedUrlData {
  campaignId: string;
  uniqueCode: string;
  extraParams?: Record<string, string>;
}

export default function RedemptionHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] =
    useState<RedemptionResult | null>(null);

  const handleIncomingUrl = useCallback(async () => {
    try {
      // Parse URL parameters
      const urlString = window.location.href;
      console.log("Parsing URL:", urlString);

      const parsedData = parseCampaignUrl(urlString);
      console.log("Parsed data:", parsedData);

      if (!parsedData || !parsedData.campaignId) {
        throw new Error("Invalid URL format - missing campaign data");
      }

      // Validate the URL structure
      const validationResult = validateCampaignUrl(urlString);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(", "));
      }

      // Fetch campaign data
      const campaign = await fetchCampaignData(parsedData.campaignId);
      setCampaignData(campaign);

      // Check if user is authenticated
      const currentUser = await checkAuthentication();
      setUser(currentUser);

      if (!currentUser) {
        // User not logged in - save to cookie and show campaign landing
        await saveCampaignDataToCookie(parsedData);
        console.log("Campaign data saved to cookie for unauthenticated user");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error handling redemption URL:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleIncomingUrl();
  }, [handleIncomingUrl]);

  const fetchCampaignData = async (
    campaignId: string
  ): Promise<CampaignData> => {
    const response = await fetch(`/api/campaigns?id=${campaignId}`);
    if (!response.ok) {
      throw new Error("Campaign not found or inactive");
    }
    const data = await response.json();
    return data.campaign;
  };

  const checkAuthentication = async (): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        return userData.user;
      }
      return null;
    } catch {
      return null;
    }
  };

  const saveCampaignDataToCookie = async (parsedData: ParsedUrlData) => {
    const cookieData = {
      campaignId: parsedData.campaignId,
      uniqueCode: parsedData.uniqueCode,
      timestamp: Date.now(),
      utmParams: parsedData.extraParams,
    };

    setCampaignCookie(cookieData, {
      expirationHours: 24,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  };

  const handleRedemption = async () => {
    if (!campaignData || !user) return;

    setIsRedeeming(true);
    try {
      // Get campaign data from cookie if available
      const cookieValidation = getCampaignCookie();
      const code =
        cookieValidation?.data?.uniqueCode || searchParams.get("code");

      const response = await fetch("/api/campaigns/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: campaignData.id,
          code: code,
          userEmail: user.email,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Clear the campaign cookie after successful redemption
        clearCampaignCookie();
        setRedemptionResult(result);
      } else {
        throw new Error(result.message || "Redemption failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Redemption failed");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleLogin = () => {
    // Save current URL to return after login
    const returnUrl = encodeURIComponent(window.location.href);
    router.push(`/auth?returnUrl=${returnUrl}`);
  };

  const handleRegister = () => {
    // Save current URL to return after registration
    const returnUrl = encodeURIComponent(window.location.href);
    router.push(`/auth?returnUrl=${returnUrl}`);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h4>Processing Redemption URL...</h4>
            <p className="text-muted">
              Validating campaign data and checking authentication status
            </p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <Alert.Heading>Invalid Redemption URL</Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-between">
                <Button
                  variant="outline-danger"
                  onClick={() => router.push("/")}
                >
                  Return Home
                </Button>
                <Button
                  variant="danger"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (redemptionResult?.success) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="border-success">
              <Card.Header className="bg-success text-white text-center">
                <h3 className="mb-0">🎉 Redemption Successful!</h3>
              </Card.Header>
              <Card.Body className="text-center">
                <h4 className="text-success mb-3">
                  ${redemptionResult.redemption?.redemptionValue || 0} Added to
                  Your Account
                </h4>
                <p className="lead">
                  Campaign: {redemptionResult.redemption?.campaign?.name}
                </p>
                <p>
                  Your new balance: $
                  {(user?.balance || 0) +
                    (redemptionResult.redemption?.redemptionValue || 0)}
                </p>
                <hr />
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <Button variant="primary" onClick={() => router.push("/")}>
                    Continue Shopping
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => router.push("/track")}
                  >
                    View Account
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!user) {
    // Unauthenticated user - show campaign landing with login/register options
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="border-primary">
              <Card.Header className="bg-primary text-white text-center">
                <h3 className="mb-0">🎁 Campaign Redemption</h3>
              </Card.Header>
              <Card.Body>
                {campaignData && (
                  <>
                    <div className="text-center mb-4">
                      <h4>{campaignData.name}</h4>
                      <p className="text-muted">{campaignData.description}</p>
                      <Badge bg="success" className="fs-5">
                        ${campaignData.redemptionValue} Value
                      </Badge>
                    </div>

                    <Alert variant="info">
                      <Alert.Heading>Sign In Required</Alert.Heading>
                      <p>
                        To redeem this campaign, you need to sign in to your
                        account. Your campaign data has been saved and will be
                        automatically processed after you sign in.
                      </p>
                    </Alert>

                    <div className="d-grid gap-3">
                      <Button variant="primary" size="lg" onClick={handleLogin}>
                        Sign In to Redeem
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="lg"
                        onClick={handleRegister}
                      >
                        Create New Account
                      </Button>
                    </div>

                    <hr />
                    <div className="text-center">
                      <small className="text-muted">
                        Campaign expires:{" "}
                        {new Date(campaignData.expiresAt).toLocaleDateString()}
                      </small>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  // Authenticated user - show redemption confirmation
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="border-success">
            <Card.Header className="bg-success text-white text-center">
              <h3 className="mb-0">Confirm Redemption</h3>
            </Card.Header>
            <Card.Body>
              {campaignData && (
                <>
                  <div className="text-center mb-4">
                    <h4>{campaignData.name}</h4>
                    <p className="text-muted">{campaignData.description}</p>
                    <Badge bg="success" className="fs-5">
                      ${campaignData.redemptionValue} Value
                    </Badge>
                  </div>

                  <Alert variant="success">
                    <Alert.Heading>Ready to Redeem</Alert.Heading>
                    <p>
                      Welcome back, {user.firstName}! Your campaign redemption
                      is ready to process.
                    </p>
                    <p>
                      <strong>Current Balance:</strong> ${user.balance}
                      <br />
                      <strong>After Redemption:</strong> $
                      {user.balance + campaignData.redemptionValue}
                    </p>
                  </Alert>

                  <div className="d-grid gap-3">
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleRedemption}
                      disabled={isRedeeming}
                    >
                      {isRedeeming ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Processing Redemption...
                        </>
                      ) : (
                        <>🎁 Confirm Redemption</>
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => router.push("/")}
                    >
                      Cancel
                    </Button>
                  </div>

                  <hr />
                  <div className="text-center">
                    <small className="text-muted">
                      Campaign expires:{" "}
                      {new Date(campaignData.expiresAt).toLocaleDateString()}
                    </small>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
