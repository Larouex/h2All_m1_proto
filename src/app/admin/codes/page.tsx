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
  code: string;
  campaignId: string;
  campaignName: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: string;
  expiresAt: string;
  createdAt: string;
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

  useEffect(() => {
    fetchCodes();
  }, []);

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

  const filteredCodes = codes.filter((code) => {
    const matchesSearch =
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.campaignName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "redeemed" && code.isRedeemed) ||
      (filterStatus === "available" && !code.isRedeemed);

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
              onClose={() => setSuccess(null)}
            >
              <Alert.Heading>Success</Alert.Heading>
              {success}
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
                    >
                      <option value="">Select Campaign...</option>
                      <option value="campaign1">Sample Campaign 1</option>
                      <option value="campaign2">Sample Campaign 2</option>
                      <option value="test-campaign">Test Campaign</option>
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
                    <th>Redeemed By</th>
                    <th>Redeemed At</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((code) => (
                    <tr key={code.id}>
                      <td>
                        <code className="bg-light p-1 rounded">
                          {code.code}
                        </code>
                      </td>
                      <td>{code.campaignName}</td>
                      <td>
                        <Badge bg={code.isRedeemed ? "success" : "primary"}>
                          {code.isRedeemed ? "Redeemed" : "Available"}
                        </Badge>
                      </td>
                      <td>{code.redeemedBy || "-"}</td>
                      <td>
                        {code.redeemedAt
                          ? new Date(code.redeemedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td>{new Date(code.expiresAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCode(code.id)}
                          disabled={code.isRedeemed}
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
