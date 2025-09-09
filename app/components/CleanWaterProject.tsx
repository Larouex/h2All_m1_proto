import type React from "react";
import FundingProgress from "@/app/components/FundingProgress";
import styles from "./CleanWaterProject.module.css";

interface CleanWaterProjectProps {
  villageName?: string;
  goal?: string;
  amountRaised?: number;
  targetAmount?: number;
  claimedBottles?: number;
  contribution?: number;
  lastClaimDate?: string;
  backgroundImage?: string;
}

const CleanWaterProject: React.FC<CleanWaterProjectProps> = ({
  villageName = "Kodema Village",
  goal = "Access to safe and clean water eliminating waterborne illness.",
  amountRaised = 1261.75,
  targetAmount = 20000,
  claimedBottles = 66,
  contribution = 3.3,
  lastClaimDate = "9/7/2025",
  backgroundImage = "/track-top.png",
}) => {
  const progressPercentage = (amountRaised / targetAmount) * 100;

  return (
    <div className={styles.container}>
      {/* Background Image */}
      <div
        className={styles.backgroundImage}
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        {/* Hero Text Overlay */}
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            Thanks for your help to bring clean water to {villageName}.
          </h1>
        </div>
      </div>

      {/* Main Content Card */}
      <div className={styles.contentCard}>
        {/* Project Info Section */}
        <div className={styles.projectInfo}>
          <h2 className={styles.villageName}>{villageName}</h2>
          <p className={styles.goalText}>Our goal: {goal}</p>

          {/* Fundraising Progress */}
          <div className={styles.fundraisingSection}>
            {/* Progress Bar */}
            <FundingProgress />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanWaterProject;
