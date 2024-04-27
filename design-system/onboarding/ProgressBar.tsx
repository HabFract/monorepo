
import React from 'react';
import './common.css';
import { Steps } from 'antd';

export type ProgressBarProps = {
  currentStep: any;
  stepNames: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, stepNames }: ProgressBarProps) => {

  return (
    <Steps
      className={"onboarding-progress"}
      direction={'horizontal'}
      current={currentStep - 1}
      items={stepNames.map(stepName => (
        {
          subTitle: stepName,
        }
      ))
      }
    />
  )
}

export default ProgressBar;