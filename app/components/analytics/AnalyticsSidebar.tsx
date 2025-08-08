"use client";

import React from "react";
import { SidebarSection } from "@/types/analytics";

interface AnalyticsSidebarProps {
  collapsed: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarSections: SidebarSection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "bi-grid-1x2",
    path: "/analytics/overview",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: "bi-bullseye",
    path: "/analytics/campaigns",
  },
  {
    id: "impact",
    label: "Impact",
    icon: "bi-graph-up",
    path: "/analytics/impact",
  },
  {
    id: "users",
    label: "Users",
    icon: "bi-people",
    path: "/analytics/users",
  },
  {
    id: "redemptions",
    label: "Redemptions",
    icon: "bi-ticket-perforated",
    path: "/analytics/redemptions",
  },
  {
    id: "projects",
    label: "Projects",
    icon: "bi-geo-alt",
    path: "/analytics/projects",
  },
];

export default function AnalyticsSidebar({
  collapsed,
  activeSection,
  onSectionChange,
}: AnalyticsSidebarProps) {
  return (
    <nav className={`analytics-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className={`sidebar-header ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-logo">
          <i className="bi-droplet-fill"></i>
        </div>
        {!collapsed && <h1 className="sidebar-title">H2All</h1>}
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-nav">
        {sidebarSections.map((section) => (
          <div key={section.id} className="nav-section">
            <button
              className={`nav-item ${
                activeSection === section.id ? "active" : ""
              }`}
              onClick={() => onSectionChange(section.id)}
              title={collapsed ? section.label : undefined}
            >
              <i className={section.icon}></i>
              {!collapsed && <span className="nav-text">{section.label}</span>}
            </button>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="nav-section">
            <div className="nav-item sidebar-footer-item">
              <i className="bi-info-circle"></i>
              <span className="nav-text">Analytics v1.0</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
