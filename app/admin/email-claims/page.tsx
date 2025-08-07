"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Alert,
  Spinner,
  Modal,
  Form,
  Badge,
  Pagination,
} from "react-bootstrap";
import { useRouter } from "next/navigation";

interface EmailClaim {
  id: string;
  email: string;
  claimCount: number;
  createdAt: string;
  updatedAt: string;
}

interface EmailClaimsStats {
  totalEmails: number;
  totalClaims: number;
  avgClaims: number;
  maxClaims: number;
}

interface EmailClaimsResponse {
  claims: EmailClaim[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: EmailClaimsStats;
}

export default function AdminEmailClaims() {
  const router = useRouter();
  const [data, setData] = useState<EmailClaimsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState<EmailClaim | null>(null);
  const [editClaimCount, setEditClaimCount] = useState<number>(0);

  useEffect(() => {
    fetchEmailClaims(currentPage);
  }, [currentPage]);

  const fetchEmailClaims = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/email-claims?page=${page}&limit=20`);
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError("Failed to load email claims data");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`Are you sure you want to delete the email claim for ${email}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/email-claims?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchEmailClaims(currentPage);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete: ${errorData.error}`);
      }
    } catch {
      alert("Network error occurred while deleting");
    }
  };

  const handleEdit = (claim: EmailClaim) => {
    setEditingClaim(claim);
    setEditClaimCount(claim.claimCount);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingClaim) return;

    try {
      const response = await fetch("/api/admin/email-claims", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: editingClaim.email,
          claimCount: editClaimCount,
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingClaim(null);
        await fetchEmailClaims(currentPage);
      } else {
        const errorData = await response.json();
        alert(`Failed to update: ${errorData.error}`);
      }
    } catch {
      alert("Network error occurred while updating");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderPagination = () => {
    if (!data?.pagination) return null;

    const { page, totalPages } = data.pagination;
    const items = [];

    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === page}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination>
        <Pagination.First onClick={() => setCurrentPage(1)} disabled={page === 1} />
        <Pagination.Prev onClick={() => setCurrentPage(page - 1)} disabled={page === 1} />
        {items}
        <Pagination.Next onClick={() => setCurrentPage(page + 1)} disabled={page === totalPages} />
        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={page === totalPages} />
      </Pagination>
    );
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading email claims...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Email Claims Management</h1>
            <Button variant="secondary" onClick={() => router.push("/admin")}>
              Back to Admin
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      {data?.stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary">{data.stats.totalEmails.toLocaleString()}</h3>
                <p className="mb-0">Total Emails</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">{data.stats.totalClaims.toLocaleString()}</h3>
                <p className="mb-0">Total Claims</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">{data.stats.avgClaims}</h3>
                <p className="mb-0">Avg Claims/Email</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">{data.stats.maxClaims}</h3>
                <p className="mb-0">Max Claims</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Email Claims Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Email Claims ({data?.pagination.totalCount.toLocaleString()})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Claim Count</th>
                    <th>Created</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.claims.map((claim) => (
                    <tr key={claim.id}>
                      <td>{claim.email}</td>
                      <td>
                        <Badge bg={claim.claimCount > 5 ? "warning" : "secondary"}>
                          {claim.claimCount}
                        </Badge>
                      </td>
                      <td>{formatDate(claim.createdAt)}</td>
                      <td>{formatDate(claim.updatedAt)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => handleEdit(claim)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(claim.email)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pagination */}
      <Row className="mt-3">
        <Col className="d-flex justify-content-center">
          {renderPagination()}
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Email Claim</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingClaim && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="text" value={editingClaim.email} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Claim Count</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={editClaimCount}
                  onChange={(e) => setEditClaimCount(parseInt(e.target.value) || 0)}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
