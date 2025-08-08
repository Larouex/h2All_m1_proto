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

interface Project {
  id: string;
  name: string;
  description: string | null;
  fundingGoal: string;
  currentFunding: string;
  category: string | null;
  location: string | null;
  status: string;
  isActive: boolean;
  beneficiaries: number | null;
  estimatedCompletion: string | null;
  projectManager: string | null;
  organization: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    totalProjects: number;
    activeProjects: number;
    totalFundingGoal: number;
    totalCurrentFunding: number;
  };
}

export default function AdminProjects() {
  const router = useRouter();
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const fetchProjects = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/projects?page=${page}&limit=20`);

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        setError("Failed to load projects data");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/projects?id=${projectId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchProjects(currentPage);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete: ${errorData.error}`);
      }
    } catch {
      alert("Network error occurred while deleting");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProject) return;

    const formData = new FormData(event.currentTarget);
    const updatedProject = {
      id: editingProject.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      fundingGoal: formData.get("fundingGoal") as string,
      category: formData.get("category") as string,
      location: formData.get("location") as string,
      status: formData.get("status") as string,
      isActive: formData.get("isActive") === "on",
      beneficiaries: parseInt(formData.get("beneficiaries") as string) || null,
      estimatedCompletion: formData.get("estimatedCompletion") as string,
      projectManager: formData.get("projectManager") as string,
      organization: formData.get("organization") as string,
    };

    try {
      const response = await fetch("/api/admin/projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProject),
      });

      if (response.ok) {
        setShowEditModal(false);
        setEditingProject(null);
        await fetchProjects(currentPage);
      } else {
        const errorData = await response.json();
        alert(`Failed to update: ${errorData.error}`);
      }
    } catch {
      alert("Network error occurred while updating");
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return <Badge bg="secondary">Inactive</Badge>;

    switch (status) {
      case "active":
        return <Badge bg="success">Active</Badge>;
      case "completed":
        return <Badge bg="primary">Completed</Badge>;
      case "cancelled":
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
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
          <p>Loading projects...</p>
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
            <h1>Projects Management</h1>
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
                  {data.stats.totalProjects.toLocaleString()}
                </h3>
                <p className="mb-0">Total Projects</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success">
                  {data.stats.activeProjects.toLocaleString()}
                </h3>
                <p className="mb-0">Active Projects</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info">
                  {formatCurrency(data.stats.totalFundingGoal.toString())}
                </h3>
                <p className="mb-0">Total Funding Goal</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-warning">
                  {formatCurrency(data.stats.totalCurrentFunding.toString())}
                </h3>
                <p className="mb-0">Current Funding</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Projects Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Projects ({data?.pagination.totalCount.toLocaleString()})
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive striped>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Funding Goal</th>
                    <th>Current Funding</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <strong>{project.name}</strong>
                        {project.description && (
                          <div className="text-muted small">
                            {project.description.substring(0, 100)}...
                          </div>
                        )}
                      </td>
                      <td>{project.category || "—"}</td>
                      <td>{formatCurrency(project.fundingGoal)}</td>
                      <td>{formatCurrency(project.currentFunding)}</td>
                      <td>
                        {getStatusBadge(project.status, project.isActive)}
                      </td>
                      <td>{project.location || "—"}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="me-2"
                          onClick={() => handleEdit(project)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(project.id)}
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
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingProject && (
            <Form onSubmit={handleSaveEdit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      defaultValue={editingProject.name}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      name="category"
                      defaultValue={editingProject.category || ""}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  defaultValue={editingProject.description || ""}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Funding Goal</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="fundingGoal"
                      defaultValue={editingProject.fundingGoal}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      defaultValue={editingProject.status}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      defaultValue={editingProject.location || ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Beneficiaries</Form.Label>
                    <Form.Control
                      type="number"
                      name="beneficiaries"
                      defaultValue={editingProject.beneficiaries || ""}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Project Manager</Form.Label>
                    <Form.Control
                      type="text"
                      name="projectManager"
                      defaultValue={editingProject.projectManager || ""}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Organization</Form.Label>
                    <Form.Control
                      type="text"
                      name="organization"
                      defaultValue={editingProject.organization || ""}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Estimated Completion</Form.Label>
                <Form.Control
                  type="text"
                  name="estimatedCompletion"
                  defaultValue={editingProject.estimatedCompletion || ""}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isActive"
                  label="Active"
                  defaultChecked={editingProject.isActive}
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
