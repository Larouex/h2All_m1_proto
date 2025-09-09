import type React from "react";
import Image from "next/image";
import styles from "./CleanWaterImpact.module.css";

interface CleanWaterImpactProps {
  className?: string;
}

export const CleanWaterImpact: React.FC<CleanWaterImpactProps> = ({ className }) => {
  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* About Section */}
      <div className={styles.aboutSection}>
        <h3 className={styles.title}>About Kodema Village</h3>

        <div className={styles.textContent}>
          <p className={styles.paragraph}>
            Kodema Village, located in the Busia District of Uganda, is home
            to over 5,000 people. Today, the only available water source in
            Kodema is a shallow, unprotected well—a place where animals and
            humans share the same water.
          </p>
          <p className={styles.paragraph}>
            This contaminated source is causing widespread waterborne illnesses,
            affecting children, families, and the future of the community.
          </p>
        </div>
      </div>

      {/* Bottom Image */}
      <div className={styles.imageContainer}>
        <Image
          src="/children-with-buckets.png"
          alt="Children with water buckets in Kodema Village"
          width={700}
          height={525}
          className={styles.bottomImage}
        />
      </div>
    </div>
  );
}

export default CleanWaterImpact
