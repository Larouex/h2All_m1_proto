import React from "react";
import "./FundingProgress.css";

interface FundingProgressProps {
  currentAmount?: number;
  targetAmount?: number;
  unit?: string; // e.g., "Gallons", "Dollars", "Liters"
  title?: string;
  className?: string;
}

const FundingProgress: React.FC<FundingProgressProps> = ({
  currentAmount = 800,
  targetAmount = 20000,
  unit = "Gallons",
  title = "Funding Progress",
  className = "",
}) => {
  const progressPercentage = Math.min(
    (currentAmount / targetAmount) * 100,
    100
  );

  return (
    <div className={`funding-progress-container ${className}`}>
      <div className="funding-progress-header">
        <h5 className="funding-progress-title">{title}</h5>
      </div>

      <div className="funding-progress-bar-wrapper">
        <div className="funding-progress-bar-background">
          <div
            className="funding-progress-bar-fill"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-label={`${progressPercentage.toFixed(1)} percent funded`}
            aria-valuenow={Math.round(progressPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className="funding-progress-stats">
        <span className="funding-progress-percentage">
          {progressPercentage.toFixed(1)}% Funded
        </span>
        <span className="funding-progress-target">
          Target: {targetAmount.toLocaleString()} {unit}
        </span>
      </div>
    </div>
  );
};

export default FundingProgress;
