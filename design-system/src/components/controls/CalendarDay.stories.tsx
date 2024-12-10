import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import CalendarDay, { CalendarDayProps } from "./CalendarDay";
import { DateTime } from "luxon";

const meta: Meta<CalendarDayProps> = {
  title: "Components/Controls/CalendarDay",
  component: CalendarDay,
  argTypes: {},
  render: (args: CalendarDayProps) => (
    <CalendarDay {...args} ></CalendarDay>
  ),
};

export default meta;

type Story = StoryObj<CalendarDayProps>;

export const Incomplete: Story = {
  args: {
    completed: false,
    dateString: DateTime.local().toISO()
  },
};

export const Completed: Story = {
  args: {
    completed: true,
    dateString: DateTime.local().toISO(),
  },
};