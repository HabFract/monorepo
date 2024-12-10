import { Meta, StoryObj } from "@storybook/react";
import ToggleSwitch, { ToggleSwitchProps } from "./toggle-switch";

const meta: Meta<ToggleSwitchProps> = {
  title: "Components/Input/ToggleSwitch",
  component: ToggleSwitch,
  argTypes: {},
};

export default meta;

type Story = StoryObj<ToggleSwitchProps>;

export const Default: Story = {
  args: {
    id: "example",
    labelValue: "Select?",
    disabled: false,
  },
};

export const WithInfo: Story = {
  args: {
    id: "example",
    labelValue: "Select?",
    disabled: false,
    withInfo: true,
  },
};
