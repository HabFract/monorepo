import { Meta, StoryObj } from '@storybook/react';
import ToggleSwitch from "./toggle-switch";

export interface ToggleSwitchProps {
  errored: boolean;
  disabled: boolean;
  label: string;
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
    label: "Select?",
    disabled: false,
  },
};