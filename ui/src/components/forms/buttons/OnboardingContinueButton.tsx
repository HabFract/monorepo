import React, { FC } from 'react';
import { Button } from 'habit-fract-design-system';

interface OnboardingContinueProps {
  onClick: () => void;
}

const OnboardingContinue: FC<OnboardingContinueProps> = ({ onClick }) => {
  return (
    <Button
      loading={false}
      type={"onboarding"}
      onClick={onClick}
    >
      Save & Continue
    </Button>
  );
};

export default OnboardingContinue;