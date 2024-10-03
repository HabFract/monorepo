import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import VisMovementVertical, { VisMovementVerticalProps } from "./VisMovementVertical";

const meta: Meta<VisMovementVerticalProps> = {
  title: "Components/Controls/VisMovementVertical",
  component: VisMovementVertical,
  argTypes: {},
  render: (args: any) => (
    <VisMovementVertical 
    ></VisMovementVertical>
  ),
};

export default meta;

type Story = StoryObj<VisMovementVerticalProps & { content: string }>;

export const Default: Story = {
  args: {},
};
