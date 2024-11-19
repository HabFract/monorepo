import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Modal, { ModalProps } from "./Modal";

const meta: Meta<ModalProps> = {
  title: "Components/Modals/Modal",
  component: Modal,
  argTypes: {},
  render: (args: any) => (
    <Modal {...args} title="" isModalOpen={true}
    />
  ),
};

export default meta;

type Story = StoryObj<ModalProps>;

export const Sun: Story = {
  args: {
    size: "lg",
    children: <div className="flex flex-col gap-2">
      <img className="max-w-72 mx-auto" src="/assets/sun.svg"></img>
      <h1 className="text-xl text-center text-white text-opacity-100">Sun</h1>
      <p>The Sun represents your most significant plan within the sphere, acting as the primary focus that illuminates and drives your progress in that area of life.</p>
    </div>,
    footerElement: `Example: "Daily Workouts" in Health and Fitness sphere.`
  },
};

export const Plannit: Story = {
  args: {
    size: "lg",
    children: <div className="flex flex-col gap-2">
      <img style={{transform: "scale(1.4) translate(.25rem, .75rem)"}} className="max-w-72 mx-auto" src="/assets/planet.svg"></img>
      <h1 className="text-xl text-center text-white text-opacity-100">Planet</h1>
      <p>The Planet orbit tracks secondary habits that support or build up to the main habit, maintaining a balanced routine around the Sun’s influence.</p>
    </div>,
    footerElement: `Example: "Running" under Daily Workouts.`
  },
};

export const Moon: Story = {
  args: {
    size: "lg",
    children: <div className="flex flex-col gap-2">
      <img className="max-w-72 mx-auto" src="/assets/moon.svg"></img>
      <h1 className="text-xl text-center text-white text-opacity-100">Moon</h1>
      <p>The Moon covers smaller, detail-oriented habits that enhance the overall progress toward your main goal. These minor actions refine your routine.</p>
    </div>,
    footerElement: `Example: "Warming up before a run" under Running.`
  },
};