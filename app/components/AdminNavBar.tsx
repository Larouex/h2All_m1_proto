"use client";

import { useState } from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";

export default function AdminNavBar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const handleNavClick = () => {
    setExpanded(false);
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
      variant="dark"
      bg="dark"
      fixed="top"
      className="shadow-sm admin-navbar"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Navbar.Brand
          href="/"
          className="fw-bold text-warning"
          onClick={(e) => {
            e.preventDefault();
            handleNavigation("/");
          }}
        >
          H2All Admin
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="admin-navbar-nav" />

        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/admin" active={pathname === "/admin"}>
              Dashboard
            </Nav.Link>

            <Nav.Link href="/admin/users" active={pathname === "/admin/users"}>
              Users
            </Nav.Link>

            <Nav.Link
              href="/admin/campaigns"
              active={pathname === "/admin/campaigns"}
            >
              Campaigns
            </Nav.Link>

            <Nav.Link href="/admin/codes" active={pathname === "/admin/codes"}>
              Codes
            </Nav.Link>

            <Nav.Link href="/admin/data" active={pathname === "/admin/data"}>
              Data
            </Nav.Link>

            <NavDropdown title="Testing" id="testing-dropdown">
              <NavDropdown.Item href="/admin/tests">
                Test Suite
              </NavDropdown.Item>
              <NavDropdown.Item href="/admin/test-cookies">
                Test Cookies
              </NavDropdown.Item>
              <NavDropdown.Item href="/admin/test-redemption-flow">
                Test Redemption Flow
              </NavDropdown.Item>
              <NavDropdown.Item href="/admin/test-redemption-urls">
                Test Redemption URLs
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link
              href="/admin/api-docs"
              active={pathname === "/admin/api-docs"}
            >
              API Docs
            </Nav.Link>

            <NavDropdown title="User Flow" id="userflow-dropdown">
              <NavDropdown.Item href="/track">Track</NavDropdown.Item>
              <NavDropdown.Item href="/share">Share</NavDropdown.Item>
              <NavDropdown.Item href="/claim">Claim</NavDropdown.Item>
              <NavDropdown.Item href="/emailclaim">
                Email Claim
              </NavDropdown.Item>
              <NavDropdown.Item href="/claimed">Claimed</NavDropdown.Item>
              <NavDropdown.Item href="/project">Project</NavDropdown.Item>
              <NavDropdown.Item href="/redeem">Redeem</NavDropdown.Item>
              <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
            </NavDropdown>
          </Nav>

          <Nav className="ms-auto">
            {user && (
              <NavDropdown
                title={`${user.firstName} ${user.lastName}`}
                id="admin-user-dropdown"
                align="end"
              >
                <NavDropdown.Item href="/profile">
                  <i className="bi bi-person me-2"></i>
                  Profile
                </NavDropdown.Item>

                <NavDropdown.Item href="/">
                  <i className="bi bi-house me-2"></i>
                  Back to Site
                </NavDropdown.Item>

                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
