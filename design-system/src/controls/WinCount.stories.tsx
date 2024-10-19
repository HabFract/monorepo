import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import WinCount, { WinCountProps } from "./WinCount";
import { Frequency } from "../generated-types";

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
    orbitFrequency: Frequency.DailyOrMore_1d,
    currentWins: 0,
  },
};

export const Loading: Story = {
  args: {
    orbitFrequency: Frequency.DailyOrMore_1d,
    currentWins: undefined,
  },
};

export const Complete: Story = {
  args: {
    orbitFrequency: Frequency.DailyOrMore_1d,
    currentWins: 1,
  },
};

export const TwiceDaily: Story = {
  args: {
    orbitFrequency: Frequency.DailyOrMore_2d,
    currentWins: 1
  },
};

export const TwiceDailyComplete: Story = {
  args: {
    orbitFrequency: Frequency.DailyOrMore_2d,
    currentWins: 2
  },
};

export const TenDaily: Story = {
  args: {
    orbitFrequency: Frequency.DailyOrMore_10d,
    currentWins: 2
  },
};

export const TenDailyComplete: Story = {
  args: {
    orbitFrequency: Frequency.DailyOrMore_10d,
    currentWins: 10
  },
};
