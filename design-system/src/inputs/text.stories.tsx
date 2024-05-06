import { Meta, StoryObj } from '@storybook/react';
import TextInput, { TextInputField } from "./text";

export interface TextInputProps {
  id: string;
  name: string;
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
  theme?: string
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

export const Disabled: Story = {
  args: {
    id: "example",
    placeholder: "Type here",
    labelValue: "Name:",
    size: "base",
    iconSide: "left",
    icon: 'tag',
    disabled: true
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

export const WithIconWithInfoRequired: Story = {
  args: {
    id: "example",
    placeholder: "Type here",
    labelValue: "Name:",
    size: "base",
    iconSide: "left",
    icon: 'tag',
    disabled: false,
    required: true,
    withInfo: true
  },
};

export const WithIconWithWarnError: Story = {
  args: {
    id: "example",
    name: "example",
    placeholder: "Type here",
    labelValue: "Name:",
    size: "base",
    iconSide: "left",
    icon: 'tag',
    disabled: false,
    errored: true,
    required: true,
    withInfo: false
  },
  
  render: (args: any) => <TextInputField field={null} form={{
    errors: {
      "example": "This is a required field."
    }, touched: {
      "example": true
    },
  }} {...args}></TextInputField>
};

export const WithIconWithDangerError: Story = {
  args: {
    id: "example",
    name: "example",
    placeholder: "Type here",
    labelValue: "Name:",
    size: "base",
    iconSide: "left",
    icon: 'tag',
    disabled: false,
    errored: true,
    required: false,
    withInfo: false
  },
  
  render: (args: any) => <TextInputField field={null} form={{
    errors: {
      "example": "This is not valid!"
    }, touched: {
      "example": true
    },
  }} {...args}></TextInputField>
};