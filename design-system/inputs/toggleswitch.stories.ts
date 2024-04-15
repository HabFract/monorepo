import { Meta, StoryObj } from '@storybook/react';
import ToggleSwitch from "./toggle-switch";

export interface ToggleSwitchProps {
  errored: boolean;
  disabled: boolean;
  id: string;
  labelValue: string;
  size: "sm" | "md" | "lg";
}

const meta: Meta<ToggleSwitchProps> = {
  title: "Components/Input/ToggleSwitch",
  component: ToggleSwitch,
  argTypes: {
  },
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