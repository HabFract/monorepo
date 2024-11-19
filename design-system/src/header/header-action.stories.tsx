import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import HeaderAction, { HeaderActionProps } from "./header-action";
import { getIconSvg } from "../icons/icons";
import { ListGroup } from "flowbite-react";

const meta: Meta<HeaderActionProps> = {
  title: "Components/Navigation/HeaderAction",
  component: HeaderAction,
  argTypes: {},
  render: (args: HeaderActionProps) => (
    <HeaderAction {...args} handlePrimaryAction={() => console.log("Handling primary action")}
    />
  ),
};

export default meta;

type Story = StoryObj<HeaderActionProps & { content: string }>;

export const Default: Story = {
  args: {
    title: "Health & Fitness",
    icon1: getIconSvg('back')
  },
};

export const Popover: Story = {
  args: {
    title: "Health & Fitness",
    icon1: getIconSvg('back'),
    icon2: getIconSvg('more'),
    secondaryActionPopoverElement: <ListGroup className="list-group-override no-auto-focus w-32">
      <ListGroup.Item onClick={() => console.log("Clicked 1")} icon={getIconSvg('pencil')}>Edit</ListGroup.Item>
      <span className="list-item-danger text-danger">
        <ListGroup.Item onClick={() => console.log("Clicked 2")} icon={getIconSvg('trash')}>Delete</ListGroup.Item>
      </span>
    </ListGroup>
  },
};
