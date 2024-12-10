import { Meta, StoryObj } from "@storybook/react";
import Button, { ButtonProps } from "./Button";
import { getIconSvg } from "../icons/icons";

const meta: Meta<ButtonProps> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'warn', 'danger', 'neutral', 'onboarding', 'icon', 'circle-icon'],
    },
    isLoading: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
  },
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<ButtonProps>;

// Base Variants
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Warning: Story = {
  args: {
    variant: "warn",
    children: "Warning Button",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Danger Button",
  },
};

export const Neutral: Story = {
  args: {
    variant: "neutral",
    children: "Neutral Button",
  },
};

// States
export const Loading: Story = {
  args: {
    variant: "primary",
    children: "Loading Button",
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    children: "Disabled Button",
    isDisabled: true,
  },
};

export const IconButton: Story = {
  args: {
    variant: "icon",
    icon: getIconSvg("cross")({}) as any,
  },
};

export const CircleIconButton: Story = {
  args: {
    variant: "circle-icon",
    icon: getIconSvg("cross")({}) as any,
  },
};

// Button Group Example
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="neutral">Cancel</Button>
    </div>
  ),
};

// Responsive Example
export const ResponsiveButton: Story = {
  args: {
    variant: "responsive btn-primary",
    children: <> {getIconSvg("tree-vis")({}) as any}<span className="block ml-2">Responsive Button</span></>,
  },
};