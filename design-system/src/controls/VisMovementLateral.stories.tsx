import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import VisMovementLateral, { VisMovementLateralProps } from "./VisMovementLateral";
import { Scale } from "../generated-types";

const meta: Meta<VisMovementLateralProps> = {
  title: "Components/Controls/VisMovementLateral",
  component: VisMovementLateral,
  argTypes: {},
  render: (args: VisMovementLateralProps) => (
    <VisMovementLateral {...args} goLeftAction={() => console.log("Handle move left")} goRightAction={() => console.log("Handle move right")}
    ></VisMovementLateral>
  ),
};

export default meta;

type Story = StoryObj<VisMovementLateralProps & { content: string }>;

export const Default: Story = {
  args: {
    orbitSiblings: [{
      orbitName: "10k run",
      orbitScale: Scale.Sub,
    }, {
      orbitName: "12k run",
      orbitScale: Scale.Sub,
    }, {
      orbitName: "15k run",
      orbitScale: Scale.Sub,
    }
  ]
  },
};

export const Overflowing: Story = {
  args: {
    orbitSiblings: [{
      orbitName: "1k run",
      orbitScale: Scale.Atom,
    }, {
      orbitName: "2k run",
      orbitScale: Scale.Atom,
    }, {
      orbitName: "5k run",
      orbitScale: Scale.Sub,
    }, {
      orbitName: "10k run",
      orbitScale: Scale.Sub,
    }, {
      orbitName: "20k run",
      orbitScale: Scale.Astro,
    }, {
      orbitName: "50k run",
      orbitScale: Scale.Astro,
    }
  ]
  },
};
