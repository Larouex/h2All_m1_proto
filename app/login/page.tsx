"use client";

import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (showError) {
      setShowError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowError(false);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        // Login successful
        const userData = await response.json();
        alert(`Welcome back, ${userData.firstName}!`);
        router.push("/impact");
      } else if (response.status === 401) {
        // Invalid credentials
        setErrorMessage("Invalid email or password. Please try again.");
        setShowError(true);
      } else if (response.status === 404) {
        // User not found - redirect to registration
        setErrorMessage(
          "No account found with this email. Redirecting to registration..."
        );
        setShowError(true);
        setTimeout(() => {
          router.push("/register");
        }, 2000);
      } else {
        // Other error
        const errorData = await response.json();
        setErrorMessage(`Login failed: ${errorData.error}`);
        setShowError(true);
      }
    } catch (error) {
      console.error("Error submitting login:", error);
      setErrorMessage("Login failed. Please try again.");
      setShowError(true);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Text className="text-muted small">
                <strong>Login:</strong> Access your account to track your impact
                and manage your profile.
              </Card.Text>
            </Card.Body>
          </Card>

          <h1 className="text-center mb-4">Welcome Back</h1>

          {showError && (
            <Alert variant="danger" className="mb-4">
              {errorMessage}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-center mb-3">
              <Button variant="primary" type="submit" size="lg">
                Sign In
              </Button>
            </div>
          </Form>

          <div className="text-center">
            <p className="text-muted">
              Don&apos;t have an account?{" "}
              <Button
                variant="link"
                className="p-0"
                onClick={() => router.push("/register")}
              >
                Create one here
              </Button>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
