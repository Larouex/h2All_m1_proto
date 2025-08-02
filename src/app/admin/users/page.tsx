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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: string;
  registrationDate: string;
  totalRedemptions: number;
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // This would be a real API call
      const mockUsers: User[] = [
        {
          id: "1",
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          isActive: true,
          lastLogin: new Date(Date.now() - 86400000).toISOString(),
          registrationDate: new Date(Date.now() - 7 * 86400000).toISOString(),
          totalRedemptions: 3,
        },
        {
          id: "2",
          email: "jane.smith@example.com",
          firstName: "Jane",
          lastName: "Smith",
          isActive: true,
          lastLogin: new Date(Date.now() - 3600000).toISOString(),
          registrationDate: new Date(Date.now() - 14 * 86400000).toISOString(),
          totalRedemptions: 1,
        },
        {
          id: "3",
          email: "inactive@example.com",
          firstName: "Inactive",
          lastName: "User",
          isActive: false,
          registrationDate: new Date(Date.now() - 30 * 86400000).toISOString(),
          totalRedemptions: 0,
        },
      ];
      setUsers(mockUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

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
        // This would be a real API call
        const response = await fetch(`/api/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        });

        if (response.ok) {
          fetchUsers();
        } else {
          setError("Failed to update user status");
        }
      } catch (err) {
        console.error("Error updating user:", err);
        setError("Error updating user status");
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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesStatus;
  });

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
                      aria-label="Filter by status"
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
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Redemptions</th>
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
                      <td>
                        <Badge bg={user.isActive ? "success" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td>{user.totalRedemptions}</td>
                      <td>
                        {new Date(user.registrationDate).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          className="me-1"
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
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
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
                  <strong>User ID:</strong> {selectedUser.id}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge bg={selectedUser.isActive ? "success" : "secondary"}>
                    {selectedUser.isActive ? "Active" : "Inactive"}
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
                  <strong>Total Redemptions:</strong>{" "}
                  {selectedUser.totalRedemptions}
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
