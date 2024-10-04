import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import WinCount, { WinCountProps } from "./WinCount";
import { Frequency } from "@ui/src/state";

const meta: Meta<WinCountProps> = {
  title: "Components/Controls/WinCount",
  component: WinCount,
  argTypes: {},
  render: (args: WinCountProps) => (
    <WinCount {...args} handleSaveWins={() => { console.log("Persisted wins!")}} ></WinCount>
  ),
};

export default meta;

type Story = StoryObj<WinCountProps>;

export const Default: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.DAILY,
    currentWins: 0,
  },
};

export const Complete: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.DAILY,
    currentWins: 1,
  },
};

export const TwiceDaily: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.TWO,
    currentWins: 1
  },
};

export const TwiceDailyComplete: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.TWO,
    currentWins: 2
  },
};

export const EighteenDaily: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.EIGHTEEN,
    currentWins: 2
  },
};

export const EighteenDailyComplete: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.EIGHTEEN,
    currentWins: 18
  },
};
