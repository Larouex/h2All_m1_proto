"use client";

import React from "react";
import { DateRange } from "@/types/analytics";

interface MetricWidgetProps {
  title: string;
  config: Record<string, string | number | boolean | object>;
  dateRange: DateRange;
}

export default function MetricWidget({ title, config }: MetricWidgetProps) {
  const value = config.value as number;
  const unit = config.unit as string;
  const change = config.change as number;
  const icon = config.icon as string;
  const color = config.color as string;

  const formatValue = (val: number, unitStr?: string) => {
    if (unitStr === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(val);
    }

    if (unitStr === "percentage") {
      return `${val.toFixed(1)}%`;
    }

    const formatted = new Intl.NumberFormat("en-US").format(val);
    return unitStr ? `${formatted} ${unitStr}` : formatted;
  };

  const formatChange = (changeVal: number) => {
    const sign = changeVal >= 0 ? "+" : "";
    return `${sign}${changeVal.toFixed(1)}%`;
  };

  const getChangeType = (changeVal?: number) => {
    if (changeVal === undefined) return "neutral";
    if (changeVal > 0) return "positive";
    if (changeVal < 0) return "negative";
    return "neutral";
  };

  const getChangeIcon = (changeVal?: number) => {
    if (changeVal === undefined) return "bi-dash";
    if (changeVal > 0) return "bi-arrow-up";
    if (changeVal < 0) return "bi-arrow-down";
    return "bi-dash";
  };

  return (
    <div className="widget-container metric-widget">
      <div className="widget-header">
        <h5 className="widget-title">{title}</h5>
        <div className="widget-actions">
          <button className="widget-action" title="Refresh">
            <i className="bi-arrow-clockwise"></i>
          </button>
          <button className="widget-action drag-handle" title="Drag to move">
            <i className="bi-grip-vertical"></i>
          </button>
        </div>
      </div>

      <div className="metric-widget-content">
        <div className="metric-widget-header">
          {icon && (
            <div className={`metric-widget-icon ${color || "primary"}`}>
              <i className={icon}></i>
            </div>
          )}
        </div>

        <div className="metric-widget-value">{formatValue(value, unit)}</div>

        {change !== undefined && (
          <div className={`metric-widget-change ${getChangeType(change)}`}>
            <i className={getChangeIcon(change)}></i>
            <span>{formatChange(change)}</span>
            <span className="change-period">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}
