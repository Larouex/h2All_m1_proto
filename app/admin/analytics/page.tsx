"use client";

import React, { useState } from "react";
import { Container } from "react-bootstrap";
import Link from "next/link";
import AnalyticsSidebar from "@/components/analytics/AnalyticsSidebar";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import DashboardGrid from "@/components/analytics/DashboardGrid";
import { ThemeProvider } from "@/context/ThemeContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DateRange } from "@/types/analytics";
import { useAuth } from "@/lib/auth-context";
import "./analytics.css";

export default function AdminAnalyticsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="loading-container">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5>Loading Analytics Dashboard...</h5>
          </div>
        </div>
      </Container>
    );
  }

  // Redirect if not authenticated (middleware should handle this, but adding as fallback)
  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger text-center">
          <h4>Authentication Required</h4>
          <p>Please log in to access the analytics dashboard.</p>
          <Link href="/auth" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </Container>
    );
  }

  // Check if user has admin access
  if (!user?.isAdmin) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning text-center">
          <h4>Admin Access Required</h4>
          <p>
            You don&apos;t have permission to access the analytics dashboard.
          </p>
          <p>
            Please contact an administrator if you believe this is an error.
          </p>
          <Link href="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <ThemeProvider>
      <AnalyticsProvider>
        <div className="analytics-dashboard">
          <AnalyticsSidebar
            collapsed={sidebarCollapsed}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />

          <div
            className={`dashboard-content ${
              sidebarCollapsed ? "sidebar-collapsed" : ""
            }`}
          >
            <AnalyticsHeader
              onToggleSidebar={toggleSidebar}
              sidebarCollapsed={sidebarCollapsed}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              userInfo={{
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                isAdmin: user.isAdmin,
              }}
            />

            <main className="dashboard-main">
              <Container fluid>
                <DashboardGrid
                  activeSection={activeSection}
                  dateRange={dateRange}
                />
              </Container>
            </main>
          </div>
        </div>
      </AnalyticsProvider>
    </ThemeProvider>
  );
}
