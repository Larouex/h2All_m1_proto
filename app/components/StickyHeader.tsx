"use client";

import React from "react";
import Image from "next/image";
import styles from "./StickyHeader.module.css";

type StickyHeaderProps = {
  className?: string;
  right?: React.ReactNode;
};

export default function StickyHeader({
  className = "",
  right,
}: StickyHeaderProps) {
  return (
    <div
      className={`${styles.root} ${className}`}
      aria-label="H2ALL WATER header"
    >
      <div className={styles.inner}>
        <div className={styles.container}>
          <Image
            src="/h2all-header-logo.png"
            alt="H2ALL WATER"
            className={styles.logo}
            width={97}
            height={25}
            priority
          />
          {right && <div className={styles.right}>{right}</div>}
        </div>
      </div>
    </div>
  );
}
