import { Meta, StoryObj } from '@storybook/react';
import RadioGroup from "./radiogroup";

export interface RadioGroupProps {
  id: string;
  labelValue: string;
  errored: boolean;
  required: boolean;
  withInfo: boolean;
  options: string[];
  disabled: boolean;
  direction: "horizontal" | "vertical";
}

const meta: Meta<RadioGroupProps> = {
  title: "Components/Input/RadioGroup",
  component: RadioGroup,
  argTypes: {
    direction: { options: ["horizontal", "vertical"], control: { type: "radio" } },
  },
};

export default meta;

type Story = StoryObj<RadioGroupProps>;

export const Default: Story = {
  args: {
    id: "example",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
  },
};

export const WithLabel: Story = {
  args: {
    id: "example",
    labelValue: "Favorite fruit:",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
  },
};

export const WithLabelWithInfo: Story = {
  args: {
    id: "example",
    labelValue: "Favorite fruit:",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
    withInfo: true,
  },
};