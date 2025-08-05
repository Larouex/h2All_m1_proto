"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    country: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues by only rendering after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const { login, register, isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push("/");
    }
  }, [mounted, isAuthenticated, router]);

  // Clear form data when user logs out
  useEffect(() => {
    if (mounted && !user) {
      setFormData({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        country: "",
      });
      setError("");
    }
  }, [mounted, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Form submitted with:", { email: formData.email, isLogin });

    try {
      if (isLogin) {
        console.log("Attempting login...");
        const result = await login(formData.email, formData.password);
        console.log("Login result:", result);

        if (!result.success) {
          setError(result.error || "Login failed");
        } else {
          console.log("Login successful, redirecting to home...");
          // Successful login - redirect to home page
          router.push("/");
        }
      } else {
        console.log("Attempting registration...");
        const result = await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          country: formData.country,
        });
        console.log("Registration result:", result);

        if (!result.success) {
          setError(result.error || "Registration failed");
          if (result.details) {
            setError(result.error + ": " + result.details.join(", "));
          }
        } else {
          console.log("Registration successful, redirecting to home...");
          // Successful registration - redirect to home page
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      country: "",
    });
  };

  // Show loading state until component is mounted to prevent hydration issues
  if (!mounted) {
    return (
      <Container className="py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="fs-3 fw-bold text-dark mb-0">
            H2<span className="text-primary">ALL</span> WATER
          </h1>
        </div>

        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <div className="d-flex justify-content-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="fs-3 fw-bold text-dark mb-0">
          H2<span className="text-primary">ALL</span> WATER
        </h1>
      </div>

      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card>
            <Card.Header className="text-center">
              <h4>{isLogin ? "Sign In" : "Create Account"}</h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                    suppressHydrationWarning={true}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your password"
                    suppressHydrationWarning={true}
                  />
                  {!isLogin && (
                    <Form.Text className="text-muted">
                      Password must be at least 8 characters with uppercase,
                      lowercase, numbers, and special characters.
                    </Form.Text>
                  )}
                </Form.Group>

                {!isLogin && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your first name"
                        suppressHydrationWarning={true}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your last name"
                        suppressHydrationWarning={true}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your country"
                        suppressHydrationWarning={true}
                      />
                    </Form.Group>
                  </>
                )}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                  suppressHydrationWarning={true}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={toggleMode}
                    className="text-decoration-none"
                    suppressHydrationWarning={true}
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
