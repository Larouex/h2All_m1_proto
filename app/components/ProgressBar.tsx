import React from "react";
import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  /** Total number of steps */
  totalSteps: number;
  /** Current active step (1-based index) */
  currentStep: number;
  /** Additional CSS class name */
  className?: string;
}

/**
 * ProgressBar component for displaying step-based progress
 *
 * @param totalSteps - Total number of steps in the process
 * @param currentStep - Current active step (1-based, so step 1 is the first step)
 * @param className - Optional additional CSS class
 *
 * @example
 * // Show 5 steps with step 3 currently active
 * <ProgressBar totalSteps={5} currentStep={3} />
 *
 * @example
 * // Show 3 steps with step 1 currently active
 * <ProgressBar totalSteps={3} currentStep={1} />
 */
export default function ProgressBar({
  totalSteps,
  currentStep,
  className = "",
}: ProgressBarProps) {
  // Validate props
  const validTotalSteps = Math.max(1, Math.floor(totalSteps));
  const validCurrentStep = Math.max(
    1,
    Math.min(validTotalSteps, Math.floor(currentStep))
  );

  return (
    <div className={`${styles.progressContainer} ${className}`}>
      {[...Array(validTotalSteps)].map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= validCurrentStep;

        return (
          <div
            key={index}
            className={`${styles.progressDot} ${
              isActive ? styles.progressDotActive : styles.progressDotInactive
            }`}
            aria-label={`Step ${stepNumber} of ${validTotalSteps}${
              isActive ? " (completed)" : ""
            }`}
          />
        );
      })}
    </div>
  );
}
