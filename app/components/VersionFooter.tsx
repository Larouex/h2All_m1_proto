"use client";

import { useState, useEffect } from "react";
import styles from "./VersionFooter.module.css";

export default function VersionFooter() {
  const [buildInfo, setBuildInfo] = useState({
    version: "1.0.0",
    build: "loading...",
    buildDate: "",
    buildTime: "",
  });

  useEffect(() => {
    // Only generate timestamps on client side to avoid hydration mismatch
    const build = process.env.NODE_ENV === "production" ? "prod" : "dev";
    const buildDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const buildTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    setBuildInfo({
      version: "1.0.0",
      build,
      buildDate,
      buildTime,
    });
  }, []);

  return (
    <div className="text-center py-2 mt-4">
      <small className={`text-white ${styles.versionText}`}>
        v{buildInfo.version} • {buildInfo.build} • {buildInfo.buildDate}{" "}
        {buildInfo.buildTime}
      </small>
    </div>
  );
}
