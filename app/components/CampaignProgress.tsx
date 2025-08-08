"use client";

import { useState } from "react";
import { Card, Button, ProgressBar, Form, Modal } from "react-bootstrap";
import { useAuth } from "@/app/lib/auth-context";

interface CampaignProgressProps {
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
  className = "",
}: CampaignProgressProps) {
  const { user } = useAuth();

  // Static placeholder data instead of database fetch
  const [campaignData] = useState<CampaignData>({
    id: "kodema-village",
    name: "Campaign Progress",
    description:
      "Our goal: clean water within 5 minutes of every home in Kodema Village.",
    fundingGoal: 5000,
    currentFunding: 1250.5,
    totalRedemptionValue: 1250.5,
    isActive: true,
  });

  const [showEditor, setShowEditor] = useState(false);
  const [editData, setEditData] = useState({
    title: campaignData.name,
    description: campaignData.description,
  });
  const [saving, setSaving] = useState(false);

  // Save campaign updates (placeholder - doesn't actually save to database)
  const handleSave = async () => {
    if (!campaignData || !user?.isAdmin) return;

    try {
      setSaving(true);
      // Simulate saving delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Just update local state for demo purposes
      setEditData({
        title: editData.title,
        description: editData.description,
      });

      setShowEditor(false);
    } catch (error) {
      console.error("Error updating campaign:", error);
    } finally {
      setSaving(false);
    }
  };

  const currentFunding = campaignData.currentFunding || 0;
  const fundingGoal = campaignData.fundingGoal || 5000;
  const progressPercentage = (currentFunding / fundingGoal) * 100;

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
                ${currentFunding.toFixed(2)}
              </span>
              <span className="text-muted small">
                of ${fundingGoal.toLocaleString()} raised
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
                {(campaignData.totalRedemptionValue || 0).toFixed(2)}
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
                  Goal: ${fundingGoal.toLocaleString()}
                </small>
                <small className="text-muted d-block">
                  Current Funding: ${currentFunding.toFixed(2)}
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
