import { Meta, StoryObj } from '@storybook/react';
import TextInput from "./text";
import { AppstoreFilled } from '@ant-design/icons';

export interface TextInputProps {
  id: string;
  placeholder: string;
  labelValue: string;
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
    id: "example",
    placeholder: "Type here",
    labelValue: "Name:",
    size: "base",
    iconSide: "left",
    icon: AppstoreFilled,
    disabled: false
  },
};