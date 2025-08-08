"use client";

import React, { useState, useMemo } from "react";
import { Table, Form, InputGroup, Button } from "react-bootstrap";
import { DateRange } from "@/types/analytics";
import { useAnalytics } from "@/context/AnalyticsContext";
import { formatDateSimple } from "../../../lib/utils/dateUtils";

interface TableWidgetProps {
  title: string;
  config: Record<string, string | number | boolean | object>;
  dateRange: DateRange;
}

interface TableRow {
  [key: string]: string | number | Date;
}

export default function TableWidget({ title, config }: TableWidgetProps) {
  const { campaigns, redemptions, users, projects, loading } = useAnalytics();
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const columns = config.columns as string[];
  const sortable = config.sortable as boolean;
  const filterable = config.filterable as boolean;
  const paginated = config.paginated as boolean;
  const pageSize = (config.pageSize as number) || 10;

  // Generate table data based on the title and columns
  const rawData = useMemo((): TableRow[] => {
    if (title.toLowerCase().includes("campaign")) {
      return campaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        goal: campaign.goal,
        raised: campaign.raised,
        backers: campaign.backers,
        status: campaign.status,
        created: campaign.createdAt,
        progress: Math.round((campaign.raised / campaign.goal) * 100),
      }));
    }

    if (title.toLowerCase().includes("redemption")) {
      return redemptions.slice(0, 20).map((redemption) => ({
        id: redemption.id,
        code: redemption.code,
        value: redemption.value,
        status: redemption.status,
        redeemedAt: redemption.redeemedAt,
        userId: redemption.userId,
      }));
    }

    if (
      title.toLowerCase().includes("user") ||
      title.toLowerCase().includes("contributor")
    ) {
      return users.slice(0, 20).map((user) => ({
        id: user.id,
        email: user.email,
        totalContribution: user.totalContribution,
        redemptionsCount: user.redemptionsCount,
        campaignsSupported: user.campaignsSupported,
        lastActive: user.lastActive,
        created: user.createdAt,
      }));
    }

    if (title.toLowerCase().includes("project")) {
      return projects.map((project) => ({
        id: project.id,
        name: project.name,
        status: project.status,
        fundingGoal: project.fundingGoal,
        fundingRaised: project.fundingRaised,
        peopleHelped: project.impactMetrics.peopleHelped,
        waterProvided: project.impactMetrics.waterProvided,
        location: project.impactMetrics.location,
        created: project.createdAt,
      }));
    }

    // Default mock data
    return [
      { id: "1", name: "Sample Item 1", value: 100, status: "active" },
      { id: "2", name: "Sample Item 2", value: 200, status: "completed" },
      { id: "3", name: "Sample Item 3", value: 150, status: "pending" },
    ];
  }, [campaigns, redemptions, users, projects, title]);

  // Filter data based on search text
  const filteredData = useMemo(() => {
    if (!filterText || !filterable) return rawData;

    return rawData.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(filterText.toLowerCase())
      )
    );
  }, [rawData, filterText, filterable]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField || !sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredData, sortField, sortDirection, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatCellValue = (value: any, column: string): string => {
    if (value === null || value === undefined) {
      return "Not set";
    }

    // Check if this looks like a date column and format accordingly
    if (
      column.toLowerCase().includes("created") ||
      column.toLowerCase().includes("updated") ||
      column.toLowerCase().includes("date")
    ) {
      return formatDateSimple(value);
    }

    // Handle other data types
    if (typeof value === "number") {
      return value.toLocaleString();
    }

    return String(value);
  };
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "completed":
        return "primary";
      case "used":
        return "secondary";
      case "expired":
        return "danger";
      case "draft":
        return "warning";
      case "pending":
        return "info";
      default:
        return "secondary";
    }
  };

  const getColumnLabel = (column: string) => {
    return column
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  if (loading) {
    return (
      <div className="widget-container">
        <div className="widget-header">
          <h5 className="widget-title">{title}</h5>
        </div>
        <div className="loading-spinner">
          <i className="bi-arrow-clockwise"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      <div className="widget-header">
        <h5 className="widget-title">{title}</h5>
        <div className="widget-actions">
          <button className="widget-action" title="Refresh">
            <i className="bi-arrow-clockwise"></i>
          </button>
          <button className="widget-action" title="Export">
            <i className="bi-download"></i>
          </button>
          <button className="widget-action drag-handle" title="Drag to move">
            <i className="bi-grip-vertical"></i>
          </button>
        </div>
      </div>

      {filterable && (
        <div className="table-controls mb-3">
          <InputGroup size="sm">
            <InputGroup.Text>
              <i className="bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </InputGroup>
        </div>
      )}

      <div className="table-responsive">
        <Table striped hover size="sm" className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className={`${sortable ? "sortable" : ""} ${
                    sortable && sortField === column ? "sorted" : ""
                  }`}
                  onClick={() => sortable && handleSort(column)}
                >
                  {getColumnLabel(column)}
                  {sortable && sortField === column && (
                    <i
                      className={`bi-arrow-${
                        sortDirection === "asc" ? "up" : "down"
                      } ms-1`}
                    ></i>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={String(row.id) || index}>
                {columns.map((column) => (
                  <td key={column}>{formatCellValue(row[column], column)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="table-pagination mt-3 d-flex justify-content-between align-items-center">
          <div className="pagination-info">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>
          <div className="pagination-controls">
            <Button
              size="sm"
              variant="outline-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="me-1"
            >
              <i className="bi-chevron-left"></i>
            </Button>
            <span className="pagination-current mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="ms-1"
            >
              <i className="bi-chevron-right"></i>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
