import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import OrbitPill, { OrbitPillProps } from "./OrbitPill";
import { Scale } from "../../generated-types";

const meta: Meta<OrbitPillProps> = {
  title: "Components/Controls/OrbitPill",
  component: OrbitPill,
  argTypes: {},
  render: (args: OrbitPillProps) => (
    <OrbitPill {...args} ></OrbitPill>
  ),
};

export default meta;

type Story = StoryObj<OrbitPillProps>;

export const Default: Story = {
  args: {
    name: "Run 10k",
    scale: Scale.Astro
  },
};

export const Selected: Story = {
  args: {
    name: "Run 10k",
    scale: Scale.Astro,
    selected: true
  },
};

export const Long: Story = {
  args: {
    name: "Run a really long distance",
    scale: Scale.Astro
  },
};

export const LongSelected: Story = {
  args: {
    name: "Run a really long distance",
    scale: Scale.Astro,
    selected: true
  },
};

export const SubAstro: Story = {
  args: {
    name: "Run a really long distance",
    scale: Scale.Sub
  },
};

export const LongSubAstro: Story = {
  args: {
    name: "Run a really long distance",
    scale: Scale.Sub
  },
};


export const Atom: Story = {
  args: {
    name: "Run a really long distance",
    scale: Scale.Atom
  },
};

export const LongAtom: Story = {
  args: {
    name: "Run a really long distance",
    scale: Scale.Atom
  },
};
