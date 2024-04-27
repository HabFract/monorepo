import { Meta, StoryObj } from '@storybook/react';
import TextArea from "./textarea";

export interface TextAreaProps {
  placeholder: string;
  labelValue: string;
  id: string;
  errored: boolean;
  required: boolean;
  withInfo: boolean;
  disabled: boolean;
  rows: number;
  onChange?: Function
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
    labelValue: "Comments:",
    placeholder: "Tell us what you think",
    rows: 5,
    disabled: false
  },
};
export const Disabled: Story = {
  args: {
    id: "test",
    labelValue: "Comments:",
    placeholder: "Tell us what you think",
    rows: 5,
    disabled: true
  },
};

export const WithInfo: Story = {
  args: {
    id: "test",
    labelValue: "Comments:",
    placeholder: "Tell us what you think",
    rows: 5,
    withInfo: true
  },
};