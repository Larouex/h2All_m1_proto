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
  Modal,
  Form,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useRouter } from "next/navigation";

interface Campaign {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  redemptionCodeLength: number;
  maxRedemptions: number;
  currentRedemptions: number;
  createdAt: string;
}

export default function CampaignManager() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    startDate: "",
    endDate: "",
    redemptionCodeLength: 8,
    maxRedemptions: 1000,
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/campaigns");
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      } else {
        setError("Failed to load campaigns");
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError("Error fetching campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setFormData({
      name: "",
      description: "",
      isActive: true,
      startDate: "",
      endDate: "",
      redemptionCodeLength: 8,
      maxRedemptions: 1000,
    });
    setShowModal(true);
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      isActive: campaign.isActive,
      startDate: campaign.startDate.split("T")[0],
      endDate: campaign.endDate.split("T")[0],
      redemptionCodeLength: campaign.redemptionCodeLength,
      maxRedemptions: campaign.maxRedemptions,
    });
    setShowModal(true);
  };

  const handleSaveCampaign = async () => {
    try {
      const method = editingCampaign ? "PUT" : "POST";
      const url = editingCampaign
        ? `/api/campaigns/${editingCampaign.id}`
        : "/api/campaigns";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchCampaigns();
      } else {
        setError("Failed to save campaign");
      }
    } catch (err) {
      console.error("Error saving campaign:", err);
      setError("Error saving campaign");
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        const response = await fetch(`/api/campaigns/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchCampaigns();
        } else {
          setError("Failed to delete campaign");
        }
      } catch (err) {
        console.error("Error deleting campaign:", err);
        setError("Error deleting campaign");
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading campaigns...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Campaign Manager</h1>
            <div>
              <Button
                variant="primary"
                onClick={handleCreateCampaign}
                className="me-2"
              >
                + New Campaign
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => router.push("/admin")}
              >
                ← Back to Admin
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Card>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Redemptions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>
                        <strong>{campaign.name}</strong>
                        <br />
                        <small className="text-muted">
                          {campaign.description}
                        </small>
                      </td>
                      <td>
                        <Badge bg={campaign.isActive ? "success" : "secondary"}>
                          {campaign.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>
                        {new Date(campaign.startDate).toLocaleDateString()}
                      </td>
                      <td>{new Date(campaign.endDate).toLocaleDateString()}</td>
                      <td>
                        {campaign.currentRedemptions} /{" "}
                        {campaign.maxRedemptions}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditCampaign(campaign)}
                          className="me-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {campaigns.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted">No campaigns found</p>
                  <Button variant="primary" onClick={handleCreateCampaign}>
                    Create Your First Campaign
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Campaign Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Campaign Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter campaign name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "true",
                      })
                    }
                    aria-label="Campaign status"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter campaign description"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Redemption Code Length</Form.Label>
                  <Form.Control
                    type="number"
                    min="4"
                    max="20"
                    value={formData.redemptionCodeLength}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        redemptionCodeLength: parseInt(e.target.value),
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Max Redemptions</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.maxRedemptions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxRedemptions: parseInt(e.target.value),
                      })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveCampaign}>
            {editingCampaign ? "Update Campaign" : "Create Campaign"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
