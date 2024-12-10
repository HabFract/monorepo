import React from "react";
import "./common.css";
import { Steps } from "antd";
import { getIconSvg } from "../icons/icons";

/**
 * Props for the ProgressBar component
 * @typedef {Object} ProgressBarProps
 * @property {number} currentStep - The current active step (zero-based index)
 * @property {string[]} stepNames - Array of step names to display in the progress bar
 */
export interface ProgressBarProps {
  currentStep: number;
  stepNames: string[];
}

/**
 * A horizontal progress bar component for onboarding flows
 * Uses Ant Design Steps component to display progress through a multi-step process
 * 
 * @component
 * @param {ProgressBarProps} props - Component props
 * @param {number} props.currentStep - The current active step (zero-based index)
 * @param {string[]} props.stepNames - Array of step names to display in the progress bar
 * @returns {JSX.Element} Rendered progress bar component
 * 
 * @example
 * ```tsx
 * <ProgressBar
 *   currentStep={2}
 *   stepNames={["Start", "Configure", "Review", "Complete"]}
 * />
 * ```
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  stepNames,
}: ProgressBarProps) => {
  return (
    <Steps
      className={`onboarding-progress progress-${currentStep}`}
      direction={"horizontal"}
      current={currentStep}
      items={stepNames.map((stepName) => ({
        subTitle: stepName,
        icon: stepNames.findIndex(step => step == stepName) < currentStep && getIconSvg('tick')({})
      }))}
    />
  );
};

export default ProgressBar;
