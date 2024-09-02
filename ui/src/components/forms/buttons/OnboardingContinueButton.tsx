import React, { FC } from 'react';
import { Button } from 'habit-fract-design-system';
import { getNextOnboardingState } from '../../header/OnboardingHeader';

interface OnboardingContinueProps {
  state: any;
  transition: (state: string) => void;
}

const OnboardingContinue: FC<OnboardingContinueProps> = ({ state, transition }) => {
  return (
    <Button
      loading={false}
      type={"onboarding"}
      onClick={() => transition(getNextOnboardingState(state))}
    >
      Save & Continue
    </Button>
  );
};

export default OnboardingContinue;