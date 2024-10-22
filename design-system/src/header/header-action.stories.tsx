import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import HeaderAction, { HeaderActionProps } from "./header-action";
import { getIconSvg } from "../icons/icons";

const meta: Meta<HeaderActionProps> = {
  title: "Components/Navigation/HeaderAction",
  component: HeaderAction,
  argTypes: {},
  render: (args: HeaderActionProps) => (
    <HeaderAction {...args} handlePrimaryAction={() => console.log("Handling primary action")} handleSecondaryAction={() => console.log("Handling secondary action")}
    />
  ),
};

export default meta;

type Story = StoryObj<HeaderActionProps & { content: string }>;

export const Default: Story = {
  args: {
    title: "Health & Fitness",
    icon1: getIconSvg('back'),
    icon2: getIconSvg('more')
  },
};
