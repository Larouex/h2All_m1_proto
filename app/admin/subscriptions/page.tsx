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

interface Subscription {
  id: string;
  email: string;
  submittedCounter: number;
  campaignTrackingId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionsResponse {
  subscriptions: Subscription[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalSubmissions: number;
    avgSubmissions: number;
  };
}

export default function AdminSubscriptions() {
  const router = useRouter();
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);

  useEffect(() => {
    fetchSubscriptions(currentPage);
  }, [currentPage]);

  const fetchSubscriptions = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/admin/subscriptions?page=${page}&limit=20`
      );

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError("Failed to load subscriptions data");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/subscriptions?id=${subscriptionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchSubscriptions(currentPage);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete: ${errorData.error}`);
      }
    } catch {
      alert("Network error occurred while deleting");
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingSubscription) return;

    const formData = new FormData(event.currentTarget);
    const updatedSubscription = {
      id: editingSubscription.id,
      email: formData.get("email") as string,
      submittedCounter: parseInt(formData.get("submittedCounter") as string),
      campaignTrackingId: formData.get("campaignTrackingId") as string,
      isActive: formData.get("isActive") === "on",
    };

    try {
      const response = await fetch("/api/admin/subscriptions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSubscription),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingSubscription(null);
        await fetchSubscriptions(currentPage);
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

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge bg="success">Active</Badge>
    ) : (
      <Badge bg="secondary">Inactive</Badge>
    );
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
        <Pagination.First
          onClick={() => setCurrentPage(1)}
          disabled={page === 1}
        />
        <Pagination.Prev
          onClick={() => setCurrentPage(page - 1)}
          disabled={page === 1}
        />
        {items}
        <Pagination.Next
          onClick={() => setCurrentPage(page + 1)}
          disabled={page === totalPages}
        />
        <Pagination.Last
          onClick={() => setCurrentPage(totalPages)}
          disabled={page === totalPages}
        />
      </Pagination>
    );
  };

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading subscriptions...</p>
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
            <h1>Subscriptions Management</h1>
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
                <h3 className="text-primary">
                  {data.stats.totalSubscriptions.toLocaleString()}
                </h3>
                <p className="mb-0">Total Subscriptions</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">
                  {data.stats.activeSubscriptions.toLocaleString()}
                </h3>
                <p className="mb-0">Active Subscriptions</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">
                  {data.stats.totalSubmissions.toLocaleString()}
                </h3>
                <p className="mb-0">Total Submissions</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">{data.stats.avgSubmissions}</h3>
                <p className="mb-0">Avg Submissions</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Subscriptions Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Subscriptions ({data?.pagination.totalCount.toLocaleString()})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Submissions</th>
                    <th>Campaign ID</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.subscriptions.map((subscription) => (
                    <tr key={subscription.id}>
                      <td>{subscription.email}</td>
                      <td>
                        <Badge
                          bg={
                            subscription.submittedCounter > 3
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {subscription.submittedCounter}
                        </Badge>
                      </td>
                      <td>
                        {subscription.campaignTrackingId ? (
                          <code className="small">
                            {subscription.campaignTrackingId}
                          </code>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{getStatusBadge(subscription.isActive)}</td>
                      <td>{formatDate(subscription.createdAt)}</td>
                      <td>{formatDate(subscription.updatedAt)}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => handleEdit(subscription)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(subscription.id)}
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
          <Modal.Title>Edit Subscription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingSubscription && (
            <Form onSubmit={handleSaveEdit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  defaultValue={editingSubscription.email}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Submitted Counter</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="submittedCounter"
                  defaultValue={editingSubscription.submittedCounter}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Campaign Tracking ID</Form.Label>
                <Form.Control
                  type="text"
                  name="campaignTrackingId"
                  defaultValue={editingSubscription.campaignTrackingId || ""}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  label="Active"
                  defaultChecked={editingSubscription.isActive}
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
