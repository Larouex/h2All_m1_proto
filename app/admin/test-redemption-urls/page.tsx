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
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [customCode, setCustomCode] = useState<string>("");
  const [generatedUrls, setGeneratedUrls] = useState<GeneratedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns");
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
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

      // Generate or use custom code
      const code = customCode.trim() || generateRedemptionCode();

      // Create redemption code in database (optional - for testing we'll just generate URL)
      const response = await fetch("/api/redemption-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: selectedCampaign,
          quantity: 1,
        }),
      });

      let actualCode = code;
      if (response.ok) {
        const data = await response.json();
        actualCode = data.codes?.[0] || code;
      }

      // Generate URL with query parameters
      const baseUrl = window.location.origin;
      const redemptionUrl = `${baseUrl}/redeem/campaign?campaign_id=${selectedCampaign}&code=${actualCode}&utm_source=test&utm_medium=url&utm_campaign=${encodeURIComponent(
        campaign.name
      )}`;

      const newUrl: GeneratedUrl = {
        url: redemptionUrl,
        campaignId: selectedCampaign,
        code: actualCode,
        campaignName: campaign.name,
        timestamp: new Date().toLocaleString(),
      };

      setGeneratedUrls((prev) => [newUrl, ...prev]);
      setCustomCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate URL");
    } finally {
      setLoading(false);
    }
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
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Campaign</Form.Label>
                    <Form.Select
                      value={selectedCampaign}
                      onChange={(e) => setSelectedCampaign(e.target.value)}
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
                <Col md={6}>
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
                    />
                    <Form.Text className="text-muted">
                      Leave empty to generate a random code
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
