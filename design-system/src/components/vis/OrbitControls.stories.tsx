import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import OrbitControls, { OrbitControlsProps } from "./OrbitControls";

const meta: Meta<OrbitControlsProps> = {
  title: "Components/Vis/OrbitControls",
  component: OrbitControls,
  argTypes: {},
  render: (args: OrbitControlsProps) => (
    <OrbitControls {...args}
    />
  ),
};

export default meta;

type Story = StoryObj<OrbitControlsProps>;

export const Default: Story = {
  args: {
    handleAppendNode: () => console.log("handleAppendNode"),
    handleEdit: () => console.log("handleEdit")
  },
};

