
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
      className={`onboarding-progress progress-${currentStep}`}
      direction={'horizontal'}
      current={currentStep}
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