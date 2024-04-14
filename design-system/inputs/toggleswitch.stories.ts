import { Meta, StoryObj } from '@storybook/react';
import ToggleSwitch from "./toggle-switch";

export interface ToggleSwitchProps {
  errored: boolean;
  disabled: boolean;
  id: string;
  label: string;
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
    label: "Select?",
    disabled: false,
  },
};