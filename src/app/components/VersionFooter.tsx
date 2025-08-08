"use client";

import styles from "./VersionFooter.module.css";

export default function VersionFooter() {
  // Get current build info
  const version = "1.0.0";
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

  return (
    <div className="text-center py-2 mt-4">
      <small className={`text-white ${styles.versionText}`}>
        v{version} • {build} • {buildDate} {buildTime}
      </small>
    </div>
  );
}
