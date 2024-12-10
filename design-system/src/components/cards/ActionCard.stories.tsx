import React from "react";
import { StoryFn, Meta, StoryObj } from "@storybook/react";
import ActionCard, { ActionCardProps } from "./ActionCard";
import { getIconSvg } from "../icons/icons";
import { Button } from "../buttons";
import { Form, Formik } from "formik";
import { object, string } from "yup";

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

export const AvatarCard: Story = {
  render: (args) => (
    <Formik
      initialValues={{ avatar: '' }}
      onSubmit={values => console.log(values)}
    >
      <Form>
        <ActionCard {...args}
          hasImage={true}
        />
      </Form>
    </Formik>
  ),
  args: {
    variant: "avatar",
    title: "Profile Picture",
    name: "John Doe",
    fieldName: "avatar"
  }
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
  button: <Button variant="primary responsive" type="button">Perform Action</Button>,
  runAction: () => { console.log("Action performed!") },
  title: "Perform a Task",
  body: "This is a bit of copy explaining what the action will do."
};

export const ButtonCardWarn: Story = Template.bind({});
ButtonCardWarn.args = {
  variant: "button",
  button: <Button variant="warn responsive" type="button">Edit Orbit</Button>,
  runAction: () => { console.log("Action performed!") },
  title: "Perform a Task",
  body: "This is a bit of copy explaining what the action will do."
};

export const ButtonDangerOutlined: Story = Template.bind({});
ButtonDangerOutlined.args = {
  variant: "button",
  button: <Button variant="danger responsive outlined" type="button">Delete</Button>,
  runAction: () => { console.log("Action performed!") },
  title: "Delete Planitt",
};