import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import FrequencyIndicator, { FrequencyIndicatorProps } from "./frequency-indicator";
import { Frequency } from "../generated-types";

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
    frequency: Frequency.DailyOrMore_1d
  },
};

export const Weekly: Story = {
  args: {
    frequency: Frequency.LessThanDaily_1w
  },
};

export const Monthly: Story = {
  args: {
    frequency: Frequency.LessThanDaily_1m
  },
};

export const Quarterly: Story = {
  args: {
    frequency: Frequency.LessThanDaily_1q
  },
};

export const TwiceDaily: Story = {
  args: {
    frequency: Frequency.DailyOrMore_2d
  },
};

export const ThriceDaily: Story = {
  args: {
    frequency: Frequency.DailyOrMore_3d
  },
};

export const TenDaily: Story = {
  args: {
    frequency: Frequency.DailyOrMore_10d
  },
};

