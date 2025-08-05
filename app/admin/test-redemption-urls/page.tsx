"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Table,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { useRouter } from "next/navigation";

interface Campaign {
  id: string;
  name: string;
  description: string;
  redemptionValue: number;
  isActive: boolean;
  expiresAt: string;
}

interface RedemptionCode {
  id: string;
  uniqueCode: string;
  campaignId: string;
  isUsed: boolean;
  redemptionValue: string;
  campaignName?: string;
}

interface GeneratedUrl {
  url: string;
  campaignId: string;
  code: string;
  campaignName: string;
  timestamp: string;
}

export default function RedemptionUrlTester() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [availableCodes, setAvailableCodes] = useState<RedemptionCode[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [customCode, setCustomCode] = useState<string>("");
  const [generatedUrls, setGeneratedUrls] = useState<GeneratedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
    fetchAvailableCodes();
  }, []);

  const fetchCampaigns = async () => {
    try {
      // Create a simple admin API call that returns JSON instead of CSV
      const response = await fetch("/api/admin/campaigns-list");
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } else {
        console.error("Failed to fetch campaigns:", response.statusText);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  };

  const fetchAvailableCodes = async () => {
    try {
      setLoadingCodes(true);
      const response = await fetch("/api/admin/unused-codes");
      if (response.ok) {
        const data = await response.json();
        setAvailableCodes(data.codes || []);
      } else {
        console.error("Failed to fetch available codes:", response.statusText);
      }
    } catch (err) {
      console.error("Failed to fetch available codes:", err);
    } finally {
      setLoadingCodes(false);
    }
  };

  const generateRedemptionCode = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateRedemptionUrl = async () => {
    if (!selectedCampaign) {
      setError("Please select a campaign");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const campaign = campaigns.find((c) => c.id === selectedCampaign);
      if (!campaign) {
        throw new Error("Campaign not found");
      }

      // Use selected code from dropdown, custom code, or generate new one
      let code = "";
      if (selectedCode) {
        const codeData = availableCodes.find((c) => c.id === selectedCode);
        code = codeData?.uniqueCode || "";
      } else if (customCode.trim()) {
        code = customCode.trim();
      } else {
        code = generateRedemptionCode();
      }

      if (!code) {
        throw new Error("No valid code available");
      }

      // Create redemption URL
      const baseUrl = window.location.origin;
      const redemptionUrl = `${baseUrl}/redeem?campaign=${selectedCampaign}&code=${code}`;

      const newUrl: GeneratedUrl = {
        url: redemptionUrl,
        campaignId: selectedCampaign,
        code: code,
        campaignName: campaign.name,
        timestamp: new Date().toLocaleString(),
      };

      setGeneratedUrls((prev) => [newUrl, ...prev]);

      // Clear form
      setSelectedCode("");
      setCustomCode("");
    } catch (error) {
      console.error("Error generating URL:", error);
      setError(
        error instanceof Error ? error.message : "Failed to generate URL"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter codes by selected campaign
  const filteredCodes = selectedCampaign
    ? availableCodes.filter((code) => code.campaignId === selectedCampaign)
    : availableCodes;

  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    setSelectedCode(""); // Clear selected code when campaign changes
  };

  const testUrl = (url: string) => {
    window.open(url, "_blank");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const clearHistory = () => {
    setGeneratedUrls([]);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Header */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">🧪 Redemption URL Tester</h3>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => router.push("/admin")}
                >
                  ← Back to Admin
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="mb-0">
                Generate and test redemption URLs with various campaign and
                authentication scenarios. Test both authenticated and
                unauthenticated user flows.
              </p>
            </Card.Body>
          </Card>

          {/* URL Generator */}
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Generate Redemption URL</h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Campaign</Form.Label>
                    <Form.Select
                      value={selectedCampaign}
                      onChange={(e) => handleCampaignChange(e.target.value)}
                      aria-label="Select campaign for redemption URL generation"
                    >
                      <option value="">Choose a campaign...</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name} (${campaign.redemptionValue})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Existing Code (Optional)
                      {loadingCodes && (
                        <span
                          className="ms-2 spinner-border spinner-border-sm"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </span>
                      )}
                    </Form.Label>
                    <Form.Select
                      value={selectedCode}
                      onChange={(e) => setSelectedCode(e.target.value)}
                      disabled={!selectedCampaign || loadingCodes}
                      aria-label="Select existing unused code"
                    >
                      <option value="">Choose existing code...</option>
                      {filteredCodes.map((code) => (
                        <option key={code.id} value={code.id}>
                          {code.uniqueCode} ({code.campaignName}) - $
                          {code.redemptionValue}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      {selectedCampaign
                        ? `${filteredCodes.length} unused codes available for this campaign`
                        : "Select a campaign to see available codes"}
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Custom Code (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Leave empty for auto-generated code"
                      value={customCode}
                      onChange={(e) =>
                        setCustomCode(e.target.value.toUpperCase())
                      }
                      maxLength={12}
                      disabled={!!selectedCode}
                    />
                    <Form.Text className="text-muted">
                      {selectedCode
                        ? "Clear the selected code to use custom code"
                        : "Leave empty to generate a random code"}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <Button
                  variant="primary"
                  onClick={generateRedemptionUrl}
                  disabled={loading || !selectedCampaign}
                >
                  {loading ? "Generating..." : "Generate Redemption URL"}
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Testing Instructions */}
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Testing Scenarios</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>🔒 Unauthenticated Testing</h5>
                  <ol>
                    <li>Open redemption URL in incognito/private window</li>
                    <li>Verify campaign landing page displays</li>
                    <li>Confirm &ldquo;Sign In Required&rdquo; message</li>
                    <li>Test login/register redirect functionality</li>
                    <li>Verify campaign data saved to cookies</li>
                  </ol>
                </Col>
                <Col md={6}>
                  <h5>✅ Authenticated Testing</h5>
                  <ol>
                    <li>Sign in to your account first</li>
                    <li>Open redemption URL in same browser</li>
                    <li>Verify immediate redemption confirmation</li>
                    <li>Test successful redemption flow</li>
                    <li>Confirm balance update</li>
                  </ol>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Generated URLs */}
          {generatedUrls.length > 0 && (
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  Generated URLs ({generatedUrls.length})
                </h4>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={clearHistory}
                >
                  Clear History
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>Code</th>
                        <th>Generated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedUrls.map((urlData, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{urlData.campaignName}</strong>
                            <br />
                            <small className="text-muted">
                              {urlData.campaignId}
                            </small>
                          </td>
                          <td>
                            <Badge bg="secondary">{urlData.code}</Badge>
                          </td>
                          <td>
                            <small>{urlData.timestamp}</small>
                          </td>
                          <td>
                            <div className="d-grid gap-1">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => testUrl(urlData.url)}
                              >
                                🧪 Test URL
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => copyToClipboard(urlData.url)}
                              >
                                📋 Copy
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* URL Details */}
                <details className="mt-3">
                  <summary className="mb-2">
                    <strong>View Raw URLs</strong>
                  </summary>
                  {generatedUrls.map((urlData, index) => (
                    <InputGroup key={index} className="mb-2">
                      <InputGroup.Text>{urlData.code}</InputGroup.Text>
                      <Form.Control
                        value={urlData.url}
                        readOnly
                        style={{ fontSize: "12px" }}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => copyToClipboard(urlData.url)}
                      >
                        Copy
                      </Button>
                    </InputGroup>
                  ))}
                </details>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}
