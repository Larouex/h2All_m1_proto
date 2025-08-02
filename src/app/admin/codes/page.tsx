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
} from "react-bootstrap";
import { useRouter } from "next/navigation";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [generating, setGenerating] = useState(false);

  const [generateForm, setGenerateForm] = useState({
    campaignId: "",
    count: 10,
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
      const response = await fetch("/api/redemption-codes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(generateForm),
      });

      if (response.ok) {
        fetchCodes();
        setGenerateForm({ campaignId: "", count: 10 });
      } else {
        setError("Failed to generate codes");
      }
    } catch (err) {
      console.error("Error generating codes:", err);
      setError("Error generating codes");
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
              {error}
            </Alert>
          )}

          {/* Generate Codes Section */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Generate New Codes</Card.Title>
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
                      {/* This would be populated from campaigns API */}
                      <option value="campaign1">Sample Campaign 1</option>
                      <option value="campaign2">Sample Campaign 2</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Number of Codes</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="1000"
                      value={generateForm.count}
                      onChange={(e) =>
                        setGenerateForm({
                          ...generateForm,
                          count: parseInt(e.target.value) || 10,
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
                    className="mb-3"
                  >
                    {generating ? "Generating..." : "Generate Codes"}
                  </Button>
                </Col>
              </Row>
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
    </Container>
  );
}
