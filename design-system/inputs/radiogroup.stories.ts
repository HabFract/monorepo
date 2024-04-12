import { Meta, StoryObj } from '@storybook/react';
import RadioGroup from "./radiogroup";

export interface RadioGroupProps {
  id: string;
  errored: boolean;
  required: boolean;
  size: "medium" | "large";
  options: string[];
  disabled: boolean;
}

const meta: Meta<RadioGroupProps> = {
  title: "Components/Input/RadioGroup",
  component: RadioGroup,
  argTypes: {
    size: { options: ["medium", "large"], control: { type: "radio" } },
  },
};

export default meta;

type Story = StoryObj<RadioGroupProps>;

export const Default: Story = {
  args: {
    id: "example",
    size: "medium",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
  },
};