import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import StreakCount, { StreakCountProps } from "./StreakCount";

const meta: Meta<StreakCountProps> = {
  title: "Components/Controls/StreakCount",
  component: StreakCount,
  argTypes: {},
  render: (args: any) => (
    <StreakCount 
    ></StreakCount>
  ),
};

export default meta;

type Story = StoryObj<StreakCountProps & { content: string }>;

export const Default: Story = {
  args: {},
};
