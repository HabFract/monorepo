import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import OverlayLayout, { OverlayLayoutProps } from "./OverlayLayout";
import { Default as VisMovementVerticalStory1 } from "./VisMovementVertical.stories";
import { Overflowing as VisMovementLateralStory1 } from "./VisMovementLateral.stories";
import { Default as CalendarStory1 } from "./Calendar.stories";
import { Frequency, WinData } from "@ui/src/state";

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
    orbitFrequency: Frequency.DAILY_OR_MORE.DAILY,
    currentWins: {
      "20/10/2024": true,
      "21/10/2024": false,
      "22/10/2024": true,
    } as WinData<Frequency.Rationals>,
    currentStreak: 2,
    ...CalendarStory1.args,
  } as any,
};
