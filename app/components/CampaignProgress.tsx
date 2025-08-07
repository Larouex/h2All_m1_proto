"use client";

import { useState, useEffect } from "react";
import { Card, Button, ProgressBar, Form, Modal } from "react-bootstrap";
import { useAuth } from "@/app/lib/auth-context";

interface CampaignProgressProps {
  campaignId?: string;
  className?: string;
}

interface CampaignData {
  id: string;
  name: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  totalRedemptionValue: number;
  isActive: boolean;
}

export default function CampaignProgress({
  campaignId = "default",
  className = "",
}: CampaignProgressProps) {
  const { user } = useAuth();
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch campaign data from database
  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns?id=${campaignId}`);

      if (response.ok) {
        const data = await response.json();
        setCampaignData(data);
        setEditData({
          title: data.name || "Campaign Progress",
          description:
            data.description ||
            "Our goal: clean water within 5 minutes of every home.",
        });
      } else {
        // Fallback to default data if campaign not found
        const defaultData: CampaignData = {
          id: "default",
          name: "Campaign Progress",
          description:
            "Our goal: clean water within 5 minutes of every home in Kodema Village.",
          fundingGoal: 5000,
          currentFunding: 412.05,
          totalRedemptionValue: 412.05,
          isActive: true,
        };
        setCampaignData(defaultData);
        setEditData({
          title: defaultData.name,
          description: defaultData.description,
        });
      }
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      // Fallback to default data on error
      const defaultData: CampaignData = {
        id: "default",
        name: "Campaign Progress",
        description:
          "Our goal: clean water within 5 minutes of every home in Kodema Village.",
        fundingGoal: 5000,
        currentFunding: 412.05,
        totalRedemptionValue: 412.05,
        isActive: true,
      };
      setCampaignData(defaultData);
      setEditData({
        title: defaultData.name,
        description: defaultData.description,
      });
    } finally {
      setLoading(false);
    }
  };

  // Save campaign updates
  const handleSave = async () => {
    if (!campaignData || !user?.isAdmin) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/campaigns/${campaignData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editData.title,
          description: editData.description,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setCampaignData(updatedData);
        setShowEditor(false);
      } else {
        console.error("Failed to update campaign");
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  if (loading) {
    return (
      <Card className={`shadow ${className}`}>
        <Card.Body className="p-3 text-center">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2 mb-0 small">Loading campaign data...</p>
        </Card.Body>
      </Card>
    );
  }

  if (!campaignData) {
    return (
      <Card className={`shadow ${className}`}>
        <Card.Body className="p-3">
          <p className="text-muted mb-0">Campaign data not available</p>
        </Card.Body>
      </Card>
    );
  }

  const progressPercentage =
    (campaignData.currentFunding / campaignData.fundingGoal) * 100;

  return (
    <>
      <Card className={`shadow ${className}`}>
        <Card.Body className="p-3">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h3 className="fs-5 fw-bold text-black mb-0">{editData.title}</h3>
            {user?.isAdmin && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowEditor(true)}
                className="border-0"
              >
                <i className="bi bi-pencil"></i>
              </Button>
            )}
          </div>

          <p className="text-muted mb-3 small">{editData.description}</p>

          <div className="mb-3">
            <div className="d-flex align-items-baseline gap-2 mb-2">
              <span className="fs-3 fw-bold text-black">
                ${campaignData.currentFunding.toFixed(2)}
              </span>
              <span className="text-muted small">
                of ${campaignData.fundingGoal.toLocaleString()} raised
              </span>
            </div>
            <ProgressBar
              now={progressPercentage}
              className="mb-0"
              variant="primary"
              style={{ height: "8px" }}
            />
          </div>

          {user?.isAdmin && (
            <div className="mt-2">
              <small className="text-muted">
                Total Redemptions: $
                {campaignData.totalRedemptionValue.toFixed(2)}
              </small>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Editor Modal */}
      <Modal show={showEditor} onHide={() => setShowEditor(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Campaign Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editData.title}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter campaign title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editData.description}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter campaign description"
              />
            </Form.Group>

            {campaignData && (
              <div className="bg-light p-3 rounded">
                <h6 className="mb-2">Campaign Stats</h6>
                <small className="text-muted d-block">
                  Goal: ${campaignData.fundingGoal.toLocaleString()}
                </small>
                <small className="text-muted d-block">
                  Current Funding: ${campaignData.currentFunding.toFixed(2)}
                </small>
                <small className="text-muted d-block">
                  Progress: {progressPercentage.toFixed(1)}%
                </small>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditor(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
