import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import FrequencyIndicator, { FrequencyIndicatorProps } from "./frequency-indicator";
import { Frequency } from "@ui/src/state/types";

const meta: Meta<FrequencyIndicatorProps> = {
  title: "Components/Icons/FrequencyIndicator",
  component: FrequencyIndicator,
  argTypes: {},
  render: (args: any) => (
    <FrequencyIndicator
      frequency={args.frequency}
      size={"md"}
    />
  ),
};

export default meta;

type Story = StoryObj<FrequencyIndicatorProps & { content: string }>;

export const Daily: Story = {
  args: {
    frequency: Frequency.DAILY_OR_MORE.DAILY
  },
};

export const Weekly: Story = {
  args: {
    frequency: Frequency.LESS_THAN_DAILY.WEEKLY
  },
};

export const Monthly: Story = {
  args: {
    frequency: Frequency.LESS_THAN_DAILY.MONTHLY
  },
};

export const Quarterly: Story = {
  args: {
    frequency: Frequency.LESS_THAN_DAILY.QUARTERLY
  },
};

export const TwiceDaily: Story = {
  args: {
    frequency: Frequency.DAILY_OR_MORE.TWO
  },
};

export const ThriceDaily: Story = {
  args: {
    frequency: Frequency.DAILY_OR_MORE.THREE
  },
};

export const TenDaily: Story = {
  args: {
    frequency: Frequency.DAILY_OR_MORE.TEN
  },
};

