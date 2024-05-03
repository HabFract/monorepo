import { Meta, StoryObj } from '@storybook/react';
import Select from "./select";

export interface SelectProps {
  id: string;
  placeholder: string;
  labelValue: string;
  errored: boolean;
  required: boolean;
  withInfo: boolean;
  size: "sm" | "base" | "lg";
  options: string[];
  disabled: boolean;
  icon: string;
  iconSide: "left" | "right";
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
    id: "example",
    labelValue: "Favorite fruit:",
    placeholder: "Type here",
    size: "base",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
    withInfo: false,
  },
};

export const WithIcon: Story = {
  args: {
    labelValue: "Favorite fruit:",
    icon: "tag",
    iconSide: "left",
    size: "base",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
    withInfo: false
  },
};

export const WithIconWithInfo: Story = {
  args: {
    labelValue: "Favorite fruit:",
    icon: "tag",
    iconSide: "left",
    size: "base",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
    withInfo: true
  },
};