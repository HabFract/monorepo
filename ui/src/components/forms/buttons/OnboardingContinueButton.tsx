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
    <div className="onboarding-continue">
      <Button loading={props.loading} type={"submit"} variant={"primary"} onClick={onClick} {...props}>
        Save & Continue
      </Button>
    </div>
  );
};

export default OnboardingContinue;
