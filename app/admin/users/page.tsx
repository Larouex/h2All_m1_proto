"use client";

import { useState, useEffect, useCallback } from "react";
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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  balance: string;
  isActive: boolean;
  isAdmin: boolean;
  lastLogin?: string;
  registrationDate: string;
  totalRedemptions: number;
  totalRedemptionValue: string;
}

export default function UserManager() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("status", filterStatus);
      params.append("limit", "100"); // Get more users for admin view

      // Call real API endpoint
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Error fetching users");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: boolean
  ) => {
    if (
      confirm(
        `Are you sure you want to ${
          currentStatus ? "deactivate" : "activate"
        } this user?`
      )
    ) {
      try {
        // Call real API endpoint
        const response = await fetch(`/api/admin/users`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            updates: { isActive: !currentStatus },
          }),
        });

        if (response.ok) {
          fetchUsers();
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to update user status");
        }
      } catch (err) {
        console.error("Error updating user:", err);
        setError("Error updating user status");
      }
    }
  };

  const handleToggleAdminStatus = async (
    userId: string,
    currentAdminStatus: boolean
  ) => {
    if (
      confirm(
        `Are you sure you want to ${
          currentAdminStatus
            ? "remove admin privileges from"
            : "grant admin privileges to"
        } this user?`
      )
    ) {
      try {
        // Call real API endpoint
        const response = await fetch(`/api/admin/users`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            updates: { isAdmin: !currentAdminStatus },
          }),
        });

        if (response.ok) {
          fetchUsers();
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to update admin status");
        }
      } catch (err) {
        console.error("Error updating admin status:", err);
        setError("Error updating admin status");
      }
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (
      confirm(
        `⚠️ DANGER: Are you sure you want to permanently delete user "${userEmail}"?\n\nThis action CANNOT be undone and will remove:\n- User account and all data\n- Redemption history\n- Balance information\n\nType "DELETE" in the next prompt to confirm.`
      )
    ) {
      const confirmation = prompt(
        `To confirm deletion of user "${userEmail}", type "DELETE" exactly:`
      );

      if (confirmation === "DELETE") {
        try {
          const response = await fetch(`/api/admin/users?id=${userId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            fetchUsers();
            alert(`User "${userEmail}" has been permanently deleted.`);
          } else {
            const errorData = await response.json();
            setError(errorData.error || "Failed to delete user");
          }
        } catch (err) {
          console.error("Error deleting user:", err);
          setError("Error deleting user");
        }
      } else {
        alert("Deletion cancelled - confirmation text did not match.");
      }
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleExportUsers = () => {
    // This would trigger a CSV export
    alert("Exporting user data... (This would download a CSV file)");
  };

  // Users are already filtered by the API
  const filteredUsers = users;

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading users...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>User Management</h1>
            <div>
              <Button
                variant="outline-primary"
                onClick={handleExportUsers}
                className="me-2"
              >
                📊 Export Users
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

          {/* Filter and Search */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Search Users</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search by name or email..."
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
                      aria-label="Filter users by status"
                      title="Filter users by status"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active Users</option>
                      <option value="inactive">Inactive Users</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <div className="mb-0">
                    <strong>Total:</strong> {filteredUsers.length} users
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Users Table */}
          <Card>
            <Card.Body>
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Admin</th>
                    <th>Last Login</th>
                    <th>Redemptions</th>
                    <th>Redemption Value</th>
                    <th>Registration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>
                          {user.firstName} {user.lastName}
                        </strong>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.country}</td>
                      <td>${user.balance}</td>
                      <td>
                        <Badge bg={user.isActive ? "success" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={user.isAdmin ? "warning" : "secondary"}>
                          {user.isAdmin ? "Admin" : "User"}
                        </Badge>
                      </td>
                      <td>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td>{user.totalRedemptions}</td>
                      <td>${user.totalRedemptionValue}</td>
                      <td>
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          className="me-1 mb-1"
                        >
                          View
                        </Button>
                        <Button
                          variant={
                            user.isActive
                              ? "outline-warning"
                              : "outline-success"
                          }
                          size="sm"
                          onClick={() =>
                            handleToggleUserStatus(user.id, user.isActive)
                          }
                          className="me-1 mb-1"
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant={
                            user.isAdmin ? "outline-danger" : "outline-primary"
                          }
                          size="sm"
                          onClick={() =>
                            handleToggleAdminStatus(user.id, user.isAdmin)
                          }
                          className="me-1 mb-1"
                        >
                          {user.isAdmin ? "Remove Admin" : "Make Admin"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="mb-1"
                          title="Permanently delete user (cannot be undone)"
                        >
                          🗑️ Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-5">
                  <p className="text-muted">No users found</p>
                  <p className="text-muted">
                    Adjust your search criteria or check back later
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Row>
              <Col md={6}>
                <h6>Personal Information</h6>
                <p>
                  <strong>Name:</strong> {selectedUser.firstName}{" "}
                  {selectedUser.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Country:</strong> {selectedUser.country}
                </p>
                <p>
                  <strong>User ID:</strong> {selectedUser.id}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge bg={selectedUser.isActive ? "success" : "secondary"}>
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </p>
                <p>
                  <strong>Admin:</strong>{" "}
                  <Badge bg={selectedUser.isAdmin ? "warning" : "secondary"}>
                    {selectedUser.isAdmin ? "Admin" : "User"}
                  </Badge>
                </p>
              </Col>
              <Col md={6}>
                <h6>Activity Information</h6>
                <p>
                  <strong>Registration:</strong>{" "}
                  {new Date(selectedUser.registrationDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Last Login:</strong>{" "}
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleDateString()
                    : "Never"}
                </p>
                <p>
                  <strong>Balance:</strong> ${selectedUser.balance}
                </p>
                <p>
                  <strong>Total Redemptions:</strong>{" "}
                  {selectedUser.totalRedemptions}
                </p>
                <p>
                  <strong>Total Redemption Value:</strong> $
                  {selectedUser.totalRedemptionValue}
                </p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
