import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import VisMovementLateral, { VisMovementLateralProps } from "./VisMovementLateral";
import { Scale } from "../generated-types";

const meta: Meta<VisMovementLateralProps> = {
  title: "Components/Controls/VisMovementLateral",
  component: VisMovementLateral,
  argTypes: {},
  render: (args: VisMovementLateralProps) => (
    <VisMovementLateral {...args} moveLeftAction={() => console.log("Handle move left")} moveRightAction={() => console.log("Handle move right")}
    ></VisMovementLateral>
  ),
};

export default meta;

type Story = StoryObj<VisMovementLateralProps & { content: string }>;

export const Default: Story = {
  args: {
    orbits: [{
      orbitName: "10k run",
      orbitScale: Scale.Sub,
      handleOrbitSelect: () => console.log("10k run selected"),
    }, {
      orbitName: "12k run",
      orbitScale: Scale.Sub,
      handleOrbitSelect: () => console.log("12k run selected")
    }, {
      orbitName: "15k run",
      orbitScale: Scale.Sub,
      handleOrbitSelect: () => console.log("15k run selected")
    }
  ]
  },
};

export const Overflowing: Story = {
  args: {
    orbits: [{
      orbitName: "1k run",
      orbitScale: Scale.Atom,
      handleOrbitSelect: () => console.log("10k run selected")
    }, {
      orbitName: "2k run",
      orbitScale: Scale.Atom,
      handleOrbitSelect: () => console.log("12k run selected")
    }, {
      orbitName: "5k run",
      orbitScale: Scale.Sub,
      handleOrbitSelect: () => console.log("15k run selected")
    }, {
      orbitName: "10k run",
      orbitScale: Scale.Sub,
      handleOrbitSelect: () => console.log("10k run selected")
    }, {
      orbitName: "20k run",
      orbitScale: Scale.Astro,
      handleOrbitSelect: () => console.log("12k run selected")
    }, {
      orbitName: "50k run",
      orbitScale: Scale.Astro,
      handleOrbitSelect: () => console.log("15k run selected")
    }
  ]
  },
};
