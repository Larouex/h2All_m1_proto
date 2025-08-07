"use client";

import { useState } from "react";
import { Container, Button, Alert, Card } from "react-bootstrap";

export default function MigrationPage() {
  const [status, setStatus] = useState<
    "idle" | "running" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const runMigration = async () => {
    try {
      setStatus("running");
      setMessage("Creating email_claims table...");

      const response = await fetch("/api/admin/migrate-email-claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus("success");
        setMessage(
          `✅ Success! ${result.message}. Current records: ${result.recordCount}`
        );
      } else {
        setStatus("error");
        setMessage(
          `❌ Error: ${result.error || "Migration failed"}\nDetails: ${
            result.details || "Unknown error"
          }`
        );
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        `❌ Network Error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <Card>
            <Card.Header>
              <h2 className="mb-0">Database Migration</h2>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-4">
                This will create the <code>email_claims</code> table in your
                production database. It&apos;s safe to run multiple times.
              </p>

              {status === "idle" && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={runMigration}
                  className="w-100"
                >
                  Create email_claims Table
                </Button>
              )}

              {status === "running" && (
                <Alert variant="info">
                  <div className="d-flex align-items-center">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    {message}
                  </div>
                </Alert>
              )}

              {status === "success" && (
                <Alert variant="success">
                  <pre className="mb-0">{message}</pre>
                </Alert>
              )}

              {status === "error" && (
                <Alert variant="danger">
                  <pre className="mb-0">{message}</pre>
                  <hr />
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setStatus("idle")}
                  >
                    Try Again
                  </Button>
                </Alert>
              )}

              {status !== "idle" && status !== "running" && (
                <div className="mt-3">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setStatus("idle")}
                  >
                    Reset
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}
