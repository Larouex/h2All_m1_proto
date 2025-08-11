"use client";

import React from "react";
import Image from "next/image";
import styles from "./StickyHeader.module.css";

type StickyHeaderProps = {
  className?: string;
};

export default function StickyHeader({ className = "" }: StickyHeaderProps) {
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
            width={280}
            height={70}
            priority
          />
        </div>
      </div>
    </div>
  );
}
