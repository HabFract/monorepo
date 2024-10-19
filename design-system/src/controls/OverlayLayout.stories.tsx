import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import OverlayLayout, { OverlayLayoutProps } from "./OverlayLayout";
import { Default as VisMovementVerticalStory1 } from "./VisMovementVertical.stories";
import { Overflowing as VisMovementLateralStory1 } from "./VisMovementLateral.stories";
import { Default as WinCountStory1 } from "./WinCount.stories";
import { Default as StreakCountStory1 } from "./StreakCount.stories";
import { Default as CalendarStory1 } from "./Calendar.stories";
import { Frequency } from "../generated-types";

const meta: Meta<OverlayLayoutProps> = {
  title: "Components/Controls/OverlayLayout",
  component: OverlayLayout,
  argTypes: {} as any,
  render: (args: OverlayLayoutProps) => (
    <OverlayLayout {...args} actions={{
      moveUp: () => console.log("Up"),
      moveDown: () => console.log("Down"),
      moveLeft: () => console.log("Left"),
      moveRight: () => console.log("Right"),
    }}
    ></OverlayLayout>
  ),
};

export default meta;

type Story = StoryObj<OverlayLayoutProps & { content: string }>;

export const Layout1: Story = {
  args: {
    ...VisMovementVerticalStory1.args,
    ...VisMovementLateralStory1.args,
    orbitFrequency: Frequency.DailyOrMore_1d,
    currentWins: 0,
    currentStreak: 2  ,
    ...CalendarStory1.args,
  },
};
