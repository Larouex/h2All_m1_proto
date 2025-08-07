"use client";

import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useRouter } from "next/navigation";

interface MigrationResult {
  success?: boolean;
  message?: string;
  error?: string;
  tableExists?: boolean;
  [key: string]: unknown;
}

export default function AdminDatabaseInit() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigration = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch("/api/admin/migrate-email-claims", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Migration failed");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await fetch("/api/admin/migrate-email-claims");
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Check failed");
      }
    } catch {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Database Initialization</h1>
            <Button variant="secondary" onClick={() => router.push("/admin")}>
              Back to Admin
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Email Claims Table Setup</h5>
            </Card.Header>
            <Card.Body>
              <p>
                Initialize the email_claims table in the production database. This is required
                for the email claim functionality to work properly.
              </p>
              
              <div className="d-flex gap-2 mb-3">
                <Button 
                  variant="primary" 
                  onClick={handleMigration}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "Create Table"}
                </Button>
                <Button 
                  variant="outline-info" 
                  onClick={handleCheck}
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "Check Status"}
                </Button>
              </div>

              {error && (
                <Alert variant="danger">
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              {result && (
                <Alert variant={result.success ? "success" : "warning"}>
                  <h6>Result:</h6>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">What this does</h6>
            </Card.Header>
            <Card.Body>
              <ul className="small">
                <li>Creates the email_claims table if it doesn&apos;t exist</li>
                <li>Adds appropriate indexes for performance</li>
                <li>Sets up unique constraints on email</li>
                <li>Safe to run multiple times</li>
              </ul>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">Table Structure</h6>
            </Card.Header>
            <Card.Body>
              <pre className="small">{`id: text (PRIMARY KEY)
email: text (UNIQUE)
claim_count: integer (DEFAULT 1)
created_at: timestamp
updated_at: timestamp`}</pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
