"use client";

import type React from "react";
import styles from "./ShareH2All.module.css";

const ShareH2All: React.FC = () => {
  return (
    <div className={styles.container}>
      <a 
        href="https://h2all.com"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.shareButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#B63A1D";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#D34722";
        }}
      >
        Share H2ALL
      </a>
    </div>
  );
};

export default ShareH2All;