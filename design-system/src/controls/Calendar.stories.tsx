import React from 'react';
import { StoryFn, Meta, StoryObj } from '@storybook/react';
import Calendar, { CalendarProps } from './Calendar';

const meta: Meta<CalendarProps> = {
  title: "Components/Navigation/Calendar",
  component: Calendar,
  argTypes: {
  },
  render: (args: any) => <Calendar ></Calendar> 
};

export default meta;

type Story = StoryObj<CalendarProps & {content: string}>;

export const Default: Story = {
  args : {  
    
  }
};