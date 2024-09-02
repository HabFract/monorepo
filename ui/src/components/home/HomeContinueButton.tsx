import React, { FC } from 'react';
import { Button } from 'habit-fract-design-system';

interface HomeContinueProps {
  state: any;
  transition: (state: string) => void;
}

const HomeContinue: FC<HomeContinueProps> = ({ state, transition }) => {
  return state.match('Home') && (
    <Button type={"onboarding"} onClick={() => transition("Onboarding1")}>
      Start Tracking Habits
    </Button>
  );
};

export default HomeContinue;