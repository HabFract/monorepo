import { Meta, StoryObj } from '@storybook/react';
import TextInput from "./text";
import { AppstoreFilled } from '@ant-design/icons';

export interface TextInputProps {
  placeholder: string;
  errored: boolean;
  required: boolean;
  size: "sm" | "base" | "large";
  iconSide: "left" | "right";
  disabled: boolean;
  icon: unknown;
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
    placeholder: "Type here",
    size: "base",
    iconSide: "left",
    icon: AppstoreFilled,
    disabled: false
  },
};