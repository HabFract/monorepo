import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import PlanittCard, { PlanittCardProps } from "./PlanittCard";
import { DateTime } from "luxon";
import { Scale, Frequency } from "../generated-types";

export default {
  title: "Components/Cards/PlanittCard",
  component: PlanittCard,
  parameters: {
    backgrounds: {
      default: 'backdrop',
    }
  }
} as Meta<PlanittCardProps>;

const Template: StoryFn<PlanittCardProps> = (args) => <PlanittCard {...args} />;

type Story = StoryObj<PlanittCardProps>;

export const Default: Story = Template.bind({});
Default.args = {
  lastTrackedWinDate: "9/18/2024",
  currentStreak: 3,
  longestStreak: 7,
  orbit: {
    sphereHash: '',
    eH: "",
    id: "SGVhbHRoMQ==",
    name: "10k Run",
    frequency: Frequency.DailyOrMore_1d,
    scale: Scale.Astro,
    metadata: {
      timeframe: {
        startTime: 19999,
        endTime: 19999,
      }
    },
  },
};

export const Giant: Story = Template.bind({});
Giant.args = {
  lastTrackedWinDate: "9/18/2024",
  currentStreak: 3,
  longestStreak: 7,
  orbit: {
    sphereHash: '',
    eH: "",
    id: "SGVhbHRoMQ==",
    name: "10k Run",
    frequency: Frequency.DailyOrMore_1d,
    scale: Scale.Sub,
    metadata: {
      timeframe: {
        startTime: 19999,
        endTime: 19999,
      }
    },
  },
};

export const Dwarf: Story = Template.bind({});
Dwarf.args = {
  lastTrackedWinDate: "9/18/2024",
  currentStreak: 3,
  longestStreak: 7,
  orbit: {
    sphereHash: '',
    eH: "",
    id: "SGVhbHRoMQ==",
    name: "10k Run",
    frequency: Frequency.DailyOrMore_1d,
    scale: Scale.Atom,
    metadata: {
      timeframe: {
        startTime: 19999,
        endTime: 19999,
      }
    },
  },
};