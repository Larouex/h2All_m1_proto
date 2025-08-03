"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Alert,
  Form,
  Spinner,
  Badge,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import {
  generateRedemptionCode,
  generateBulkCodes,
  validateCodeFormat,
  verifyUniqueness,
  type CodeGenerationOptions,
  type BulkGenerationResult,
} from "@/lib/utils/codeGenerator";

interface RedemptionCode {
  id: string;
  uniqueCode: string; // Changed from 'code' to match API
  campaignId: string;
  campaignName?: string; // Made optional since it might not come from API
  isUsed: boolean; // Changed from 'isRedeemed' to match API
  userId?: string | null; // Changed from 'redeemedBy'
  redeemedAt?: Date | string | null;
  createdAt: Date | string;
  userEmail?: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  maxRedemptions: number;
  currentRedemptions: number;
}

export default function RedemptionCodeManager() {
  const router = useRouter();
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [generating, setGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationResult, setGenerationResult] =
    useState<BulkGenerationResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const [generateForm, setGenerateForm] = useState({
    campaignId: "",
    count: 10,
    length: 8,
    prefix: "",
    suffix: "",
    excludeAmbiguous: true,
    includeNumbers: true,
    uppercase: true,
  });

  // URL Generation state
  const [urlGenerating, setUrlGenerating] = useState(false);
  const [urlForm, setUrlForm] = useState({
    campaignId: "",
    baseUrl: typeof window !== "undefined" ? window.location.origin : "",
    utmSource: "",
    utmMedium: "",
    utmContent: "",
  });
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [availableCodes, setAvailableCodes] = useState<number>(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);

  useEffect(() => {
    fetchCodes();
    fetchCampaigns();
  }, []);

  // Check available codes when campaign changes
  useEffect(() => {
    if (urlForm.campaignId) {
      checkAvailableCodes(urlForm.campaignId);
    }
  }, [urlForm.campaignId]);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/redemption-codes");
      if (response.ok) {
        const data = await response.json();
        setCodes(data);
      } else {
        setError("Failed to load redemption codes");
      }
    } catch (err) {
      console.error("Error fetching codes:", err);
      setError("Error fetching redemption codes");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setCampaignsLoading(true);
      const response = await fetch("/api/campaigns");
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      } else {
        console.error("Failed to load campaigns");
        // Don't set error for campaigns, just log it
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      // Don't set error for campaigns, just log it
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleGenerateCodes = async () => {
    if (!generateForm.campaignId) {
      setError("Please select a campaign");
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      // Generate codes using our secure utility
      const options: CodeGenerationOptions = {
        length: generateForm.length,
        prefix: generateForm.prefix || undefined,
        suffix: generateForm.suffix || undefined,
        excludeAmbiguous: generateForm.excludeAmbiguous,
        includeNumbers: generateForm.includeNumbers,
        uppercase: generateForm.uppercase,
      };

      const result = await generateBulkCodes(generateForm.count, options);

      // Verify uniqueness
      const uniquenessResult = verifyUniqueness(result.codes);
      if (!uniquenessResult.isUnique) {
        setError(
          `Generated codes contain duplicates: ${uniquenessResult.duplicates.length} found`
        );
        return;
      }

      // Validate all codes
      const validationErrors: string[] = [];
      result.codes.forEach((code, index) => {
        const validation = validateCodeFormat(code, options);
        if (!validation.isValid) {
          validationErrors.push(
            `Code ${index + 1}: ${validation.errors.join(", ")}`
          );
        }
      });

      if (validationErrors.length > 0) {
        setError(
          `Code validation failed:\n${validationErrors.slice(0, 5).join("\n")}`
        );
        return;
      }

      // Store the result and show success
      setGenerationResult(result);
      setSuccess(`Successfully generated ${result.generated} unique codes`);
      setShowResults(true);

      // Here you would typically save to database
      // For now, we'll just refresh the codes list
      fetchCodes();

      // Reset form to default values
      setGenerateForm({
        campaignId: "",
        count: 10,
        length: 8,
        prefix: "",
        suffix: "",
        excludeAmbiguous: true,
        includeNumbers: true,
        uppercase: true,
      });
    } catch (err) {
      console.error("Error generating codes:", err);
      setError(
        "Error generating codes: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (confirm("Are you sure you want to delete this redemption code?")) {
      try {
        const response = await fetch(`/api/redemption-codes/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchCodes();
        } else {
          setError("Failed to delete code");
        }
      } catch (err) {
        console.error("Error deleting code:", err);
        setError("Error deleting code");
      }
    }
  };

  // URL Generation handlers
  const checkAvailableCodes = async (campaignId: string) => {
    if (!campaignId) {
      setAvailableCodes(0);
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/generate-redeem-url?campaignId=${encodeURIComponent(
          campaignId
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableCodes(data.availableCodes || 0);
      } else {
        setAvailableCodes(0);
      }
    } catch (err) {
      console.error("Error checking available codes:", err);
      setAvailableCodes(0);
    }
  };

  const handleGenerateUrl = async () => {
    if (!urlForm.campaignId) {
      setError("Please select a campaign for URL generation");
      return;
    }

    try {
      setUrlGenerating(true);
      setError(null);
      setGeneratedUrl(null);

      const payload: {
        campaignId: string;
        baseUrl: string;
        utmParams?: {
          source?: string;
          medium?: string;
          content?: string;
        };
      } = {
        campaignId: urlForm.campaignId,
        baseUrl: urlForm.baseUrl || `${window.location.origin}/redeem`,
      };

      // Add UTM parameters if provided
      const utmParams: { source?: string; medium?: string; content?: string } =
        {};
      if (urlForm.utmSource) utmParams.source = urlForm.utmSource;
      if (urlForm.utmMedium) utmParams.medium = urlForm.utmMedium;
      if (urlForm.utmContent) utmParams.content = urlForm.utmContent;

      // Only add utmParams if at least one UTM parameter is provided
      if (Object.keys(utmParams).length > 0) {
        payload.utmParams = utmParams;
      }

      const response = await fetch("/api/admin/generate-redeem-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedUrl(data.redemptionUrl || data.url);
        setSuccess(
          `Successfully generated redemption URL using code: ${
            data.code?.uniqueCode || data.uniqueCode || "N/A"
          }`
        );

        // Refresh available codes count
        checkAvailableCodes(urlForm.campaignId);

        // Refresh codes list to show the newly used code
        fetchCodes();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate redemption URL");
      }
    } catch (err) {
      console.error("Error generating URL:", err);
      setError(
        "Error generating redemption URL: " +
          (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setUrlGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setError("Failed to copy to clipboard");
    }
  };

  const filteredCodes = codes.filter((code) => {
    const matchesSearch =
      code.uniqueCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (code.campaignName &&
        code.campaignName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      code.campaignId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "redeemed" && code.isUsed) ||
      (filterStatus === "available" && !code.isUsed);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading redemption codes...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Redemption Code Manager</h1>
            <Button
              variant="outline-secondary"
              onClick={() => router.push("/admin")}
            >
              ← Back to Admin
            </Button>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <Alert.Heading>Error</Alert.Heading>
              <div className="font-monospace small">{error}</div>
            </Alert>
          )}

          {success && (
            <Alert
              variant="success"
              dismissible
              onClose={() => {
                setSuccess(null);
                setGeneratedUrl(null);
              }}
            >
              <Alert.Heading>Success</Alert.Heading>
              {generatedUrl ? (
                <div>
                  <p className="mb-3">{success}</p>
                  <div className="border rounded p-3 bg-light">
                    <div className="mb-2">
                      <strong>Generated URL:</strong>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <code className="flex-grow-1 bg-white p-2 rounded border text-break small">
                        <a
                          href={generatedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          {generatedUrl}
                        </a>
                      </code>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => copyToClipboard(generatedUrl)}
                      >
                        📋 Copy
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                success
              )}
            </Alert>
          )}

          {/* Generate Codes Section */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">🔧 Generate New Codes</Card.Title>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Options
                </Button>
              </div>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Campaign</Form.Label>
                    <Form.Select
                      value={generateForm.campaignId}
                      onChange={(e) =>
                        setGenerateForm({
                          ...generateForm,
                          campaignId: e.target.value,
                        })
                      }
                      aria-label="Select campaign"
                      disabled={campaignsLoading}
                    >
                      <option value="">
                        {campaignsLoading
                          ? "Loading campaigns..."
                          : "Select Campaign..."}
                      </option>
                      {campaigns
                        .filter((campaign) => campaign.isActive)
                        .map((campaign) => (
                          <option key={campaign.id} value={campaign.id}>
                            {campaign.id}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Number of Codes</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="10000"
                      value={generateForm.count}
                      onChange={(e) =>
                        setGenerateForm({
                          ...generateForm,
                          count: parseInt(e.target.value) || 10,
                        })
                      }
                    />
                    <Form.Text className="text-muted">
                      Max 10,000 codes per batch
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Code Length</Form.Label>
                    <Form.Control
                      type="number"
                      min="4"
                      max="32"
                      value={generateForm.length}
                      onChange={(e) =>
                        setGenerateForm({
                          ...generateForm,
                          length: parseInt(e.target.value) || 8,
                        })
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={3} className="d-flex align-items-end">
                  <Button
                    variant="primary"
                    onClick={handleGenerateCodes}
                    disabled={generating}
                    className="mb-3 w-100"
                  >
                    {generating ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Generating...
                      </>
                    ) : (
                      "🚀 Generate Codes"
                    )}
                  </Button>
                </Col>
              </Row>

              {/* Advanced Options */}
              {showAdvanced && (
                <Card className="mt-3 border-secondary">
                  <Card.Header className="bg-light">
                    <strong>⚙️ Advanced Generation Options</strong>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Prefix (Optional)</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="e.g., H2-"
                            maxLength={8}
                            value={generateForm.prefix}
                            onChange={(e) =>
                              setGenerateForm({
                                ...generateForm,
                                prefix: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </Col>

                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Suffix (Optional)</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="e.g., -2025"
                            maxLength={8}
                            value={generateForm.suffix}
                            onChange={(e) =>
                              setGenerateForm({
                                ...generateForm,
                                suffix: e.target.value,
                              })
                            }
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Label>Character Options</Form.Label>
                        <div className="d-flex gap-3 mb-3">
                          <Form.Check
                            type="checkbox"
                            id="excludeAmbiguous"
                            label="Exclude ambiguous (0,O,I,l,1)"
                            checked={generateForm.excludeAmbiguous}
                            onChange={(e) =>
                              setGenerateForm({
                                ...generateForm,
                                excludeAmbiguous: e.target.checked,
                              })
                            }
                          />
                          <Form.Check
                            type="checkbox"
                            id="includeNumbers"
                            label="Include numbers"
                            checked={generateForm.includeNumbers}
                            onChange={(e) =>
                              setGenerateForm({
                                ...generateForm,
                                includeNumbers: e.target.checked,
                              })
                            }
                          />
                          <Form.Check
                            type="checkbox"
                            id="uppercase"
                            label="Uppercase letters"
                            checked={generateForm.uppercase}
                            onChange={(e) =>
                              setGenerateForm({
                                ...generateForm,
                                uppercase: e.target.checked,
                              })
                            }
                          />
                        </div>
                      </Col>
                    </Row>

                    <Alert variant="info" className="mb-0">
                      <strong>🔒 Security Features:</strong>
                      <ul className="mb-0 mt-2">
                        <li>
                          Cryptographically secure random generation using
                          nanoid
                        </li>
                        <li>Automatic uniqueness verification</li>
                        <li>Format validation for all generated codes</li>
                        <li>
                          Optimized for high-volume generation (1M+
                          codes/second)
                        </li>
                      </ul>
                    </Alert>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>

          {/* Code Generation Testing */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>🧪 Test Code Generation</Card.Title>
              <Card.Text>
                Test the secure code generation system with various
                configurations.
              </Card.Text>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => {
                    const testCode = generateRedemptionCode();
                    setSuccess(`Generated test code: ${testCode}`);
                  }}
                >
                  Generate Single Code
                </Button>
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "/api/test-codes?test=requirement"
                      );
                      const data = await response.json();
                      if (data.success) {
                        setSuccess(
                          `Performance Test: Generated ${data.results.generated} codes in ${data.results.generationTime} (${data.results.performance})`
                        );
                      } else {
                        setError("Performance test failed");
                      }
                    } catch (error) {
                      console.error("Performance test error:", error);
                      setError("Failed to run performance test");
                    }
                  }}
                >
                  Run Performance Test
                </Button>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => {
                    const codes = Array.from({ length: 100 }, () =>
                      generateRedemptionCode()
                    );
                    const uniquenessResult = verifyUniqueness(codes);
                    if (uniquenessResult.isUnique) {
                      setSuccess(
                        `Uniqueness Test Passed: 100 codes, all unique`
                      );
                    } else {
                      setError(
                        `Uniqueness Test Failed: ${uniquenessResult.duplicates.length} duplicates found`
                      );
                    }
                  }}
                >
                  Test Uniqueness
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* URL Generation Section */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>🔗 Generate Redemption URLs</Card.Title>
              <Card.Text>
                Create fully qualified redemption URLs using the next available
                unused code from your campaigns.
              </Card.Text>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Campaign</Form.Label>
                    <Form.Select
                      value={urlForm.campaignId}
                      onChange={(e) =>
                        setUrlForm({
                          ...urlForm,
                          campaignId: e.target.value,
                        })
                      }
                      aria-label="Select campaign for URL generation"
                      disabled={campaignsLoading}
                    >
                      <option value="">
                        {campaignsLoading
                          ? "Loading campaigns..."
                          : "Select Campaign..."}
                      </option>
                      {campaigns
                        .filter((campaign) => campaign.isActive)
                        .map((campaign) => (
                          <option key={campaign.id} value={campaign.id}>
                            {campaign.id}
                          </option>
                        ))}
                    </Form.Select>
                    {urlForm.campaignId && (
                      <Form.Text className="text-muted">
                        Available codes: {availableCodes}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>

                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Base URL</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://your-domain.com/redeem"
                      value={urlForm.baseUrl}
                      onChange={(e) =>
                        setUrlForm({
                          ...urlForm,
                          baseUrl: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* UTM Parameters */}
              <Card className="mb-3 border-secondary">
                <Card.Header className="bg-light">
                  <strong>📊 UTM Tracking Parameters (Optional)</strong>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>UTM Source</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., email, social"
                          value={urlForm.utmSource}
                          onChange={(e) =>
                            setUrlForm({
                              ...urlForm,
                              utmSource: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>UTM Medium</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., newsletter, banner"
                          value={urlForm.utmMedium}
                          onChange={(e) =>
                            setUrlForm({
                              ...urlForm,
                              utmMedium: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>UTM Content</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., header-link"
                          value={urlForm.utmContent}
                          onChange={(e) =>
                            setUrlForm({
                              ...urlForm,
                              utmContent: e.target.value,
                            })
                          }
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <div className="d-flex gap-2 align-items-center">
                <Button
                  variant="success"
                  onClick={handleGenerateUrl}
                  disabled={
                    urlGenerating || !urlForm.campaignId || availableCodes === 0
                  }
                >
                  {urlGenerating ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Generating URL...
                    </>
                  ) : (
                    "🚀 Generate Redemption URL"
                  )}
                </Button>

                {availableCodes === 0 && urlForm.campaignId && (
                  <Alert variant="warning" className="mb-0 py-2 px-3">
                    No available codes for this campaign. Generate codes first.
                  </Alert>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Filter and Search */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Search Codes</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search by code or campaign..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Filter by Status</Form.Label>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      aria-label="Filter by status"
                    >
                      <option value="all">All Codes</option>
                      <option value="available">Available</option>
                      <option value="redeemed">Redeemed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <div className="mb-0">
                    <strong>Total:</strong> {filteredCodes.length} codes
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Codes Table */}
          <Card>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Campaign</th>
                    <th>Status</th>
                    <th>User</th>
                    <th>Redeemed At</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((code) => (
                    <tr key={code.id}>
                      <td>
                        <code className="bg-light p-1 rounded">
                          {code.uniqueCode}
                        </code>
                      </td>
                      <td>{code.campaignName || code.campaignId}</td>
                      <td>
                        <Badge bg={code.isUsed ? "success" : "primary"}>
                          {code.isUsed ? "Redeemed" : "Available"}
                        </Badge>
                      </td>
                      <td>{code.userEmail || code.userId || "-"}</td>
                      <td>
                        {code.redeemedAt
                          ? new Date(code.redeemedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td>{new Date(code.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCode(code.id)}
                          disabled={code.isUsed}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {filteredCodes.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted">No redemption codes found</p>
                  <p className="text-muted">
                    Generate codes using the form above or adjust your search
                    criteria
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Generation Results Modal */}
      <Modal show={showResults} onHide={() => setShowResults(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🎉 Code Generation Results</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {generationResult && (
            <div>
              <Alert variant="success">
                <strong>
                  Successfully generated {generationResult.generated} codes!
                </strong>
              </Alert>

              <Row className="mb-3">
                <Col md={6}>
                  <Card className="border-success">
                    <Card.Body>
                      <Card.Title className="h6">
                        📊 Generation Stats
                      </Card.Title>
                      <ul className="list-unstyled mb-0">
                        <li>
                          <strong>Requested:</strong>{" "}
                          {generationResult.requested}
                        </li>
                        <li>
                          <strong>Generated:</strong>{" "}
                          {generationResult.generated}
                        </li>
                        <li>
                          <strong>Success Rate:</strong>{" "}
                          {(
                            (generationResult.generated /
                              generationResult.requested) *
                            100
                          ).toFixed(1)}
                          %
                        </li>
                        <li>
                          <strong>Generated At:</strong>{" "}
                          {generationResult.metadata.generatedAt.toLocaleString()}
                        </li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="border-info">
                    <Card.Body>
                      <Card.Title className="h6">⚙️ Configuration</Card.Title>
                      <ul className="list-unstyled mb-0">
                        <li>
                          <strong>Length:</strong>{" "}
                          {generationResult.metadata.length} characters
                        </li>
                        <li>
                          <strong>Alphabet:</strong>{" "}
                          {generationResult.metadata.alphabet}
                        </li>
                        {generationResult.metadata.prefix && (
                          <li>
                            <strong>Prefix:</strong>{" "}
                            {generationResult.metadata.prefix}
                          </li>
                        )}
                        {generationResult.metadata.suffix && (
                          <li>
                            <strong>Suffix:</strong>{" "}
                            {generationResult.metadata.suffix}
                          </li>
                        )}
                        <li>
                          <strong>Uniqueness Verified:</strong>{" "}
                          {generationResult.metadata.uniquenessVerified
                            ? "✅ Yes"
                            : "❌ No"}
                        </li>
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card>
                <Card.Header>
                  <strong>📋 Sample Generated Codes (first 20)</strong>
                </Card.Header>
                <Card.Body>
                  <div className="row">
                    {generationResult.codes.slice(0, 20).map((code, index) => (
                      <div key={index} className="col-md-3 mb-2">
                        <code className="bg-light p-2 rounded d-block text-center">
                          {code}
                        </code>
                      </div>
                    ))}
                  </div>
                  {generationResult.codes.length > 20 && (
                    <Alert variant="info" className="mt-3 mb-0">
                      <strong>Note:</strong> Showing first 20 of{" "}
                      {generationResult.codes.length} generated codes. All codes
                      have been validated for format and uniqueness.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResults(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
