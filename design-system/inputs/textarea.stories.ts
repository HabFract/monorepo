import { Meta, StoryObj } from '@storybook/react';
import TextArea from "./textarea";

export interface TextAreaProps {
  placeholder: string;
  label: string;
  id: string;
  errored: boolean;
  required: boolean;
  disabled: boolean;
  rows: number;
}

const meta: Meta<TextAreaProps> = {
  title: "Components/Input/TextArea",
  component: TextArea,
  argTypes: {
    placeholder: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<TextAreaProps>;

export const Default: Story = {
  args: {
    id: "test",
    label: "Comments:",
    placeholder: "Tell us what you think",
    rows: 5,
    disabled: false
  },
};
export const Disabled: Story = {
  args: {
    id: "test",
    label: "Comments:",
    placeholder: "Tell us what you think",
    rows: 5,
    disabled: true
  },
};