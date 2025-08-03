"use client";

import { useState } from "react";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";

interface NavBarProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function NavBar({
  variant = "light",
  className = "",
}: NavBarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  // Determine if we should use dark or light theme based on page
  const isDarkPage = pathname?.startsWith("/admin") || pathname === "/auth";
  const navVariant = variant === "dark" || isDarkPage ? "dark" : "light";
  const bgColor = navVariant === "dark" ? "dark" : "light";

  const handleNavClick = () => {
    setExpanded(false);
  };

  const handleLogin = () => {
    router.push("/auth");
    handleNavClick();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      handleNavClick();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    handleNavClick();
  };

  return (
    <Navbar
      expand="lg"
      variant={navVariant}
      bg={bgColor}
      fixed="top"
      className={`shadow-sm ${
        navVariant === "dark" ? "admin-navbar" : ""
      } ${className}`}
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand
          href="/"
          className="fw-bold"
          onClick={(e) => {
            e.preventDefault();
            handleNavigation("/");
          }}
        >
          H2All
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              onClick={() => handleNavigation("/")}
              active={pathname === "/"}
            >
              Home
            </Nav.Link>

            <Nav.Link
              onClick={() => handleNavigation("/track")}
              active={pathname === "/track"}
            >
              Track
            </Nav.Link>

            {isAuthenticated && (
              <>
                <Nav.Link
                  onClick={() => handleNavigation("/redeem")}
                  active={pathname === "/redeem"}
                >
                  Redeem
                </Nav.Link>

                <Nav.Link
                  onClick={() => handleNavigation("/profile")}
                  active={pathname === "/profile"}
                >
                  Profile
                </Nav.Link>

                {user?.isAdmin && (
                  <Nav.Link
                    onClick={() => handleNavigation("/admin")}
                    active={pathname?.startsWith("/admin")}
                    className="text-warning"
                  >
                    Admin
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>

          <Nav className="ms-auto">
            {isAuthenticated && user ? (
              <NavDropdown
                title={`${user.firstName} ${user.lastName}`}
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item onClick={() => handleNavigation("/profile")}>
                  <i className="bi bi-person me-2"></i>
                  Profile
                </NavDropdown.Item>

                <NavDropdown.Item onClick={() => handleNavigation("/redeem")}>
                  <i className="bi bi-gift me-2"></i>
                  Redeem
                </NavDropdown.Item>

                {user.isAdmin && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item
                      onClick={() => handleNavigation("/admin")}
                    >
                      <i className="bi bi-gear me-2"></i>
                      Admin Panel
                    </NavDropdown.Item>
                  </>
                )}

                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Button
                variant={
                  navVariant === "dark" ? "outline-light" : "outline-primary"
                }
                onClick={handleLogin}
                size="sm"
              >
                Sign In
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
