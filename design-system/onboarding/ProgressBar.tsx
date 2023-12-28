
import React from 'react';
import './common.css';
import { Steps } from 'antd';

type ProgressBarProps = {
  currentStep: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }: ProgressBarProps) => {

  return (
    <Steps
      className={"onboarding-progress"}
      direction={'horizontal'}
      current={currentStep - 1}
      items={[
        {
          subTitle: 'Profile',
        },
        {
          subTitle: 'Sphere',
        },
        {
          subTitle: 'Orbit',
        },
        {
          subTitle: 'Visualise',
        },
      ]}
    />
  )
}

export default ProgressBar;