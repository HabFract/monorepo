import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import Calendar, { CalendarProps } from "./Calendar";
import TickBox from "./TickBox";
import mockAppState from "../mockState";
import { DateTime } from "luxon";

const meta: Meta<CalendarProps> = {
  title: "Components/Controls/Calendar",
  component: Calendar,
  argTypes: {},
  render: (args: CalendarProps) => (
    <Calendar {...args}
    ></Calendar>
  ),
};

export default meta;

type Story = StoryObj<CalendarProps>;

export const Default: Story = {
  args: {
    currentDate: DateTime.now(),
    setNewDate: () => { console.log("Setting new date")},
    orbitWins: mockAppState.wins['uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc']
  },
};

export const FullWeekIncomplete: Story = {
  args: {
    currentDate: DateTime.now().minus({days: 3}),
    setNewDate: () => { console.log("Setting new date")},
    orbitWins: mockAppState.wins['uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc']
  },
};

export const FullWeekCompleted: Story = {
  args: {
    currentDate: DateTime.now().minus({days: 3}),
    setNewDate: () => { console.log("Setting new date")},
    orbitWins: mockAppState.wins['uhCAkWj8LkCQ3moXA7qGNoY5Vxgb2Ppr6xpDg9WnE9Uoc']
  },
};

