"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  Form,
} from "react-bootstrap";
import CampaignProgress from "@/app/components/CampaignProgress";
import MyImpact from "@/app/components/MyImpact";
import { useAuth } from "@/app/lib/auth-context";

interface DebugInfo {
  timestamp: string;
  userAgent: string;
  windowSize: {
    width: number;
    height: number;
  };
  currentUrl: string;
  authState: {
    isAuthenticated: boolean;
    isLoading: boolean;
    userId?: string;
    isAdmin?: boolean;
    email?: string;
  };
}

interface ApiStatus {
  getAllCampaigns?: {
    status: number;
    data: unknown;
  };
  getSpecificCampaign?: {
    status: number;
    data: unknown;
  };
  seedEndpoint?: {
    status: number;
    data: unknown;
  };
  userImpact?: {
    status: number;
    data: unknown;
  };
  impactSeed?: {
    status: number;
    data: unknown;
  };
  error?: string;
}

interface DbStatus {
  status?: string;
  environment?: string;
  railway?: string;
  database?: {
    testPassed: boolean;
  };
  error?: string;
}

export default function CampaignProgressDebugPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [testCampaignId, setTestCampaignId] = useState("kodema-village");
  const [apiStatus, setApiStatus] = useState<ApiStatus>({});
  const [dbStatus, setDbStatus] = useState<DbStatus>({});

  // Test database connection
  const testDatabaseConnection = useCallback(async () => {
    try {
      const response = await fetch("/api/debug/database");
      const data = await response.json();
      setDbStatus(data);
    } catch {
      setDbStatus({ error: "Failed to connect to debug endpoint" });
    }
  }, []);

  // Test campaigns API
  const testCampaignsAPI = useCallback(async () => {
    try {
      // Test GET all campaigns
      const allResponse = await fetch("/api/campaigns");
      const allData = await allResponse.json();

      // Test GET specific campaign
      const specificResponse = await fetch(
        `/api/campaigns?id=${testCampaignId}`
      );
      const specificData = await specificResponse.json();

      // Test seed endpoint
      const seedResponse = await fetch("/api/campaigns/seed");
      const seedData = await seedResponse.json();

      // Test user impact endpoints if authenticated
      let impactData = null;
      let impactSeedData = null;

      if (user?.id) {
        try {
          const impactResponse = await fetch(
            `/api/user/impact?userId=${user.id}&campaignId=${testCampaignId}`
          );
          if (impactResponse.ok) {
            impactData = await impactResponse.json();
          }
        } catch {
          // Impact endpoint might not work without data
        }

        try {
          const impactSeedResponse = await fetch("/api/user/impact/seed");
          if (impactSeedResponse.ok) {
            impactSeedData = await impactSeedResponse.json();
          }
        } catch {
          // Seed endpoint might fail if no data exists
        }
      }

      setApiStatus({
        getAllCampaigns: {
          status: allResponse.status,
          data: allData,
        },
        getSpecificCampaign: {
          status: specificResponse.status,
          data: specificData,
        },
        seedEndpoint: {
          status: seedResponse.status,
          data: seedData,
        },
        userImpact: impactData
          ? {
              status: 200,
              data: impactData,
            }
          : undefined,
        impactSeed: impactSeedData
          ? {
              status: 200,
              data: impactSeedData,
            }
          : undefined,
      });
    } catch {
      setApiStatus({ error: "Failed to test API endpoints" });
    }
  }, [testCampaignId, user?.id]);

  // Collect debug information
  useEffect(() => {
    const info: DebugInfo = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      windowSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      currentUrl: window.location.href,
      authState: {
        isAuthenticated,
        isLoading,
        userId: user?.id,
        isAdmin: user?.isAdmin,
        email: user?.email,
      },
    };
    setDebugInfo(info);

    // Auto-run tests
    testDatabaseConnection();
    testCampaignsAPI();
  }, [
    isAuthenticated,
    isLoading,
    user,
    testDatabaseConnection,
    testCampaignsAPI,
  ]);

  const runAllTests = () => {
    testDatabaseConnection();
    testCampaignsAPI();
  };

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h1 className="mb-4">CampaignProgress Component Debug Session</h1>

          {/* Authentication Status */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">🔐 Authentication Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-2 mb-3">
                <Badge bg={isAuthenticated ? "success" : "danger"}>
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </Badge>
                <Badge bg={isLoading ? "warning" : "success"}>
                  {isLoading ? "Loading" : "Ready"}
                </Badge>
                {user?.isAdmin && <Badge bg="primary">Admin User</Badge>}
              </div>

              {user && (
                <div>
                  <small className="text-muted d-block">
                    User ID: {user.id}
                  </small>
                  <small className="text-muted d-block">
                    Email: {user.email}
                  </small>
                  <small className="text-muted d-block">
                    Admin: {user.isAdmin ? "Yes" : "No"}
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Debug Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">🐛 Debug Information</h5>
            </Card.Header>
            <Card.Body>
              <pre className="small bg-light p-3 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </Card.Body>
          </Card>

          {/* Database Status */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🗄️ Database Connection</h5>
              <Button size="sm" onClick={testDatabaseConnection}>
                Test Connection
              </Button>
            </Card.Header>
            <Card.Body>
              {dbStatus.error ? (
                <Alert variant="danger">{dbStatus.error}</Alert>
              ) : dbStatus.status === "success" ? (
                <Alert variant="success">
                  ✅ Database Connected Successfully
                  <div className="mt-2">
                    <small className="d-block">
                      Environment: {dbStatus.environment}
                    </small>
                    <small className="d-block">
                      Railway: {dbStatus.railway}
                    </small>
                    <small className="d-block">
                      Test Passed:{" "}
                      {dbStatus.database?.testPassed ? "Yes" : "No"}
                    </small>
                  </div>
                </Alert>
              ) : (
                <div className="text-muted">
                  Click &quot;Test Connection&quot; to check database status
                </div>
              )}
            </Card.Body>
          </Card>

          {/* API Testing */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🔗 API Endpoints Testing</h5>
              <Button size="sm" onClick={testCampaignsAPI}>
                Test APIs
              </Button>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Test Campaign ID:</Form.Label>
                <Form.Control
                  type="text"
                  value={testCampaignId}
                  onChange={(e) => setTestCampaignId(e.target.value)}
                  placeholder="Enter campaign ID to test"
                />
              </Form.Group>

              {apiStatus.error && (
                <Alert variant="danger">{apiStatus.error}</Alert>
              )}

              {apiStatus.getAllCampaigns && (
                <div className="mb-3">
                  <h6>GET /api/campaigns</h6>
                  <Badge
                    bg={
                      apiStatus.getAllCampaigns.status === 200
                        ? "success"
                        : "danger"
                    }
                  >
                    Status: {apiStatus.getAllCampaigns.status}
                  </Badge>
                  <pre className="small bg-light p-2 mt-2 rounded">
                    {JSON.stringify(apiStatus.getAllCampaigns.data, null, 2)}
                  </pre>
                </div>
              )}

              {apiStatus.getSpecificCampaign && (
                <div className="mb-3">
                  <h6>GET /api/campaigns?id={testCampaignId}</h6>
                  <Badge
                    bg={
                      apiStatus.getSpecificCampaign.status === 200
                        ? "success"
                        : "danger"
                    }
                  >
                    Status: {apiStatus.getSpecificCampaign.status}
                  </Badge>
                  <pre className="small bg-light p-2 mt-2 rounded">
                    {JSON.stringify(
                      apiStatus.getSpecificCampaign.data,
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}

              {apiStatus.seedEndpoint && (
                <div className="mb-3">
                  <h6>GET /api/campaigns/seed</h6>
                  <Badge
                    bg={
                      apiStatus.seedEndpoint.status === 200
                        ? "success"
                        : "danger"
                    }
                  >
                    Status: {apiStatus.seedEndpoint.status}
                  </Badge>
                  <pre className="small bg-light p-2 mt-2 rounded">
                    {JSON.stringify(apiStatus.seedEndpoint.data, null, 2)}
                  </pre>
                </div>
              )}

              {apiStatus.userImpact && (
                <div className="mb-3">
                  <h6>
                    GET /api/user/impact?userId={user?.id}&campaignId=
                    {testCampaignId}
                  </h6>
                  <Badge bg="success">
                    Status: {apiStatus.userImpact.status}
                  </Badge>
                  <pre className="small bg-light p-2 mt-2 rounded">
                    {JSON.stringify(apiStatus.userImpact.data, null, 2)}
                  </pre>
                </div>
              )}

              {apiStatus.impactSeed && (
                <div className="mb-3">
                  <h6>GET /api/user/impact/seed</h6>
                  <Badge bg="success">
                    Status: {apiStatus.impactSeed.status}
                  </Badge>
                  <pre className="small bg-light p-2 mt-2 rounded">
                    {JSON.stringify(apiStatus.impactSeed.data, null, 2)}
                  </pre>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Component Testing */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">🧩 Component Testing</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h6>CampaignProgress Component</h6>

                <div className="mb-3">
                  <small className="text-muted">
                    Test with Campaign ID: {testCampaignId}
                  </small>
                  <CampaignProgress
                    campaignId={testCampaignId}
                    className="mb-3"
                  />
                </div>

                <div className="mb-3">
                  <small className="text-muted">
                    Test with Default Campaign
                  </small>
                  <CampaignProgress campaignId="default" className="mb-3" />
                </div>

                <div className="mb-3">
                  <small className="text-muted">
                    Test with Non-existent Campaign
                  </small>
                  <CampaignProgress
                    campaignId="non-existent-campaign"
                    className="mb-3"
                  />
                </div>
              </div>

              <div className="mb-4">
                <h6>MyImpact Component</h6>

                <div className="mb-3">
                  <small className="text-muted">
                    Test with Campaign ID: {testCampaignId}
                  </small>
                  <MyImpact campaignId={testCampaignId} className="mb-3" />
                </div>

                <div className="mb-3">
                  <small className="text-muted">
                    Test without Campaign ID (all impacts)
                  </small>
                  <MyImpact className="mb-3" />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Actions */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">🔧 Debug Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-2 flex-wrap">
                <Button variant="primary" onClick={runAllTests}>
                  Run All Tests
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
                <Button variant="info" onClick={() => setDebugInfo(null)}>
                  Clear Debug Info
                </Button>
                <Button
                  variant="success"
                  onClick={() => window.open("/claimed2", "_blank")}
                >
                  Open Claimed2 Page
                </Button>
                <Button
                  variant="warning"
                  onClick={() => window.open("/admin", "_blank")}
                >
                  Open Admin Dashboard
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => window.open("/api/user/impact/seed", "_blank")}
                >
                  Seed Impact Data
                </Button>
                <Button
                  variant="outline-success"
                  onClick={() =>
                    window.open(
                      `/api/user/impact?userId=${user?.id || "test"}`,
                      "_blank"
                    )
                  }
                >
                  Test Impact API
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
