import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import PlannitCard, { PlannitCardProps } from "./PlannitCard";
import { DateTime } from "luxon";
import { Scale, Frequency } from "../generated-types";

export default {
  title: "Components/Cards/PlannitCard",
  component: PlannitCard,
} as Meta<PlannitCardProps>;

const Template: StoryFn<PlannitCardProps> = (args) => <PlannitCard {...args} />;

type Story = StoryObj<PlannitCardProps>;

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