"use client";

import React, { useState } from "react";
import { Button, Dropdown } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateRange } from "@/types/analytics";
import { useTheme } from "@/context/ThemeContext";
import { useAnalytics } from "@/context/AnalyticsContext";
import MetricsCards from "./MetricsCards";

interface AnalyticsHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function AnalyticsHeader({
  onToggleSidebar,
  sidebarCollapsed,
  dateRange,
  onDateRangeChange,
}: AnalyticsHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { exportData, loading } = useAnalytics();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      await exportData({
        format,
        includeCharts: true,
        dateRange,
        sections: ["overview", "campaigns", "users", "redemptions", "projects"],
      });
    } catch (error) {
      console.error("Export failed:", error);
      // In a real app, you'd show a toast notification here
    }
  };

  const getDateRangeText = () => {
    const start = dateRange.startDate.toLocaleDateString();
    const end = dateRange.endDate.toLocaleDateString();
    return `${start} - ${end}`;
  };

  const setQuickDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    onDateRangeChange({ startDate, endDate });
  };

  return (
    <>
      <header className="analytics-header">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className={`bi-${sidebarCollapsed ? "list" : "x-lg"}`}></i>
          </button>
          <h1 className="header-title">Analytics Dashboard</h1>
        </div>

        <div className="header-right">
          {/* Quick Date Range Buttons */}
          <div className="date-quick-buttons">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setQuickDateRange(7)}
              className="me-1"
            >
              7D
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setQuickDateRange(30)}
              className="me-1"
            >
              30D
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setQuickDateRange(90)}
              className="me-2"
            >
              90D
            </Button>
          </div>

          {/* Date Range Picker */}
          <Dropdown show={showDatePicker} onToggle={setShowDatePicker}>
            <Dropdown.Toggle
              variant="outline-primary"
              id="date-range-dropdown"
              className="date-picker"
            >
              <i className="bi-calendar3 me-2"></i>
              {getDateRangeText()}
            </Dropdown.Toggle>

            <Dropdown.Menu className="date-picker-menu">
              <div className="p-3">
                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <DatePicker
                    selected={dateRange.startDate}
                    onChange={(date) =>
                      date &&
                      onDateRangeChange({ ...dateRange, startDate: date })
                    }
                    className="form-control form-control-sm"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <DatePicker
                    selected={dateRange.endDate}
                    onChange={(date) =>
                      date && onDateRangeChange({ ...dateRange, endDate: date })
                    }
                    className="form-control form-control-sm"
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowDatePicker(false)}
                  className="w-100"
                >
                  Apply
                </Button>
              </div>
            </Dropdown.Menu>
          </Dropdown>

          {/* Export Dropdown */}
          <Dropdown>
            <Dropdown.Toggle
              variant="success"
              id="export-dropdown"
              className="export-button"
            >
              <i className="bi-download me-2"></i>
              Export
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => handleExport("csv")}
                disabled={loading}
              >
                <i className="bi-filetype-csv me-2"></i>
                Export as CSV
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleExport("xlsx")}
                disabled={loading}
              >
                <i className="bi-filetype-xlsx me-2"></i>
                Export as Excel
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => handleExport("pdf")}
                disabled={loading}
              >
                <i className="bi-filetype-pdf me-2"></i>
                Export as PDF
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          >
            <i className={`bi-${theme === "light" ? "moon" : "sun"}`}></i>
          </button>
        </div>
      </header>

      {/* Metrics Cards Row */}
      <div className="metrics-section">
        <MetricsCards />
      </div>
    </>
  );
}
