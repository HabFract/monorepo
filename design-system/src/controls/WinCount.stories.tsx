import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import WinCount, { WinCountProps } from "./WinCount";

const meta: Meta<WinCountProps> = {
  title: "Components/Controls/WinCount",
  component: WinCount,
  argTypes: {},
  render: (args: any) => (
    <WinCount 
    ></WinCount>
  ),
};

export default meta;

type Story = StoryObj<WinCountProps & { content: string }>;

export const Default: Story = {
  args: {},
};
