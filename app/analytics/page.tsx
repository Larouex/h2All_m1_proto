"use client";

import React, { useState } from "react";
import { Container } from "react-bootstrap";
import AnalyticsSidebar from "@/components/analytics/AnalyticsSidebar";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import DashboardGrid from "@/components/analytics/DashboardGrid";
import { ThemeProvider } from "@/context/ThemeContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import { DateRange } from "@/types/analytics";
import "./analytics.css";

export default function AnalyticsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
