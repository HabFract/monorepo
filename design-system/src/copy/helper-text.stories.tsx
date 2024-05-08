import React from 'react';
import { StoryFn, Meta, StoryObj } from '@storybook/react';
import HelperText, { HelperTextProps } from './helper-text';
import BackCaret from '../../../app/src/components/icons/BackCaret';

const meta: Meta<HelperTextProps> = {
  title: "Components/Onboarding/HelperText",
  component: HelperText,
  argTypes: {
  },
  render: (args: any) => <HelperText title={args.title} onClickInfo={(e) => console.log("Clicked!") as any}>{args.content}</HelperText> 
};

export default meta;

type Story = StoryObj<HelperTextProps & {content: string}>;

export const Default: Story = {
  args : {  
    content: "Hello World"
  }
};

export const Title: Story = {
  args : {  
    title: "Hello World",
    content: "This is the best way to write a helper message"
  }
};

export const TitleIcon: Story = {
  args : {  
    content: "This is the best way to write a helper message",
    title: "Hello World",
    titleIcon: <BackCaret />
  }
};