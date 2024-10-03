import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import VisMovementLateral, { VisMovementLateralProps } from "./VisMovementLateral";

const meta: Meta<VisMovementLateralProps> = {
  title: "Components/Controls/VisMovementLateral",
  component: VisMovementLateral,
  argTypes: {},
  render: (args: any) => (
    <VisMovementLateral 
    ></VisMovementLateral>
  ),
};

export default meta;

type Story = StoryObj<VisMovementLateralProps & { content: string }>;

export const Default: Story = {
  args: {},
};
