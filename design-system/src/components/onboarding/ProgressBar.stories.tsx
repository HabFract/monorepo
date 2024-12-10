import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import ProgressBar, { ProgressBarProps } from "./ProgressBar";

const meta: Meta<ProgressBarProps> = {
  title: "Components/Onboarding/ProgressBar",
  component: ProgressBar,
  argTypes: {},
};

export default meta;

type Story = StoryObj<ProgressBarProps>;

export const Step1: Story = {
  args: {
    stepNames: [
      "Create Profile",
      "Create A Sphere",
      "Create An Orbit",
      "Confirm Orbit",
      "Visualize",
    ],
    currentStep: 1,
  },
};

export const Step2: Story = {
  args: {
    stepNames: [
      "Create Profile",
      "Create A Sphere",
      "Create An Orbit",
      "Confirm Orbit",
      "Visualize",
    ],
    currentStep: 2,
  },
};

export const Step3: Story = {
  args: {
    stepNames: [
      "Create Profile",
      "Create A Sphere",
      "Create An Orbit",
      "Confirm Orbit",
      "Visualize",
    ],
    currentStep: 3,
  },
};

export const Step4: Story = {
  args: {
    stepNames: [
      "Create Profile",
      "Create A Sphere",
      "Create An Orbit",
      "Confirm Orbit",
      "Visualize",
    ],
    currentStep: 4,
  },
};
