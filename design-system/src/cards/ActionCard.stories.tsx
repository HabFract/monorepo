import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import ActionCard, { ActionCardProps } from "./ActionCard";
import { getIconSvg } from "../icons/icons";
import { Button } from "../buttons";

export default {
  title: "Components/Cards/ActionCard",
  component: ActionCard,
  parameters: {
    backgrounds: {
      default: 'backdrop',
    }
  }
} as Meta<ActionCardProps>;

const Template: StoryFn<ActionCardProps> = (args) => <ActionCard {...args} />;

type Story = StoryObj<ActionCardProps>;

export const DefaultCard: Story = Template.bind({});
DefaultCard.args = {
  variant: "default",
  runAction: () => { console.log("Action performed!") },
  title: "Perform a Task",
  body: "This is a bit of copy explaining what the action will do."
};

export const IconCard: Story = Template.bind({});
IconCard.args = {
  variant: "icon",
  icon: getIconSvg('pencil')({}),
  runAction: () => { console.log("Action performed!") },
  title: "Perform a Task",
  body: "This is a bit of copy explaining what the action will do."
};

export const ButtonCard: Story = Template.bind({});
ButtonCard.args = {
  variant: "button",
  button: <Button  variant="primary responsive" type="button">Perform Action</Button>,
  runAction: () => { console.log("Action performed!") },
  title: "Perform a Task",
  body: "This is a bit of copy explaining what the action will do."
};

export const ButtonCardWarn: Story = Template.bind({});
ButtonCardWarn.args = {
  variant: "button",
  button: <Button  variant="warn responsive" type="button">Edit Orbit</Button>,
  runAction: () => { console.log("Action performed!") },
  title: "Perform a Task",
  body: "This is a bit of copy explaining what the action will do."
};