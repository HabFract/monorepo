import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import StreakCount, { StreakCountProps } from "./StreakCount";
import { Frequency } from "@ui/src/state";

const meta: Meta<StreakCountProps> = {
  title: "Components/Controls/StreakCount",
  component: StreakCount,
  argTypes: {},
  render: (args: StreakCountProps) => (
    <StreakCount {...args} ></StreakCount>
  ),
};

export default meta;

type Story = StoryObj<StreakCountProps>;

export const Default: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.DAILY,
    currentStreak: 0,
  },
};

export const Short: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.DAILY,
    currentStreak: 2,
  },
};

export const Long: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.DAILY,
    currentStreak: 46,
  },
};

export const ShortWeekly: Story = {
  args: {
    orbitFrequency: Frequency.LESS_THAN_DAILY.WEEKLY,
    currentStreak: 2,
  },
};

export const LongWeekly: Story = {
  args: {
    orbitFrequency: Frequency.LESS_THAN_DAILY.WEEKLY,
    currentStreak: 46,
  },
};

export const ShortMonthly: Story = {
  args: {
    orbitFrequency: Frequency.LESS_THAN_DAILY.MONTHLY,
    currentStreak: 2,
  },
};

export const LongMonthly: Story = {
  args: {
    orbitFrequency: Frequency.LESS_THAN_DAILY.MONTHLY,
    currentStreak: 14,
  },
};

export const ShortQuarterly: Story = {
  args: {
    orbitFrequency: Frequency.LESS_THAN_DAILY.QUARTERLY,
    currentStreak: 3,
  },
};

export const Twoly: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.TWO,
    currentStreak: 9,
  },
};
export const Eightly: Story = {
  args: {
    orbitFrequency: Frequency.DAILY_OR_MORE.EIGHT,
    currentStreak: 3,
  },
};

export const LongQuarterly: Story = {
  args: {
    orbitFrequency: Frequency.LESS_THAN_DAILY.QUARTERLY,
    currentStreak: 9,
  },
};