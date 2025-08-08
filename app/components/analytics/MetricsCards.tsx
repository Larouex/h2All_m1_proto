"use client";

import React from "react";
import { Row, Col } from "react-bootstrap";
import { useAnalytics } from "@/context/AnalyticsContext";

export default function MetricsCards() {
  const { metrics, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="metrics-section">
        <Row className="metrics-row">
          {[1, 2, 3, 4].map((i) => (
            <Col key={i} md={3} sm={6} className="mb-3">
              <div className="metric-card">
                <div className="loading-spinner">
                  <i className="bi-arrow-clockwise"></i>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  const formatValue = (value: number, type: string) => {
    if (type === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    }
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="metrics-section">
      <Row className="metrics-row">
        {Object.entries(metrics).map(([key, metric]) => (
          <Col key={key} md={3} sm={6} className="mb-3">
            <div className="metric-card fade-in">
              <div className="metric-header">
                <h6 className="metric-title">{metric.label}</h6>
                <div className={`metric-icon ${metric.color}`}>
                  <i className={metric.icon}></i>
                </div>
              </div>

              <div className="metric-value">
                {formatValue(
                  metric.value,
                  key === "fundingRaised" ? "currency" : "number"
                )}
              </div>

              <div className={`metric-change ${metric.changeType}`}>
                <i
                  className={`bi-arrow-${
                    metric.changeType === "positive"
                      ? "up"
                      : metric.changeType === "negative"
                      ? "down"
                      : "right"
                  }`}
                ></i>
                {formatChange(metric.change)}
                <span className="ms-1 text-muted">vs last period</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
