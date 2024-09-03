import React, { FC } from 'react';
import { Button } from 'habit-fract-design-system';

interface HomeContinueProps {
  onClick: () => void;
}

const HomeContinue: FC<HomeContinueProps> = ({ onClick }) => {
  return (
    <Button type={"onboarding"} onClick={onClick}>
      Start Tracking Habits
    </Button>
  );
};

export default HomeContinue;