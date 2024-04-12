import { Meta, StoryObj } from '@storybook/react';
import Select from "./select";

export interface SelectProps {
  placeholder: string;
  errored: boolean;
  required: boolean;
  size: "sm" | "base" | "lg";
  options: string[];
  disabled: boolean;
}

const meta: Meta<SelectProps> = {
  title: "Components/Input/Select",
  component: Select,
  argTypes: {
    placeholder: { control: "text" },
    size: { options: ["sm", "base", "lg"], control: { type: "radio" } },
  },
};

export default meta;

type Story = StoryObj<SelectProps>;

export const Default: Story = {
  args: {
    placeholder: "Type here",
    size: "base",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false
  },
};