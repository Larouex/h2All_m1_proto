"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Table,
  Badge,
  Tab,
  Tabs,
  Modal,
  Form,
} from "react-bootstrap";
import { useRouter } from "next/navigation";

interface SystemStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalCodes: number;
  redeemedCodes: number;
  totalUsers: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export default function DataManager() {
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Clean database state
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isCleaningDatabase, setIsCleaningDatabase] = useState(false);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);

      // Call real API endpoint for system statistics
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const stats = await response.json();
      setStats(stats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(
        err instanceof Error ? err.message : "Error fetching system statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (type: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/data/${type}`);

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.match(/filename="(.+)"/)?.[1] ||
        `${type}_export.csv`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setError(null);
      alert(`${type} data exported successfully!`);
    } catch (err) {
      console.error("Export error:", err);
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setLoading(false);
    }
  };

  const handleImportData = (type: string) => {
    if (type === "users") {
      alert(
        "User data import is restricted for security and privacy compliance"
      );
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`/api/admin/data/${type}`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Import failed");
        }

        setError(null);
        alert(result.message || `${type} data imported successfully!`);

        // Refresh stats after import
        fetchSystemStats();
      } catch (err) {
        console.error("Import error:", err);
        setError(err instanceof Error ? err.message : "Import failed");
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  const handleCleanDatabase = async () => {
    try {
      setIsCleaningDatabase(true);
      const response = await fetch("/api/admin/data/clean", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to clean database");
      }

      setError(null);
      setShowCleanModal(false);
      setConfirmText("");
      alert(`Database cleaned successfully! ${result.message}`);

      // Refresh stats after cleaning
      fetchSystemStats();
    } catch (err) {
      console.error("Clean database error:", err);
      setError(err instanceof Error ? err.message : "Failed to clean database");
    } finally {
      setIsCleaningDatabase(false);
    }
  };

  const isConfirmationValid = confirmText.trim().toLowerCase() === "yes";

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading system data...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Data Management</h1>
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

          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k || "overview")}
            className="mb-4"
          >
            <Tab eventKey="overview" title="System Overview">
              {stats && (
                <>
                  {/* Statistics Cards */}
                  <Row className="mb-4">
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h3 className="text-primary">
                            {stats.totalCampaigns}
                          </h3>
                          <p className="mb-0">Total Campaigns</p>
                          <small className="text-muted">
                            {stats.activeCampaigns} active
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h3 className="text-success">{stats.totalCodes}</h3>
                          <p className="mb-0">Total Codes</p>
                          <small className="text-muted">
                            {stats.redeemedCodes} redeemed
                          </small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h3 className="text-info">{stats.totalUsers}</h3>
                          <p className="mb-0">Total Users</p>
                          <small className="text-muted">Registered</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <h3 className="text-warning">
                            {(
                              (stats.redeemedCodes / stats.totalCodes) *
                              100
                            ).toFixed(1)}
                            %
                          </h3>
                          <p className="mb-0">Redemption Rate</p>
                          <small className="text-muted">Overall</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Recent Activity */}
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Recent Activity</h5>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive>
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentActivity.map((activity) => (
                            <tr key={activity.id}>
                              <td>
                                <Badge
                                  bg={
                                    activity.type === "redemption"
                                      ? "success"
                                      : activity.type === "campaign"
                                      ? "primary"
                                      : "info"
                                  }
                                >
                                  {activity.type}
                                </Badge>
                              </td>
                              <td>{activity.description}</td>
                              <td>
                                {new Date(activity.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </>
              )}
            </Tab>

            <Tab eventKey="campaigns" title="Campaign Data">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Campaign Data Management</h5>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleExportData("campaigns")}
                        className="me-2"
                        disabled={loading}
                      >
                        {loading ? "Exporting..." : "Export CSV"}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleImportData("campaigns")}
                        className="me-2"
                        disabled={loading}
                      >
                        {loading ? "Importing..." : "Import CSV"}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push("/admin/campaigns")}
                      >
                        Manage Campaigns
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted">
                    Export campaign data for analysis or import bulk campaign
                    data from CSV files. Use the campaign manager for detailed
                    CRUD operations.
                  </p>
                  <ul>
                    <li>
                      Export includes: Campaign details, statistics, and status
                    </li>
                    <li>
                      Import supports: CSV format with predefined schema (see
                      /data/campaigns.csv for example)
                    </li>
                    <li>
                      Import will update existing campaigns or create new ones
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="codes" title="Redemption Codes">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Redemption Code Data</h5>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleExportData("codes")}
                        className="me-2"
                        disabled={loading}
                      >
                        {loading ? "Exporting..." : "Export CSV"}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleImportData("codes")}
                        className="me-2"
                        disabled={loading}
                      >
                        {loading ? "Importing..." : "Import CSV"}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push("/admin/codes")}
                      >
                        Manage Codes
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted">
                    Bulk operations for redemption codes. Export for reporting
                    or import pre-generated codes from CSV files.
                  </p>
                  <ul>
                    <li>
                      Export includes: Code, campaign, status, and usage data
                    </li>
                    <li>
                      Import supports: Pre-generated codes or batch creation
                      (see /data/redemption_codes.csv for example)
                    </li>
                    <li>
                      Import will update existing codes or create new ones
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="users" title="User Data">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>User Data Management</h5>
                    <div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleExportData("users")}
                        className="me-2"
                        disabled={loading}
                      >
                        {loading ? "Exporting..." : "Export CSV"}
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleImportData("users")}
                        className="me-2"
                        disabled={true}
                      >
                        Import (Restricted)
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push("/admin/users")}
                      >
                        Manage Users
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted">
                    User data operations with privacy and security
                    considerations. Export for analytics and reporting. Import
                    is restricted for security.
                  </p>
                  <ul>
                    <li>
                      Export includes: User ID, email, registration date,
                      activity (excludes password data)
                    </li>
                    <li>
                      Import restricted due to privacy and security requirements
                    </li>
                    <li>GDPR compliance features available</li>
                  </ul>
                  <Alert variant="info" className="mt-3">
                    <small>
                      <strong>Privacy Note:</strong> User data exports are
                      logged and require appropriate permissions for compliance
                      purposes.
                    </small>
                  </Alert>
                </Card.Body>
              </Card>
            </Tab>

            <Tab eventKey="database" title="Database Management">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5>Database Operations</h5>
                    <Badge bg="warning" className="fs-6">
                      ⚠️ Danger Zone
                    </Badge>
                  </div>
                  <Alert variant="danger">
                    <Alert.Heading>
                      ⚠️ Critical Database Operations
                    </Alert.Heading>
                    <p>
                      The operations below will permanently modify or delete
                      data from your database. These actions cannot be undone.
                      Use with extreme caution.
                    </p>
                  </Alert>

                  {/* Backup Recommendation */}
                  <Card className="border-info mb-4">
                    <Card.Header className="bg-info text-white">
                      <h6 className="mb-0">💾 Backup Recommendation</h6>
                    </Card.Header>
                    <Card.Body>
                      <Alert variant="info" className="mb-3">
                        <strong>🛡️ Backup First!</strong> Before performing any
                        destructive operations, we strongly recommend creating a
                        database backup.
                      </Alert>

                      <Row>
                        <Col md={6}>
                          <h6>Railway Database Backup:</h6>
                          <ol className="small">
                            <li>Go to your Railway project dashboard</li>
                            <li>Navigate to Database tab</li>
                            <li>Click &quot;Create Backup&quot;</li>
                            <li>Download backup file</li>
                          </ol>
                        </Col>
                        <Col md={6}>
                          <h6>Current Database Size:</h6>
                          <div className="small">
                            <div>
                              📊 Campaigns: {stats?.totalCampaigns || 0}
                            </div>
                            <div>🎫 Codes: {stats?.totalCodes || 0}</div>
                            <div>👥 Users: {stats?.totalUsers || 0}</div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Card className="border-danger">
                    <Card.Header className="bg-danger text-white">
                      <h6 className="mb-0">🗑️ Clean Database</h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="text-muted">
                        This will permanently delete <strong>ALL DATA</strong>{" "}
                        from all tables including:
                      </p>
                      <ul className="text-muted">
                        <li>
                          <strong>All campaigns</strong> and their
                          configurations
                        </li>
                        <li>
                          <strong>All redemption codes</strong> (used and
                          unused)
                        </li>
                        <li>
                          <strong>All user accounts</strong> and profiles
                        </li>
                        <li>
                          <strong>All projects</strong> and project data
                        </li>
                        <li>
                          <strong>All subscriptions</strong> and email lists
                        </li>
                        <li>
                          <strong>All activity logs</strong> and statistics
                        </li>
                      </ul>
                      <Alert variant="warning" className="mt-3">
                        <small>
                          <strong>⚠️ Warning:</strong> This action is
                          irreversible. Make sure you have a database backup
                          before proceeding.
                        </small>
                      </Alert>
                      <div className="d-grid">
                        <Button
                          variant="danger"
                          size="lg"
                          onClick={() => setShowCleanModal(true)}
                          className="fw-bold"
                        >
                          🗑️ Clean Entire Database
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>

          {/* Clean Database Confirmation Modal */}
          <Modal
            show={showCleanModal}
            onHide={() => {
              setShowCleanModal(false);
              setConfirmText("");
            }}
            backdrop="static"
            keyboard={false}
            centered
          >
            <Modal.Header className="bg-danger text-white">
              <Modal.Title>🚨 Confirm Database Cleanup</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Alert variant="danger">
                <Alert.Heading>⚠️ CRITICAL WARNING</Alert.Heading>
                <p>
                  You are about to <strong>permanently delete ALL DATA</strong>{" "}
                  from the entire database. This includes all campaigns,
                  redemption codes, users, projects, and settings.
                </p>
                <p className="mb-0">
                  <strong>This action cannot be undone!</strong>
                </p>
              </Alert>

              <div className="bg-light p-3 rounded mb-3">
                <h6>This will delete:</h6>
                <div className="row">
                  <div className="col-6">
                    <ul className="list-unstyled small">
                      <li>✗ All campaigns</li>
                      <li>✗ All redemption codes</li>
                      <li>✗ All user accounts</li>
                    </ul>
                  </div>
                  <div className="col-6">
                    <ul className="list-unstyled small">
                      <li>✗ All projects</li>
                      <li>✗ All subscriptions</li>
                      <li>✗ All system logs</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Form.Group>
                <Form.Label className="fw-bold">
                  Type &quot;Yes&quot; to confirm this action:
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Type exactly: Yes"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className={`${
                    isConfirmationValid ? "border-success" : "border-danger"
                  }`}
                  autoComplete="off"
                />
                <Form.Text className="text-muted">
                  You must type &quot;Yes&quot; exactly to enable the delete
                  button.
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCleanModal(false);
                  setConfirmText("");
                }}
                disabled={isCleaningDatabase}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleCleanDatabase}
                disabled={!isConfirmationValid || isCleaningDatabase}
                className="fw-bold"
              >
                {isCleaningDatabase ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Cleaning Database...
                  </>
                ) : (
                  "🗑️ Yes, Delete Everything"
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}
