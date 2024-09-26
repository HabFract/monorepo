import { Meta, StoryObj } from '@storybook/react';
import Button, { ButtonProps } from './Button';

const meta: Meta<ButtonProps> = {
  title: "Components/Onboarding/Button",
  component: Button,
  argTypes: {
  },
};

export default meta;

type Story = StoryObj<ButtonProps>;

export const Primary: Story = {
  args : {
    type: "onboarding"
  },
  render: (args) => <Button type={args.type} onClick={() => { }}>Save & Continue</Button>
};