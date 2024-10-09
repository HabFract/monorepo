import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import VisMovementVertical, { VisMovementVerticalProps } from "./VisMovementVertical";
import { Scale } from "../generated-types";

const meta: Meta<VisMovementVerticalProps> = {
  title: "Components/Controls/VisMovementVertical",
  component: VisMovementVertical,
  argTypes: {},
  render: (args: VisMovementVerticalProps) => (
    <VisMovementVertical {...args} />
  ),
};

export default meta;

type Story = StoryObj<VisMovementVerticalProps>;

const sampleOrbits = [
  { orbitName: "Mercury", orbitScale: Scale.Astro },
  { orbitName: "Venus", orbitScale: Scale.Astro },
  { orbitName: "Earth", orbitScale: Scale.Astro },
  { orbitName: "Mars", orbitScale: Scale.Astro },
  { orbitName: "Jupiter", orbitScale: Scale.Astro },
  { orbitName: "Saturn", orbitScale: Scale.Astro },
  { orbitName: "Uranus", orbitScale: Scale.Astro },
  { orbitName: "Neptune", orbitScale: Scale.Astro },
];

export const Default: Story = {
  args: {
    orbitDescendants: sampleOrbits,
  },
};