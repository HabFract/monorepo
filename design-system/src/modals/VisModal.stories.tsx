import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import VisModal, { VisModalProps } from "./VisModal";

const meta: Meta<VisModalProps> = {
  title: "Components/Modals/VisModal",
  component: VisModal,
  argTypes: {},
  render: (args: any) => (
    <VisModal {...args} isModalOpen={true}
    />
  ),
};

export default meta;

type Story = StoryObj<VisModalProps>;

export const Daily: Story = {
  args: {
    size: "lg",
    children: <div className="flex flex-col gap-2">
      <img className="max-w-72 mx-auto" src="/assets/sun.svg"></img>
      <h1 className="text-center text-xl text-opacity-100 text-white">Sun</h1>
      <p>The Sun represents your most significant habit within the sphere, acting as the primary focus that illuminates and drives your progress in that area of life.</p>
    </div>,
    modalAnnotation: `Example: "Daily Workouts" in Health and Fitness sphere.`
  },
};