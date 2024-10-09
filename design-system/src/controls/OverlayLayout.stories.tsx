import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import OverlayLayout, { OverlayLayoutProps } from "./OverlayLayout";
import { Default as VisMovementVerticalStory1 } from "./VisMovementVertical.stories";
import { Overflowing as VisMovementLateralStory1 } from "./VisMovementLateral.stories";
import { Default as WinCountStory1 } from "./WinCount.stories";
import { Default as StreakCountStory1 } from "./StreakCount.stories";
import { Default as CalendarStory1 } from "./Calendar.stories";

const meta: Meta<OverlayLayoutProps> = {
  title: "Components/Controls/OverlayLayout",
  component: OverlayLayout,
  argTypes: {},
  render: (args: OverlayLayoutProps) => (
    <OverlayLayout {...args}
    ></OverlayLayout>
  ),
};

export default meta;

type Story = StoryObj<OverlayLayoutProps & { content: string }>;

export const Layout1: Story = {
  args: {
    ...VisMovementVerticalStory1.args,
    ...VisMovementLateralStory1.args,
    ...WinCountStory1.args,
    ...StreakCountStory1.args,
    ...CalendarStory1.args,
  },
};
