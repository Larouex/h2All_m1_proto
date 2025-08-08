"use client";

import React, { useState, useMemo } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { DateRange, WidgetConfig } from "@/types/analytics";
import ChartWidget from "./widgets/ChartWidget";
import TableWidget from "./widgets/TableWidget";
import MetricWidget from "./widgets/MetricWidget";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  activeSection: string;
  dateRange: DateRange;
}

export default function DashboardGrid({
  activeSection,
  dateRange,
}: DashboardGridProps) {
  // Default layouts for different sections
  const getDefaultLayouts = (section: string): WidgetConfig[] => {
    switch (section) {
      case "overview":
        return [
          {
            id: "campaigns-over-time",
            type: "chart",
            title: "Campaigns Over Time",
            size: "large",
            position: { x: 0, y: 0, w: 8, h: 4 },
            config: {
              chartType: "line",
              dataKey: "campaigns",
              colors: ["#0066cc"],
            },
          },
          {
            id: "funding-breakdown",
            type: "chart",
            title: "Funding Breakdown",
            size: "medium",
            position: { x: 8, y: 0, w: 4, h: 4 },
            config: {
              chartType: "pie",
              dataKey: "funding",
              colors: ["#0066cc", "#00a3e0", "#28a745", "#ffc107"],
            },
          },
          {
            id: "recent-campaigns",
            type: "table",
            title: "Recent Campaigns",
            size: "large",
            position: { x: 0, y: 4, w: 12, h: 4 },
            config: {
              columns: ["title", "goal", "raised", "backers", "status"],
              sortable: true,
              filterable: true,
            },
          },
        ];

      case "campaigns":
        return [
          {
            id: "campaign-performance",
            type: "chart",
            title: "Campaign Performance",
            size: "large",
            position: { x: 0, y: 0, w: 12, h: 4 },
            config: {
              chartType: "bar",
              dataKey: "performance",
              colors: ["#0066cc", "#28a745"],
            },
          },
          {
            id: "campaign-status",
            type: "chart",
            title: "Campaign Status Distribution",
            size: "medium",
            position: { x: 0, y: 4, w: 6, h: 3 },
            config: {
              chartType: "donut",
              dataKey: "status",
              colors: ["#28a745", "#0066cc", "#ffc107"],
            },
          },
          {
            id: "top-campaigns",
            type: "table",
            title: "Top Performing Campaigns",
            size: "medium",
            position: { x: 6, y: 4, w: 6, h: 3 },
            config: {
              columns: ["title", "raised", "backers"],
              sortable: true,
            },
          },
        ];

      case "impact":
        return [
          {
            id: "water-impact",
            type: "metric",
            title: "Water Impact",
            size: "medium",
            position: { x: 0, y: 0, w: 3, h: 2 },
            config: {
              value: 325000,
              unit: "liters",
              change: 15.2,
              icon: "bi-droplet",
            },
          },
          {
            id: "people-helped",
            type: "metric",
            title: "People Helped",
            size: "medium",
            position: { x: 3, y: 0, w: 3, h: 2 },
            config: {
              value: 2050,
              unit: "people",
              change: 23.1,
              icon: "bi-people",
            },
          },
          {
            id: "impact-timeline",
            type: "chart",
            title: "Impact Over Time",
            size: "large",
            position: { x: 6, y: 0, w: 6, h: 4 },
            config: {
              chartType: "area",
              dataKey: "impact",
              colors: ["#00a3e0", "#28a745"],
            },
          },
          {
            id: "project-locations",
            type: "table",
            title: "Project Locations",
            size: "large",
            position: { x: 0, y: 4, w: 12, h: 3 },
            config: {
              columns: ["location", "waterProvided", "peopleHelped", "status"],
            },
          },
        ];

      case "users":
        return [
          {
            id: "user-growth",
            type: "chart",
            title: "User Growth",
            size: "large",
            position: { x: 0, y: 0, w: 8, h: 4 },
            config: {
              chartType: "line",
              dataKey: "users",
              colors: ["#ffc107"],
            },
          },
          {
            id: "user-engagement",
            type: "chart",
            title: "User Engagement",
            size: "medium",
            position: { x: 8, y: 0, w: 4, h: 4 },
            config: {
              chartType: "bar",
              dataKey: "engagement",
              colors: ["#17a2b8"],
            },
          },
          {
            id: "top-contributors",
            type: "table",
            title: "Top Contributors",
            size: "large",
            position: { x: 0, y: 4, w: 12, h: 4 },
            config: {
              columns: [
                "email",
                "totalContribution",
                "campaignsSupported",
                "lastActive",
              ],
            },
          },
        ];

      case "redemptions":
        return [
          {
            id: "redemption-trends",
            type: "chart",
            title: "Redemption Trends",
            size: "large",
            position: { x: 0, y: 0, w: 12, h: 4 },
            config: {
              chartType: "line",
              dataKey: "redemptions",
              colors: ["#28a745", "#dc3545"],
            },
          },
          {
            id: "redemption-status",
            type: "chart",
            title: "Redemption Status",
            size: "medium",
            position: { x: 0, y: 4, w: 6, h: 3 },
            config: {
              chartType: "pie",
              dataKey: "status",
              colors: ["#28a745", "#ffc107", "#dc3545"],
            },
          },
          {
            id: "recent-redemptions",
            type: "table",
            title: "Recent Redemptions",
            size: "medium",
            position: { x: 6, y: 4, w: 6, h: 3 },
            config: {
              columns: ["code", "value", "status", "redeemedAt"],
            },
          },
        ];

      case "projects":
        return [
          {
            id: "project-funding",
            type: "chart",
            title: "Project Funding Progress",
            size: "large",
            position: { x: 0, y: 0, w: 12, h: 4 },
            config: {
              chartType: "bar",
              dataKey: "funding",
              colors: ["#0066cc", "#00a3e0"],
            },
          },
          {
            id: "project-impact",
            type: "chart",
            title: "Project Impact Metrics",
            size: "medium",
            position: { x: 0, y: 4, w: 6, h: 3 },
            config: {
              chartType: "area",
              dataKey: "impact",
              colors: ["#28a745"],
            },
          },
          {
            id: "project-status",
            type: "table",
            title: "Project Status Overview",
            size: "medium",
            position: { x: 6, y: 4, w: 6, h: 3 },
            config: {
              columns: ["name", "status", "fundingRaised", "peopleHelped"],
            },
          },
        ];

      default:
        return [];
    }
  };

  const [widgets, setWidgets] = useState<WidgetConfig[]>(() =>
    getDefaultLayouts(activeSection)
  );

  // Update widgets when section changes
  React.useEffect(() => {
    setWidgets(getDefaultLayouts(activeSection));
  }, [activeSection]);

  // Convert widgets to react-grid-layout format
  const layouts = useMemo(() => {
    const layout: Layout[] = widgets.map((widget) => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      minW: 2,
      minH: 2,
      maxH: 6,
    }));

    return {
      lg: layout,
      md: layout,
      sm: layout.map((item) => ({ ...item, w: Math.min(item.w, 12) })),
      xs: layout.map((item) => ({ ...item, w: 12, h: Math.max(item.h, 3) })),
    };
  }, [widgets]);

  const handleLayoutChange = (currentLayout: Layout[]) => {
    const updatedWidgets = widgets.map((widget) => {
      const layoutItem = currentLayout.find((item) => item.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          position: {
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          },
        };
      }
      return widget;
    });
    setWidgets(updatedWidgets);
  };

  const renderWidget = (widget: WidgetConfig) => {
    const commonProps = {
      key: widget.id,
      title: widget.title,
      config: widget.config,
      dateRange,
    };

    switch (widget.type) {
      case "chart":
        return <ChartWidget {...commonProps} />;
      case "table":
        return <TableWidget {...commonProps} />;
      case "metric":
        return <MetricWidget {...commonProps} />;
      default:
        return (
          <div className="widget-container">
            <div className="widget-header">
              <h5 className="widget-title">{widget.title}</h5>
            </div>
            <div className="error-state">
              <i className="bi-exclamation-triangle"></i>
              <div className="error-message">
                Unknown widget type: {widget.type}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-grid">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 1 }}
        rowHeight={60}
        margin={[16, 16]}
        onLayoutChange={handleLayoutChange}
        isDraggable={true}
        isResizable={true}
        useCSSTransforms={true}
        preventCollision={false}
        compactType="vertical"
      >
        {widgets.map(renderWidget)}
      </ResponsiveGridLayout>
    </div>
  );
}
