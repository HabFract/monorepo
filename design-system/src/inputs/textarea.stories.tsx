import { Meta, StoryObj } from '@storybook/react';
import TextArea, { TextAreaField } from "./textarea";

export interface TextAreaProps {
  placeholder: string;
  labelValue: string;
  value: string;
  id: string;
  name: string;
  errored: boolean;
  required: boolean;
  withInfo: boolean;
  disabled: boolean;
  rows: number;
  onChange?: Function
  theme?: string
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

export const WithInfoRequired: Story = {
  args: {
    id: "test",
    labelValue: "Comments:",
    placeholder: "Tell us what you think",
    rows: 5,
    withInfo: true,
    required: true
  },
};

export const WithIconWithWarnError: Story = {
  args: {
    name: "test",
    id: "test",
    labelValue: "Comments:",
    placeholder: "Tell us what you think",
    rows: 5,
    errored: true,
    required: true,
    withInfo: false
  },
  
  render: (args: any) => <TextAreaField field={null} form={{
    errors: {
      "test": "This is a required field."
    }, touched: {
      "test": true
    },
  }} {...args}></TextAreaField>
};

export const WithIconWithDangerError: Story = {
  args: {
    name: "test",
    id: "test",
    labelValue: "Comments:",
    placeholder: "Tell us what you think",
    rows: 5,
    errored: true,
    required: false,
    withInfo: false
  },
  
  render: (args: any) => <TextAreaField field={null} form={{
    errors: {
      "test": "This is not valid!"
    }, touched: {
      "test": true
    },
  }} {...args}></TextAreaField>
};