"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useRouter } from "next/navigation";

// Import cookie utilities (client-side only)
import {
  setCampaignCookie,
  getCampaignCookie,
  clearCampaignCookie,
  hasCampaignCookie,
  getCampaignCookieExpiration,
  updateCampaignCookieUTM,
  cookieDebug,
} from "@/lib/utils/cookies";

interface TestResult {
  test: string;
  status: "pass" | "fail" | "running";
  message: string;
  timestamp: number;
}

export default function CookieTestPage() {
  const router = useRouter();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [cookieInfo, setCookieInfo] = useState<Record<string, unknown> | null>(
    null
  );

  // Form states
  const [testForm, setTestForm] = useState({
    campaignId: "test-campaign-" + Date.now(),
    uniqueCode:
      "TEST" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    utmSource: "email",
    utmMedium: "newsletter",
    utmContent: "test-button",
    expirationHours: 24,
  });

  const addResult = (
    test: string,
    status: "pass" | "fail" | "running",
    message: string
  ) => {
    setResults((prev) => [
      ...prev,
      {
        test,
        status,
        message,
        timestamp: Date.now(),
      },
    ]);
  };

  const updateCookieInfo = () => {
    try {
      const debug = cookieDebug.getAllInfo();
      setCookieInfo(debug);
    } catch (error) {
      setCookieInfo({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  useEffect(() => {
    updateCookieInfo();
  }, []);

  const runBasicTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Clear existing cookies
      addResult(
        "Clear existing cookies",
        "running",
        "Clearing any existing campaign cookies..."
      );
      const clearResult = clearCampaignCookie();
      addResult(
        "Clear existing cookies",
        clearResult.success ? "pass" : "fail",
        clearResult.success
          ? "Successfully cleared"
          : clearResult.errors.join(", ")
      );

      // Test 2: Set campaign cookie
      addResult(
        "Set campaign cookie",
        "running",
        "Setting campaign cookie with test data..."
      );
      const setResult = setCampaignCookie(
        {
          campaignId: testForm.campaignId,
          uniqueCode: testForm.uniqueCode,
          utmParams: {
            source: testForm.utmSource,
            medium: testForm.utmMedium,
            content: testForm.utmContent,
          },
        },
        {
          expirationHours: testForm.expirationHours,
        }
      );
      addResult(
        "Set campaign cookie",
        setResult.success ? "pass" : "fail",
        setResult.success
          ? "Cookie set successfully"
          : setResult.errors.join(", ")
      );

      if (setResult.success) {
        // Test 3: Check cookie exists
        addResult(
          "Check cookie exists",
          "running",
          "Checking if cookie exists..."
        );
        const exists = hasCampaignCookie();
        addResult(
          "Check cookie exists",
          exists ? "pass" : "fail",
          exists ? "Cookie exists" : "Cookie not found"
        );

        // Test 4: Get campaign cookie
        addResult(
          "Get campaign cookie",
          "running",
          "Retrieving campaign cookie..."
        );
        const getResult = getCampaignCookie();
        addResult(
          "Get campaign cookie",
          getResult.isValid ? "pass" : "fail",
          getResult.isValid
            ? "Retrieved successfully"
            : getResult.errors.join(", ")
        );

        if (getResult.isValid && getResult.data) {
          // Test 5: Validate data integrity
          addResult(
            "Validate data integrity",
            "running",
            "Checking data integrity..."
          );
          const dataValid =
            getResult.data.campaignId === testForm.campaignId &&
            getResult.data.uniqueCode === testForm.uniqueCode &&
            getResult.data.utmParams?.source === testForm.utmSource;
          addResult(
            "Validate data integrity",
            dataValid ? "pass" : "fail",
            dataValid ? "Data matches original" : "Data mismatch detected"
          );

          // Test 6: Check expiration info
          addResult(
            "Check expiration info",
            "running",
            "Getting expiration information..."
          );
          const expInfo = getCampaignCookieExpiration();
          addResult(
            "Check expiration info",
            expInfo.exists ? "pass" : "fail",
            expInfo.exists
              ? `Expires at: ${expInfo.expiresAt?.toLocaleString()}`
              : "No expiration info"
          );

          // Test 7: Update UTM parameters
          addResult(
            "Update UTM parameters",
            "running",
            "Updating UTM parameters..."
          );
          const updateResult = updateCampaignCookieUTM({
            source: "updated-source",
            content: "updated-content",
          });
          addResult(
            "Update UTM parameters",
            updateResult.success ? "pass" : "fail",
            updateResult.success
              ? "UTM updated successfully"
              : updateResult.errors.join(", ")
          );

          if (updateResult.success) {
            // Test 8: Verify UTM update
            addResult(
              "Verify UTM update",
              "running",
              "Verifying UTM parameter update..."
            );
            const updatedResult = getCampaignCookie();
            if (updatedResult.isValid && updatedResult.data) {
              const utmUpdated =
                updatedResult.data.utmParams?.source === "updated-source" &&
                updatedResult.data.utmParams?.medium === testForm.utmMedium && // Should preserve
                updatedResult.data.utmParams?.content === "updated-content";
              addResult(
                "Verify UTM update",
                utmUpdated ? "pass" : "fail",
                utmUpdated ? "UTM update verified" : "UTM update failed"
              );
            }
          }
        }
      }

      // Test 9: Error handling
      addResult(
        "Test error handling",
        "running",
        "Testing error conditions..."
      );
      const invalidResult = setCampaignCookie({
        campaignId: "",
        uniqueCode: "",
      });
      addResult(
        "Test error handling",
        !invalidResult.success ? "pass" : "fail",
        !invalidResult.success
          ? "Invalid data rejected correctly"
          : "Should have rejected invalid data"
      );

      // Final cleanup
      addResult("Final cleanup", "running", "Cleaning up test cookies...");
      const finalClear = clearCampaignCookie();
      addResult(
        "Final cleanup",
        finalClear.success ? "pass" : "fail",
        finalClear.success ? "Cleanup successful" : "Cleanup failed"
      );
    } catch (error) {
      addResult(
        "Test suite error",
        "fail",
        `Exception occurred: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    setIsRunning(false);
    updateCookieInfo();
  };

  const testExpiration = async () => {
    setResults([]);

    try {
      // Test with very short expiration (this should work in dev/test)
      addResult("Test expiration", "running", "Testing expiration handling...");

      // Set cookie with 1 hour expiration
      const setResult = setCampaignCookie(
        {
          campaignId: "exp-test",
          uniqueCode: "EXP123",
        },
        { expirationHours: 1 }
      );

      if (setResult.success) {
        const expInfo = getCampaignCookieExpiration();
        addResult(
          "Test expiration",
          expInfo.exists ? "pass" : "fail",
          expInfo.exists
            ? `Cookie set with expiration: ${expInfo.expiresAt?.toLocaleString()}`
            : "Failed to get expiration info"
        );
      } else {
        addResult("Test expiration", "fail", setResult.errors.join(", "));
      }

      // Test invalid expiration
      const invalidExp = setCampaignCookie(
        {
          campaignId: "invalid-exp",
          uniqueCode: "INV123",
        },
        { expirationHours: 100 }
      ); // Should be rejected

      addResult(
        "Test invalid expiration",
        !invalidExp.success ? "pass" : "fail",
        !invalidExp.success
          ? "Invalid expiration rejected"
          : "Should reject invalid expiration"
      );
    } catch (error) {
      addResult(
        "Expiration test error",
        "fail",
        `Exception: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    updateCookieInfo();
  };

  const clearResults = () => {
    setResults([]);
    updateCookieInfo();
  };

  const passedTests = results.filter((r) => r.status === "pass").length;
  const failedTests = results.filter((r) => r.status === "fail").length;
  const runningTests = results.filter((r) => r.status === "running").length;

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Cookie Utilities Test Suite</h1>
            <Button
              variant="outline-secondary"
              onClick={() => router.push("/admin")}
            >
              ← Back to Admin
            </Button>
          </div>

          {/* Test Configuration */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Test Configuration</Card.Title>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Campaign ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={testForm.campaignId}
                      onChange={(e) =>
                        setTestForm({ ...testForm, campaignId: e.target.value })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Unique Code</Form.Label>
                    <Form.Control
                      type="text"
                      value={testForm.uniqueCode}
                      onChange={(e) =>
                        setTestForm({ ...testForm, uniqueCode: e.target.value })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Expiration Hours</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="48"
                      value={testForm.expirationHours}
                      onChange={(e) =>
                        setTestForm({
                          ...testForm,
                          expirationHours: parseInt(e.target.value) || 24,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>UTM Source</Form.Label>
                    <Form.Control
                      type="text"
                      value={testForm.utmSource}
                      onChange={(e) =>
                        setTestForm({ ...testForm, utmSource: e.target.value })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>UTM Medium</Form.Label>
                    <Form.Control
                      type="text"
                      value={testForm.utmMedium}
                      onChange={(e) =>
                        setTestForm({ ...testForm, utmMedium: e.target.value })
                      }
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>UTM Content</Form.Label>
                    <Form.Control
                      type="text"
                      value={testForm.utmContent}
                      onChange={(e) =>
                        setTestForm({ ...testForm, utmContent: e.target.value })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Test Controls */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Test Controls</Card.Title>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  onClick={runBasicTests}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Running Tests...
                    </>
                  ) : (
                    "🧪 Run Basic Tests"
                  )}
                </Button>
                <Button
                  variant="info"
                  onClick={testExpiration}
                  disabled={isRunning}
                >
                  ⏰ Test Expiration
                </Button>
                <Button variant="warning" onClick={updateCookieInfo}>
                  🔍 Refresh Cookie Info
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => {
                    clearCampaignCookie();
                    updateCookieInfo();
                  }}
                >
                  🗑️ Clear Cookies
                </Button>
                <Button variant="outline-secondary" onClick={clearResults}>
                  Clear Results
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Current Cookie Info */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Current Cookie Information</Card.Title>
              {cookieInfo ? (
                <pre className="bg-light p-3 rounded">
                  {JSON.stringify(cookieInfo, null, 2)}
                </pre>
              ) : (
                <p>Loading cookie information...</p>
              )}
            </Card.Body>
          </Card>

          {/* Test Results */}
          {results.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title>Test Results</Card.Title>
                  <div>
                    <Badge bg="success" className="me-2">
                      ✅ Passed: {passedTests}
                    </Badge>
                    <Badge bg="danger" className="me-2">
                      ❌ Failed: {failedTests}
                    </Badge>
                    {runningTests > 0 && (
                      <Badge bg="primary">🔄 Running: {runningTests}</Badge>
                    )}
                  </div>
                </div>

                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Status</th>
                      <th>Message</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index}>
                        <td>{result.test}</td>
                        <td>
                          <Badge
                            bg={
                              result.status === "pass"
                                ? "success"
                                : result.status === "fail"
                                ? "danger"
                                : "primary"
                            }
                          >
                            {result.status === "pass"
                              ? "✅ PASS"
                              : result.status === "fail"
                              ? "❌ FAIL"
                              : "🔄 RUNNING"}
                          </Badge>
                        </td>
                        <td>{result.message}</td>
                        <td>
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Usage Instructions */}
          <Card>
            <Card.Body>
              <Card.Title>Usage Instructions</Card.Title>
              <h6>Cookie Utilities Features:</h6>
              <ul>
                <li>
                  <strong>setCampaignCookie:</strong> Set campaign data with UTM
                  parameters and expiration
                </li>
                <li>
                  <strong>getCampaignCookie:</strong> Retrieve and validate
                  campaign data
                </li>
                <li>
                  <strong>clearCampaignCookie:</strong> Clear campaign cookie
                </li>
                <li>
                  <strong>hasCampaignCookie:</strong> Check if campaign cookie
                  exists
                </li>
                <li>
                  <strong>getCampaignCookieExpiration:</strong> Get expiration
                  information
                </li>
                <li>
                  <strong>updateCampaignCookieUTM:</strong> Update UTM
                  parameters
                </li>
                <li>
                  <strong>cookieDebug:</strong> Debug utilities and force clear
                </li>
              </ul>

              <h6>Browser Console Testing:</h6>
              <pre className="bg-light p-3 rounded">
                {`// Import utilities (if not using this test page)
import { setCampaignCookie, getCampaignCookie } from './lib/utils/cookies';

// Set a campaign cookie
setCampaignCookie({
  campaignId: 'test-123',
  uniqueCode: 'CODE123',
  utmParams: { source: 'email', medium: 'newsletter' }
});

// Get campaign data
const result = getCampaignCookie();
console.log(result);`}
              </pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
