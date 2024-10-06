import React, { FC } from "react";
import { Button } from "habit-fract-design-system";

interface OnboardingContinueProps {
  onClick: () => void;
  touched?: object,
  errors?: object,
  loading?: boolean,
}

const OnboardingContinue: FC<OnboardingContinueProps> = ({ onClick, ...props }) => {
  return (
    <Button loading={false} type={"onboarding"} onClick={onClick} {...props}>
      Save & Continue
    </Button>
  );
};

export default OnboardingContinue;
