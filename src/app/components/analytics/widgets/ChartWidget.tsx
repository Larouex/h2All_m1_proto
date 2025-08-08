"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DateRange } from "@/types/analytics";
import { useAnalytics } from "@/context/AnalyticsContext";

interface ChartWidgetProps {
  title: string;
  config: Record<string, string | number | boolean | object>;
  dateRange: DateRange;
}

export default function ChartWidget({
  title,
  config,
  dateRange,
}: ChartWidgetProps) {
  const { loading } = useAnalytics();

  // Generate mock chart data based on the dataKey
  const chartData = useMemo(() => {
    const chartType = config.chartType as string;
    const dataKey = config.dataKey as string;

    const generateTimeSeriesData = (days: number = 30) => {
      const data: Array<{
        date: string;
        value: number;
        value2: number;
        name: string;
      }> = [];
      const endDate = dateRange.endDate;

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);

        let value = 0;
        let value2 = 0;

        switch (dataKey) {
          case "campaigns":
            value = Math.floor(Math.random() * 5) + 1;
            break;
          case "users":
            value = Math.floor(Math.random() * 50) + 20;
            break;
          case "redemptions":
            value = Math.floor(Math.random() * 30) + 10;
            value2 = Math.floor(Math.random() * 5) + 1;
            break;
          case "funding":
            value = Math.floor(Math.random() * 1000) + 500;
            break;
          case "impact":
            value = Math.floor(Math.random() * 1000) + 500;
            value2 = Math.floor(Math.random() * 50) + 20;
            break;
          case "performance":
            value = Math.floor(Math.random() * 80) + 20;
            value2 = Math.floor(Math.random() * 100) + 50;
            break;
          case "engagement":
            value = Math.floor(Math.random() * 60) + 40;
            break;
          default:
            value = Math.floor(Math.random() * 100);
        }

        data.push({
          date: date.toLocaleDateString(),
          value,
          value2,
          name: date.toLocaleDateString(),
        });
      }

      return data;
    };

    const generateCategoryData = () => {
      switch (dataKey) {
        case "funding":
          return [
            { name: "Water Wells", value: 15000, percentage: 45 },
            { name: "Emergency Relief", value: 8000, percentage: 24 },
            { name: "Education Programs", value: 7000, percentage: 21 },
            { name: "Infrastructure", value: 3500, percentage: 10 },
          ];
        case "status":
          if (title.includes("Campaign")) {
            return [
              { name: "Active", value: 12, percentage: 50 },
              { name: "Completed", value: 8, percentage: 33 },
              { name: "Draft", value: 4, percentage: 17 },
            ];
          } else {
            return [
              { name: "Active", value: 1200, percentage: 65 },
              { name: "Used", value: 450, percentage: 24 },
              { name: "Expired", value: 197, percentage: 11 },
            ];
          }
        default:
          return [];
      }
    };

    if (chartType === "pie" || chartType === "donut") {
      return generateCategoryData();
    }

    return generateTimeSeriesData();
  }, [config.dataKey, config.chartType, dateRange, title]);

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

  const renderChart = () => {
    const chartType = config.chartType as string;
    const colors = config.colors as string[];

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...commonProps}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-color)"
              />
              <XAxis
                dataKey="date"
                stroke="var(--text-secondary)"
                fontSize={12}
              />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                name="Primary"
              />
              {chartData[0] &&
                "value2" in chartData[0] &&
                chartData[0].value2 !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="value2"
                    stroke={colors[1] || colors[0]}
                    strokeWidth={2}
                    dot={{ fill: colors[1] || colors[0], strokeWidth: 2, r: 4 }}
                    name="Secondary"
                  />
                )}
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...commonProps}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-color)"
              />
              <XAxis
                dataKey="date"
                stroke="var(--text-secondary)"
                fontSize={12}
              />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stackId="1"
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
                name="Primary"
              />
              {chartData[0] &&
                "value2" in chartData[0] &&
                chartData[0].value2 !== undefined && (
                  <Area
                    type="monotone"
                    dataKey="value2"
                    stackId="1"
                    stroke={colors[1] || colors[0]}
                    fill={colors[1] || colors[0]}
                    fillOpacity={0.3}
                    name="Secondary"
                  />
                )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...commonProps}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-color)"
              />
              <XAxis
                dataKey="date"
                stroke="var(--text-secondary)"
                fontSize={12}
              />
              <YAxis stroke="var(--text-secondary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                }}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill={colors[0]}
                name="Primary"
                radius={[2, 2, 0, 0]}
              />
              {chartData[0] &&
                "value2" in chartData[0] &&
                chartData[0].value2 !== undefined && (
                  <Bar
                    dataKey="value2"
                    fill={colors[1] || colors[0]}
                    name="Secondary"
                    radius={[2, 2, 0, 0]}
                  />
                )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
      case "donut":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={chartType === "donut" ? 60 : 0}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  color: "var(--text-primary)",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="error-state">
            <i className="bi-exclamation-triangle"></i>
            <div className="error-message">
              Unsupported chart type: {chartType}
            </div>
          </div>
        );
    }
  };

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
      <div className="chart-container">{renderChart()}</div>
    </div>
  );
}
