import React from 'react';
import { StoryFn, Meta, StoryObj } from '@storybook/react';
import HelperText, { HelperTextProps } from './helper-text';
import List from '../../../ui/src/components/icons/List';

const meta: Meta<HelperTextProps> = {
  title: "Components/Onboarding/HelperText",
  component: HelperText,
  argTypes: {
  },
  render: (args: any) => <HelperText title={args.title} titleIcon={args.titleIcon} withInfo={args.withInfo} onClickInfo={() => ({title: "Clicked!", body: "That was cool"})}>{args.content}</HelperText> 
};

export default meta;

type Story = StoryObj<HelperTextProps & {content: string}>;

export const Default: Story = {
  args : {  
    content: "Hello World"
  }
};

export const TitleIconInfo: Story = {
  args : {  
    title: "Hello World",
    content: "This is the best way to write a helper message",
    titleIcon: <List />
  }
};

export const TitleIcon: Story = {
  args : {  
    content: "This is the best way to write a helper message",
    title: "Hello World",
    titleIcon: <List />,
    withInfo: false,
  }
};