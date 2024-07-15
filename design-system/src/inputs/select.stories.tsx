import { Meta, StoryObj } from '@storybook/react';
import Select, { SelectInputField } from "./select";

export interface SelectProps {
  id: string;
  name: string;
  value: string;
  placeholder: string;
  labelValue: string;
  errored: boolean;
  required: boolean;
  withInfo: boolean;
  size: "sm" | "base" | "lg";
  options: string[] | HTMLElement[];
  disabled: boolean;
  icon: string;
  iconSide: "left" | "right";
  onChange?: Function,
  onBlur?: Function,
  theme?: string,
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

export const Disabled: Story = {
  args: {
    labelValue: "Favorite fruit:",
    icon: "tag",
    iconSide: "left",
    size: "base",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: true,
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

export const WithIconWithInfoRequired: Story = {
  args: {
    labelValue: "Favorite fruit:",
    icon: "tag",
    iconSide: "left",
    size: "base",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
    required: true,
    withInfo: true
  },
};

export const WithIconWithWarnError: Story = {
  args: {
    labelValue: "Favorite fruit:",
    icon: "tag",
    name: "fruit",
    iconSide: "left",
    size: "base",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
    errored: true,
    required: true,
    withInfo: false
  },
  
  render: (args: any) => <SelectInputField field={null} form={{
    errors: {
      "fruit": "This is a required field."
    }, touched: {
      "fruit": true
    },
  }} {...args}></SelectInputField>
};

export const WithIconWithDangerError: Story = {
  args: {
    labelValue: "Favorite fruit:",
    icon: "tag",
    name: "fruit",
    iconSide: "left",
    size: "base",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
    errored: true,
    withInfo: false
  },
  
  render: (args: any) => <SelectInputField field={null} form={{
    errors: {
      "fruit": "This is not a fruit, try again!"
    }, touched: {
      "fruit": true
    },
  }} {...args}></SelectInputField>
};