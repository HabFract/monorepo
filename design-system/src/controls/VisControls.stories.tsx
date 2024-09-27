import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import VisControls, { VisControlsProps } from "./VisControls";

const meta: Meta<VisControlsProps> = {
  title: "Components/Navigation/VisControls",
  component: VisControls,
  argTypes: {},
  render: (args: any) => <VisControls {...args}></VisControls>,
};

export default meta;

type Story = StoryObj<VisControlsProps & { content: string }>;

export const Default: Story = {
  args: {},
};
