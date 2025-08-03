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

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      // This would be a real API call to get system statistics
      const mockStats: SystemStats = {
        totalCampaigns: 5,
        activeCampaigns: 3,
        totalCodes: 1250,
        redeemedCodes: 340,
        totalUsers: 89,
        recentActivity: [
          {
            id: "1",
            type: "redemption",
            description: "Code ABC123 redeemed by user@example.com",
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            type: "campaign",
            description: "New campaign 'Summer 2024' created",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "3",
            type: "user",
            description: "New user registration: newuser@example.com",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
      };
      setStats(mockStats);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Error fetching system statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = (type: string) => {
    // This would trigger a data export
    alert(`Exporting ${type} data... (This would download a CSV file)`);
  };

  const handleImportData = (type: string) => {
    // This would open a file picker for data import
    alert(`Import ${type} data... (This would open a file picker)`);
  };

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
                      >
                        Export CSV
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleImportData("campaigns")}
                        className="me-2"
                      >
                        Import CSV
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
                    data. Use the campaign manager for detailed CRUD operations.
                  </p>
                  <ul>
                    <li>
                      Export includes: Campaign details, statistics, and status
                    </li>
                    <li>Import supports: CSV format with predefined schema</li>
                    <li>Backup recommended before bulk operations</li>
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
                      >
                        Export CSV
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleImportData("codes")}
                        className="me-2"
                      >
                        Import CSV
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
                    or import pre-generated codes.
                  </p>
                  <ul>
                    <li>
                      Export includes: Code, campaign, status, and usage data
                    </li>
                    <li>
                      Import supports: Pre-generated codes or batch creation
                    </li>
                    <li>Validation ensures no duplicate codes</li>
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
                      >
                        Export CSV
                      </Button>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() =>
                          alert("User data import requires special permissions")
                        }
                        className="me-2"
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
                    considerations. Export for analytics, manage user records.
                  </p>
                  <ul>
                    <li>
                      Export includes: User ID, email, registration date,
                      activity
                    </li>
                    <li>Import restricted due to privacy requirements</li>
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
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}
