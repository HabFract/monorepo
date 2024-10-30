import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import VisMovementVertical, { VisMovementVerticalProps } from "./VisMovementVertical";
import { Scale } from "../generated-types";

const meta: Meta<VisMovementVerticalProps> = {
  title: "Components/Controls/VisMovementVertical",
  component: VisMovementVertical,
  argTypes: {},
  render: (args: VisMovementVerticalProps) => (
    <div className="absolute w-128 h-128 top-1/2 overflow-hidden">
      <div className="center-marker" style={{ bottom: "-6.5rem" }}></div>
      <VisMovementVertical {...args} moveDownAction={() => console.log("Move down")} moveUpAction={() => console.log("Move up")} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<VisMovementVerticalProps>;

const sampleOrbits = [
  { orbitName: "Mercury", orbitScale: Scale.Astro },
  { orbitName: "Venus", orbitScale: Scale.Sub },
  { orbitName: "Earth", orbitScale: Scale.Atom },
  { orbitName: "Mars", orbitScale: Scale.Atom },
  { orbitName: "Jupiter", orbitScale: Scale.Atom },
  { orbitName: "Saturn", orbitScale: Scale.Atom },
  { orbitName: "Uranus", orbitScale: Scale.Atom },
  { orbitName: "Neptune", orbitScale: Scale.Atom },
];

export const Default: Story = {
  args: {
    orbitDescendants: sampleOrbits,
  },
};