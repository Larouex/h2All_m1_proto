import CampaignProgress from "@/app/components/CampaignProgress";
import MyImpact from "@/app/components/MyImpact";
import styles from "./CampaignWithImpact.module.css";

export default function CampaignWithImpact({ className = "" }) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div
        className={styles.campaignProgressNoBottomRadius}
        style={{ marginBottom: 0, paddingBottom: 0 }}
      >
        <CampaignProgress />
      </div>
      <div
        className={styles.impactSection}
        style={{ marginTop: 0, paddingTop: 0 }}
      >
        <MyImpact />
      </div>
    </div>
  );
}
