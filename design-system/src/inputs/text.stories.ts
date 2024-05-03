import { Meta, StoryObj } from '@storybook/react';
import TextInput from "./text";

export interface TextInputProps {
  id: string;
  placeholder: string;
  labelValue: string;
  errored: boolean;
  required: boolean;
  withInfo: boolean;
  size: "sm" | "base" | "large";
  iconSide: "left" | "right";
  disabled: boolean;
  icon: string;
  onChange?: Function
  value?: string
}

const meta: Meta<TextInputProps> = {
  title: "Components/Input/TextInput",
  component: TextInput,
  argTypes: {
    placeholder: { control: "text" },
    size: { options: ["base", "sm", "lg"], control: { type: "radio" } },
  },
};

export default meta;

type Story = StoryObj<TextInputProps>;

export const Default: Story = {
  args: {
    id: "example",
    placeholder: "Type here",
    labelValue: "Name:",
    size: "base",
    disabled: false
  },
};

export const IconLeft: Story = {
  args: {
    id: "example",
    placeholder: "Type here",
    labelValue: "Name:",
    size: "base",
    iconSide: "left",
    icon: 'tag',
    disabled: false
  },
};

export const WithIconWithInfo: Story = {
  args: {
    id: "example",
    placeholder: "Type here",
    labelValue: "Name:",
    size: "base",
    iconSide: "left",
    icon: 'tag',
    disabled: false,
    withInfo: true
  },
};