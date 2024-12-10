import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import OrbitLabel, { OrbitLabelProps } from "./OrbitLabel";
import { Frequency } from "@ui/src/state/types";

const meta: Meta<OrbitLabelProps> = {
  title: "Components/Vis/OrbitLabel",
  component: OrbitLabel,
  argTypes: {},
  render: (args: OrbitLabelProps) => (
    <OrbitLabel {...args}
    />
  ),
};

export default meta;

type Story = StoryObj<OrbitLabelProps>;

export const NoDescription: Story = {
  args: {
    orbitDetails: {
      name: "Run a marathon",
      frequency: Frequency.DAILY_OR_MORE.DAILY
    },
  },
};

export const WithDescription: Story = {
  args: {
    orbitDetails: {
      name: "Run a marathon",
      description: "This is a long goal but if you train really consistently, I am sure I can do it!",
      frequency: Frequency.DAILY_OR_MORE.DAILY
    }
  },
};

export const LongTitle: Story = {
  args: {
    orbitDetails: {
      name: "Run a marathon and then do something else!",
      description: "This is a long goal but if you train really consistently, I am sure I can do it!",
      frequency: Frequency.DAILY_OR_MORE.DAILY
    }
  },
};

