"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Table,
  Badge,
} from "react-bootstrap";
import { useAuth } from "@/lib/auth-context";

interface Campaign {
  id: string;
  name: string;
  description: string;
  redemptionValue: number;
  isActive: boolean;
}

interface TestResult {
  type: "success" | "error";
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

export default function TestRedemptionPage() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [redemptionCode, setRedemptionCode] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialBalance, setInitialBalance] = useState<number>(0);

  useEffect(() => {
    loadCampaigns();
    if (user) {
      setInitialBalance(user.balance);
    }
  }, [user]);

  const loadCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
        if (data.length > 0) {
          setSelectedCampaign(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
    }
  };

  const generateTestCode = () => {
    const code = `TEST-${Math.random()
      .toString(36)
      .substr(2, 8)
      .toUpperCase()}`;
    setRedemptionCode(code);
    return code;
  };

  const addTestResult = (
    type: "success" | "error",
    message: string,
    details?: Record<string, unknown>
  ) => {
    const result: TestResult = {
      type,
      message,
      details,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTestResults((prev) => [result, ...prev]);
  };

  const testRedemptionURL = () => {
    if (!selectedCampaign) {
      addTestResult("error", "Please select a campaign first");
      return;
    }

    const code = redemptionCode || generateTestCode();
    const url = `/redeem?campaign_id=${selectedCampaign}&code=${code}`;

    addTestResult("success", `Generated redemption URL: ${url}`, {
      url,
      campaignId: selectedCampaign,
      code,
    });

    // Open in new tab for testing
    window.open(url, "_blank");
  };

  const testDirectRedemption = async () => {
    if (!selectedCampaign || !user) {
      addTestResult(
        "error",
        "Please select a campaign and ensure you are logged in"
      );
      return;
    }

    setLoading(true);
    const code = redemptionCode || generateTestCode();

    try {
      addTestResult("success", `Testing direct redemption with code: ${code}`);

      const response = await fetch("/api/campaigns/redeem", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: selectedCampaign,
          redemptionCode: code,
          userEmail: user.email,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        addTestResult("success", `Redemption successful! ${result.message}`, {
          campaignName: result.campaignName,
          redemptionValue: result.redemptionValue,
          oldBalance: initialBalance,
          newBalance: result.userBalance,
          balanceIncrease: result.userBalance - initialBalance,
        });

        // Refresh user data to show updated balance
        await refreshUser();
      } else {
        addTestResult(
          "error",
          `Redemption failed: ${result.error || result.message}`,
          result
        );
      }
    } catch (error) {
      addTestResult(
        "error",
        `Network error during redemption: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : { error: String(error) }
      );
    } finally {
      setLoading(false);
    }
  };

  const testCookieCleanup = () => {
    // Set some test cookies
    document.cookie = `campaign_${selectedCampaign}=test-value; path=/`;
    document.cookie = `redemption_code_${selectedCampaign}=test-code; path=/`;
    document.cookie = `campaign_context=test-context; path=/`;

    addTestResult("success", "Test cookies set");

    // Clear them
    setTimeout(() => {
      document.cookie = `campaign_${selectedCampaign}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `redemption_code_${selectedCampaign}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `campaign_context=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

      addTestResult("success", "Test cookies cleared");
    }, 1000);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="warning">
              <h5>Authentication Required</h5>
              <p>You must be logged in to test the redemption flow.</p>
              <Button variant="primary" href="/auth">
                Go to Login
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row>
        <Col md={12}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">
                <i className="bi bi-check-circle me-2"></i>
                Redemption Flow Testing
              </h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-4">
                <strong>Test Environment:</strong> Use this page to test the
                complete redemption flow including URL generation, confirmation
                component, API calls, balance updates, and cookie cleanup.
              </Alert>

              <Row className="mb-4">
                <Col md={6}>
                  <div className="user-balance">
                    <h5>
                      Current Balance: ${user?.balance?.toFixed(2) || "0.00"}
                    </h5>
                    <small className="text-muted">User: {user?.email}</small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-end">
                    <Badge bg="primary" className="me-2">
                      Initial Balance: ${initialBalance.toFixed(2)}
                    </Badge>
                    <Badge bg="success">
                      Change: +$
                      {((user?.balance || 0) - initialBalance).toFixed(2)}
                    </Badge>
                  </div>
                </Col>
              </Row>

              <Form>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Select Campaign</Form.Label>
                      <Form.Select
                        value={selectedCampaign}
                        onChange={(e) => setSelectedCampaign(e.target.value)}
                      >
                        <option value="">Choose a campaign...</option>
                        {campaigns.map((campaign) => (
                          <option key={campaign.id} value={campaign.id}>
                            {campaign.name} ($
                            {campaign.redemptionValue.toFixed(2)})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Redemption Code (optional)</Form.Label>
                      <div className="input-group">
                        <Form.Control
                          type="text"
                          value={redemptionCode}
                          onChange={(e) => setRedemptionCode(e.target.value)}
                          placeholder="Auto-generated if empty"
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={generateTestCode}
                        >
                          Generate
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-grid gap-2 d-md-flex justify-content-md-start mb-4">
                  <Button
                    variant="primary"
                    onClick={testRedemptionURL}
                    disabled={!selectedCampaign}
                  >
                    <i className="bi bi-link-45deg me-2"></i>
                    Test Redemption URL
                  </Button>
                  <Button
                    variant="success"
                    onClick={testDirectRedemption}
                    disabled={!selectedCampaign || loading}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Test Direct Redemption
                  </Button>
                  <Button
                    variant="warning"
                    onClick={testCookieCleanup}
                    disabled={!selectedCampaign}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Test Cookie Cleanup
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={clearTestResults}
                  >
                    Clear Results
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h5 className="mb-0">Test Results</h5>
            </Card.Header>
            <Card.Body>
              {testResults.length === 0 ? (
                <p className="text-muted text-center py-3">
                  No test results yet. Run some tests above to see results here.
                </p>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Message</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.map((result, index) => (
                      <tr key={index}>
                        <td>{result.timestamp}</td>
                        <td>
                          <Badge
                            bg={
                              result.type === "success" ? "success" : "danger"
                            }
                          >
                            {result.type.toUpperCase()}
                          </Badge>
                        </td>
                        <td>{result.message}</td>
                        <td>
                          {result.details && (
                            <details>
                              <summary>View Details</summary>
                              <pre className="mt-2 p-2 bg-light rounded small-text">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Testing Checklist</h5>
            </Card.Header>
            <Card.Body>
              <ul>
                <li>
                  <strong>URL Generation:</strong> Test redemption URL creation
                  with campaign ID and code
                </li>
                <li>
                  <strong>Authentication Flow:</strong> Verify redirect to login
                  for unauthenticated users
                </li>
                <li>
                  <strong>Campaign Loading:</strong> Check campaign details are
                  loaded correctly
                </li>
                <li>
                  <strong>Confirmation UI:</strong> Test the confirmation
                  component displays correctly
                </li>
                <li>
                  <strong>Direct Redemption:</strong> Test API call and response
                  handling
                </li>
                <li>
                  <strong>Balance Updates:</strong> Verify user balance
                  increases after redemption
                </li>
                <li>
                  <strong>Cookie Cleanup:</strong> Confirm campaign cookies are
                  cleared after redemption
                </li>
                <li>
                  <strong>Error Handling:</strong> Test various error scenarios
                </li>
                <li>
                  <strong>Success States:</strong> Verify success messages and
                  navigation
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
