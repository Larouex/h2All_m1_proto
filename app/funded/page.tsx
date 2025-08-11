"use client";

import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { formatDateSimple } from "../lib/utils/dateUtils";

interface ProjectData {
  id: string;
  name: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  category: string;
  location: string;
  status: string;
  createdDate: string;
  // Add more fields as needed
}

export default function Funded() {
  return (
    <Suspense
      fallback={
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading project details...</p>
            </Col>
          </Row>
        </Container>
      }
    >
      <FundedContent />
    </Suspense>
  );
}

function FundedContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("FundedContent useEffect triggered");
    console.log("projectId from URL:", projectId);

    // Add a small delay to ensure the component is fully mounted
    const timeoutId = setTimeout(() => {
      if (projectId) {
        console.log("Calling fetchProjectData with ID:", projectId);
        fetchProjectData(projectId);
      } else {
        console.log("No project ID provided");
        setError(
          "No project ID provided - please include ?project=PROJECT_ID in the URL"
        );
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [projectId]);
  const fetchProjectData = async (id: string) => {
    try {
      console.log("fetchProjectData started for ID:", id);
      setLoading(true);

      const requestBody = JSON.stringify({ projectId: id });
      console.log("Request body:", requestBody);

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });

      console.log("Response received:", response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log("Project data received:", data);
        setProjectData(data);
      } else {
        const errorData = await response.json();
        console.error("API error:", errorData);
        setError(errorData.error || "Failed to load project data");
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      setError("Failed to load project data");
    } finally {
      console.log("fetchProjectData completed, setting loading to false");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading project details...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!projectData) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="warning">
              <Alert.Heading>Project Not Found</Alert.Heading>
              <p>The requested project could not be found.</p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  const fundingPercentage =
    (projectData.currentFunding / projectData.fundingGoal) * 100;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Text className="text-muted small">
                <strong>Project Funding:</strong> View detailed information
                about funded projects and their impact.
              </Card.Text>
            </Card.Body>
          </Card>

          <h1 className="text-center mb-4">Project Funded Successfully!</h1>

          <Card className="mb-4">
            <Card.Header>
              <h3>{projectData.name}</h3>
              <span
                className={`badge ${
                  projectData.status === "active"
                    ? "bg-success"
                    : "bg-secondary"
                }`}
              >
                {projectData.status.toUpperCase()}
              </span>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h5>Project Description</h5>
                  <p>{projectData.description}</p>

                  <h5>Details</h5>
                  <ul>
                    <li>
                      <strong>Category:</strong> {projectData.category}
                    </li>
                    <li>
                      <strong>Location:</strong> {projectData.location}
                    </li>
                    <li>
                      <strong>Project ID:</strong> {projectData.id}
                    </li>
                    <li>
                      <strong>Created:</strong>{" "}
                      {formatDateSimple(projectData.createdDate)}
                    </li>
                  </ul>
                </Col>

                <Col md={4}>
                  <Card className="bg-light">
                    <Card.Body>
                      <h5>Funding Progress</h5>
                      <div className="progress mb-2">
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{
                            width: `${Math.min(fundingPercentage, 100)}%`,
                          }}
                          aria-valuenow={Math.round(fundingPercentage)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Project funding progress: ${fundingPercentage.toFixed(
                            1
                          )}% complete`}
                          title={`${fundingPercentage.toFixed(1)}% funded`}
                        ></div>
                      </div>
                      <p className="mb-1">
                        <strong>
                          ${projectData.currentFunding.toLocaleString()}
                        </strong>{" "}
                        raised
                      </p>
                      <p className="mb-1">
                        Goal:{" "}
                        <strong>
                          ${projectData.fundingGoal.toLocaleString()}
                        </strong>
                      </p>
                      <p className="text-muted">
                        {fundingPercentage.toFixed(1)}% funded
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h5>What Happens Next?</h5>
              <p>
                Thank you for supporting this project! Your contribution helps
                make a real difference. The project team will begin
                implementation and provide regular updates on progress.
              </p>
              <ul>
                <li>You will receive email updates on project milestones</li>
                <li>Track progress through your personal impact dashboard</li>
                <li>Connect with other supporters and the project team</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
