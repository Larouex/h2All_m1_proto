"use client";

import type React from "react";
import Image from "next/image";
import styles from "./ClaimedBottleSuccess.module.css";

const ClaimedBottleSuccess: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.successBox}>
        <Image
          src="/star.svg"
          alt="Star"
          width={20}
          height={20}
          className={styles.starIcon}
        />
        <span className={styles.message}>
          Your bottle has been claimed!
        </span>
      </div>
    </div>
  );
};

export default ClaimedBottleSuccess;