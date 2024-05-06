import { Meta, StoryObj } from '@storybook/react';
import RadioGroup, { RadioGroupField } from "./radiogroup";

export interface RadioGroupProps {
  id: string;
  name: string;
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

export const Disabled: Story = {
  args: {
    id: "example",
    labelValue: "Favorite fruit:",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: true,
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

export const WithLabelWithInfoRequired: Story = {
  args: {
    id: "example",
    labelValue: "Favorite fruit:",
    options: ["Apples", "Oranges", "Bananas"],
    disabled: false,
    required: true,
    withInfo: true,
  },
};

export const WithIconWithWarnError: Story = {
  args: {
    name: "test",
    id: "test",
    labelValue: "Favorite fruit:",
    options: ["Apples", "Oranges", "Bananas"],
    errored: true,
    required: true,
    withInfo: false
  },
  
  render: (args: any) => <RadioGroupField field={null} form={{
    errors: {
      "test": "This is a required field."
    }, touched: {
      "test": true
    },
  }} {...args}></RadioGroupField>
};

export const WithIconWithDangerError: Story = {
  args: {
    name: "test",
    id: "test",
    labelValue: "Favorite fruit:",
    options: ["Apples", "Oranges", "Bananas"],
    errored: true,
    required: false,
    withInfo: false
  },
  
  render: (args: any) => <RadioGroupField field={null} form={{
    errors: {
      "test": "This is not valid!"
    }, touched: {
      "test": true
    },
  }} {...args}></RadioGroupField>
};